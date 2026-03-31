import { readFile, writeFile, copyFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join } from 'path'
import JSON5 from 'json5'
import lockfile from 'proper-lockfile'

const CONFIG_DIR = join(homedir(), '.openclaw')
const CONFIG_PATH = join(CONFIG_DIR, 'openclaw.json')
const ENV_PATH = join(CONFIG_DIR, '.env')

const VALID_SECTIONS = new Set([
  'agents', 'channels', 'gateway', 'session', 'messages',
  'talk', 'tools', 'models', 'skills', 'plugins', 'browser',
  'ui', 'bindings', 'commands', 'env', 'authProfiles',
  'hooks', 'cron', 'logging',
])

const DEFAULT_CONFIG = {
  agents: {
    defaults: {
      model: { primary: 'anthropic/claude-opus-4-6', fallbacks: [] },
      models: {},
      imageMaxDimensionPx: 2048,
      sandbox: { mode: 'off', scope: 'session' },
      heartbeat: { every: '5m', target: 'last' },
      blockStreamingDefault: 'on',
      typingMode: 'thinking',
    },
    list: [],
  },
  channels: {
    defaults: {
      groupPolicy: 'allowlist',
      heartbeat: { showOk: true, showAlerts: true, useIndicator: true },
    },
  },
  gateway: {
    mode: 'local',
    port: 18789,
    bind: 'loopback',
    auth: { mode: 'none' },
    tailscale: { mode: 'off', resetOnExit: false },
  },
  session: {
    scope: 'per-sender',
    dmScope: 'main',
    reset: { mode: 'idle', idleMinutes: 30 },
    threadBindings: { enabled: false },
  },
  messages: {
    responsePrefix: 'auto',
    ackReactionScope: 'group-mentions',
    removeAckAfterReply: true,
  },
  tools: {
    profile: 'full',
    allow: [],
    deny: [],
  },
  models: {
    mode: 'merge',
    providers: {},
  },
  skills: {
    allowBundled: [],
    entries: {},
  },
  plugins: {
    enabled: true,
    allow: [],
    deny: [],
    entries: {},
  },
  browser: {
    enabled: true,
    headless: true,
  },
  ui: {
    assistant: { name: 'OpenClaw', avatar: '' },
  },
  commands: {
    native: 'auto',
    text: true,
    bash: true,
    config: true,
    debug: false,
    restart: true,
  },
  env: {},
  cron: { enabled: false, maxConcurrentRuns: 1 },
  hooks: { enabled: false },
  logging: {},
}

export function isValidSection(section: string): boolean {
  return VALID_SECTIONS.has(section)
}

export async function ensureConfigExists(): Promise<void> {
  if (!existsSync(CONFIG_DIR)) {
    await mkdir(CONFIG_DIR, { recursive: true })
  }
  if (!existsSync(CONFIG_PATH)) {
    await writeFile(CONFIG_PATH, JSON.stringify(DEFAULT_CONFIG, null, 2), 'utf-8')
    console.log(`Created default config at ${CONFIG_PATH}`)
  }
}

export async function readConfig(): Promise<Record<string, unknown>> {
  await ensureConfigExists()
  const content = await readFile(CONFIG_PATH, 'utf-8')
  return JSON5.parse(content)
}

export async function writeConfig(config: Record<string, unknown>): Promise<void> {
  await ensureConfigExists()
  const release = await lockfile.lock(CONFIG_PATH, { retries: 3 })
  try {
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
  } finally {
    await release()
  }
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target }
  for (const key of Object.keys(source)) {
    const sVal = source[key]
    // null means "delete this key"
    if (sVal === null) {
      delete result[key]
      continue
    }
    const tVal = target[key]
    if (
      tVal && sVal &&
      typeof tVal === 'object' && !Array.isArray(tVal) &&
      typeof sVal === 'object' && !Array.isArray(sVal)
    ) {
      result[key] = deepMerge(
        tVal as Record<string, unknown>,
        sVal as Record<string, unknown>,
      )
    } else {
      result[key] = sVal
    }
  }
  return result
}

export async function updateSection(
  section: string,
  data: Record<string, unknown>,
): Promise<void> {
  await ensureConfigExists()
  const release = await lockfile.lock(CONFIG_PATH, { retries: 3 })
  try {
    const content = await readFile(CONFIG_PATH, 'utf-8')
    const config = JSON5.parse(content)
    const existing = (config[section] ?? {}) as Record<string, unknown>
    const merged = deepMerge(existing, data)
    // If merge resulted in an empty object after deletions, keep the key but empty
    config[section] = merged
    await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
  } finally {
    await release()
  }
}

export async function createBackup(): Promise<string> {
  const backupDir = join(CONFIG_DIR, 'backups')
  if (!existsSync(backupDir)) {
    await mkdir(backupDir, { recursive: true })
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const backupPath = join(backupDir, `openclaw-${timestamp}.json`)
  await copyFile(CONFIG_PATH, backupPath)
  return backupPath
}

// --- Env file helpers (API keys stored separately with restrictive permissions) ---

export async function readEnvKeys(): Promise<Record<string, string>> {
  if (!existsSync(ENV_PATH)) return {}
  const content = await readFile(ENV_PATH, 'utf-8')
  const result: Record<string, string> = {}
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    let val = trimmed.slice(eqIdx + 1).trim()
    // Strip surrounding quotes (single or double)
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    result[key] = val
  }
  return result
}

const ENV_KEY_RE = /^[A-Za-z_][A-Za-z0-9_]*$/

function sanitizeEnvValue(val: string): string {
  // Reject values with newlines or null bytes to prevent .env injection
  if (/[\r\n\0]/.test(val)) {
    throw new Error('Env value must not contain newlines or null bytes')
  }
  // Quote values that contain spaces, #, =, or quotes
  if (/[\s#="']/.test(val)) {
    return `"${val.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  }
  return val
}

export async function writeEnvKeys(keys: Record<string, string>): Promise<void> {
  await ensureConfigExists()
  // Validate keys
  for (const k of Object.keys(keys)) {
    if (!ENV_KEY_RE.test(k)) {
      throw new Error(`Invalid env key: ${k}`)
    }
  }
  // Use CONFIG_PATH as lockfile anchor (ENV_PATH may not exist yet)
  const release = await lockfile.lock(CONFIG_PATH, { retries: 3 })
  try {
    // Merge with existing keys so partial saves don't erase other keys
    const existing = await readEnvKeys()
    const merged = { ...existing }
    for (const [k, v] of Object.entries(keys)) {
      if (v) {
        merged[k] = v
      }
      // If value is empty/undefined, remove the key
      if (!v && k in merged) {
        delete merged[k]
      }
    }
    const lines = Object.entries(merged).map(([k, v]) => `${k}=${sanitizeEnvValue(v)}`)
    await writeFile(ENV_PATH, lines.join('\n') + '\n', { encoding: 'utf-8', mode: 0o600 })
  } finally {
    await release()
  }
}

export { CONFIG_PATH }

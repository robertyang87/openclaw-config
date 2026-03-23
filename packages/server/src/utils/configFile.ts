import { readFile, writeFile, copyFile, mkdir } from 'fs/promises'
import { existsSync } from 'fs'
import { homedir } from 'os'
import { join, dirname } from 'path'
import JSON5 from 'json5'

const CONFIG_DIR = join(homedir(), '.openclaw')
const CONFIG_PATH = join(CONFIG_DIR, 'openclaw.json')

const DEFAULT_CONFIG = {
  agents: {
    model: 'anthropic/claude-sonnet-4-6',
    fallbacks: [],
    models: [],
    concurrency: 4,
  },
  channels: {},
  gateway: {
    port: 3000,
    bind: 'loopback',
  },
  session: {
    scope: 'channel',
  },
  tools: {},
  env: {},
  hooks: {},
  cron: {},
  logging: {},
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
  await writeFile(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
}

export async function updateSection(
  section: string,
  data: Record<string, unknown>,
): Promise<void> {
  const config = await readConfig()
  config[section] = data
  await writeConfig(config)
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

export { CONFIG_PATH }

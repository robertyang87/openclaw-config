const BASE = '/api'

export async function getConfig(): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}/config`)
  if (!res.ok) throw new Error('Failed to fetch config')
  return res.json()
}

export async function updateConfig(config: Record<string, unknown>): Promise<void> {
  const res = await fetch(`${BASE}/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  })
  if (!res.ok) throw new Error('Failed to update config')
}

export async function updateConfigSection(
  section: string,
  data: Record<string, unknown>,
): Promise<void> {
  const res = await fetch(`${BASE}/config/${section}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error('Failed to update config section')
}

export async function backupConfig(): Promise<{ path: string }> {
  const res = await fetch(`${BASE}/config/backup`, { method: 'POST' })
  if (!res.ok) throw new Error('Failed to backup config')
  return res.json()
}

export async function getStatus(): Promise<Record<string, unknown>> {
  const res = await fetch(`${BASE}/status`)
  if (!res.ok) throw new Error('Failed to fetch status')
  return res.json()
}

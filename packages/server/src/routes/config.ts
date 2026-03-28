import { Router } from 'express'
import {
  readConfig,
  writeConfig,
  updateSection,
  createBackup,
  isValidSection,
  readEnvKeys,
  writeEnvKeys,
} from '../utils/configFile.js'

const router: ReturnType<typeof Router> = Router()

router.get('/config', async (_req, res) => {
  try {
    const config = await readConfig()
    // Merge env keys into response so frontend can display them
    const envKeys = await readEnvKeys()
    if (Object.keys(envKeys).length > 0) {
      config.env = envKeys
    }
    res.json(config)
  } catch (err) {
    res.status(500).json({ error: 'Failed to read config', detail: String(err) })
  }
})

router.put('/config', async (req, res) => {
  try {
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      res.status(400).json({ error: 'Request body must be a JSON object' })
      return
    }
    await writeConfig(req.body)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to write config', detail: String(err) })
  }
})

router.patch('/config/:section', async (req, res) => {
  try {
    const { section } = req.params
    if (!isValidSection(section)) {
      res.status(400).json({ error: `Invalid section: ${section}` })
      return
    }
    if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
      res.status(400).json({ error: 'Request body must be a JSON object' })
      return
    }

    // Store env keys in separate .env file instead of config JSON
    if (section === 'env') {
      await writeEnvKeys(req.body as Record<string, string>)
    } else {
      await updateSection(section, req.body)
    }

    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to update section', detail: String(err) })
  }
})

router.post('/config/backup', async (_req, res) => {
  try {
    const path = await createBackup()
    res.json({ success: true, path })
  } catch (err) {
    res.status(500).json({ error: 'Failed to create backup', detail: String(err) })
  }
})

router.get('/status', async (_req, res) => {
  try {
    const config = await readConfig()
    res.json({
      status: 'ok',
      hasConfig: true,
      sections: Object.keys(config),
    })
  } catch {
    res.json({ status: 'error', hasConfig: false })
  }
})

export default router

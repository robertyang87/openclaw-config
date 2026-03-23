import { Router } from 'express'
import {
  readConfig,
  writeConfig,
  updateSection,
  createBackup,
} from '../utils/configFile.js'

const router = Router()

router.get('/config', async (_req, res) => {
  try {
    const config = await readConfig()
    res.json(config)
  } catch (err) {
    res.status(500).json({ error: 'Failed to read config', detail: String(err) })
  }
})

router.put('/config', async (req, res) => {
  try {
    await writeConfig(req.body)
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to write config', detail: String(err) })
  }
})

router.patch('/config/:section', async (req, res) => {
  try {
    const { section } = req.params
    await updateSection(section, req.body)
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

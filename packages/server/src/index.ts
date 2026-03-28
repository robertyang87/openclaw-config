import express from 'express'
import cors from 'cors'
import configRouter from './routes/config.js'
import { ensureConfigExists, CONFIG_PATH } from './utils/configFile.js'

const app = express()
const PORT = 3210

app.use(cors({ origin: 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))
app.use('/api', configRouter)

async function start() {
  await ensureConfigExists()
  app.listen(PORT, () => {
    console.log(`\n  OpenClaw Config Server`)
    console.log(`  ─────────────────────`)
    console.log(`  API:    http://localhost:${PORT}/api`)
    console.log(`  Config: ${CONFIG_PATH}\n`)
  })
}

start().catch(console.error)

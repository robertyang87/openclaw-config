# OpenClaw Config - Development Guide

## Project Overview
OpenClaw visual configuration manager - a web UI for managing `~/.openclaw/openclaw.json`.
Aligned with the official OpenClaw docs at https://docs.openclaw.ai.

## Tech Stack
- **Monorepo**: pnpm workspace
- **Frontend**: React 19 + Vite + TypeScript + Ant Design 5 (dark theme)
- **Backend**: Express 5 + TypeScript + tsx (hot reload)
- **Icons**: react-icons (si for brand icons, tb for Tabler icons)

## Project Structure
```
packages/
  web/        # Frontend (port 5173)
    src/
      api/        # API client functions
      components/ # Reusable components (ApiKeyInput, ChannelCard, PluginCard)
      pages/      # Route pages (Dashboard, ModelConfig, Channels, Plugins, Advanced)
      styles/     # Global CSS
  server/     # Backend API (port 3210)
    src/
      routes/     # Express routes
      utils/      # Config file read/write utilities (with file locking)
```

## Commands
- `pnpm dev` — Start both frontend and backend
- `pnpm dev:web` — Frontend only (localhost:5173)
- `pnpm dev:server` — Backend only (localhost:3210)
- `pnpm build` — Build all packages

## Key Design Decisions
- Dark theme with purple (#6C5CE7) as primary color
- Font: Space Grotesk (display) + Inter (body)
- Backend reads/writes `~/.openclaw/openclaw.json` (JSON5 compatible)
- API keys stored in `~/.openclaw/.env` (mode 0600), NOT in the JSON config
- Vite proxies `/api` requests to backend at port 3210
- CORS restricted to `http://localhost:5173`
- Config file auto-created with defaults if not exists
- File locking via `proper-lockfile` to prevent concurrent write corruption
- Section whitelist validation on PATCH endpoints
- `updateSection` merges data (not replaces) to prevent field loss

## Config Schema (aligned with OpenClaw official)
- `agents.defaults.model`: `{ primary, fallbacks }` format
- `channels.<key>`: 9 built-in channels (whatsapp, telegram, discord, slack, signal, bluebubbles, imessage, googlechat, irc)
- `tools`: profile (full/coding/messaging/minimal), allow/deny with tool groups, web, exec, media, agentToAgent
- `browser`: top-level config (enabled, headless)
- `cron`: enabled, maxConcurrentRuns
- `hooks`: event hook system (enabled)
- `skills`: allowBundled
- `gateway`: port 18789, bind, auth, tailscale
- `session`: scope, dmScope, reset, threadBindings
- `messages`: responsePrefix, ackReactionScope
- `commands`: native, text, bash, config, restart
- `ui.assistant`: name

## Supported Providers (31 total)
Built-in: Anthropic, OpenAI, Google Gemini, Amazon Bedrock, OpenCode, OpenCode Go, Z.AI
Plugin: DeepSeek, OpenRouter, Mistral, xAI, Groq, GitHub Copilot, MiniMax, Moonshot, Kimi Coding, Together, NVIDIA, Cerebras, Venice, Hugging Face, Model Studio, Qianfan, Volcengine, Xiaomi, Synthetic
Gateway: Vercel AI Gateway, Kilocode, Cloudflare AI Gateway, LiteLLM
Local: Ollama

## API Endpoints
- `GET /api/config` — Read full config (merges .env keys into response)
- `PUT /api/config` — Write full config (with body validation)
- `PATCH /api/config/:section` — Update a section (merge, section whitelist enforced)
- `PATCH /api/config/env` — Writes to `~/.openclaw/.env` instead of JSON
- `POST /api/config/backup` — Create timestamped backup
- `GET /api/status` — Health check

## Node.js Setup
Node installed via fnm at `~/.local/bin/fnm`. Shell needs:
```bash
export PATH="$HOME/.local/bin:$PATH"
eval "$(fnm env)"
```

# OpenClaw Config - Development Guide

## Project Overview
OpenClaw visual configuration manager - a web UI for managing `~/.openclaw/openclaw.json`.
Aligned with the official OpenClaw source at https://github.com/openclaw/openclaw.

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
      api/        # API client functions (getConfig, updateConfigSection, updateConfigSections)
      components/ # Reusable components (ApiKeyInput, ChannelCard, PluginCard)
      pages/      # Route pages (Dashboard, ModelConfig, Channels, Plugins, Advanced)
      styles/     # Global CSS
  server/     # Backend API (port 3210, binds to 127.0.0.1)
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
- Backend binds to `127.0.0.1` only (no network exposure)
- Backend reads/writes `~/.openclaw/openclaw.json` (JSON5 compatible read, JSON write)
- API keys stored in `~/.openclaw/.env` (mode 0600), NOT in the JSON config
- API keys masked in GET response (first 4 + last 4 chars, never sent in full)
- `.env` values validated: key format checked, newlines rejected, special chars quoted
- Vite proxies `/api` requests to backend at port 3210
- CORS restricted to `http://localhost:5173`
- Config file auto-created with defaults if not exists
- File locking via `proper-lockfile` to prevent concurrent write corruption
- 30 section whitelist validation on PATCH endpoints
- `deepMerge` supports `null` values to delete keys (solves config residue)
- Frontend uses `updateConfigSections()` for sequential saves (no concurrent PATCH race)

## Config Schema (aligned with OpenClaw source at github.com/openclaw/openclaw)

### Core sections (with UI)
- `agents.defaults`: model (primary/fallbacks), thinkingDefault (off/minimal/low/medium/high/xhigh/adaptive), compaction (safeguard/aggressive/off), sandbox, heartbeat, typingMode, blockStreamingDefault, imageMaxDimensionPx, memorySearch
- `channels.<key>`: 20+ channels — whatsapp, telegram, discord, slack, signal, bluebubbles, imessage, googlechat, irc, msteams, feishu, line, matrix, mattermost, nextcloud-talk, nostr, twitch, qqbot, zalo, synology-chat
- `tools`: profile (full/coding/messaging/minimal), allow/alsoAllow/deny, web.search, web.fetch, exec (timeoutSec, askMode), media, agentToAgent, links, loopDetection, sandbox
- `browser`: enabled, headless
- `cron`: enabled, maxConcurrentRuns
- `hooks`: enabled
- `skills`: allowBundled, entries
- `gateway`: port 18789, bind (loopback/lan/tailnet/auto), auth (none/token/password/trusted-proxy), tailscale (off/serve/funnel), reload (off/restart/hot/hybrid)
- `session`: scope (per-sender/global), dmScope (main/per-peer/per-channel-peer/per-account-channel-peer), reset (idle/daily), threadBindings (enabled, idleHours, maxAgeHours)
- `messages`: responsePrefix, ackReactionScope (group-mentions/group-all/direct/all/off), removeAckAfterReply, queue (steer/followup/collect/steer-backlog/queue/interrupt)
- `commands`: native, text, bash, config, restart
- `ui`: assistant (name), seamColor
- `logging`: level (debug/info/warn/error), redactSensitive (tools/all/off)
- `memory`: backend (builtin/qmd)
- `mcp`: servers (MCP server definitions, displayed read-only in UI)
- `discovery`: mdns (enabled)
- `models`: mode (merge), providers

### Backend-only sections (accepted but no dedicated UI)
- `meta`, `auth`, `acp`, `env`, `wizard`, `diagnostics`, `cli`, `update`
- `secrets`, `nodeHost`, `bindings`, `broadcast`, `audio`, `media`
- `approvals`, `web`, `canvasHost`, `talk`

## Supported Providers (39 total)
Built-in: Anthropic, OpenAI, Google Gemini, Amazon Bedrock (Access Key + Secret Key), OpenCode, OpenCode Go (separate OPENCODE_GO_API_KEY), Z.AI
Plugin: DeepSeek, OpenRouter, Mistral, xAI, Groq, GitHub Copilot, MiniMax, Moonshot, Kimi Coding, Together, NVIDIA, Cerebras, Venice, Hugging Face, Model Studio, Qianfan, Volcengine, Xiaomi, Synthetic
Gateway: Vercel AI Gateway, Kilocode, Cloudflare AI Gateway, LiteLLM, Anthropic Vertex, Copilot Proxy, BytePlus, Microsoft AI Foundry, SGLang, vLLM, Chutes AI
Local: Ollama

## API Endpoints
- `GET /api/config` — Read full config (merges masked .env keys into response)
- `PUT /api/config` — Write full config (strips env keys from body, validates object)
- `PATCH /api/config/:section` — Update a section (deep merge, null=delete, 30-section whitelist)
- `PATCH /api/config/env` — Writes to `~/.openclaw/.env` (validates string values, sanitizes)
- `POST /api/config/backup` — Create timestamped backup
- `GET /api/status` — Health check (used by Layout for dynamic connection indicator)

## Security Notes
- Server binds to 127.0.0.1 only
- API keys never sent in full to browser (masked: first 4 + last 4 chars)
- `.env` keys validated against `^[A-Za-z_][A-Za-z0-9_]*$`
- `.env` values reject newlines/null bytes, quote special characters
- `env` section in PUT body is stripped to prevent secrets leaking into JSON config

## Node.js Setup
Node installed via fnm at `~/.local/bin/fnm`. Shell needs:
```bash
export PATH="$HOME/.local/bin:$PATH"
eval "$(fnm env)"
```

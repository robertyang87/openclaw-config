# OpenClaw Config - Development Guide

## Project Overview
OpenClaw visual configuration manager - a web UI for managing `~/.openclaw/openclaw.json`.

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
      utils/      # Config file read/write utilities
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
- Vite proxies `/api` requests to backend at port 3210
- Config file auto-created with defaults if not exists

## API Endpoints
- `GET /api/config` — Read full config
- `PUT /api/config` — Write full config
- `PATCH /api/config/:section` — Update a section
- `POST /api/config/backup` — Create timestamped backup
- `GET /api/status` — Health check

## Node.js Setup
Node installed via fnm at `~/.local/bin/fnm`. Shell needs:
```bash
export PATH="$HOME/.local/bin:$PATH"
eval "$(fnm env)"
```

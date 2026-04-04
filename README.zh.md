# OpenClaw Config

中文 | [English](./README.md)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-20%2B-green)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-10%2B-orange)](https://pnpm.io/)

[OpenClaw](https://github.com/openclaw/openclaw) 可视化配置管理器 — 开源、自托管的 AI 助手平台。

通过现代化 Web 界面管理你的 OpenClaw 配置，无需手动编辑 JSON 文件。

## 截图

### 仪表盘
![仪表盘](docs/screenshots/dashboard.png)

### 模型与 API 密钥
![模型与 API 密钥](docs/screenshots/models.png)

### IM 频道
![IM 频道](docs/screenshots/channels.png)

### 工具与插件
![工具与插件](docs/screenshots/plugins.png)

### 高级设置
![高级设置](docs/screenshots/advanced.png)

## 功能特性

- **仪表盘** — 一目了然的配置状态概览
- **模型与 API 密钥** — 31 个 LLM 服务商（Anthropic、OpenAI、Google、DeepSeek、Mistral、xAI、Groq、MiniMax 等），密钥安全存储在 `.env`
- **IM 频道** — 9 个内置消息平台，与 OpenClaw 官方文档对齐
  - WhatsApp、Telegram、Discord、Slack、Signal、iMessage (BlueBubbles)、iMessage (Legacy)、Google Chat、IRC
- **工具与插件** — 工具访问控制（配置、白名单/黑名单）、浏览器、网络、Shell 执行、媒体、定时任务、钩子和技能
- **高级设置** — 网关、会话、消息、聊天命令、沙箱、Tailscale、界面和代理默认值，支持一键备份
- **暗色主题** — 基于 Ant Design 的现代化暗色 UI
- **中英文切换** — 完整的国际化支持

## 快速开始

### 前提条件

- [Node.js](https://nodejs.org/) 20+
- [pnpm](https://pnpm.io/) 10+

### 安装

```bash
# 克隆仓库
git clone https://github.com/robertyang87/openclaw-config.git
cd openclaw-config

# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev
```

在浏览器中打开 http://localhost:5173。

### 可用脚本

| 命令              | 说明                              |
| ----------------- | --------------------------------- |
| `pnpm dev`        | 启动前端 + 后端                    |
| `pnpm dev:web`    | 仅启动前端（端口 5173）            |
| `pnpm dev:server` | 仅启动后端（端口 3210）            |
| `pnpm build`      | 构建所有包（生产环境）              |

## 架构

```
openclaw-config/
├── packages/
│   ├── web/            # React 前端
│   │   └── src/
│   │       ├── api/          # API 客户端函数
│   │       ├── components/   # 可复用 UI 组件
│   │       ├── locales/      # 国际化翻译文件
│   │       ├── pages/        # 路由页面
│   │       └── styles/       # 全局 CSS
│   └── server/         # Express 后端
│       └── src/
│           ├── routes/       # REST API 路由
│           └── utils/        # 配置文件读写
├── package.json        # 根工作区配置
└── pnpm-workspace.yaml
```

## 技术栈

| 层级   | 技术                                 |
| ------ | ------------------------------------ |
| 前端   | React 19, Vite 6, TypeScript        |
| UI     | Ant Design 5（暗色主题）              |
| 后端   | Express 5, TypeScript, tsx           |
| 国际化 | i18next, react-i18next               |
| 图标   | react-icons (Simple Icons + Tabler)  |
| 单仓库 | pnpm workspace                       |

## API 参考

后端提供 REST API 来管理 `~/.openclaw/openclaw.json`：

| 方法   | 端点                    | 说明              |
| ------ | ----------------------- | ----------------- |
| GET    | `/api/config`           | 读取完整配置       |
| PUT    | `/api/config`           | 替换完整配置       |
| PATCH  | `/api/config/:section`  | 更新配置段         |
| POST   | `/api/config/backup`    | 创建带时间戳的备份  |
| GET    | `/api/status`           | 健康检查           |

## 配置

首次启动时，如果 `~/.openclaw/openclaw.json` 不存在，后端会自动创建默认配置。备份文件存储在 `~/.openclaw/backups/` 目录。

## 语言支持

界面支持英文和简体中文。点击右上角的语言切换按钮即可切换，语言偏好会保存在 localStorage 中。

## 贡献

欢迎贡献！请按照以下步骤：

1. Fork 本仓库
2. 创建功能分支 (`git checkout -b feat/amazing-feature`)
3. 提交更改 (`git commit -m 'feat: add amazing feature'`)
4. 推送到分支 (`git push origin feat/amazing-feature`)
5. 创建 Pull Request

### 开发指南

- 遵循 [Conventional Commits](https://www.conventionalcommits.org/) 提交规范
- 使用 TypeScript 严格模式
- 保持组件小而专注

## 路线图

- [ ] 带语法高亮的 JSON 编辑器
- [ ] 每个频道的实时连接状态
- [ ] 导入/导出配置文件
- [ ] Docker 支持
- [x] 国际化（中文/英文）

## 许可证

本项目采用 MIT 许可证 — 详见 [LICENSE](LICENSE) 文件。

## 致谢

- [OpenClaw](https://github.com/openclaw/openclaw) — 本工具所配置的 AI 助手平台
- [Ant Design](https://ant.design/) — UI 组件库
- [react-icons](https://react-icons.github.io/react-icons/) — 品牌图标

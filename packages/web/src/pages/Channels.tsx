import { useEffect, useState } from 'react'
import {
  Row,
  Col,
  Typography,
  Space,
  message,
  Drawer,
  Form,
  Input,
  Switch,
  Select,
  Button,
  Tag,
  InputNumber,
} from 'antd'
import { MessageOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  SiTelegram,
  SiDiscord,
  SiWhatsapp,
  SiSlack,
  SiSignal,
  SiImessage,
  SiGooglechat,
} from 'react-icons/si'
import { TbHash } from 'react-icons/tb'
import { getConfig, updateConfigSection } from '../api/config'
import ChannelCard from '../components/ChannelCard'

const { Title, Text } = Typography

interface ChannelMeta {
  name: string
  color: string
  icon: React.ReactNode
  fields: FieldDef[]
}

interface FieldDef {
  key: string
  label: string
  type: 'input' | 'password' | 'switch' | 'select' | 'textarea' | 'tags' | 'number'
  placeholder?: string
  options?: { label: string; value: string }[]
  required?: boolean
  tip?: string
  min?: number
  max?: number
}

const COMMON_FIELDS: FieldDef[] = [
  { key: 'enabled', label: 'Enabled', type: 'switch' },
  { key: 'dmPolicy', label: 'DM Policy', type: 'select', options: [
    { label: 'Pairing (default)', value: 'pairing' },
    { label: 'Allowlist only', value: 'allowlist' },
    { label: 'Open', value: 'open' },
    { label: 'Disabled', value: 'disabled' },
  ]},
  { key: 'groupPolicy', label: 'Group Policy', type: 'select', options: [
    { label: 'Allowlist (default)', value: 'allowlist' },
    { label: 'Open', value: 'open' },
    { label: 'Disabled', value: 'disabled' },
  ]},
  { key: 'textChunkLimit', label: 'Text Chunk Limit', type: 'number', placeholder: '4000', min: 100, max: 10000 },
  { key: 'chunkMode', label: 'Chunk Mode', type: 'select', options: [
    { label: 'By length (default)', value: 'length' },
    { label: 'By newline (paragraph)', value: 'newline' },
  ]},
  { key: 'historyLimit', label: 'History Limit', type: 'number', placeholder: '50', min: 0, max: 500 },
  { key: 'mediaMaxMb', label: 'Max Media Size (MB)', type: 'number', placeholder: '50', min: 1, max: 200 },
  { key: 'configWrites', label: 'Allow config writes from channel', type: 'switch' },
]

const iconStyle = { fontSize: 28 }

const CHANNEL_META: Record<string, ChannelMeta> = {
  whatsapp: {
    name: 'WhatsApp', color: '#25D366', icon: <SiWhatsapp style={{ ...iconStyle, color: '#25D366' }} />,
    fields: [
      { key: 'allowFrom', label: 'Allowed Phone Numbers (DM)', type: 'tags', placeholder: '+15551234567', tip: 'E.164 format phone numbers' },
      { key: 'groupAllowFrom', label: 'Allowed Phone Numbers (Groups)', type: 'tags', placeholder: '+15551234567' },
      { key: 'sendReadReceipts', label: 'Send Read Receipts', type: 'switch' },
      ...COMMON_FIELDS,
    ],
  },
  telegram: {
    name: 'Telegram', color: '#0088cc', icon: <SiTelegram style={{ ...iconStyle, color: '#0088cc' }} />,
    fields: [
      { key: 'botToken', label: 'Bot Token', type: 'password', placeholder: '123456:ABC-DEF...', required: true, tip: 'Get from @BotFather. Env fallback: TELEGRAM_BOT_TOKEN' },
      { key: 'allowFrom', label: 'Allowed User IDs (DM)', type: 'tags', placeholder: 'Numeric Telegram user ID' },
      { key: 'groupAllowFrom', label: 'Allowed User IDs (Groups)', type: 'tags', placeholder: 'Numeric Telegram user ID' },
      { key: 'linkPreview', label: 'Link Preview', type: 'switch' },
      { key: 'streaming', label: 'Streaming', type: 'select', options: [
        { label: 'Off', value: 'off' },
        { label: 'Partial', value: 'partial' },
        { label: 'Block', value: 'block' },
        { label: 'Progress', value: 'progress' },
      ]},
      { key: 'replyToMode', label: 'Reply Threading', type: 'select', options: [
        { label: 'Off', value: 'off' },
        { label: 'First message', value: 'first' },
        { label: 'All messages', value: 'all' },
      ]},
      ...COMMON_FIELDS,
    ],
  },
  discord: {
    name: 'Discord', color: '#5865F2', icon: <SiDiscord style={{ ...iconStyle, color: '#5865F2' }} />,
    fields: [
      { key: 'token', label: 'Bot Token', type: 'password', required: true, tip: 'Env fallback: DISCORD_BOT_TOKEN' },
      { key: 'allowFrom', label: 'Allowed User/Role IDs', type: 'tags', placeholder: 'User or role ID' },
      { key: 'allowBots', label: 'Allow Bot Messages', type: 'select', options: [
        { label: 'No (default)', value: 'false' },
        { label: 'Yes', value: 'true' },
        { label: 'Mentions only', value: 'mentions' },
      ]},
      { key: 'streaming', label: 'Streaming', type: 'select', options: [
        { label: 'Off (default)', value: 'off' },
        { label: 'Partial', value: 'partial' },
        { label: 'Block', value: 'block' },
        { label: 'Progress', value: 'progress' },
      ]},
      { key: 'replyToMode', label: 'Reply Threading', type: 'select', options: [
        { label: 'Off', value: 'off' },
        { label: 'First message', value: 'first' },
        { label: 'All messages', value: 'all' },
      ]},
      ...COMMON_FIELDS,
    ],
  },
  slack: {
    name: 'Slack', color: '#4A154B', icon: <SiSlack style={{ ...iconStyle, color: '#E01E5A' }} />,
    fields: [
      { key: 'mode', label: 'Connection Mode', type: 'select', options: [
        { label: 'Socket Mode (default)', value: 'socket' },
        { label: 'HTTP', value: 'http' },
      ]},
      { key: 'botToken', label: 'Bot Token (xoxb-)', type: 'password', required: true, tip: 'OAuth Bot User Token' },
      { key: 'appToken', label: 'App Token (xapp-)', type: 'password', tip: 'Required for Socket Mode' },
      { key: 'signingSecret', label: 'Signing Secret', type: 'password', tip: 'Required for HTTP Mode' },
      { key: 'allowFrom', label: 'Allowed User IDs', type: 'tags', placeholder: 'Slack user ID' },
      { key: 'streaming', label: 'Streaming', type: 'select', options: [
        { label: 'Off', value: 'off' },
        { label: 'Partial (default)', value: 'partial' },
        { label: 'Block', value: 'block' },
        { label: 'Progress', value: 'progress' },
      ]},
      { key: 'replyToMode', label: 'Reply Threading', type: 'select', options: [
        { label: 'Off', value: 'off' },
        { label: 'First message', value: 'first' },
        { label: 'All messages', value: 'all' },
      ]},
      ...COMMON_FIELDS,
    ],
  },
  signal: {
    name: 'Signal', color: '#3A76F0', icon: <SiSignal style={{ ...iconStyle, color: '#3A76F0' }} />,
    fields: [
      { key: 'account', label: 'Account (Phone Number)', type: 'input', required: true, placeholder: '+15551234567', tip: 'E.164 format phone number' },
      { key: 'cliPath', label: 'signal-cli Path', type: 'input', placeholder: 'signal-cli', tip: 'Path to signal-cli binary' },
      { key: 'httpUrl', label: 'Daemon URL', type: 'input', placeholder: 'http://127.0.0.1:8080', tip: 'Full daemon URL (overrides host/port)' },
      { key: 'httpHost', label: 'Daemon Host', type: 'input', placeholder: '127.0.0.1' },
      { key: 'httpPort', label: 'Daemon Port', type: 'number', placeholder: '8080', min: 1, max: 65535 },
      { key: 'autoStart', label: 'Auto-start Daemon', type: 'switch' },
      { key: 'allowFrom', label: 'Allowed Numbers (DM)', type: 'tags', placeholder: '+15551234567 or uuid:...' },
      { key: 'groupAllowFrom', label: 'Allowed Numbers (Groups)', type: 'tags', placeholder: '+15551234567' },
      { key: 'sendReadReceipts', label: 'Send Read Receipts', type: 'switch' },
      ...COMMON_FIELDS,
    ],
  },
  bluebubbles: {
    name: 'iMessage (BlueBubbles)', color: '#34C759', icon: <SiImessage style={{ ...iconStyle, color: '#34C759' }} />,
    fields: [
      { key: 'serverUrl', label: 'BlueBubbles Server URL', type: 'input', required: true, placeholder: 'http://localhost:1234' },
      { key: 'password', label: 'Server Password', type: 'password', required: true },
      { key: 'webhookPath', label: 'Webhook Path', type: 'input', placeholder: '/bluebubbles-webhook' },
      { key: 'allowFrom', label: 'Allowed Contacts (DM)', type: 'tags', placeholder: 'Handle, email, or phone' },
      { key: 'groupAllowFrom', label: 'Allowed Contacts (Groups)', type: 'tags', placeholder: 'Handle, email, or phone' },
      { key: 'sendReadReceipts', label: 'Send Read Receipts', type: 'switch' },
      { key: 'blockStreaming', label: 'Block Streaming', type: 'switch' },
      ...COMMON_FIELDS,
    ],
  },
  imessage: {
    name: 'iMessage (Legacy)', color: '#34C759', icon: <SiImessage style={{ ...iconStyle, color: '#5AC8FA' }} />,
    fields: [
      { key: 'cliPath', label: 'imsg CLI Path', type: 'input', placeholder: 'Path to imsg binary' },
      { key: 'dbPath', label: 'Messages DB Path', type: 'input', placeholder: 'Path to chat.db' },
      { key: 'includeAttachments', label: 'Include Attachments', type: 'switch' },
      { key: 'allowFrom', label: 'Allowed Contacts', type: 'tags', placeholder: 'Handle or chat target' },
      { key: 'groupAllowFrom', label: 'Allowed Contacts (Groups)', type: 'tags', placeholder: 'Handle or chat target' },
      ...COMMON_FIELDS,
    ],
  },
  googlechat: {
    name: 'Google Chat', color: '#00AC47', icon: <SiGooglechat style={{ ...iconStyle, color: '#00AC47' }} />,
    fields: [
      { key: 'serviceAccountFile', label: 'Service Account Key File Path', type: 'input', placeholder: '/path/to/service-account.json', tip: 'Path to the JSON key file' },
      { key: 'serviceAccount', label: 'Service Account Key (inline JSON)', type: 'textarea', tip: 'Alternatively paste the JSON key content directly' },
      { key: 'webhookPath', label: 'Webhook Path', type: 'input', placeholder: '/googlechat' },
      { key: 'audienceType', label: 'Audience Type', type: 'select', options: [
        { label: 'App URL', value: 'app-url' },
        { label: 'Project Number', value: 'project-number' },
      ]},
      { key: 'audience', label: 'Audience', type: 'input', placeholder: 'Audience value matching your Chat app config' },
      { key: 'botUser', label: 'Bot User Resource Name', type: 'input', tip: 'Helps with mention detection' },
      { key: 'allowFrom', label: 'Allowed User IDs (DM)', type: 'tags', placeholder: 'User ID' },
      { key: 'typingIndicator', label: 'Typing Indicator', type: 'select', options: [
        { label: 'Message (default)', value: 'message' },
        { label: 'Reaction', value: 'reaction' },
        { label: 'None', value: 'none' },
      ]},
      ...COMMON_FIELDS,
    ],
  },
  irc: {
    name: 'IRC', color: '#8B5CF6', icon: <TbHash style={{ ...iconStyle, color: '#8B5CF6' }} />,
    fields: [
      { key: 'host', label: 'Server Host', type: 'input', required: true, placeholder: 'irc.libera.chat' },
      { key: 'port', label: 'Server Port', type: 'number', placeholder: '6697', min: 1, max: 65535 },
      { key: 'tls', label: 'Use TLS', type: 'switch' },
      { key: 'nick', label: 'Nickname', type: 'input', required: true, placeholder: 'openclaw' },
      { key: 'channels', label: 'Channels to Join', type: 'tags', placeholder: '#channel' },
      { key: 'allowFrom', label: 'Allowed Senders (DM)', type: 'tags', placeholder: 'nick!user@host', tip: 'nick!user@host format' },
      { key: 'groupAllowFrom', label: 'Allowed Senders (Channels)', type: 'tags', placeholder: 'nick!user@host' },
      ...COMMON_FIELDS,
    ],
  },
}

export default function Channels() {
  const [channels, setChannels] = useState<Record<string, Record<string, unknown>>>({})
  const [loading, setLoading] = useState(true)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [activeChannel, setActiveChannel] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    getConfig()
      .then((cfg) => {
        const raw = (cfg.channels ?? {}) as Record<string, Record<string, unknown>>
        const ch: Record<string, Record<string, unknown>> = {}
        for (const [k, v] of Object.entries(raw)) {
          if (k !== 'defaults' && k !== 'modelByChannel' && typeof v === 'object') {
            ch[k] = v as Record<string, unknown>
          }
        }
        setChannels(ch)
      })
      .catch(() => message.error('Failed to load channels'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async (key: string, enabled: boolean) => {
    const updated = { ...channels, [key]: { ...channels[key], enabled } }
    setChannels(updated)
    try {
      await updateConfigSection('channels', { [key]: { ...channels[key], enabled } })
      message.success(`${CHANNEL_META[key]?.name ?? key} ${enabled ? 'enabled' : 'disabled'}`)
    } catch {
      message.error('Failed to update')
    }
  }

  const openConfigure = (key: string) => {
    setActiveChannel(key)
    const channelConfig = channels[key] ?? {}
    form.resetFields()
    form.setFieldsValue(channelConfig)
    setDrawerOpen(true)
  }

  const handleSave = async () => {
    if (!activeChannel) return
    try {
      setSaving(true)
      const values = form.getFieldsValue()
      const cleaned: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(values)) {
        if (v !== undefined && v !== '' && v !== null) {
          cleaned[k] = v
        }
      }
      if (Object.keys(cleaned).length > 0 && cleaned.enabled === undefined) {
        cleaned.enabled = true
      }
      const updated = { ...channels, [activeChannel]: cleaned }
      setChannels(updated)
      await updateConfigSection('channels', { [activeChannel]: cleaned })
      message.success(`${CHANNEL_META[activeChannel]?.name ?? activeChannel} configuration saved`)
      setDrawerOpen(false)
    } catch {
      message.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleClear = async () => {
    if (!activeChannel) return
    const updated = { ...channels }
    delete updated[activeChannel]
    setChannels(updated)
    try {
      await updateConfigSection('channels', { [activeChannel]: null as unknown as Record<string, unknown> })
      message.success(`${CHANNEL_META[activeChannel]?.name ?? activeChannel} configuration cleared`)
      setDrawerOpen(false)
    } catch {
      message.error('Failed to clear')
    }
  }

  const allChannelKeys = Array.from(
    new Set([...Object.keys(CHANNEL_META), ...Object.keys(channels)]),
  )

  const activeMeta = activeChannel ? CHANNEL_META[activeChannel] : null

  return (
    <div>
      <Space direction="vertical" size={4} style={{ marginBottom: 28 }}>
        <Space align="center">
          <MessageOutlined style={{ fontSize: 28, color: '#00cec9' }} />
          <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>
            IM Channels
          </Title>
        </Space>
        <Text style={{ color: '#9898b8' }}>
          Connect your favorite messaging platforms (built-in channels only)
        </Text>
      </Space>

      <Row gutter={[16, 16]}>
        {allChannelKeys.map((key) => {
          const meta = CHANNEL_META[key] ?? { name: key, color: '#6C5CE7', icon: <MessageOutlined style={{ fontSize: 28, color: '#6C5CE7' }} />, fields: COMMON_FIELDS }
          const channelConfig = channels[key] ?? {}
          const enabled = channelConfig.enabled === true

          return (
            <Col xs={24} sm={12} lg={8} key={key}>
              <ChannelCard
                name={meta.name}
                icon={meta.icon}
                color={meta.color}
                enabled={enabled}
                configured={Object.keys(channelConfig).length > 0}
                onToggle={(v) => handleToggle(key, v)}
                onConfigure={() => openConfigure(key)}
              />
            </Col>
          )
        })}
      </Row>

      <Drawer
        title={
          activeMeta ? (
            <Space>
              <span style={{ fontSize: 22 }}>{activeMeta.icon}</span>
              <span>{activeMeta.name} Configuration</span>
              <Tag color={activeMeta.color} style={{ borderRadius: 12 }}>
                {activeChannel}
              </Tag>
            </Space>
          ) : 'Channel Configuration'
        }
        placement="right"
        width={480}
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        styles={{
          body: { paddingBottom: 80 },
          header: { borderBottom: '1px solid #2a2a4a' },
        }}
        extra={
          <Button
            danger
            type="text"
            icon={<DeleteOutlined />}
            onClick={handleClear}
            size="small"
          >
            Clear
          </Button>
        }
        footer={
          <div style={{ textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setDrawerOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSave}
                loading={saving}
                style={{ borderRadius: 8 }}
              >
                Save
              </Button>
            </Space>
          </div>
        }
      >
        <Form form={form} layout="vertical">
          {activeMeta?.fields.map((field) => {
            if (field.type === 'switch') {
              return (
                <Form.Item
                  key={field.key}
                  name={field.key}
                  label={field.label}
                  valuePropName="checked"
                >
                  <Switch />
                </Form.Item>
              )
            }

            if (field.type === 'number') {
              return (
                <Form.Item
                  key={field.key}
                  name={field.key}
                  label={field.label}
                  rules={field.required ? [{ required: true, message: `${field.label} is required` }] : undefined}
                >
                  <InputNumber
                    min={field.min}
                    max={field.max}
                    placeholder={field.placeholder}
                    style={{ width: '100%' }}
                  />
                </Form.Item>
              )
            }

            if (field.type === 'select') {
              return (
                <Form.Item
                  key={field.key}
                  name={field.key}
                  label={field.label}
                  rules={field.required ? [{ required: true, message: `${field.label} is required` }] : undefined}
                >
                  <Select
                    options={field.options}
                    placeholder={`Select ${field.label.toLowerCase()}`}
                    allowClear
                  />
                </Form.Item>
              )
            }

            if (field.type === 'tags') {
              return (
                <Form.Item
                  key={field.key}
                  name={field.key}
                  label={field.label}
                  extra={field.tip ? <Text style={{ fontSize: 12, color: '#9898b8' }}>{field.tip}</Text> : undefined}
                >
                  <Select
                    mode="tags"
                    placeholder={field.placeholder}
                    style={{ width: '100%' }}
                    tokenSeparators={[',']}
                  />
                </Form.Item>
              )
            }

            if (field.type === 'textarea') {
              return (
                <Form.Item
                  key={field.key}
                  name={field.key}
                  label={field.label}
                  rules={field.required ? [{ required: true, message: `${field.label} is required` }] : undefined}
                  extra={field.tip ? <Text style={{ fontSize: 12, color: '#9898b8' }}>{field.tip}</Text> : undefined}
                >
                  <Input.TextArea
                    rows={4}
                    placeholder={field.placeholder}
                    style={{ fontFamily: 'monospace', fontSize: 12 }}
                  />
                </Form.Item>
              )
            }

            return (
              <Form.Item
                key={field.key}
                name={field.key}
                label={field.label}
                rules={field.required ? [{ required: true, message: `${field.label} is required` }] : undefined}
                extra={field.tip ? <Text style={{ fontSize: 12, color: '#9898b8' }}>{field.tip}</Text> : undefined}
              >
                <Input
                  type={field.type === 'password' ? 'password' : 'text'}
                  placeholder={field.placeholder}
                  style={{ fontFamily: field.type === 'password' ? 'monospace' : undefined, fontSize: 13 }}
                />
              </Form.Item>
            )
          })}
        </Form>
      </Drawer>
    </div>
  )
}

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
  Divider,
  Tag,
} from 'antd'
import { MessageOutlined, SaveOutlined, DeleteOutlined } from '@ant-design/icons'
import {
  SiTelegram,
  SiDiscord,
  SiWhatsapp,
  SiSlack,
  SiWechat,
  SiSignal,
  SiImessage,
  SiMattermost,
  SiGooglechat,
} from 'react-icons/si'
import { TbBrandTeams } from 'react-icons/tb'
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
  type: 'input' | 'password' | 'switch' | 'select' | 'textarea' | 'tags'
  placeholder?: string
  options?: { label: string; value: string }[]
  required?: boolean
  tip?: string
}

const COMMON_FIELDS: FieldDef[] = [
  { key: 'enabled', label: 'Enabled', type: 'switch' },
  { key: 'dmPolicy', label: 'DM Policy', type: 'select', options: [
    { label: 'Allow all', value: 'allow' },
    { label: 'Allowlist only', value: 'allowlist' },
    { label: 'Deny all', value: 'deny' },
  ]},
  { key: 'requireMention', label: 'Require @mention in groups', type: 'switch' },
]

const iconStyle = { fontSize: 28 }

const CHANNEL_META: Record<string, ChannelMeta> = {
  telegram: {
    name: 'Telegram', color: '#0088cc', icon: <SiTelegram style={{ ...iconStyle, color: '#0088cc' }} />,
    fields: [
      { key: 'botToken', label: 'Bot Token', type: 'password', placeholder: '123456:ABC-DEF...', required: true, tip: 'Get from @BotFather' },
      { key: 'allowFrom', label: 'Allowed User IDs', type: 'tags', placeholder: 'Enter user ID and press Enter' },
      { key: 'groupAllowlist', label: 'Allowed Group IDs', type: 'tags', placeholder: 'Enter group ID and press Enter' },
      ...COMMON_FIELDS,
    ],
  },
  discord: {
    name: 'Discord', color: '#5865F2', icon: <SiDiscord style={{ ...iconStyle, color: '#5865F2' }} />,
    fields: [
      { key: 'botToken', label: 'Bot Token', type: 'password', required: true, tip: 'Get from Discord Developer Portal' },
      { key: 'applicationId', label: 'Application ID', type: 'input', placeholder: 'Discord application ID' },
      { key: 'allowFrom', label: 'Allowed User IDs', type: 'tags', placeholder: 'Enter user ID and press Enter' },
      ...COMMON_FIELDS,
    ],
  },
  whatsapp: {
    name: 'WhatsApp', color: '#25D366', icon: <SiWhatsapp style={{ ...iconStyle, color: '#25D366' }} />,
    fields: [
      { key: 'accessToken', label: 'Access Token', type: 'password', required: true },
      { key: 'phoneNumberId', label: 'Phone Number ID', type: 'input', placeholder: 'WhatsApp phone number ID' },
      { key: 'verifyToken', label: 'Verify Token', type: 'password', placeholder: 'Webhook verify token' },
      { key: 'allowFrom', label: 'Allowed Phone Numbers', type: 'tags', placeholder: '+1234567890' },
      ...COMMON_FIELDS,
    ],
  },
  slack: {
    name: 'Slack', color: '#4A154B', icon: <SiSlack style={{ ...iconStyle, color: '#E01E5A' }} />,
    fields: [
      { key: 'botToken', label: 'Bot Token (xoxb-)', type: 'password', required: true, tip: 'OAuth Bot User Token' },
      { key: 'appToken', label: 'App Token (xapp-)', type: 'password', tip: 'For Socket Mode' },
      { key: 'signingSecret', label: 'Signing Secret', type: 'password' },
      { key: 'allowFrom', label: 'Allowed User IDs', type: 'tags', placeholder: 'Enter Slack user ID' },
      ...COMMON_FIELDS,
    ],
  },
  wechat: {
    name: 'WeChat', color: '#07C160', icon: <SiWechat style={{ ...iconStyle, color: '#07C160' }} />,
    fields: [
      { key: 'appId', label: 'App ID', type: 'input', required: true },
      { key: 'appSecret', label: 'App Secret', type: 'password', required: true },
      { key: 'token', label: 'Token', type: 'password' },
      { key: 'encodingAESKey', label: 'Encoding AES Key', type: 'password' },
      ...COMMON_FIELDS,
    ],
  },
  signal: {
    name: 'Signal', color: '#3A76F0', icon: <SiSignal style={{ ...iconStyle, color: '#3A76F0' }} />,
    fields: [
      { key: 'phoneNumber', label: 'Phone Number', type: 'input', required: true, placeholder: '+1234567890' },
      { key: 'allowFrom', label: 'Allowed Numbers', type: 'tags', placeholder: '+1234567890' },
      ...COMMON_FIELDS,
    ],
  },
  imessage: {
    name: 'iMessage', color: '#34C759', icon: <SiImessage style={{ ...iconStyle, color: '#34C759' }} />,
    fields: [
      { key: 'allowFrom', label: 'Allowed Contacts', type: 'tags', placeholder: 'Phone or email' },
      ...COMMON_FIELDS,
    ],
  },
  mattermost: {
    name: 'Mattermost', color: '#0058CC', icon: <SiMattermost style={{ ...iconStyle, color: '#0058CC' }} />,
    fields: [
      { key: 'url', label: 'Server URL', type: 'input', required: true, placeholder: 'https://mattermost.example.com' },
      { key: 'botToken', label: 'Bot Token', type: 'password', required: true },
      { key: 'allowFrom', label: 'Allowed User IDs', type: 'tags' },
      ...COMMON_FIELDS,
    ],
  },
  teams: {
    name: 'Microsoft Teams', color: '#6264A7', icon: <TbBrandTeams style={{ ...iconStyle, color: '#6264A7' }} />,
    fields: [
      { key: 'appId', label: 'App ID', type: 'input', required: true },
      { key: 'appPassword', label: 'App Password', type: 'password', required: true },
      { key: 'allowFrom', label: 'Allowed User IDs', type: 'tags' },
      ...COMMON_FIELDS,
    ],
  },
  googlechat: {
    name: 'Google Chat', color: '#00AC47', icon: <SiGooglechat style={{ ...iconStyle, color: '#00AC47' }} />,
    fields: [
      { key: 'serviceAccountKey', label: 'Service Account Key (JSON)', type: 'textarea', required: true },
      { key: 'allowFrom', label: 'Allowed User Emails', type: 'tags', placeholder: 'user@company.com' },
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
        setChannels((cfg.channels ?? {}) as Record<string, Record<string, unknown>>)
      })
      .catch(() => message.error('Failed to load channels'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async (key: string, enabled: boolean) => {
    const updated = { ...channels, [key]: { ...channels[key], enabled } }
    setChannels(updated)
    try {
      await updateConfigSection('channels', updated)
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
      // Clean undefined values
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
      await updateConfigSection('channels', updated)
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
      await updateConfigSection('channels', updated)
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
          Connect your favorite messaging platforms
        </Text>
      </Space>

      <Row gutter={[16, 16]}>
        {allChannelKeys.map((key) => {
          const meta = CHANNEL_META[key] ?? { name: key, color: '#6C5CE7', icon: <MessageOutlined style={{ fontSize: 28, color: '#6C5CE7' }} />, fields: COMMON_FIELDS }
          const channelConfig = channels[key] ?? {}
          const enabled = channelConfig.enabled !== false && Object.keys(channelConfig).length > 0

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

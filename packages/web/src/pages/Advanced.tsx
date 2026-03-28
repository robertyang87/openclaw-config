import { useEffect, useState } from 'react'
import {
  Card,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Space,
  Typography,
  message,
  Row,
  Col,
  Switch,
} from 'antd'
import { SettingOutlined, SaveOutlined } from '@ant-design/icons'
import { getConfig, updateConfig, backupConfig } from '../api/config'

const { Title, Text } = Typography

export default function Advanced() {
  const [config, setConfig] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    getConfig()
      .then((cfg) => {
        setConfig(cfg)
        const gw = (cfg.gateway ?? {}) as Record<string, unknown>
        const session = (cfg.session ?? {}) as Record<string, unknown>
        const agents = (cfg.agents ?? {}) as Record<string, unknown>
        const defaults = (agents.defaults ?? agents) as Record<string, unknown>
        const sandbox = (defaults.sandbox ?? {}) as Record<string, unknown>
        const tailscale = (gw.tailscale ?? {}) as Record<string, unknown>
        const reset = (session.reset ?? {}) as Record<string, unknown>

        form.setFieldsValue({
          port: gw.port ?? 18789,
          bind: gw.bind ?? 'loopback',
          gatewayMode: gw.mode ?? 'local',
          authMode: (gw.auth as Record<string, unknown>)?.mode ?? 'none',
          tailscaleMode: tailscale.mode ?? 'off',
          sessionScope: session.scope ?? 'per-sender',
          dmScope: session.dmScope ?? 'main',
          resetMode: reset.mode ?? 'idle',
          idleMinutes: reset.idleMinutes ?? 30,
          sandboxMode: sandbox.mode ?? 'off',
          sandboxScope: sandbox.scope ?? 'session',
          typingMode: defaults.typingMode ?? 'thinking',
          blockStreaming: defaults.blockStreamingDefault ?? 'on',
        })
      })
      .catch(() => message.error('Failed to load config'))
      .finally(() => setLoading(false))
  }, [form])

  const handleSave = async () => {
    try {
      setSaving(true)
      const values = form.getFieldsValue()
      const updated = {
        ...config,
        gateway: {
          ...(config.gateway as Record<string, unknown>),
          mode: values.gatewayMode,
          port: values.port,
          bind: values.bind,
          auth: {
            ...((config.gateway as Record<string, unknown>)?.auth as Record<string, unknown>),
            mode: values.authMode,
          },
          tailscale: {
            ...((config.gateway as Record<string, unknown>)?.tailscale as Record<string, unknown>),
            mode: values.tailscaleMode,
          },
        },
        session: {
          ...(config.session as Record<string, unknown>),
          scope: values.sessionScope,
          dmScope: values.dmScope,
          reset: {
            ...((config.session as Record<string, unknown>)?.reset as Record<string, unknown>),
            mode: values.resetMode,
            idleMinutes: values.idleMinutes,
          },
        },
        agents: {
          ...(config.agents as Record<string, unknown>),
          defaults: {
            ...((config.agents as Record<string, unknown>)?.defaults as Record<string, unknown>),
            sandbox: {
              mode: values.sandboxMode,
              scope: values.sandboxScope,
            },
            typingMode: values.typingMode,
            blockStreamingDefault: values.blockStreaming,
          },
        },
      }
      await updateConfig(updated)
      setConfig(updated)
      message.success('Advanced settings saved')
    } catch {
      message.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleBackup = async () => {
    try {
      const result = await backupConfig()
      message.success(`Backup created: ${result.path}`)
    } catch {
      message.error('Backup failed')
    }
  }

  return (
    <div>
      <Space direction="vertical" size={4} style={{ marginBottom: 28 }}>
        <Space align="center">
          <SettingOutlined style={{ fontSize: 28, color: '#a29bfe' }} />
          <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>
            Advanced Settings
          </Title>
        </Space>
        <Text style={{ color: '#9898b8' }}>
          Gateway, session, sandbox, and system configuration
        </Text>
      </Space>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card title="Gateway" style={{ border: '1px solid #2a2a4a' }}>
              <Form.Item name="gatewayMode" label="Mode">
                <Select
                  options={[
                    { label: 'Local', value: 'local' },
                    { label: 'Remote', value: 'remote' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="port" label="Port">
                <InputNumber
                  min={1}
                  max={65535}
                  style={{ width: '100%' }}
                  placeholder="18789"
                />
              </Form.Item>
              <Form.Item name="bind" label="Bind Address">
                <Select
                  options={[
                    { label: 'Loopback (localhost)', value: 'loopback' },
                    { label: 'LAN', value: 'lan' },
                    { label: 'Tailscale', value: 'tailscale' },
                    { label: 'Auto', value: 'auto' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="authMode" label="Auth Mode">
                <Select
                  options={[
                    { label: 'None', value: 'none' },
                    { label: 'Token', value: 'token' },
                    { label: 'Password', value: 'password' },
                    { label: 'Trusted Proxy', value: 'trusted-proxy' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="tailscaleMode" label="Tailscale">
                <Select
                  options={[
                    { label: 'Off', value: 'off' },
                    { label: 'Serve (tailnet only)', value: 'serve' },
                    { label: 'Funnel (public)', value: 'funnel' },
                  ]}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Session" style={{ border: '1px solid #2a2a4a' }}>
              <Form.Item name="sessionScope" label="Session Scope">
                <Select
                  options={[
                    { label: 'Per Sender', value: 'per-sender' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="dmScope" label="DM Scope">
                <Select
                  options={[
                    { label: 'Main', value: 'main' },
                    { label: 'Per Peer', value: 'per-peer' },
                    { label: 'Per Channel Peer', value: 'per-channel-peer' },
                    { label: 'Per Account Channel Peer', value: 'per-account-channel-peer' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="resetMode" label="Reset Mode">
                <Select
                  options={[
                    { label: 'Idle timeout', value: 'idle' },
                    { label: 'Daily', value: 'daily' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="idleMinutes" label="Idle Minutes">
                <InputNumber min={1} max={1440} style={{ width: '100%' }} />
              </Form.Item>
            </Card>

            <Card title="Agent Defaults" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="sandboxMode" label="Sandbox Mode">
                <Select
                  options={[
                    { label: 'Off', value: 'off' },
                    { label: 'Non-main sessions', value: 'non-main' },
                    { label: 'All sessions', value: 'all' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="sandboxScope" label="Sandbox Scope">
                <Select
                  options={[
                    { label: 'Per Session', value: 'session' },
                    { label: 'Per Agent', value: 'agent' },
                    { label: 'Shared', value: 'shared' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="typingMode" label="Typing Indicator">
                <Select
                  options={[
                    { label: 'Never', value: 'never' },
                    { label: 'Instant', value: 'instant' },
                    { label: 'While thinking', value: 'thinking' },
                    { label: 'While messaging', value: 'message' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="blockStreaming" label="Block Streaming">
                <Select
                  options={[
                    { label: 'On', value: 'on' },
                    { label: 'Off', value: 'off' },
                  ]}
                />
              </Form.Item>
            </Card>

            <Card
              title="Maintenance"
              style={{ border: '1px solid #2a2a4a', marginTop: 20 }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Button onClick={handleBackup} block style={{ borderRadius: 8 }}>
                  Backup Config
                </Button>
                <Text style={{ color: '#9898b8', fontSize: 12 }}>
                  Creates a timestamped backup of your current configuration file.
                </Text>
              </Space>
            </Card>
          </Col>
        </Row>

        <div style={{ marginTop: 24, textAlign: 'right' }}>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            htmlType="submit"
            loading={saving}
            size="large"
            style={{ borderRadius: 10, paddingInline: 32 }}
          >
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  )
}

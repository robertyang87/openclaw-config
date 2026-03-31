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
import { getConfig, updateConfigSections, backupConfig } from '../api/config'

const { Title, Text } = Typography

export default function Advanced() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    getConfig()
      .then((cfg) => {
        const gw = (cfg.gateway ?? {}) as Record<string, unknown>
        const session = (cfg.session ?? {}) as Record<string, unknown>
        const agents = (cfg.agents ?? {}) as Record<string, unknown>
        const defaults = (agents.defaults ?? agents) as Record<string, unknown>
        const sandbox = (defaults.sandbox ?? {}) as Record<string, unknown>
        const compaction = (defaults.compaction ?? {}) as Record<string, unknown>
        const tailscale = (gw.tailscale ?? {}) as Record<string, unknown>
        const reset = (session.reset ?? {}) as Record<string, unknown>
        const threadBindings = (session.threadBindings ?? {}) as Record<string, unknown>
        const msgs = (cfg.messages ?? {}) as Record<string, unknown>
        const queue = (msgs.queue ?? {}) as Record<string, unknown>
        const cmds = (cfg.commands ?? {}) as Record<string, unknown>
        const ui = (cfg.ui ?? {}) as Record<string, unknown>
        const assistant = (ui.assistant ?? {}) as Record<string, unknown>
        const logging = (cfg.logging ?? {}) as Record<string, unknown>
        const memory = (cfg.memory ?? {}) as Record<string, unknown>
        const discovery = (cfg.discovery ?? {}) as Record<string, unknown>
        const mdns = (discovery.mdns ?? {}) as Record<string, unknown>

        form.setFieldsValue({
          // Gateway
          port: gw.port ?? 18789,
          bind: gw.bind ?? 'loopback',
          gatewayMode: gw.mode ?? 'local',
          authMode: (gw.auth as Record<string, unknown>)?.mode ?? 'none',
          tailscaleMode: tailscale.mode ?? 'off',
          tailscaleResetOnExit: tailscale.resetOnExit ?? false,
          gatewayReload: gw.reload ?? 'hybrid',

          // Session
          sessionScope: session.scope ?? 'per-sender',
          dmScope: session.dmScope ?? 'main',
          resetMode: reset.mode ?? 'idle',
          idleMinutes: reset.idleMinutes ?? 30,
          resetAtHour: reset.atHour,
          threadBindingsEnabled: threadBindings.enabled ?? false,
          threadBindingsIdleHours: threadBindings.idleHours,
          threadBindingsMaxAgeHours: threadBindings.maxAgeHours,

          // Agent defaults
          sandboxMode: sandbox.mode ?? 'off',
          sandboxScope: sandbox.scope ?? 'session',
          typingMode: defaults.typingMode ?? 'thinking',
          blockStreaming: defaults.blockStreamingDefault ?? 'on',
          imageMaxDimensionPx: defaults.imageMaxDimensionPx ?? 2048,
          userTimezone: defaults.userTimezone,
          thinkingDefault: defaults.thinkingDefault ?? 'adaptive',
          compactionMode: compaction.mode ?? 'safeguard',

          // Messages
          responsePrefix: msgs.responsePrefix ?? 'auto',
          ackReactionScope: msgs.ackReactionScope ?? 'group-mentions',
          removeAckAfterReply: msgs.removeAckAfterReply ?? true,
          queueMode: queue.mode ?? 'steer',

          // Commands
          commandsNative: cmds.native ?? 'auto',
          commandsText: cmds.text !== false,
          commandsBash: cmds.bash !== false,
          commandsConfig: cmds.config !== false,
          commandsRestart: cmds.restart !== false,

          // UI
          assistantName: assistant.name ?? 'OpenClaw',
          seamColor: ui.seamColor,

          // Logging
          logLevel: logging.level,
          redactSensitive: logging.redactSensitive ?? 'tools',

          // Memory
          memoryBackend: memory.backend ?? 'builtin',

          // Discovery
          mdnsEnabled: mdns.enabled ?? false,
        })
      })
      .catch(() => message.error('Failed to load config'))
      .finally(() => setLoading(false))
  }, [form])

  const handleSave = async () => {
    try {
      setSaving(true)
      const v = form.getFieldsValue()
      await updateConfigSections([
        { section: 'gateway', data: {
          mode: v.gatewayMode,
          port: v.port,
          bind: v.bind,
          auth: { mode: v.authMode },
          tailscale: { mode: v.tailscaleMode, resetOnExit: v.tailscaleResetOnExit },
          reload: v.gatewayReload,
        }},
        { section: 'session', data: {
          scope: v.sessionScope,
          dmScope: v.dmScope,
          reset: {
            mode: v.resetMode,
            idleMinutes: v.idleMinutes,
            ...(v.resetAtHour != null ? { atHour: v.resetAtHour } : { atHour: null }),
          },
          threadBindings: {
            enabled: v.threadBindingsEnabled,
            ...(v.threadBindingsIdleHours != null ? { idleHours: v.threadBindingsIdleHours } : { idleHours: null }),
            ...(v.threadBindingsMaxAgeHours != null ? { maxAgeHours: v.threadBindingsMaxAgeHours } : { maxAgeHours: null }),
          },
        }},
        { section: 'agents', data: {
          defaults: {
            sandbox: { mode: v.sandboxMode, scope: v.sandboxScope },
            typingMode: v.typingMode,
            blockStreamingDefault: v.blockStreaming,
            imageMaxDimensionPx: v.imageMaxDimensionPx,
            thinkingDefault: v.thinkingDefault,
            compaction: { mode: v.compactionMode },
            ...(v.userTimezone ? { userTimezone: v.userTimezone } : { userTimezone: null }),
          },
        }},
        { section: 'messages', data: {
          responsePrefix: v.responsePrefix,
          ackReactionScope: v.ackReactionScope,
          removeAckAfterReply: v.removeAckAfterReply,
          queue: { mode: v.queueMode },
        }},
        { section: 'commands', data: {
          native: v.commandsNative,
          text: v.commandsText,
          bash: v.commandsBash,
          config: v.commandsConfig,
          restart: v.commandsRestart,
        }},
        { section: 'ui', data: {
          assistant: { name: v.assistantName },
          ...(v.seamColor ? { seamColor: v.seamColor } : { seamColor: null }),
        }},
        { section: 'logging', data: {
          ...(v.logLevel ? { level: v.logLevel } : { level: null }),
          redactSensitive: v.redactSensitive,
        }},
        { section: 'memory', data: {
          backend: v.memoryBackend,
        }},
        { section: 'discovery', data: {
          mdns: { enabled: v.mdnsEnabled },
        }},
      ])
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
          Gateway, session, messages, commands, and system configuration
        </Text>
      </Space>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card title="Gateway" style={{ border: '1px solid #2a2a4a' }}>
              <Form.Item name="gatewayMode" label="Mode">
                <Select options={[
                  { label: 'Local', value: 'local' },
                  { label: 'Remote', value: 'remote' },
                ]} />
              </Form.Item>
              <Form.Item name="port" label="Port">
                <InputNumber min={1} max={65535} style={{ width: '100%' }} placeholder="18789" />
              </Form.Item>
              <Form.Item name="bind" label="Bind Address">
                <Select options={[
                  { label: 'Loopback (localhost)', value: 'loopback' },
                  { label: 'LAN', value: 'lan' },
                  { label: 'Tailscale', value: 'tailscale' },
                  { label: 'Auto', value: 'auto' },
                ]} />
              </Form.Item>
              <Form.Item name="authMode" label="Auth Mode">
                <Select options={[
                  { label: 'None', value: 'none' },
                  { label: 'Token', value: 'token' },
                  { label: 'Password', value: 'password' },
                  { label: 'Trusted Proxy', value: 'trusted-proxy' },
                ]} />
              </Form.Item>
              <Form.Item name="tailscaleMode" label="Tailscale">
                <Select options={[
                  { label: 'Off', value: 'off' },
                  { label: 'Serve (tailnet only)', value: 'serve' },
                  { label: 'Funnel (public)', value: 'funnel' },
                ]} />
              </Form.Item>
              <Form.Item name="tailscaleResetOnExit" label="Tailscale Reset on Exit" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="gatewayReload" label="Reload Strategy">
                <Select options={[
                  { label: 'Off', value: 'off' },
                  { label: 'Restart', value: 'restart' },
                  { label: 'Hot', value: 'hot' },
                  { label: 'Hybrid (default)', value: 'hybrid' },
                ]} />
              </Form.Item>
            </Card>

            <Card title="Session" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="sessionScope" label="Session Scope">
                <Select options={[
                  { label: 'Per Sender', value: 'per-sender' },
                ]} />
              </Form.Item>
              <Form.Item name="dmScope" label="DM Scope">
                <Select options={[
                  { label: 'Main', value: 'main' },
                  { label: 'Per Peer', value: 'per-peer' },
                  { label: 'Per Channel Peer', value: 'per-channel-peer' },
                  { label: 'Per Account Channel Peer', value: 'per-account-channel-peer' },
                ]} />
              </Form.Item>
              <Form.Item name="resetMode" label="Reset Mode">
                <Select options={[
                  { label: 'Idle timeout', value: 'idle' },
                  { label: 'Daily', value: 'daily' },
                ]} />
              </Form.Item>
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.resetMode !== cur.resetMode}>
                {({ getFieldValue }) =>
                  getFieldValue('resetMode') === 'idle' ? (
                    <Form.Item name="idleMinutes" label="Idle Minutes">
                      <InputNumber min={1} max={1440} style={{ width: '100%' }} />
                    </Form.Item>
                  ) : (
                    <Form.Item name="resetAtHour" label="Daily Reset Hour (0-23)">
                      <InputNumber min={0} max={23} style={{ width: '100%' }} />
                    </Form.Item>
                  )
                }
              </Form.Item>
              <Form.Item name="threadBindingsEnabled" label="Thread Bindings" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.threadBindingsEnabled !== cur.threadBindingsEnabled}>
                {({ getFieldValue }) =>
                  getFieldValue('threadBindingsEnabled') ? (
                    <>
                      <Form.Item name="threadBindingsIdleHours" label="Thread Idle Hours">
                        <InputNumber min={1} max={720} style={{ width: '100%' }} placeholder="Auto" />
                      </Form.Item>
                      <Form.Item name="threadBindingsMaxAgeHours" label="Thread Max Age Hours">
                        <InputNumber min={1} max={8760} style={{ width: '100%' }} placeholder="Auto" />
                      </Form.Item>
                    </>
                  ) : null
                }
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Agent Defaults" style={{ border: '1px solid #2a2a4a' }}>
              <Form.Item name="thinkingDefault" label="Thinking Level">
                <Select options={[
                  { label: 'Off', value: 'off' },
                  { label: 'Minimal', value: 'minimal' },
                  { label: 'Low', value: 'low' },
                  { label: 'Medium', value: 'medium' },
                  { label: 'High', value: 'high' },
                  { label: 'Extra High', value: 'xhigh' },
                  { label: 'Adaptive (default)', value: 'adaptive' },
                ]} />
              </Form.Item>
              <Form.Item name="compactionMode" label="Context Compaction">
                <Select options={[
                  { label: 'Safeguard (default)', value: 'safeguard' },
                  { label: 'Aggressive', value: 'aggressive' },
                  { label: 'Off', value: 'off' },
                ]} />
              </Form.Item>
              <Form.Item name="sandboxMode" label="Sandbox Mode">
                <Select options={[
                  { label: 'Off', value: 'off' },
                  { label: 'Non-main sessions', value: 'non-main' },
                  { label: 'All sessions', value: 'all' },
                ]} />
              </Form.Item>
              <Form.Item name="sandboxScope" label="Sandbox Scope">
                <Select options={[
                  { label: 'Per Session', value: 'session' },
                  { label: 'Per Agent', value: 'agent' },
                  { label: 'Shared', value: 'shared' },
                ]} />
              </Form.Item>
              <Form.Item name="typingMode" label="Typing Indicator">
                <Select options={[
                  { label: 'Never', value: 'never' },
                  { label: 'Instant', value: 'instant' },
                  { label: 'While thinking', value: 'thinking' },
                  { label: 'While messaging', value: 'message' },
                ]} />
              </Form.Item>
              <Form.Item name="blockStreaming" label="Block Streaming">
                <Select options={[
                  { label: 'On', value: 'on' },
                  { label: 'Off', value: 'off' },
                ]} />
              </Form.Item>
              <Form.Item name="imageMaxDimensionPx" label="Max Image Dimension (px)">
                <InputNumber min={256} max={8192} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="userTimezone" label="User Timezone">
                <Input placeholder="e.g. Asia/Shanghai, America/New_York" />
              </Form.Item>
            </Card>

            <Card title="Messages" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="responsePrefix" label="Response Prefix">
                <Select options={[
                  { label: 'Auto', value: 'auto' },
                  { label: 'Emoji', value: 'emoji' },
                ]} />
              </Form.Item>
              <Form.Item name="ackReactionScope" label="Ack Reaction Scope">
                <Select options={[
                  { label: 'Group mentions', value: 'group-mentions' },
                  { label: 'Group all', value: 'group-all' },
                  { label: 'Direct', value: 'direct' },
                  { label: 'All', value: 'all' },
                  { label: 'Off', value: 'off' },
                ]} />
              </Form.Item>
              <Form.Item name="removeAckAfterReply" label="Remove Ack After Reply" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="queueMode" label="Message Queue Mode">
                <Select options={[
                  { label: 'Steer (default)', value: 'steer' },
                  { label: 'Follow-up', value: 'followup' },
                  { label: 'Collect', value: 'collect' },
                  { label: 'Steer Backlog', value: 'steer-backlog' },
                  { label: 'Queue', value: 'queue' },
                  { label: 'Interrupt', value: 'interrupt' },
                ]} />
              </Form.Item>
            </Card>

            <Card title="Chat Commands" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="commandsNative" label="Native Commands">
                <Select options={[
                  { label: 'Auto', value: 'auto' },
                  { label: 'Enabled', value: true },
                  { label: 'Disabled', value: false },
                ]} />
              </Form.Item>
              <Form.Item name="commandsText" label="/status, /think, /verbose" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="commandsBash" label="/bash" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="commandsConfig" label="/config" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="commandsRestart" label="/restart" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            <Card title="UI" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="assistantName" label="Assistant Name">
                <Input placeholder="OpenClaw" />
              </Form.Item>
              <Form.Item name="seamColor" label="Seam Color">
                <Input placeholder="e.g. #6C5CE7" />
              </Form.Item>
            </Card>

            <Card title="Logging" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="logLevel" label="Log Level">
                <Select allowClear placeholder="Default" options={[
                  { label: 'Debug', value: 'debug' },
                  { label: 'Info', value: 'info' },
                  { label: 'Warn', value: 'warn' },
                  { label: 'Error', value: 'error' },
                ]} />
              </Form.Item>
              <Form.Item name="redactSensitive" label="Redact Sensitive Data">
                <Select options={[
                  { label: 'Tools only (default)', value: 'tools' },
                  { label: 'All', value: 'all' },
                  { label: 'Off', value: 'off' },
                ]} />
              </Form.Item>
            </Card>

            <Card title="Memory" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="memoryBackend" label="Memory Backend">
                <Select options={[
                  { label: 'Built-in (default)', value: 'builtin' },
                  { label: 'QMD', value: 'qmd' },
                ]} />
              </Form.Item>
            </Card>

            <Card title="Discovery" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="mdnsEnabled" label="mDNS / Bonjour" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            <Card title="Maintenance" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
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

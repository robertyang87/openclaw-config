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
import { useTranslation } from 'react-i18next'
import { getConfig, updateConfigSections, backupConfig } from '../api/config'

const { Title, Text } = Typography

export default function Advanced() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const { t } = useTranslation()

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
          port: gw.port ?? 18789,
          bind: gw.bind ?? 'loopback',
          gatewayMode: gw.mode ?? 'local',
          authMode: (gw.auth as Record<string, unknown>)?.mode ?? 'none',
          tailscaleMode: tailscale.mode ?? 'off',
          tailscaleResetOnExit: tailscale.resetOnExit ?? false,
          gatewayReload: gw.reload ?? 'hybrid',
          sessionScope: session.scope ?? 'per-sender',
          dmScope: session.dmScope ?? 'main',
          resetMode: reset.mode ?? 'idle',
          idleMinutes: reset.idleMinutes ?? 30,
          resetAtHour: reset.atHour,
          threadBindingsEnabled: threadBindings.enabled ?? false,
          threadBindingsIdleHours: threadBindings.idleHours,
          threadBindingsMaxAgeHours: threadBindings.maxAgeHours,
          sandboxMode: sandbox.mode ?? 'off',
          sandboxScope: sandbox.scope ?? 'session',
          typingMode: defaults.typingMode ?? 'thinking',
          blockStreaming: defaults.blockStreamingDefault ?? 'on',
          imageMaxDimensionPx: defaults.imageMaxDimensionPx ?? 2048,
          userTimezone: defaults.userTimezone,
          thinkingDefault: defaults.thinkingDefault ?? 'adaptive',
          compactionMode: compaction.mode ?? 'safeguard',
          responsePrefix: msgs.responsePrefix ?? 'auto',
          ackReactionScope: msgs.ackReactionScope ?? 'group-mentions',
          removeAckAfterReply: msgs.removeAckAfterReply ?? true,
          queueMode: queue.mode ?? 'steer',
          commandsNative: cmds.native ?? 'auto',
          commandsText: cmds.text !== false,
          commandsBash: cmds.bash !== false,
          commandsConfig: cmds.config !== false,
          commandsRestart: cmds.restart !== false,
          assistantName: assistant.name ?? 'OpenClaw',
          seamColor: ui.seamColor,
          logLevel: logging.level,
          redactSensitive: logging.redactSensitive ?? 'tools',
          memoryBackend: memory.backend ?? 'builtin',
          mdnsEnabled: mdns.enabled ?? false,
        })
      })
      .catch(() => message.error(t('advanced.loadError')))
      .finally(() => setLoading(false))
  }, [form, t])

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
      message.success(t('advanced.savedSuccess'))
    } catch {
      message.error(t('advanced.savedError'))
    } finally {
      setSaving(false)
    }
  }

  const handleBackup = async () => {
    try {
      const result = await backupConfig()
      message.success(t('advanced.backupSuccess', { path: result.path }))
    } catch {
      message.error(t('advanced.backupError'))
    }
  }

  return (
    <div>
      <Space direction="vertical" size={4} style={{ marginBottom: 28 }}>
        <Space align="center">
          <SettingOutlined style={{ fontSize: 28, color: '#a29bfe' }} />
          <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>
            {t('advanced.title')}
          </Title>
        </Space>
        <Text style={{ color: '#9898b8' }}>
          {t('advanced.subtitle')}
        </Text>
      </Space>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card title={t('advanced.gateway')} style={{ border: '1px solid #2a2a4a' }}>
              <Form.Item name="gatewayMode" label={t('advanced.mode')}>
                <Select options={[
                  { label: t('advanced.modeLocal'), value: 'local' },
                  { label: t('advanced.modeRemote'), value: 'remote' },
                ]} />
              </Form.Item>
              <Form.Item name="port" label={t('advanced.port')}>
                <InputNumber min={1} max={65535} style={{ width: '100%' }} placeholder="18789" />
              </Form.Item>
              <Form.Item name="bind" label={t('advanced.bindAddress')}>
                <Select options={[
                  { label: t('advanced.bindLoopback'), value: 'loopback' },
                  { label: t('advanced.bindLan'), value: 'lan' },
                  { label: t('advanced.bindTailscale'), value: 'tailscale' },
                  { label: t('advanced.bindAuto'), value: 'auto' },
                ]} />
              </Form.Item>
              <Form.Item name="authMode" label={t('advanced.authMode')}>
                <Select options={[
                  { label: t('advanced.authNone'), value: 'none' },
                  { label: t('advanced.authToken'), value: 'token' },
                  { label: t('advanced.authPassword'), value: 'password' },
                  { label: t('advanced.authTrustedProxy'), value: 'trusted-proxy' },
                ]} />
              </Form.Item>
              <Form.Item name="tailscaleMode" label={t('advanced.tailscale')}>
                <Select options={[
                  { label: t('advanced.tailscaleOff'), value: 'off' },
                  { label: t('advanced.tailscaleServe'), value: 'serve' },
                  { label: t('advanced.tailscaleFunnel'), value: 'funnel' },
                ]} />
              </Form.Item>
              <Form.Item name="tailscaleResetOnExit" label={t('advanced.tailscaleReset')} valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="gatewayReload" label={t('advanced.reloadStrategy')}>
                <Select options={[
                  { label: t('advanced.reloadOff'), value: 'off' },
                  { label: t('advanced.reloadRestart'), value: 'restart' },
                  { label: t('advanced.reloadHot'), value: 'hot' },
                  { label: t('advanced.reloadHybrid'), value: 'hybrid' },
                ]} />
              </Form.Item>
            </Card>

            <Card title={t('advanced.session')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="sessionScope" label={t('advanced.sessionScope')}>
                <Select options={[
                  { label: t('advanced.perSender'), value: 'per-sender' },
                ]} />
              </Form.Item>
              <Form.Item name="dmScope" label={t('advanced.dmScope')}>
                <Select options={[
                  { label: t('advanced.dmMain'), value: 'main' },
                  { label: t('advanced.dmPerPeer'), value: 'per-peer' },
                  { label: t('advanced.dmPerChannelPeer'), value: 'per-channel-peer' },
                  { label: t('advanced.dmPerAccountChannelPeer'), value: 'per-account-channel-peer' },
                ]} />
              </Form.Item>
              <Form.Item name="resetMode" label={t('advanced.resetMode')}>
                <Select options={[
                  { label: t('advanced.resetIdle'), value: 'idle' },
                  { label: t('advanced.resetDaily'), value: 'daily' },
                ]} />
              </Form.Item>
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.resetMode !== cur.resetMode}>
                {({ getFieldValue }) =>
                  getFieldValue('resetMode') === 'idle' ? (
                    <Form.Item name="idleMinutes" label={t('advanced.idleMinutes')}>
                      <InputNumber min={1} max={1440} style={{ width: '100%' }} />
                    </Form.Item>
                  ) : (
                    <Form.Item name="resetAtHour" label={t('advanced.dailyResetHour')}>
                      <InputNumber min={0} max={23} style={{ width: '100%' }} />
                    </Form.Item>
                  )
                }
              </Form.Item>
              <Form.Item name="threadBindingsEnabled" label={t('advanced.threadBindings')} valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.threadBindingsEnabled !== cur.threadBindingsEnabled}>
                {({ getFieldValue }) =>
                  getFieldValue('threadBindingsEnabled') ? (
                    <>
                      <Form.Item name="threadBindingsIdleHours" label={t('advanced.threadIdleHours')}>
                        <InputNumber min={1} max={720} style={{ width: '100%' }} placeholder="Auto" />
                      </Form.Item>
                      <Form.Item name="threadBindingsMaxAgeHours" label={t('advanced.threadMaxAgeHours')}>
                        <InputNumber min={1} max={8760} style={{ width: '100%' }} placeholder="Auto" />
                      </Form.Item>
                    </>
                  ) : null
                }
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title={t('advanced.agentDefaults')} style={{ border: '1px solid #2a2a4a' }}>
              <Form.Item name="thinkingDefault" label={t('advanced.thinkingLevel')}>
                <Select options={[
                  { label: t('advanced.thinkingOff'), value: 'off' },
                  { label: t('advanced.thinkingMinimal'), value: 'minimal' },
                  { label: t('advanced.thinkingLow'), value: 'low' },
                  { label: t('advanced.thinkingMedium'), value: 'medium' },
                  { label: t('advanced.thinkingHigh'), value: 'high' },
                  { label: t('advanced.thinkingXhigh'), value: 'xhigh' },
                  { label: t('advanced.thinkingAdaptive'), value: 'adaptive' },
                ]} />
              </Form.Item>
              <Form.Item name="compactionMode" label={t('advanced.compaction')}>
                <Select options={[
                  { label: t('advanced.compactionSafeguard'), value: 'safeguard' },
                  { label: t('advanced.compactionAggressive'), value: 'aggressive' },
                  { label: t('advanced.compactionOff'), value: 'off' },
                ]} />
              </Form.Item>
              <Form.Item name="sandboxMode" label={t('advanced.sandboxMode')}>
                <Select options={[
                  { label: t('advanced.sandboxOff'), value: 'off' },
                  { label: t('advanced.sandboxNonMain'), value: 'non-main' },
                  { label: t('advanced.sandboxAll'), value: 'all' },
                ]} />
              </Form.Item>
              <Form.Item name="sandboxScope" label={t('advanced.sandboxScope')}>
                <Select options={[
                  { label: t('advanced.sandboxPerSession'), value: 'session' },
                  { label: t('advanced.sandboxPerAgent'), value: 'agent' },
                  { label: t('advanced.sandboxShared'), value: 'shared' },
                ]} />
              </Form.Item>
              <Form.Item name="typingMode" label={t('advanced.typingIndicator')}>
                <Select options={[
                  { label: t('advanced.typingNever'), value: 'never' },
                  { label: t('advanced.typingInstant'), value: 'instant' },
                  { label: t('advanced.typingThinking'), value: 'thinking' },
                  { label: t('advanced.typingMessage'), value: 'message' },
                ]} />
              </Form.Item>
              <Form.Item name="blockStreaming" label={t('advanced.blockStreaming')}>
                <Select options={[
                  { label: t('advanced.streamOn'), value: 'on' },
                  { label: t('advanced.streamOff'), value: 'off' },
                ]} />
              </Form.Item>
              <Form.Item name="imageMaxDimensionPx" label={t('advanced.maxImageDimension')}>
                <InputNumber min={256} max={8192} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="userTimezone" label={t('advanced.userTimezone')}>
                <Input placeholder="e.g. Asia/Shanghai, America/New_York" />
              </Form.Item>
            </Card>

            <Card title={t('advanced.messages')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="responsePrefix" label={t('advanced.responsePrefix')}>
                <Select options={[
                  { label: t('advanced.prefixAuto'), value: 'auto' },
                  { label: t('advanced.prefixEmoji'), value: 'emoji' },
                ]} />
              </Form.Item>
              <Form.Item name="ackReactionScope" label={t('advanced.ackReactionScope')}>
                <Select options={[
                  { label: t('advanced.ackGroupMentions'), value: 'group-mentions' },
                  { label: t('advanced.ackGroupAll'), value: 'group-all' },
                  { label: t('advanced.ackDirect'), value: 'direct' },
                  { label: t('advanced.ackAll'), value: 'all' },
                  { label: t('advanced.ackOff'), value: 'off' },
                ]} />
              </Form.Item>
              <Form.Item name="removeAckAfterReply" label={t('advanced.removeAckAfterReply')} valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="queueMode" label={t('advanced.queueMode')}>
                <Select options={[
                  { label: t('advanced.queueSteer'), value: 'steer' },
                  { label: t('advanced.queueFollowup'), value: 'followup' },
                  { label: t('advanced.queueCollect'), value: 'collect' },
                  { label: t('advanced.queueSteerBacklog'), value: 'steer-backlog' },
                  { label: t('advanced.queueQueue'), value: 'queue' },
                  { label: t('advanced.queueInterrupt'), value: 'interrupt' },
                ]} />
              </Form.Item>
            </Card>

            <Card title={t('advanced.chatCommands')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="commandsNative" label={t('advanced.nativeCommands')}>
                <Select options={[
                  { label: t('advanced.nativeAuto'), value: 'auto' },
                  { label: t('advanced.nativeEnabled'), value: true },
                  { label: t('advanced.nativeDisabled'), value: false },
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

            <Card title={t('advanced.ui')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="assistantName" label={t('advanced.assistantName')}>
                <Input placeholder="OpenClaw" />
              </Form.Item>
              <Form.Item name="seamColor" label={t('advanced.seamColor')}>
                <Input placeholder="e.g. #6C5CE7" />
              </Form.Item>
            </Card>

            <Card title={t('advanced.logging')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="logLevel" label={t('advanced.logLevel')}>
                <Select allowClear placeholder="Default" options={[
                  { label: t('advanced.logDebug'), value: 'debug' },
                  { label: t('advanced.logInfo'), value: 'info' },
                  { label: t('advanced.logWarn'), value: 'warn' },
                  { label: t('advanced.logError'), value: 'error' },
                ]} />
              </Form.Item>
              <Form.Item name="redactSensitive" label={t('advanced.redactSensitive')}>
                <Select options={[
                  { label: t('advanced.redactTools'), value: 'tools' },
                  { label: t('advanced.redactAll'), value: 'all' },
                  { label: t('advanced.redactOff'), value: 'off' },
                ]} />
              </Form.Item>
            </Card>

            <Card title={t('advanced.memory')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="memoryBackend" label={t('advanced.memoryBackend')}>
                <Select options={[
                  { label: t('advanced.memoryBuiltin'), value: 'builtin' },
                  { label: t('advanced.memoryQmd'), value: 'qmd' },
                ]} />
              </Form.Item>
            </Card>

            <Card title={t('advanced.discovery')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="mdnsEnabled" label={t('advanced.mdns')} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            <Card title={t('advanced.maintenance')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                <Button onClick={handleBackup} block style={{ borderRadius: 8 }}>
                  {t('advanced.backupConfig')}
                </Button>
                <Text style={{ color: '#9898b8', fontSize: 12 }}>
                  {t('advanced.backupDesc')}
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
            {t('advanced.saveChanges')}
          </Button>
        </div>
      </Form>
    </div>
  )
}

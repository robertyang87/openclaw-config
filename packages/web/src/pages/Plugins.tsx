import { useEffect, useState } from 'react'
import {
  Row,
  Col,
  Typography,
  Space,
  message,
  Card,
  Form,
  Select,
  Switch,
  InputNumber,
  Button,
  Divider,
  Tag,
} from 'antd'
import { AppstoreOutlined, SaveOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { getConfig, updateConfigSections } from '../api/config'

const { Title, Text } = Typography

const TOOL_GROUP_KEYS = [
  'runtime', 'fs', 'web', 'sessions', 'memory',
  'ui', 'automation', 'messaging', 'nodes', 'openclaw',
] as const

const TOOL_GROUP_NAMES: Record<string, string> = {
  runtime: 'Runtime',
  fs: 'Filesystem',
  web: 'Web',
  sessions: 'Sessions',
  memory: 'Memory',
  ui: 'Canvas / UI',
  automation: 'Automation',
  messaging: 'Messaging',
  nodes: 'Nodes',
  openclaw: 'OpenClaw',
}

interface McpServer {
  command: string
  args?: string[]
  env?: Record<string, string>
}

export default function Plugins() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [mcpServers, setMcpServers] = useState<Record<string, McpServer>>({})
  const [form] = Form.useForm()
  const { t } = useTranslation()

  useEffect(() => {
    getConfig()
      .then((cfg) => {
        const tools = (cfg.tools ?? {}) as Record<string, unknown>
        const browser = (cfg.browser ?? {}) as Record<string, unknown>
        const skills = (cfg.skills ?? {}) as Record<string, unknown>
        const cron = (cfg.cron ?? {}) as Record<string, unknown>
        const hooks = (cfg.hooks ?? {}) as Record<string, unknown>
        const web = (tools.web ?? {}) as Record<string, unknown>
        const webSearch = (web.search ?? {}) as Record<string, unknown>
        const webFetch = (web.fetch ?? {}) as Record<string, unknown>
        const exec = (tools.exec ?? {}) as Record<string, unknown>
        const media = (tools.media ?? {}) as Record<string, unknown>
        const agentToAgent = (tools.agentToAgent ?? {}) as Record<string, unknown>
        const loopDetection = (tools.loopDetection ?? {}) as Record<string, unknown>
        const sandbox = (tools.sandbox ?? {}) as Record<string, unknown>
        const links = (tools.links ?? {}) as Record<string, unknown>
        const mcp = (cfg.mcp ?? {}) as Record<string, unknown>
        setMcpServers((mcp.servers ?? {}) as Record<string, McpServer>)

        form.setFieldsValue({
          toolProfile: tools.profile ?? 'full',
          toolAllow: tools.allow ?? [],
          toolAlsoAllow: tools.alsoAllow ?? [],
          toolDeny: tools.deny ?? [],

          browserEnabled: browser.enabled !== false,
          browserHeadless: browser.headless !== false,

          webSearchEnabled: webSearch.enabled !== false,
          webFetchEnabled: webFetch.enabled !== false,
          execTimeoutSec: exec.timeoutSec ?? 120,
          execAskMode: exec.askMode,

          mediaEnabled: media.enabled !== false,
          agentToAgentEnabled: agentToAgent.enabled !== false,
          linksEnabled: links.enabled !== false,

          loopDetectionEnabled: loopDetection.enabled !== false,
          sandboxMode: sandbox.mode ?? 'off',

          cronEnabled: cron.enabled !== false,
          cronMaxConcurrent: cron.maxConcurrentRuns ?? 1,

          hooksEnabled: hooks.enabled !== false,

          skillsAllowBundled: skills.allowBundled ?? [],
        })
      })
      .catch(() => message.error(t('plugins.loadError')))
      .finally(() => setLoading(false))
  }, [form, t])

  const handleSave = async () => {
    try {
      setSaving(true)
      const v = form.getFieldsValue()
      await updateConfigSections([
        { section: 'tools', data: {
          profile: v.toolProfile,
          allow: v.toolAllow?.length ? v.toolAllow : [],
          alsoAllow: v.toolAlsoAllow?.length ? v.toolAlsoAllow : [],
          deny: v.toolDeny?.length ? v.toolDeny : [],
          web: {
            search: { enabled: v.webSearchEnabled },
            fetch: { enabled: v.webFetchEnabled },
          },
          exec: {
            timeoutSec: v.execTimeoutSec,
            ...(v.execAskMode ? { askMode: v.execAskMode } : { askMode: null }),
          },
          media: { enabled: v.mediaEnabled },
          agentToAgent: { enabled: v.agentToAgentEnabled },
          links: { enabled: v.linksEnabled },
          loopDetection: { enabled: v.loopDetectionEnabled },
          ...(v.sandboxMode !== 'off' ? { sandbox: { mode: v.sandboxMode } } : {}),
        }},
        { section: 'browser', data: {
          enabled: v.browserEnabled,
          headless: v.browserHeadless,
        }},
        { section: 'cron', data: {
          enabled: v.cronEnabled,
          maxConcurrentRuns: v.cronMaxConcurrent,
        }},
        { section: 'hooks', data: {
          enabled: v.hooksEnabled,
        }},
        { section: 'skills', data: {
          allowBundled: v.skillsAllowBundled ?? [],
        }},
      ])
      message.success(t('plugins.savedSuccess'))
    } catch {
      message.error(t('plugins.savedError'))
    } finally {
      setSaving(false)
    }
  }

  const toolGroupOptions = TOOL_GROUP_KEYS.map((key) => ({
    label: `group:${key} — ${TOOL_GROUP_NAMES[key]}`,
    value: `group:${key}`,
  }))

  return (
    <div>
      <Space direction="vertical" size={4} style={{ marginBottom: 28 }}>
        <Space align="center">
          <AppstoreOutlined style={{ fontSize: 28, color: '#fdcb6e' }} />
          <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>
            {t('plugins.title')}
          </Title>
        </Space>
        <Text style={{ color: '#9898b8' }}>
          {t('plugins.subtitle')}
        </Text>
      </Space>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card title={t('plugins.toolAccessControl')} style={{ border: '1px solid #2a2a4a' }}>
              <Form.Item name="toolProfile" label={t('plugins.toolProfile')}>
                <Select options={[
                  { label: t('plugins.profileFull'), value: 'full' },
                  { label: t('plugins.profileCoding'), value: 'coding' },
                  { label: t('plugins.profileMessaging'), value: 'messaging' },
                  { label: t('plugins.profileMinimal'), value: 'minimal' },
                ]} />
              </Form.Item>
              <Form.Item name="toolAllow" label={t('plugins.allow')}>
                <Select mode="tags" placeholder="e.g. group:web, group:fs" options={toolGroupOptions} />
              </Form.Item>
              <Form.Item name="toolAlsoAllow" label={t('plugins.alsoAllow')}>
                <Select mode="tags" placeholder="e.g. group:messaging" options={toolGroupOptions} />
              </Form.Item>
              <Form.Item name="toolDeny" label={t('plugins.deny')}>
                <Select mode="tags" placeholder="e.g. group:runtime" options={toolGroupOptions} />
              </Form.Item>

              <Divider style={{ borderColor: '#2a2a4a' }} />
              <Text style={{ color: '#9898b8', fontSize: 12 }}>
                {t('plugins.availableGroups')}
              </Text>
              <div style={{ marginTop: 8 }}>
                {TOOL_GROUP_KEYS.map((key) => (
                  <Tag key={key} style={{ marginBottom: 6, borderRadius: 8, fontSize: 11 }}>
                    group:{key} — {t(`plugins.toolGroups.${key}`)}
                  </Tag>
                ))}
              </div>
            </Card>

            <Card title={t('plugins.skills')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="skillsAllowBundled" label={t('plugins.allowedBundledSkills')}>
                <Select mode="tags" placeholder={t('plugins.allowedBundledSkillsPlaceholder')} />
              </Form.Item>
            </Card>

            <Card
              title={t('plugins.mcpServers')}
              style={{ border: '1px solid #2a2a4a', marginTop: 20 }}
              extra={
                <Tag color="purple" style={{ borderRadius: 12, fontSize: 11 }}>
                  {t('plugins.mcpConfigured', { count: Object.keys(mcpServers).length })}
                </Tag>
              }
            >
              {Object.keys(mcpServers).length === 0 ? (
                <Text style={{ color: '#9898b8', fontSize: 12 }}>
                  {t('plugins.mcpEmpty')}
                </Text>
              ) : (
                <Space direction="vertical" size={8} style={{ width: '100%' }}>
                  {Object.entries(mcpServers).map(([name, server]) => (
                    <div
                      key={name}
                      style={{
                        padding: '10px 14px',
                        background: 'rgba(108, 92, 231, 0.04)',
                        border: '1px solid #2a2a4a',
                        borderRadius: 8,
                      }}
                    >
                      <Text strong style={{ fontSize: 13 }}>{name}</Text>
                      <br />
                      <Text code style={{ fontSize: 11 }}>
                        {server.command}{server.args?.length ? ' ' + server.args.join(' ') : ''}
                      </Text>
                    </div>
                  ))}
                </Space>
              )}
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title={t('plugins.browser')} style={{ border: '1px solid #2a2a4a' }}>
              <Form.Item name="browserEnabled" label={t('plugins.browserEnabled')} valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="browserHeadless" label={t('plugins.headlessMode')} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            <Card title={t('plugins.webTools')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="webSearchEnabled" label={t('plugins.webSearch')} valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="webFetchEnabled" label={t('plugins.webFetch')} valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="linksEnabled" label={t('plugins.linkUnderstanding')} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            <Card title={t('plugins.shellExecution')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="execTimeoutSec" label={t('plugins.timeoutSec')}>
                <InputNumber min={1} max={3600} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="execAskMode" label={t('plugins.askMode')}>
                <Select allowClear placeholder={t('plugins.askDefault')} options={[
                  { label: t('plugins.askAlways'), value: 'always' },
                  { label: t('plugins.askAuto'), value: 'auto' },
                  { label: t('plugins.askNever'), value: 'never' },
                ]} />
              </Form.Item>
            </Card>

            <Card title={t('plugins.mediaAgent')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="mediaEnabled" label={t('plugins.audioVideo')} valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="agentToAgentEnabled" label={t('plugins.interAgent')} valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            <Card title={t('plugins.safety')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="loopDetectionEnabled" label={t('plugins.loopDetection')} valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="sandboxMode" label={t('plugins.sandboxMode')}>
                <Select options={[
                  { label: t('plugins.sandboxOff'), value: 'off' },
                  { label: t('plugins.sandboxNonMain'), value: 'non-main' },
                  { label: t('plugins.sandboxAll'), value: 'all' },
                ]} />
              </Form.Item>
            </Card>

            <Card title={t('plugins.cron')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="cronEnabled" label={t('plugins.cronEnabled')} valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="cronMaxConcurrent" label={t('plugins.cronMaxConcurrent')}>
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Card>

            <Card title={t('plugins.hooks')} style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="hooksEnabled" label={t('plugins.hooksEnabled')} valuePropName="checked">
                <Switch />
              </Form.Item>
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
            {t('plugins.saveChanges')}
          </Button>
        </div>
      </Form>
    </div>
  )
}

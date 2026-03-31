import { useEffect, useState } from 'react'
import {
  Row,
  Col,
  Typography,
  Space,
  message,
  Card,
  Form,
  Input,
  Select,
  Switch,
  InputNumber,
  Button,
  Divider,
  Tag,
} from 'antd'
import { AppstoreOutlined, SaveOutlined } from '@ant-design/icons'
import { getConfig, updateConfigSections, updateConfigSection } from '../api/config'

const { Title, Text } = Typography

const TOOL_GROUPS = [
  { key: 'group:runtime', name: 'Runtime', desc: 'Shell execution and background processes' },
  { key: 'group:fs', name: 'Filesystem', desc: 'Read, write, edit, and apply patches to files' },
  { key: 'group:web', name: 'Web', desc: 'Web search and page fetching' },
  { key: 'group:sessions', name: 'Sessions', desc: 'Session management and sub-agents' },
  { key: 'group:memory', name: 'Memory', desc: 'Long-term memory search and recall' },
  { key: 'group:ui', name: 'Canvas / UI', desc: 'Node Canvas (present, eval, snapshot)' },
  { key: 'group:automation', name: 'Automation', desc: 'Cron jobs and gateway control' },
  { key: 'group:messaging', name: 'Messaging', desc: 'Send messages across channels' },
  { key: 'group:nodes', name: 'Nodes', desc: 'Discover and target paired devices' },
  { key: 'group:openclaw', name: 'OpenClaw', desc: 'Internal OpenClaw management tools' },
]

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
        const fs = (tools.fs ?? {}) as Record<string, unknown>
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

          fsPathGuards: fs.pathGuards ?? [],
          loopDetectionEnabled: loopDetection.enabled !== false,
          sandboxMode: sandbox.mode ?? 'off',

          cronEnabled: cron.enabled !== false,
          cronMaxConcurrent: cron.maxConcurrentRuns ?? 1,

          hooksEnabled: hooks.enabled !== false,

          skillsAllowBundled: skills.allowBundled ?? [],
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
      message.success('Tools & plugins configuration saved')
    } catch {
      message.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const toolGroupOptions = TOOL_GROUPS.map((g) => ({
    label: `${g.key} — ${g.name}`,
    value: g.key,
  }))

  return (
    <div>
      <Space direction="vertical" size={4} style={{ marginBottom: 28 }}>
        <Space align="center">
          <AppstoreOutlined style={{ fontSize: 28, color: '#fdcb6e' }} />
          <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>
            Tools & Plugins
          </Title>
        </Space>
        <Text style={{ color: '#9898b8' }}>
          Configure agent tool access, browser, cron, hooks, and skills
        </Text>
      </Space>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card title="Tool Access Control" style={{ border: '1px solid #2a2a4a' }}>
              <Form.Item name="toolProfile" label="Tool Profile">
                <Select options={[
                  { label: 'Full (all tools enabled)', value: 'full' },
                  { label: 'Coding (filesystem + runtime)', value: 'coding' },
                  { label: 'Messaging (channels + web)', value: 'messaging' },
                  { label: 'Minimal (read-only)', value: 'minimal' },
                ]} />
              </Form.Item>
              <Form.Item name="toolAllow" label="Allow (whitelist specific tools/groups)">
                <Select mode="tags" placeholder="e.g. group:web, group:fs" options={toolGroupOptions} />
              </Form.Item>
              <Form.Item name="toolAlsoAllow" label="Also Allow (additive to profile)">
                <Select mode="tags" placeholder="e.g. group:messaging" options={toolGroupOptions} />
              </Form.Item>
              <Form.Item name="toolDeny" label="Deny (blacklist specific tools/groups)">
                <Select mode="tags" placeholder="e.g. group:runtime" options={toolGroupOptions} />
              </Form.Item>

              <Divider style={{ borderColor: '#2a2a4a' }} />
              <Text style={{ color: '#9898b8', fontSize: 12 }}>
                Available tool groups:
              </Text>
              <div style={{ marginTop: 8 }}>
                {TOOL_GROUPS.map((g) => (
                  <Tag key={g.key} style={{ marginBottom: 6, borderRadius: 8, fontSize: 11 }}>
                    {g.key} — {g.desc}
                  </Tag>
                ))}
              </div>
            </Card>

            <Card title="Skills" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="skillsAllowBundled" label="Allowed Bundled Skills">
                <Select mode="tags" placeholder="Leave empty to allow all bundled skills" />
              </Form.Item>
            </Card>

            <Card
              title="MCP Servers"
              style={{ border: '1px solid #2a2a4a', marginTop: 20 }}
              extra={
                <Tag color="purple" style={{ borderRadius: 12, fontSize: 11 }}>
                  {Object.keys(mcpServers).length} configured
                </Tag>
              }
            >
              {Object.keys(mcpServers).length === 0 ? (
                <Text style={{ color: '#9898b8', fontSize: 12 }}>
                  No MCP servers configured. Add servers to openclaw.json under mcp.servers.
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
            <Card title="Browser" style={{ border: '1px solid #2a2a4a' }}>
              <Form.Item name="browserEnabled" label="Enabled" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="browserHeadless" label="Headless Mode" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            <Card title="Web Tools" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="webSearchEnabled" label="Web Search" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="webFetchEnabled" label="Web Fetch" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="linksEnabled" label="Link Understanding" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            <Card title="Shell Execution" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="execTimeoutSec" label="Timeout (seconds)">
                <InputNumber min={1} max={3600} style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="execAskMode" label="Ask Mode">
                <Select allowClear placeholder="Default (auto)" options={[
                  { label: 'Always ask', value: 'always' },
                  { label: 'Auto', value: 'auto' },
                  { label: 'Never', value: 'never' },
                ]} />
              </Form.Item>
            </Card>

            <Card title="Media & Agent" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="mediaEnabled" label="Audio / Video Understanding" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="agentToAgentEnabled" label="Inter-agent Communication" valuePropName="checked">
                <Switch />
              </Form.Item>
            </Card>

            <Card title="Safety" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="loopDetectionEnabled" label="Tool Loop Detection" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="sandboxMode" label="Sandbox Mode">
                <Select options={[
                  { label: 'Off', value: 'off' },
                  { label: 'Non-main sessions', value: 'non-main' },
                  { label: 'All sessions', value: 'all' },
                ]} />
              </Form.Item>
            </Card>

            <Card title="Cron" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="cronEnabled" label="Enabled" valuePropName="checked">
                <Switch />
              </Form.Item>
              <Form.Item name="cronMaxConcurrent" label="Max Concurrent Runs">
                <InputNumber min={1} max={10} style={{ width: '100%' }} />
              </Form.Item>
            </Card>

            <Card title="Hooks" style={{ border: '1px solid #2a2a4a', marginTop: 20 }}>
              <Form.Item name="hooksEnabled" label="Event Hooks System" valuePropName="checked">
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
            Save Changes
          </Button>
        </div>
      </Form>
    </div>
  )
}

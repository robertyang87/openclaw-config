import { useEffect, useState } from 'react'
import { Row, Col, Typography, Space, message } from 'antd'
import { AppstoreOutlined } from '@ant-design/icons'
import { getConfig, updateConfigSection } from '../api/config'
import PluginCard from '../components/PluginCard'

const { Title, Text } = Typography

const PLUGIN_META: Record<string, { name: string; desc: string; icon: string; color: string }> = {
  browser: { name: 'Browser', desc: 'Web browsing and page automation', icon: '🌐', color: '#0984e3' },
  cron: { name: 'Cron Scheduler', desc: 'Schedule recurring tasks', icon: '⏰', color: '#6C5CE7' },
  hooks: { name: 'Webhooks', desc: 'HTTP webhook integrations', icon: '🔗', color: '#00cec9' },
  memory: { name: 'Memory', desc: 'Long-term memory and context recall', icon: '🧠', color: '#e17055' },
  skills: { name: 'Skills', desc: 'Custom skill scripts and workflows', icon: '⚡', color: '#fdcb6e' },
  voice: { name: 'Voice', desc: 'Voice input and TTS output', icon: '🎤', color: '#a29bfe' },
  'claude-hud': { name: 'Claude HUD', desc: 'Claude heads-up display for real-time status monitoring', icon: '📊', color: '#e84393' },
}

export default function Plugins() {
  const [tools, setTools] = useState<Record<string, Record<string, unknown>>>({})
  const [, setLoading] = useState(true)

  useEffect(() => {
    getConfig()
      .then((cfg) => {
        const t = {} as Record<string, Record<string, unknown>>
        for (const key of Object.keys(PLUGIN_META)) {
          t[key] = ((cfg.tools ?? cfg) as Record<string, unknown>)[key] as Record<string, unknown> ?? {}
        }
        setTools(t)
      })
      .catch(() => message.error('Failed to load plugins'))
      .finally(() => setLoading(false))
  }, [])

  const handleToggle = async (key: string, enabled: boolean) => {
    const updated = { ...tools, [key]: { ...tools[key], enabled } }
    setTools(updated)
    try {
      await updateConfigSection('tools', updated)
      message.success(`${PLUGIN_META[key].name} ${enabled ? 'enabled' : 'disabled'}`)
    } catch {
      message.error('Failed to update')
    }
  }

  return (
    <div>
      <Space direction="vertical" size={4} style={{ marginBottom: 28 }}>
        <Space align="center">
          <AppstoreOutlined style={{ fontSize: 28, color: '#fdcb6e' }} />
          <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>
            Plugins & Tools
          </Title>
        </Space>
        <Text style={{ color: '#9898b8' }}>
          Enable and configure OpenClaw capabilities
        </Text>
      </Space>

      <Row gutter={[16, 16]}>
        {Object.entries(PLUGIN_META).map(([key, meta]) => {
          const pluginConfig = tools[key] ?? {}
          const enabled = pluginConfig.enabled === true

          return (
            <Col xs={24} sm={12} lg={8} key={key}>
              <PluginCard
                name={meta.name}
                description={meta.desc}
                icon={meta.icon}
                color={meta.color}
                enabled={enabled}
                onToggle={(v) => handleToggle(key, v)}
              />
            </Col>
          )
        })}
      </Row>
    </div>
  )
}

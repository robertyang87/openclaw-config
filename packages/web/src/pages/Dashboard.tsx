import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, Row, Col, Typography, Space, Statistic, Tag, Button } from 'antd'
import {
  ApiOutlined,
  MessageOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ArrowRightOutlined,
  RocketOutlined,
} from '@ant-design/icons'
import { getConfig } from '../api/config'

const { Title, Text } = Typography

interface ConfigSummary {
  primaryModel: string
  fallbackCount: number
  channelCount: number
  enabledChannels: number
  pluginCount: number
}

function parseConfigSummary(config: Record<string, unknown>): ConfigSummary {
  const agents = (config.agents ?? {}) as Record<string, unknown>
  const defaults = (agents.defaults ?? agents) as Record<string, unknown>
  const channels = (config.channels ?? {}) as Record<string, unknown>
  const tools = (config.tools ?? {}) as Record<string, unknown>
  const plugins = (config.plugins ?? {}) as Record<string, unknown>

  // Support both new { primary, fallbacks } and legacy flat format
  const modelField = defaults.model
  let primaryModel = 'Not configured'
  let fallbackCount = 0
  if (modelField && typeof modelField === 'object') {
    const m = modelField as Record<string, unknown>
    primaryModel = (m.primary as string) ?? 'Not configured'
    fallbackCount = Array.isArray(m.fallbacks) ? m.fallbacks.length : 0
  } else if (typeof modelField === 'string') {
    primaryModel = modelField
    fallbackCount = Array.isArray(defaults.fallbacks) ? defaults.fallbacks.length : 0
  }

  // Filter out meta keys from channels
  const channelEntries = Object.entries(channels).filter(
    ([k]) => k !== 'defaults' && k !== 'modelByChannel',
  )
  const enabledChannels = channelEntries.filter(
    ([, v]) => (v as Record<string, unknown>)?.enabled === true,
  ).length

  const pluginCount = Object.keys(plugins.entries ?? tools ?? {}).length

  return {
    primaryModel,
    fallbackCount,
    channelCount: channelEntries.length,
    enabledChannels,
    pluginCount,
  }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState<ConfigSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getConfig()
      .then((cfg) => setSummary(parseConfigSummary(cfg)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const statCards = [
    {
      title: 'Primary Model',
      value: loading ? '-' : (summary?.primaryModel ?? '-'),
      subtitle: `${summary?.fallbackCount ?? 0} fallback(s)`,
      icon: <ApiOutlined style={{ fontSize: 24, color: '#6C5CE7' }} />,
      path: '/models',
      gradient: 'linear-gradient(135deg, rgba(108,92,231,0.12) 0%, rgba(108,92,231,0.04) 100%)',
      isText: true,
    },
    {
      title: 'IM Channels',
      value: summary?.enabledChannels ?? 0,
      subtitle: `${summary?.channelCount ?? 0} configured`,
      icon: <MessageOutlined style={{ fontSize: 24, color: '#00cec9' }} />,
      path: '/channels',
      gradient: 'linear-gradient(135deg, rgba(0,206,201,0.12) 0%, rgba(0,206,201,0.04) 100%)',
      isText: false,
    },
    {
      title: 'Plugins',
      value: summary?.pluginCount ?? 0,
      subtitle: 'Active tools',
      icon: <AppstoreOutlined style={{ fontSize: 24, color: '#fdcb6e' }} />,
      path: '/plugins',
      gradient: 'linear-gradient(135deg, rgba(253,203,110,0.12) 0%, rgba(253,203,110,0.04) 100%)',
      isText: false,
    },
  ]

  return (
    <div>
      <Space direction="vertical" size={4} style={{ marginBottom: 32 }}>
        <Space align="center">
          <RocketOutlined style={{ fontSize: 28, color: '#6C5CE7' }} />
          <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>
            Dashboard
          </Title>
        </Space>
        <Text style={{ color: '#9898b8', fontSize: 14 }}>
          Manage your OpenClaw AI assistant configuration
        </Text>
      </Space>

      {error && (
        <Card
          style={{
            marginBottom: 24,
            background: 'rgba(255, 107, 107, 0.08)',
            border: '1px solid rgba(255, 107, 107, 0.2)',
          }}
        >
          <Text style={{ color: '#ff6b6b' }}>
            Unable to load config: {error}. Make sure the backend server is running.
          </Text>
        </Card>
      )}

      <Row gutter={[20, 20]}>
        {statCards.map((card) => (
          <Col xs={24} sm={8} key={card.title}>
            <Card
              hoverable
              onClick={() => navigate(card.path)}
              style={{
                background: card.gradient,
                border: '1px solid #2a2a4a',
                cursor: 'pointer',
              }}
            >
              <Space
                style={{ width: '100%', justifyContent: 'space-between' }}
                align="start"
              >
                <div>
                  <Text style={{ color: '#9898b8', fontSize: 13 }}>
                    {card.title}
                  </Text>
                  {card.isText ? (
                    <div style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: '#e8e8f0',
                      fontFamily: "'Space Grotesk', sans-serif",
                      marginTop: 8,
                      marginBottom: 8,
                      wordBreak: 'break-all',
                    }}>
                      {card.value}
                    </div>
                  ) : (
                    <Statistic
                      value={loading ? '-' : card.value}
                      valueStyle={{
                        fontSize: 36,
                        fontWeight: 700,
                        color: '#e8e8f0',
                        fontFamily: "'Space Grotesk', sans-serif",
                      }}
                    />
                  )}
                  <Text style={{ color: '#9898b8', fontSize: 12 }}>
                    {card.subtitle}
                  </Text>
                </div>
                {card.icon}
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[20, 20]} style={{ marginTop: 24 }}>
        <Col xs={24} md={16}>
          <Card
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#00b894' }} />
                <span>Quick Actions</span>
              </Space>
            }
            style={{ border: '1px solid #2a2a4a' }}
          >
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              {[
                { label: 'Configure API Keys', desc: 'Set up your LLM provider credentials', path: '/models' },
                { label: 'Enable IM Channels', desc: 'Connect Telegram, Discord, WhatsApp, Slack and more', path: '/channels' },
                { label: 'Manage Plugins', desc: 'Enable browser, cron, webhook and other tools', path: '/plugins' },
              ].map((action) => (
                <div
                  key={action.path}
                  onClick={() => navigate(action.path)}
                  style={{
                    padding: '14px 18px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid #2a2a4a',
                    borderRadius: 10,
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(108,92,231,0.3)'
                    e.currentTarget.style.background = 'rgba(108,92,231,0.04)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#2a2a4a'
                    e.currentTarget.style.background = 'rgba(255,255,255,0.02)'
                  }}
                >
                  <div>
                    <Text strong style={{ fontSize: 14 }}>
                      {action.label}
                    </Text>
                    <br />
                    <Text style={{ color: '#9898b8', fontSize: 12 }}>
                      {action.desc}
                    </Text>
                  </div>
                  <ArrowRightOutlined style={{ color: '#6C5CE7' }} />
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={8}>
          <Card
            title="System Info"
            style={{ border: '1px solid #2a2a4a' }}
          >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Text style={{ color: '#9898b8', fontSize: 12 }}>Status</Text>
                <br />
                <Tag color="green" style={{ marginTop: 4 }}>
                  Config Loaded
                </Tag>
              </div>
              <div>
                <Text style={{ color: '#9898b8', fontSize: 12 }}>
                  Config Path
                </Text>
                <br />
                <Text
                  code
                  style={{ fontSize: 12, marginTop: 4, display: 'inline-block' }}
                >
                  ~/.openclaw/openclaw.json
                </Text>
              </div>
              <div>
                <Text style={{ color: '#9898b8', fontSize: 12 }}>
                  Gateway
                </Text>
                <br />
                <Text
                  code
                  style={{ fontSize: 12, marginTop: 4, display: 'inline-block' }}
                >
                  ws://127.0.0.1:18789
                </Text>
              </div>
              <Button
                type="primary"
                ghost
                size="small"
                style={{ borderRadius: 8 }}
                onClick={() => navigate('/advanced')}
              >
                Advanced Settings
              </Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

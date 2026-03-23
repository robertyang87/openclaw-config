import { useEffect, useState } from 'react'
import {
  Card,
  Form,
  Select,
  Button,
  Space,
  Typography,
  message,
  Divider,
  Row,
  Col,
  Tag,
} from 'antd'
import {
  ApiOutlined,
  PlusOutlined,
  SaveOutlined,
} from '@ant-design/icons'
import { getConfig, updateConfigSection } from '../api/config'
import ApiKeyInput from '../components/ApiKeyInput'

const { Title, Text } = Typography

const PROVIDERS = [
  { key: 'anthropic', name: 'Anthropic (Claude)', color: '#6C5CE7', models: ['claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5'] },
  { key: 'openai', name: 'OpenAI', color: '#00b894', models: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o3-mini'] },
  { key: 'deepseek', name: 'DeepSeek', color: '#0984e3', models: ['deepseek-chat', 'deepseek-reasoner'] },
  { key: 'ollama', name: 'Ollama (Local)', color: '#fdcb6e', models: ['llama3', 'mistral', 'codellama'] },
]

export default function ModelConfig() {
  const [config, setConfig] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()

  useEffect(() => {
    getConfig()
      .then((cfg) => {
        setConfig(cfg)
        const agents = (cfg.agents ?? {}) as Record<string, unknown>
        const env = (cfg.env ?? {}) as Record<string, unknown>
        form.setFieldsValue({
          model: agents.model,
          fallbacks: agents.fallbacks,
          anthropicKey: env.ANTHROPIC_API_KEY,
          openaiKey: env.OPENAI_API_KEY,
          deepseekKey: env.DEEPSEEK_API_KEY,
        })
      })
      .catch(() => message.error('Failed to load config'))
      .finally(() => setLoading(false))
  }, [form])

  const handleSave = async () => {
    try {
      setSaving(true)
      const values = form.getFieldsValue()
      await updateConfigSection('agents', {
        model: values.model,
        fallbacks: values.fallbacks,
      })
      await updateConfigSection('env', {
        ANTHROPIC_API_KEY: values.anthropicKey,
        OPENAI_API_KEY: values.openaiKey,
        DEEPSEEK_API_KEY: values.deepseekKey,
      })
      message.success('Model configuration saved')
    } catch {
      message.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <Space direction="vertical" size={4} style={{ marginBottom: 28 }}>
        <Space align="center">
          <ApiOutlined style={{ fontSize: 28, color: '#6C5CE7' }} />
          <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>
            Models & API Keys
          </Title>
        </Space>
        <Text style={{ color: '#9898b8' }}>
          Configure LLM providers and manage API credentials
        </Text>
      </Space>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card
              title="Primary Model"
              style={{ border: '1px solid #2a2a4a' }}
            >
              <Form.Item name="model" label="Default Model">
                <Select
                  placeholder="Select primary model"
                  options={PROVIDERS.flatMap((p) =>
                    p.models.map((m) => ({
                      label: (
                        <Space>
                          <Tag color={p.color} style={{ borderRadius: 8 }}>
                            {p.key}
                          </Tag>
                          {m}
                        </Space>
                      ),
                      value: `${p.key}/${m}`,
                    })),
                  )}
                />
              </Form.Item>

              <Form.Item name="fallbacks" label="Fallback Models">
                <Select
                  mode="multiple"
                  placeholder="Select fallback models"
                  options={PROVIDERS.flatMap((p) =>
                    p.models.map((m) => ({
                      label: `${p.key}/${m}`,
                      value: `${p.key}/${m}`,
                    })),
                  )}
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title="API Keys"
              style={{ border: '1px solid #2a2a4a' }}
              extra={
                <Tag color="orange" style={{ borderRadius: 12, fontSize: 11 }}>
                  Stored locally
                </Tag>
              }
            >
              <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {PROVIDERS.filter((p) => p.key !== 'ollama').map((provider) => (
                  <div key={provider.key}>
                    <Text style={{ fontSize: 13, color: '#9898b8' }}>
                      <Tag
                        color={provider.color}
                        style={{ borderRadius: 8, marginRight: 8 }}
                      >
                        {provider.key}
                      </Tag>
                      {provider.name}
                    </Text>
                    <Form.Item
                      name={`${provider.key}Key`}
                      style={{ marginBottom: 0, marginTop: 6 }}
                    >
                      <ApiKeyInput placeholder={`Enter ${provider.name} API key`} />
                    </Form.Item>
                  </div>
                ))}
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

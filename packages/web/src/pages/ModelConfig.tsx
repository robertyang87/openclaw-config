import { useEffect, useState } from 'react'
import {
  Card,
  Form,
  Select,
  Button,
  Space,
  Typography,
  message,
  Row,
  Col,
  Tag,
  Collapse,
} from 'antd'
import { ApiOutlined, SaveOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'
import { getConfig, updateConfigSections } from '../api/config'
import ApiKeyInput from '../components/ApiKeyInput'

const { Title, Text } = Typography

interface Provider {
  key: string
  name: string
  color: string
  envKey: string | null
  models: string[]
  category: 'builtin' | 'plugin' | 'gateway' | 'local'
  tip?: string
}

const PROVIDERS: Provider[] = [
  // ========== Built-in (PI-AI Catalog) ==========
  { key: 'anthropic', name: 'Anthropic (Claude)', color: '#6C5CE7', envKey: 'ANTHROPIC_API_KEY', category: 'builtin', models: [
    'claude-opus-4-6', 'claude-sonnet-4-6', 'claude-haiku-4-5',
  ]},
  { key: 'openai', name: 'OpenAI', color: '#00b894', envKey: 'OPENAI_API_KEY', category: 'builtin', models: [
    'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-5.4-pro',
    'gpt-5.3-codex',
    'gpt-5.2', 'gpt-5.2-pro', 'gpt-5.2-codex',
    'o4-mini', 'o3', 'o3-pro', 'o3-mini',
    'gpt-4.1', 'gpt-4.1-mini', 'gpt-4.1-nano',
    'gpt-4o', 'gpt-4o-mini',
  ]},
  { key: 'google', name: 'Google (Gemini)', color: '#ea4335', envKey: 'GEMINI_API_KEY', category: 'builtin', models: [
    'gemini-3.1-pro-preview', 'gemini-3-flash-preview', 'gemini-3.1-flash-lite-preview',
    'gemini-2.5-pro', 'gemini-2.5-flash', 'gemini-2.5-flash-lite',
  ]},
  { key: 'amazon-bedrock', name: 'Amazon Bedrock', color: '#FF9900', envKey: 'AWS_ACCESS_KEY_ID', category: 'builtin', tip: 'Access Key ID', models: [
    'us.anthropic.claude-opus-4-6-v1:0', 'us.anthropic.claude-sonnet-4-6-v1:0',
  ]},
  { key: 'amazon-bedrock-secret', name: 'Amazon Bedrock (Secret)', color: '#FF9900', envKey: 'AWS_SECRET_ACCESS_KEY', category: 'builtin', tip: 'Secret Access Key', models: []},
  { key: 'opencode', name: 'OpenCode (Zen)', color: '#14b8a6', envKey: 'OPENCODE_API_KEY', category: 'builtin', models: [
    'claude-opus-4-6', 'gpt-5.2', 'gemini-3-pro',
  ]},
  { key: 'opencode-go', name: 'OpenCode Go', color: '#14b8a6', envKey: 'OPENCODE_GO_API_KEY', category: 'builtin', models: [
    'kimi-k2.5', 'glm-5', 'minimax-m2.5',
  ]},
  { key: 'zai', name: 'Z.AI (GLM)', color: '#2563eb', envKey: 'ZAI_API_KEY', category: 'builtin', models: [
    'glm-5', 'glm-4.7', 'glm-4.6',
  ]},

  // ========== Bundled Plugin Providers ==========
  { key: 'deepseek', name: 'DeepSeek', color: '#0984e3', envKey: 'DEEPSEEK_API_KEY', category: 'plugin', models: [
    'deepseek-chat', 'deepseek-reasoner',
  ]},
  { key: 'openrouter', name: 'OpenRouter', color: '#6366f1', envKey: 'OPENROUTER_API_KEY', category: 'plugin', tip: 'Aggregator: access 200+ models', models: [
    'anthropic/claude-opus-4-6', 'anthropic/claude-sonnet-4-6',
    'openai/gpt-5.4', 'google/gemini-3.1-pro-preview',
    'deepseek/deepseek-chat', 'deepseek/deepseek-reasoner',
  ]},
  { key: 'mistral', name: 'Mistral', color: '#ff6b35', envKey: 'MISTRAL_API_KEY', category: 'plugin', models: [
    'mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest',
    'codestral-latest', 'devstral-latest', 'devstral-small-latest',
    'magistral-medium-latest', 'magistral-small-latest',
  ]},
  { key: 'xai', name: 'xAI (Grok)', color: '#1DA1F2', envKey: 'XAI_API_KEY', category: 'plugin', models: [
    'grok-4', 'grok-4-fast-reasoning', 'grok-4-fast-non-reasoning',
    'grok-code-fast-1',
  ]},
  { key: 'groq', name: 'Groq', color: '#f55036', envKey: 'GROQ_API_KEY', category: 'plugin', models: [
    'llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'gemma-2-9b', 'mixtral-8x7b',
  ]},
  { key: 'github-copilot', name: 'GitHub Copilot', color: '#24292e', envKey: 'COPILOT_GITHUB_TOKEN', category: 'plugin', tip: 'Also accepts GH_TOKEN / GITHUB_TOKEN', models: [
    'gpt-4o', 'gpt-4.1',
  ]},
  { key: 'minimax', name: 'MiniMax', color: '#6d28d9', envKey: 'MINIMAX_API_KEY', category: 'plugin', models: [
    'MiniMax-M2.7', 'MiniMax-M2.7-highspeed',
  ]},
  { key: 'moonshot', name: 'Moonshot (Kimi)', color: '#0ea5e9', envKey: 'MOONSHOT_API_KEY', category: 'plugin', models: [
    'kimi-k2.5', 'kimi-k2-thinking', 'kimi-k2-thinking-turbo',
  ]},
  { key: 'kimi-coding', name: 'Kimi Coding', color: '#0ea5e9', envKey: 'KIMI_API_KEY', category: 'plugin', models: [
    'k2p5',
  ]},
  { key: 'together', name: 'Together AI', color: '#0d9488', envKey: 'TOGETHER_API_KEY', category: 'plugin', models: [
    'moonshotai/Kimi-K2.5', 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    'deepseek-ai/DeepSeek-R1',
  ]},
  { key: 'nvidia', name: 'NVIDIA', color: '#76b900', envKey: 'NVIDIA_API_KEY', category: 'plugin', models: [
    'llama-3.1-nemotron-70b-instruct', 'meta/llama-3.3-70b-instruct',
  ]},
  { key: 'cerebras', name: 'Cerebras', color: '#e11d48', envKey: 'CEREBRAS_API_KEY', category: 'plugin', models: [
    'llama-3.3-70b',
  ]},
  { key: 'venice', name: 'Venice AI', color: '#8b5cf6', envKey: 'VENICE_API_KEY', category: 'plugin', models: [
    'kimi-k2-5', 'llama-3.3-70b', 'deepseek-v3.2', 'qwen3-235b-a22b-thinking-2507',
  ]},
  { key: 'huggingface', name: 'Hugging Face', color: '#fbbf24', envKey: 'HF_TOKEN', category: 'plugin', tip: 'Also accepts HUGGINGFACE_HUB_TOKEN', models: [
    'deepseek-ai/DeepSeek-R1', 'deepseek-ai/DeepSeek-V3.2',
    'Qwen/Qwen3-8B', 'meta-llama/Llama-3.3-70B-Instruct',
    'moonshotai/Kimi-K2.5', 'openai/gpt-oss-120b',
  ]},
  { key: 'modelstudio', name: 'Qwen / Model Studio', color: '#7c3aed', envKey: 'MODELSTUDIO_API_KEY', category: 'plugin', models: [
    'qwen3.5-plus', 'qwen3-coder-plus', 'qwen3-coder-next',
  ]},
  { key: 'qianfan', name: 'Qianfan (Baidu)', color: '#2563eb', envKey: 'QIANFAN_API_KEY', category: 'plugin', models: [
    'ernie-4.5-8k', 'ernie-4.5-turbo-8k',
  ]},
  { key: 'volcengine', name: 'Volcengine (Doubao)', color: '#3b82f6', envKey: 'VOLCANO_ENGINE_API_KEY', category: 'plugin', models: [
    'doubao-seed-1-8', 'doubao-seed-code-preview', 'ark-code-latest',
  ]},
  { key: 'xiaomi', name: 'Xiaomi (MiMo)', color: '#f97316', envKey: 'XIAOMI_API_KEY', category: 'plugin', models: [
    'mimo-v2-flash', 'mimo-v2-pro', 'mimo-v2-omni',
  ]},
  { key: 'synthetic', name: 'Synthetic', color: '#64748b', envKey: 'SYNTHETIC_API_KEY', category: 'plugin', models: [
    'hf:MiniMaxAI/MiniMax-M2.5', 'hf:moonshotai/Kimi-K2-Thinking',
    'hf:deepseek-ai/DeepSeek-V3.2', 'hf:openai/gpt-oss-120b',
  ]},

  // ========== Gateway / Proxy Providers ==========
  { key: 'vercel-ai-gateway', name: 'Vercel AI Gateway', color: '#000000', envKey: 'AI_GATEWAY_API_KEY', category: 'gateway', models: [
    'anthropic/claude-opus-4.6', 'openai/gpt-5.4',
  ]},
  { key: 'kilocode', name: 'Kilocode Gateway', color: '#059669', envKey: 'KILOCODE_API_KEY', category: 'gateway', models: [
    'kilo/auto',
  ]},
  { key: 'cloudflare-ai-gateway', name: 'Cloudflare AI Gateway', color: '#f48120', envKey: 'CLOUDFLARE_AI_GATEWAY_API_KEY', category: 'gateway', models: [
    'claude-sonnet-4-6',
  ]},
  { key: 'litellm', name: 'LiteLLM', color: '#475569', envKey: 'LITELLM_API_KEY', category: 'gateway', models: [
    'claude-opus-4-6', 'gpt-4o',
  ]},
  { key: 'anthropic-vertex', name: 'Anthropic (Vertex AI)', color: '#6C5CE7', envKey: 'GOOGLE_APPLICATION_CREDENTIALS', category: 'gateway', tip: 'Claude via Google Cloud Vertex', models: [
    'claude-opus-4-6', 'claude-sonnet-4-6',
  ]},
  { key: 'copilot-proxy', name: 'Copilot Proxy', color: '#24292e', envKey: 'COPILOT_PROXY_TOKEN', category: 'gateway', models: [
    'gpt-4o', 'gpt-4.1',
  ]},
  { key: 'byteplus', name: 'BytePlus (Volcengine Intl)', color: '#3b82f6', envKey: 'BYTEPLUS_API_KEY', category: 'gateway', models: [
    'doubao-seed-1-8',
  ]},
  { key: 'microsoft-foundry', name: 'Microsoft AI Foundry', color: '#0078D4', envKey: 'AZURE_AI_API_KEY', category: 'gateway', tip: 'Azure AI model catalog', models: [
    'gpt-5.4', 'Phi-4',
  ]},
  { key: 'sglang', name: 'SGLang', color: '#475569', envKey: null, category: 'gateway', tip: 'Self-hosted SGLang server', models: []},
  { key: 'vllm', name: 'vLLM', color: '#475569', envKey: null, category: 'gateway', tip: 'Self-hosted vLLM server', models: []},
  { key: 'chutes', name: 'Chutes AI', color: '#10b981', envKey: 'CHUTES_API_KEY', category: 'gateway', models: [
    'deepseek-ai/DeepSeek-V3.2',
  ]},

  // ========== Local Providers ==========
  { key: 'ollama', name: 'Ollama (Local)', color: '#fdcb6e', envKey: null, category: 'local', models: [
    'llama3.3', 'mistral', 'codellama', 'deepseek-r1:32b',
    'qwen2.5-coder:32b', 'glm-4.7-flash',
  ]},
]

const allModelOptions = PROVIDERS.flatMap((p) =>
  p.models.map((m) => ({
    label: (
      <Space>
        <Tag color={p.color} style={{ borderRadius: 8 }}>{p.key}</Tag>
        {m}
      </Space>
    ),
    value: `${p.key}/${m}`,
  })),
)

const allModelFlatOptions = PROVIDERS.flatMap((p) =>
  p.models.map((m) => ({
    label: `${p.key}/${m}`,
    value: `${p.key}/${m}`,
  })),
)

export default function ModelConfig() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form] = Form.useForm()
  const { t } = useTranslation()

  const CATEGORY_LABELS: Record<string, string> = {
    builtin: t('models.builtin'),
    plugin: t('models.plugin'),
    gateway: t('models.gateway'),
    local: t('models.local'),
  }

  useEffect(() => {
    getConfig()
      .then((cfg) => {
        const agents = (cfg.agents ?? {}) as Record<string, unknown>
        const defaults = (agents.defaults ?? agents) as Record<string, unknown>
        const env = (cfg.env ?? {}) as Record<string, unknown>

        const modelField = defaults.model
        let primary: string | undefined
        let fallbacks: string[] = []
        if (modelField && typeof modelField === 'object') {
          const m = modelField as Record<string, unknown>
          primary = m.primary as string | undefined
          fallbacks = (m.fallbacks as string[]) ?? []
        } else if (typeof modelField === 'string') {
          primary = modelField
          fallbacks = (defaults.fallbacks as string[]) ?? []
        }

        const keyValues: Record<string, unknown> = { primary, fallbacks }
        for (const p of PROVIDERS) {
          if (p.envKey) {
            keyValues[`${p.key}Key`] = env[p.envKey]
          }
        }
        form.setFieldsValue(keyValues)
      })
      .catch(() => message.error(t('models.loadError')))
      .finally(() => setLoading(false))
  }, [form, t])

  const handleSave = async () => {
    try {
      setSaving(true)
      const values = form.getFieldsValue()
      const envData: Record<string, string> = {}
      for (const p of PROVIDERS) {
        if (p.envKey) {
          envData[p.envKey] = values[`${p.key}Key`] ?? ''
        }
      }
      await updateConfigSections([
        { section: 'agents', data: {
          defaults: {
            model: {
              primary: values.primary,
              fallbacks: values.fallbacks ?? [],
            },
          },
        }},
        { section: 'env', data: envData },
      ])
      message.success(t('models.savedSuccess'))
    } catch {
      message.error(t('models.savedError'))
    } finally {
      setSaving(false)
    }
  }

  const providersByCategory = PROVIDERS.reduce<Record<string, Provider[]>>((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {})

  return (
    <div>
      <Space direction="vertical" size={4} style={{ marginBottom: 28 }}>
        <Space align="center">
          <ApiOutlined style={{ fontSize: 28, color: '#6C5CE7' }} />
          <Title level={2} style={{ margin: 0, letterSpacing: '-0.5px' }}>
            {t('models.title')}
          </Title>
        </Space>
        <Text style={{ color: '#9898b8' }}>
          {t('models.subtitle', { count: PROVIDERS.length })}
        </Text>
      </Space>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card
              title={t('models.primaryModel')}
              style={{ border: '1px solid #2a2a4a' }}
            >
              <Form.Item name="primary" label={t('models.defaultModel')}>
                <Select
                  showSearch
                  placeholder={t('models.selectPrimary')}
                  options={allModelOptions}
                  filterOption={(input, option) =>
                    (option?.value as string)?.toLowerCase().includes(input.toLowerCase()) ?? false
                  }
                />
              </Form.Item>

              <Form.Item name="fallbacks" label={t('models.fallbackModels')}>
                <Select
                  mode="multiple"
                  showSearch
                  placeholder={t('models.selectFallbacks')}
                  options={allModelFlatOptions}
                  filterOption={(input, option) =>
                    (option?.value as string)?.toLowerCase().includes(input.toLowerCase()) ?? false
                  }
                />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card
              title={t('models.apiKeys')}
              style={{ border: '1px solid #2a2a4a' }}
              extra={
                <Tag color="orange" style={{ borderRadius: 12, fontSize: 11 }}>
                  {t('models.storedInEnv')}
                </Tag>
              }
            >
              <Collapse
                ghost
                defaultActiveKey={['builtin']}
                items={(['builtin', 'plugin', 'gateway', 'local'] as const).map((cat) => ({
                  key: cat,
                  label: (
                    <Text strong style={{ fontSize: 13 }}>
                      {CATEGORY_LABELS[cat]} ({providersByCategory[cat]?.length ?? 0})
                    </Text>
                  ),
                  children: (
                    <Space direction="vertical" size={14} style={{ width: '100%' }}>
                      {(providersByCategory[cat] ?? [])
                        .filter((p) => p.envKey)
                        .map((provider) => (
                          <div key={provider.key}>
                            <Text style={{ fontSize: 13, color: '#9898b8' }}>
                              <Tag
                                color={provider.color}
                                style={{ borderRadius: 8, marginRight: 8 }}
                              >
                                {provider.key}
                              </Tag>
                              {provider.name}
                              {provider.tip && (
                                <span style={{ fontSize: 11, marginLeft: 8, opacity: 0.6 }}>
                                  ({provider.tip})
                                </span>
                              )}
                            </Text>
                            <Form.Item
                              name={`${provider.key}Key`}
                              style={{ marginBottom: 0, marginTop: 6 }}
                            >
                              <ApiKeyInput placeholder={`${provider.envKey}`} />
                            </Form.Item>
                          </div>
                        ))}
                      {cat === 'local' && (
                        <Text style={{ fontSize: 12, color: '#9898b8' }}>
                          {t('models.ollamaNote')}
                        </Text>
                      )}
                    </Space>
                  ),
                }))}
              />
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
            {t('models.saveChanges')}
          </Button>
        </div>
      </Form>
    </div>
  )
}

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
  Divider,
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
        form.setFieldsValue({
          port: gw.port ?? 3000,
          bind: gw.bind ?? 'loopback',
          concurrency: (cfg.agents as Record<string, unknown>)?.concurrency ?? 4,
          sessionScope: session.scope ?? 'channel',
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
          port: values.port,
          bind: values.bind,
        },
        agents: {
          ...(config.agents as Record<string, unknown>),
          concurrency: values.concurrency,
        },
        session: {
          ...(config.session as Record<string, unknown>),
          scope: values.sessionScope,
        },
      }
      await updateConfig(updated)
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
          Gateway, session, and system configuration
        </Text>
      </Space>

      <Form form={form} layout="vertical" onFinish={handleSave}>
        <Row gutter={[20, 20]}>
          <Col xs={24} md={12}>
            <Card title="Gateway" style={{ border: '1px solid #2a2a4a' }}>
              <Form.Item name="port" label="Port">
                <InputNumber
                  min={1}
                  max={65535}
                  style={{ width: '100%' }}
                  placeholder="3000"
                />
              </Form.Item>
              <Form.Item name="bind" label="Bind Address">
                <Select
                  options={[
                    { label: 'Localhost only (loopback)', value: 'loopback' },
                    { label: 'All interfaces (0.0.0.0)', value: '0.0.0.0' },
                  ]}
                />
              </Form.Item>
              <Form.Item name="concurrency" label="Max Concurrency">
                <InputNumber min={1} max={32} style={{ width: '100%' }} />
              </Form.Item>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Session" style={{ border: '1px solid #2a2a4a' }}>
              <Form.Item name="sessionScope" label="Session Scope">
                <Select
                  options={[
                    { label: 'Per Channel', value: 'channel' },
                    { label: 'Per User', value: 'user' },
                    { label: 'Global', value: 'global' },
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

import type { ReactNode } from 'react'
import { Card, Switch, Tag, Space, Typography, Button } from 'antd'
import { SettingOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

interface ChannelCardProps {
  name: string
  icon: ReactNode
  color: string
  enabled: boolean
  configured: boolean
  onToggle: (enabled: boolean) => void
  onConfigure: () => void
}

export default function ChannelCard({
  name,
  icon,
  color,
  enabled,
  configured,
  onToggle,
  onConfigure,
}: ChannelCardProps) {
  const { t } = useTranslation()

  return (
    <Card
      hoverable
      onClick={onConfigure}
      style={{
        border: `1px solid ${enabled ? color + '40' : '#2a2a4a'}`,
        background: enabled
          ? `linear-gradient(135deg, ${color}0a 0%, transparent 100%)`
          : undefined,
        transition: 'all 0.25s ease',
        cursor: 'pointer',
      }}
    >
      <Space
        direction="vertical"
        size={12}
        style={{ width: '100%' }}
      >
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <span style={{ fontSize: 28, display: 'flex', alignItems: 'center' }}>{icon}</span>
            <div>
              <Text strong style={{ fontSize: 15 }}>
                {name}
              </Text>
              <br />
              <Tag
                color={enabled ? 'green' : configured ? 'orange' : 'default'}
                style={{ borderRadius: 12, fontSize: 11, marginTop: 2 }}
              >
                {enabled ? t('channels.active') : configured ? t('channels.configured') : t('channels.notConfigured')}
              </Tag>
            </div>
          </Space>
          <Switch
            checked={enabled}
            onChange={(v, e) => {
              e.stopPropagation()
              onToggle(v)
            }}
          />
        </Space>

        <Button
          type="text"
          size="small"
          icon={<SettingOutlined />}
          onClick={(e) => {
            e.stopPropagation()
            onConfigure()
          }}
          style={{ color: '#9898b8', padding: '0 8px' }}
        >
          {t('channels.configure')}
        </Button>
      </Space>
    </Card>
  )
}

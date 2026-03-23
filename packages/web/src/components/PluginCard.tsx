import { Card, Switch, Tag, Space, Typography } from 'antd'

const { Text } = Typography

interface PluginCardProps {
  name: string
  description: string
  icon: string
  color: string
  enabled: boolean
  onToggle: (enabled: boolean) => void
}

export default function PluginCard({
  name,
  description,
  icon,
  color,
  enabled,
  onToggle,
}: PluginCardProps) {
  return (
    <Card
      style={{
        border: `1px solid ${enabled ? color + '40' : '#2a2a4a'}`,
        background: enabled
          ? `linear-gradient(135deg, ${color}08 0%, transparent 100%)`
          : undefined,
      }}
    >
      <Space style={{ width: '100%', justifyContent: 'space-between' }} align="start">
        <Space direction="vertical" size={4}>
          <Space>
            <span style={{ fontSize: 24 }}>{icon}</span>
            <Text strong style={{ fontSize: 16 }}>{name}</Text>
          </Space>
          <Text style={{ color: '#9898b8', fontSize: 13 }}>{description}</Text>
          <Tag
            color={enabled ? 'green' : 'default'}
            style={{ borderRadius: 12, fontSize: 11, marginTop: 4 }}
          >
            {enabled ? 'Active' : 'Inactive'}
          </Tag>
        </Space>
        <Switch checked={enabled} onChange={onToggle} />
      </Space>
    </Card>
  )
}

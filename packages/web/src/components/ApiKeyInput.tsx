import { useState } from 'react'
import { Input, Button, Space } from 'antd'
import { EyeOutlined, EyeInvisibleOutlined } from '@ant-design/icons'

interface ApiKeyInputProps {
  value?: string
  onChange?: (value: string) => void
  placeholder?: string
}

export default function ApiKeyInput({ value, onChange, placeholder }: ApiKeyInputProps) {
  const [visible, setVisible] = useState(false)

  const maskedValue = value && !visible
    ? value.slice(0, 6) + '•'.repeat(Math.max(0, value.length - 10)) + value.slice(-4)
    : value

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input
        value={visible ? value : maskedValue}
        onChange={(e) => onChange?.(e.target.value)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        placeholder={placeholder}
        style={{
          fontFamily: 'monospace',
          fontSize: 13,
          letterSpacing: visible ? 0 : 1,
        }}
      />
    </Space.Compact>
  )
}

import { useState } from 'react'
import { Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Layout, Menu, Typography, Space, Tag } from 'antd'
import {
  DashboardOutlined,
  ApiOutlined,
  MessageOutlined,
  AppstoreOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons'

const { Sider, Content, Header } = Layout
const { Title, Text } = Typography

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: 'Dashboard' },
  { key: '/models', icon: <ApiOutlined />, label: 'Models & Keys' },
  { key: '/channels', icon: <MessageOutlined />, label: 'IM Channels' },
  { key: '/plugins', icon: <AppstoreOutlined />, label: 'Plugins' },
  { key: '/advanced', icon: <SettingOutlined />, label: 'Advanced' },
]

export default function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        width={240}
        style={{
          background: 'linear-gradient(180deg, #12122a 0%, #0f0f1a 100%)',
          borderRight: '1px solid #1e1e35',
        }}
      >
        <div style={{ padding: collapsed ? '20px 8px' : '20px 20px', textAlign: 'center' }}>
          <Space direction="vertical" size={4}>
            <ThunderboltOutlined
              style={{ fontSize: 28, color: '#6C5CE7' }}
            />
            {!collapsed && (
              <>
                <Title
                  level={4}
                  style={{ margin: 0, color: '#e8e8f0', letterSpacing: '-0.5px' }}
                >
                  OpenClaw
                </Title>
                <Tag
                  color="purple"
                  style={{ fontSize: 10, margin: 0, borderRadius: 12 }}
                >
                  Config Manager
                </Tag>
              </>
            )}
          </Space>
        </div>

        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent',
            border: 'none',
            padding: '8px',
          }}
        />

        {!collapsed && (
          <div
            style={{
              position: 'absolute',
              bottom: 60,
              left: 0,
              right: 0,
              padding: '16px 20px',
            }}
          >
            <div
              style={{
                padding: '12px 16px',
                background: 'rgba(108, 92, 231, 0.06)',
                borderRadius: 10,
                border: '1px solid rgba(108, 92, 231, 0.12)',
              }}
            >
              <Text style={{ fontSize: 11, color: '#9898b8' }}>
                Config file
              </Text>
              <br />
              <Text
                style={{ fontSize: 11, color: '#6C5CE7', fontFamily: 'monospace' }}
                copyable
              >
                ~/.openclaw/openclaw.json
              </Text>
            </div>
          </div>
        )}
      </Sider>

      <Layout>
        <Header
          style={{
            background: 'transparent',
            borderBottom: '1px solid #1e1e35',
            padding: '0 32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 56,
          }}
        >
          <Text style={{ color: '#9898b8', fontSize: 13 }}>
            Visual Configuration Manager
          </Text>
          <Space>
            <Tag color="green" style={{ borderRadius: 12 }}>
              Connected
            </Tag>
          </Space>
        </Header>

        <Content
          style={{
            padding: '28px 32px',
            overflow: 'auto',
            background: '#0f0f1a',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

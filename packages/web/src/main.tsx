import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ConfigProvider, theme } from 'antd'
import App from './App'
import './styles/global.css'

const customTheme = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#6C5CE7',
    colorBgContainer: '#1a1a2e',
    colorBgLayout: '#0f0f1a',
    colorBgElevated: '#1e1e35',
    colorBorder: '#2a2a4a',
    colorText: '#e8e8f0',
    colorTextSecondary: '#9898b8',
    fontFamily: "'Space Grotesk', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    borderRadius: 10,
    fontSize: 14,
  },
  components: {
    Menu: {
      itemBg: 'transparent',
      itemSelectedBg: 'rgba(108, 92, 231, 0.15)',
      itemSelectedColor: '#6C5CE7',
      itemHoverBg: 'rgba(108, 92, 231, 0.08)',
    },
    Card: {
      colorBgContainer: '#1a1a2e',
      colorBorderSecondary: '#2a2a4a',
    },
    Button: {
      primaryShadow: '0 4px 14px rgba(108, 92, 231, 0.4)',
    },
  },
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider theme={customTheme}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ConfigProvider>
  </React.StrictMode>,
)

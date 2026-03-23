import { Routes, Route, Navigate } from 'react-router-dom'
import AppLayout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import ModelConfig from './pages/ModelConfig'
import Channels from './pages/Channels'
import Plugins from './pages/Plugins'
import Advanced from './pages/Advanced'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="models" element={<ModelConfig />} />
        <Route path="channels" element={<Channels />} />
        <Route path="plugins" element={<Plugins />} />
        <Route path="advanced" element={<Advanced />} />
      </Route>
    </Routes>
  )
}

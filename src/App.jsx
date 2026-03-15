import './index.css'
import { useState } from 'react'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { ToastProvider } from './components/Toast'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Feed from './pages/Feed'
import Checkin from './pages/Checkin'
import Biblia from './pages/Biblia'
import Pontos from './pages/Pontos'
import Classe from './pages/Classe'
import Admin from './pages/Admin'
import Perfil from './pages/Perfil'

function AppInner() {
  const { user, loading } = useAuth()
  const [aba, setAba] = useState('home')

  if (loading) return (
    <div className="loading-full">
      <div style={{ fontSize: 48, marginBottom: 8 }}>⚜️</div>
      <div className="spinner" />
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 8 }}>Carregando...</p>
    </div>
  )

  if (!user) return <Login />

  const pages = {
    home:    <Feed />,
    checkin: <Checkin />,
    biblia:  <Biblia />,
    pontos:  <Pontos />,
    classe:  <Classe />,
    admin:   <Admin />,
    perfil:  <Perfil />,
  }

  return (
    <div style={{ height: '100%', position: 'relative' }}>
      {pages[aba] || <Feed />}
      <BottomNav active={aba} onChange={setAba} />
    </div>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </AuthProvider>
  )
}

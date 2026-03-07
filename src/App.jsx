import './index.css'
import { useState } from 'react'
import { AuthProvider, useAuth } from './lib/AuthContext'
import Stars from './components/Stars'
import BottomNav from './components/BottomNav'
import Login from './pages/Login'
import Home from './pages/Home'
import Checkin from './pages/Checkin'
import Biblia from './pages/Biblia'
import Pontos from './pages/Pontos'
import Classe from './pages/Classe'
import Admin from './pages/Admin'

function AppInner() {
  const { user, loading } = useAuth()
  const [aba, setAba] = useState('home')

  if (loading) return (
    <div className="loading-screen">
      <Stars />
      <div className="spinner" />
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>Carregando...</p>
    </div>
  )

  if (!user) return (
    <>
      <Stars />
      <Login />
    </>
  )

  const renderPage = () => {
    switch (aba) {
      case 'home':    return <Home />
      case 'checkin': return <Checkin />
      case 'biblia':  return <Biblia />
      case 'pontos':  return <Pontos />
      case 'classe':  return <Classe />
      case 'admin':   return <Admin />
      default:        return <Home />
    }
  }

  return (
    <>
      <Stars />
      <div className="app-wrapper">
        {renderPage()}
        <BottomNav active={aba} onChange={setAba} />
      </div>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  )
}

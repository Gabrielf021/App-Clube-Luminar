import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const [nome, setNome] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleLogin = async () => {
    if (!nome.trim() || !dataNasc) { setErro('Preencha todos os campos.'); return }
    setLoading(true); setErro('')
    try {
      await login(nome, dataNasc)
    } catch (e) {
      setErro(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-screen">
      <img src="/logo.png" alt="Luminar" className="login-logo"
        onError={e => { e.target.style.display='none' }} />
      <h1 className="login-title">LUMINAR</h1>
      <p className="login-subtitle">Clube de Desbravadores</p>

      <div className="login-card">
        <h2>Entrar no App</h2>

        <div className="input-group">
          <label>Nome Completo</label>
          <input
            type="text"
            placeholder="Seu nome completo"
            value={nome}
            onChange={e => setNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            autoComplete="name"
          />
        </div>

        <div className="input-group">
          <label>Data de Nascimento</label>
          <input
            type="date"
            value={dataNasc}
            onChange={e => setDataNasc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? 'Entrando...' : '⚜️  Entrar'}
        </button>

        {erro && <div className="error-msg">⚠️ {erro}</div>}
      </div>

      <p style={{ marginTop: 24, fontSize: 11, color: 'rgba(255,255,255,0.25)', textAlign: 'center' }}>
        Clube Luminar · Sistema de Acompanhamento
      </p>
    </div>
  )
}

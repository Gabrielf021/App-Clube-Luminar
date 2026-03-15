import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { ORDEM_CLASSES } from '../lib/classes'

export default function Login() {
  const { login } = useAuth()
  const [tela, setTela] = useState('login') // login | cadastro
  return tela === 'login'
    ? <TelaLogin onCadastro={() => setTela('cadastro')} login={login} />
    : <TelaCadastro onVoltar={() => setTela('login')} />
}

function TelaLogin({ onCadastro, login }) {
  const [nome, setNome] = useState('')
  const [data, setData] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')

  const handleLogin = async () => {
    if (!nome.trim() || !data) { setErro('Preencha todos os campos.'); return }
    setLoading(true); setErro('')
    try { await login(nome, data) }
    catch (e) { setErro(e.message) }
    finally { setLoading(false) }
  }

  return (
    <div className="login-screen">
      <div className="login-logo-wrap">
        <img src="/logo.png" alt="Luminar" onError={e => { e.target.style.display='none'; e.target.parentNode.innerHTML='⚜️' }} />
      </div>
      <h1 className="login-title">LUMINAR</h1>
      <p className="login-subtitle">Clube de Desbravadores</p>

      <div className="login-card">
        <div className="field-wrap">
          <label className="input-label-dark">Nome Completo</label>
          <input className="input-dark" type="text" placeholder="Seu nome completo"
            value={nome} onChange={e => setNome(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} autoComplete="name" />
        </div>
        <div className="field-wrap">
          <label className="input-label-dark">Data de Nascimento</label>
          <input className="input-dark" type="date"
            value={data} onChange={e => setData(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()} />
        </div>

        {erro && <div className="error-msg" style={{ marginBottom: 12 }}>{erro}</div>}

        <button className="btn btn-gold" onClick={handleLogin} disabled={loading} style={{ marginBottom: 10, marginTop: 4 }}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
        <button className="btn btn-outline-gold" onClick={onCadastro}>
          Cadastre-se
        </button>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.2)', marginTop: 24 }}>
          Clube Luminar · Sistema de Acompanhamento
        </p>
      </div>
    </div>
  )
}

function TelaCadastro({ onVoltar }) {
  const [form, setForm] = useState({ nome: '', data_nascimento: '', classe: '', unidade: '' })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleCadastro = async () => {
    if (!form.nome.trim() || !form.data_nascimento) { setErro('Nome e data de nascimento são obrigatórios.'); return }
    setLoading(true); setErro('')
    const { error } = await supabase.from('perfis').insert({
      nome: form.nome.trim(),
      data_nascimento: form.data_nascimento,
      tipo: 'desbravador',
      classe: form.classe || null,
      unidade: form.unidade.trim() || null,
      pontos: 0,
    })
    setLoading(false)
    if (error) { setErro('Erro ao cadastrar. Verifique se o nome já existe.'); return }
    setSucesso(true)
  }

  if (sucesso) return (
    <div className="login-screen">
      <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
      <h1 className="login-title" style={{ marginBottom: 8 }}>Cadastro feito!</h1>
      <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 32, textAlign: 'center' }}>
        Seu cadastro foi enviado.<br/>Aguarde a ativação pela diretoria.
      </p>
      <button className="btn btn-gold" style={{ maxWidth: 320, width: '100%' }} onClick={onVoltar}>
        Ir para o Login
      </button>
    </div>
  )

  return (
    <div className="login-screen" style={{ justifyContent: 'flex-start', paddingTop: 'calc(var(--safe-top) + 20px)' }}>
      <div style={{ width: '100%', maxWidth: 400 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <button onClick={onVoltar} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: 8, width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', fontSize: 18 }}>‹</button>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>Criar conta</div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>Preencha seus dados</div>
          </div>
        </div>

        <div className="field-wrap">
          <label className="input-label-dark">Nome Completo</label>
          <input className="input-dark" type="text" placeholder="Seu nome completo"
            value={form.nome} onChange={e => set('nome', e.target.value)} />
        </div>
        <div className="field-wrap">
          <label className="input-label-dark">Data de Nascimento</label>
          <input className="input-dark" type="date"
            value={form.data_nascimento} onChange={e => set('data_nascimento', e.target.value)} />
        </div>
        <div className="field-wrap">
          <label className="input-label-dark">Classe</label>
          <select className="input-dark" value={form.classe} onChange={e => set('classe', e.target.value)}
            style={{ cursor: 'pointer' }}>
            <option value="">Selecionar classe...</option>
            {ORDEM_CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="field-wrap">
          <label className="input-label-dark">Unidade (opcional)</label>
          <input className="input-dark" type="text" placeholder="Ex: Águia"
            value={form.unidade} onChange={e => set('unidade', e.target.value)} />
        </div>

        {erro && <div className="error-msg" style={{ marginBottom: 12 }}>{erro}</div>}

        <button className="btn btn-gold" onClick={handleCadastro} disabled={loading} style={{ marginTop: 4 }}>
          {loading ? 'Cadastrando...' : 'Criar conta'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
          Já tem conta? <span style={{ color: 'var(--dourado)', cursor: 'pointer' }} onClick={onVoltar}>Entrar</span>
        </p>
      </div>
    </div>
  )
}

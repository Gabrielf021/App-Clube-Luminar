import { useAuth } from '../lib/AuthContext'
import { getAvatarUrl, calcularPct, CLASSES } from '../lib/classes'
import { supabase } from '../lib/supabase'
import { useState, useEffect } from 'react'

function calcularIdade(dataNasc) {
  if (!dataNasc) return '—'
  const hoje = new Date()
  const nasc = new Date(dataNasc)
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}

function tipoBadge(tipo) {
  const map = {
    desbravador: { label: 'Desbravador', color: '#22c55e' },
    instrutor:   { label: 'Instrutor',   color: '#3b82f6' },
    conselheiro: { label: 'Conselheiro', color: '#8b5cf6' },
    diretoria:   { label: 'Diretoria',   color: '#f5c000' },
  }
  return map[tipo] || { label: tipo, color: '#6b7280' }
}

export default function Home() {
  const { user, logout } = useAuth()
  const [progresso, setProgresso] = useState({})
  const [ultimoCheckin, setUltimoCheckin] = useState(null)
  const avatar = getAvatarUrl(user?.nome, user?.avatar_seed)
  const { label, color } = tipoBadge(user?.tipo)
  const idade = calcularIdade(user?.data_nascimento)

  useEffect(() => {
    if (!user) return
    // Busca progresso
    if (user.classe) {
      supabase.from('progresso')
        .select('secao, requisito_index, concluido')
        .eq('perfil_id', user.id)
        .eq('classe', user.classe)
        .then(({ data }) => {
          const map = {}
          data?.forEach(r => { map[`${r.secao}-${r.requisito_index}`] = r.concluido })
          setProgresso(map)
        })
    }
    // Último check-in
    supabase.from('checkins')
      .select('*')
      .eq('perfil_id', user.id)
      .eq('aprovado', true)
      .order('criado_em', { ascending: false })
      .limit(1)
      .then(({ data }) => { if (data?.[0]) setUltimoCheckin(data[0]) })
  }, [user])

  const pct = user?.classe ? calcularPct(progresso, user.classe) : null
  const classeInfo = user?.classe ? CLASSES[user.classe] : null

  return (
    <div className="page">
      {/* Perfil */}
      <div className="profile-card">
        <img
          src={user?.foto_url || avatar}
          alt={user?.nome}
          className="profile-avatar"
          onError={e => { e.target.src = avatar }}
        />
        <div className="profile-name">{user?.nome}</div>
        <div className="profile-info">
          {idade} anos
          {user?.classe && ` · Classe ${user.classe}`}
          {user?.unidade && ` · Unidade ${user.unidade}`}
        </div>
        <span className="profile-badge" style={{ background: color, color: color === '#f5c000' ? '#0d1b5e' : '#fff' }}>
          {label}
        </span>
      </div>

      {/* Stats */}
      <div className="stat-row">
        <div className="stat-box">
          <div className="value">{user?.pontos ?? 0}</div>
          <div className="label">⭐ Pontos</div>
        </div>
        <div className="stat-box">
          <div className="value">{pct !== null ? `${pct}%` : '—'}</div>
          <div className="label">📚 Progresso</div>
        </div>
      </div>

      {/* Progresso da classe */}
      {user?.classe && (
        <div className="card">
          <div className="card-title">
            <span>{classeInfo?.icone}</span> Classe {user.classe}
          </div>
          <div className="prog-wrap">
            <div className="prog-label">
              <span>Progresso geral</span>
              <span style={{ color: '#f5c000' }}>{pct}%</span>
            </div>
            <div className="prog-bg">
              <div className="prog-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${classeInfo?.cor}, #f5c000)` }} />
            </div>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>
            Livro do ano: {classeInfo?.livro}
          </p>
        </div>
      )}

      {/* Último check-in */}
      {ultimoCheckin && (
        <div className="card">
          <div className="card-title">📍 Último Check-in</div>
          <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)' }}>
            {new Date(ultimoCheckin.criado_em).toLocaleDateString('pt-BR', {
              weekday: 'long', day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit'
            })}
          </p>
          <p style={{ fontSize: 12, color: '#86efac', marginTop: 4, fontWeight: 700 }}>
            ✅ Aprovado · +20 pontos
          </p>
        </div>
      )}

      {/* Sair */}
      <button className="btn-secondary" onClick={logout} style={{ marginTop: 8 }}>
        Sair da conta
      </button>
    </div>
  )
}

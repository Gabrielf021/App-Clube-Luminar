import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { calcularPct, CLASSES, getAvatarUrl } from '../lib/classes'

function calcIdade(d) {
  if (!d) return '—'
  const hoje = new Date(), nasc = new Date(d)
  let i = hoje.getFullYear() - nasc.getFullYear()
  if (hoje.getMonth() - nasc.getMonth() < 0 || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) i--
  return i
}

const TIPO_LABEL = { desbravador:'Desbravador', instrutor:'Instrutor', conselheiro:'Conselheiro', diretoria:'Diretoria' }

export default function Home() {
  const { user, logout } = useAuth()
  const [progresso, setProgresso] = useState({})
  const [ultimoCheckin, setUltimoCheckin] = useState(null)
  const [evento, setEvento] = useState(null)
  const idade = calcIdade(user?.data_nascimento)
  const avatar = getAvatarUrl(user?.nome, user?.avatar_seed)
  const classeInfo = user?.classe ? CLASSES[user.classe] : null
  const pct = user?.classe ? calcularPct(progresso, user.classe) : null

  useEffect(() => {
    if (!user) return
    if (user.classe) {
      supabase.from('progresso').select('secao,requisito_index,concluido')
        .eq('perfil_id', user.id).eq('classe', user.classe)
        .then(({ data }) => {
          const m = {}
          data?.forEach(r => { m[`${r.secao}-${r.requisito_index}`] = r.concluido })
          setProgresso(m)
        })
    }
    supabase.from('checkins').select('*').eq('perfil_id', user.id).eq('aprovado', true)
      .order('criado_em', { ascending: false }).limit(1)
      .then(({ data }) => data?.[0] && setUltimoCheckin(data[0]))
    supabase.from('eventos').select('*').eq('ativo', true).limit(1).single()
      .then(({ data }) => setEvento(data))
  }, [user])

  const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

  return (
    <div className="app-shell">
      <div className="scroll-area fade-in">
        {/* Header */}
        <div className="profile-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div className="profile-avatar">
              <img src={user?.foto_url || avatar} alt={user?.nome}
                onError={e => { e.target.style.display='none' }} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p className="profile-sub">Olá, bem-vindo!</p>
              <p className="profile-nome" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.nome}</p>
              <div className="profile-badge">{TIPO_LABEL[user?.tipo] || user?.tipo}</div>
            </div>
          </div>
        </div>

        <div className="page-body">
          {/* Stats */}
          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-value" style={{ color: 'var(--dourado)' }}>{user?.pontos ?? 0}</div>
              <div className="stat-label">⭐ Pontos</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{pct !== null ? `${pct}%` : '—'}</div>
              <div className="stat-label">📚 Progresso</div>
            </div>
          </div>

          {/* Info pessoal */}
          <div className="card">
            <div className="card-pad">
              <p className="card-title">Informações</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['👤 Idade', `${idade} anos`],
                  user?.classe && ['📚 Classe', user.classe],
                  user?.unidade && ['🏅 Unidade', user.unidade],
                ].filter(Boolean).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, color: 'var(--texto-suave)' }}>{k}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--texto)' }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Progresso da classe */}
          {user?.classe && classeInfo && (
            <div className="card card-pad">
              <p className="card-title">Classe {user.classe} {classeInfo.icone}</p>
              <div className="prog-wrap">
                <div className="prog-label">
                  <span>Progresso geral</span>
                  <span style={{ color: classeInfo.cor, fontWeight: 800 }}>{pct}%</span>
                </div>
                <div className="prog-bg">
                  <div className="prog-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${classeInfo.cor}, var(--dourado))` }} />
                </div>
              </div>
              <p style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: 8 }}>
                Livro do ano: <strong>{classeInfo.livro}</strong>
              </p>
            </div>
          )}

          {/* Próxima reunião */}
          {evento && (
            <div className="card card-pad">
              <p className="card-title">Próxima Reunião</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--texto)' }}>{evento.nome}</p>
                  <p style={{ fontSize: 12, color: 'var(--texto-suave)', marginTop: 2 }}>
                    {DIAS[evento.dia_semana]} · até {evento.horario_limite?.slice(0,5)}
                  </p>
                </div>
                <div style={{ background: 'var(--azul)', color: 'var(--dourado)', borderRadius: 8, padding: '6px 12px', fontSize: 12, fontWeight: 700 }}>
                  +20 pts
                </div>
              </div>
            </div>
          )}

          {/* Último check-in */}
          {ultimoCheckin && (
            <div className="card card-pad">
              <p className="card-title">Último Check-in</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ fontSize: 13, color: 'var(--texto-suave)' }}>
                  {new Date(ultimoCheckin.criado_em).toLocaleDateString('pt-BR', { weekday:'long', day:'2-digit', month:'long' })}
                </p>
                <span className="badge badge-ok">+20 pts</span>
              </div>
            </div>
          )}

          {/* Sair */}
          <button className="btn btn-outline-blue" onClick={logout} style={{ marginTop: 4 }}>
            Sair da conta
          </button>
        </div>
      </div>
    </div>
  )
}

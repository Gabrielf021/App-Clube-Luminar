import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { getAvatarUrl } from '../lib/classes'

export default function Pontos() {
  const { user } = useAuth()
  const [historico, setHistorico] = useState([])
  const [ranking, setRanking] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('pontos_historico').select('*').eq('perfil_id', user.id)
        .order('criado_em', { ascending: false }).limit(30),
      supabase.from('perfis').select('id,nome,pontos,classe,tipo')
        .order('pontos', { ascending: false }).limit(10),
    ]).then(([h, r]) => {
      setHistorico(h.data || [])
      setRanking(r.data || [])
      setLoading(false)
    })
  }, [user.id])

  const medalhas = ['🥇','🥈','🥉']

  if (loading) return (
    <div className="app-shell">
      <div className="scroll-area" style={{ display:'flex', alignItems:'center', justifyContent:'center' }}>
        <div className="spinner" style={{ borderTopColor:'var(--azul)' }} />
      </div>
    </div>
  )

  return (
    <div className="app-shell">
      <div className="scroll-area fade-in">
        {/* Header */}
        <div className="page-header" style={{ textAlign:'center', paddingBottom:28 }}>
          <p className="page-header-eyebrow">⭐ Desempenho</p>
          <div className="pontos-big" style={{ marginTop:8 }}>{user.pontos ?? 0}</div>
          <p style={{ fontSize:12, color:'rgba(255,255,255,0.45)', marginTop:4 }}>pontos totais</p>
        </div>

        <div className="page-body">
          {/* Ranking */}
          <div className="card">
            <div className="card-pad" style={{ paddingBottom:8 }}>
              <p className="card-title">🏆 Ranking Geral</p>
            </div>
            {ranking.map((p, i) => (
              <div key={p.id} className="list-row" style={{
                background: p.id === user.id ? '#fffbeb' : 'transparent',
              }}>
                <span style={{ fontSize:18, minWidth:28 }}>{medalhas[i] || `${i+1}º`}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight: p.id===user.id ? 800:600, color: p.id===user.id ? 'var(--azul)':'var(--texto)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {p.nome}{p.id===user.id ? ' (você)':''}
                  </p>
                  {p.classe && <p style={{ fontSize:11, color:'var(--texto-suave)' }}>{p.classe}</p>}
                </div>
                <span style={{ fontSize:15, fontWeight:800, color: p.id===user.id ? 'var(--dourado)':'var(--azul)' }}>
                  {p.pontos ?? 0}
                </span>
              </div>
            ))}
          </div>

          {/* Histórico */}
          <div className="card">
            <div className="card-pad" style={{ paddingBottom:8 }}>
              <p className="card-title">📋 Histórico</p>
            </div>
            {historico.length === 0 ? (
              <div className="empty-state"><div className="empty-icon">⭐</div>Nenhum ponto registrado ainda.</div>
            ) : historico.map(h => (
              <div key={h.id} className="hist-row">
                <div style={{ flex:1, minWidth:0 }}>
                  <p className="hist-motivo" style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {h.motivo || 'Pontos atribuídos'}
                  </p>
                  <p className="hist-data">
                    {new Date(h.criado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
                  </p>
                </div>
                <span className={`hist-pts ${h.pontos>=0?'pos':'neg'}`}>
                  {h.pontos>0?'+':''}{h.pontos}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

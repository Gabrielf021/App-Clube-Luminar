import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

export default function Pontos() {
  const { user } = useAuth()
  const [historico, setHistorico] = useState([])
  const [loading, setLoading] = useState(true)
  const [ranking, setRanking] = useState([])

  useEffect(() => {
    Promise.all([
      supabase.from('pontos_historico').select('*, atribuido_por_perfil:atribuido_por(nome)')
        .eq('perfil_id', user.id)
        .order('criado_em', { ascending: false })
        .limit(30),
      supabase.from('perfis').select('id, nome, pontos, classe, tipo')
        .order('pontos', { ascending: false })
        .limit(10),
    ]).then(([hist, rank]) => {
      setHistorico(hist.data || [])
      setRanking(rank.data || [])
      setLoading(false)
    })
  }, [user.id])

  const medalhas = ['🥇','🥈','🥉']

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div className="spinner" />
    </div>
  )

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>
          ⭐ Desempenho
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#f5c000' }}>Meus Pontos</div>
      </div>

      {/* Total de pontos */}
      <div className="card" style={{ textAlign: 'center', padding: '28px 20px', marginBottom: 16 }}>
        <div className="pontos-big">{user.pontos ?? 0}</div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', fontWeight: 700, marginTop: 8, textTransform: 'uppercase', letterSpacing: 1 }}>
          Pontos Totais
        </div>
      </div>

      {/* Ranking geral */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-title">🏆 Ranking Geral</div>
        {ranking.map((p, i) => (
          <div key={p.id} style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
            background: p.id === user.id ? 'rgba(245,192,0,0.07)' : 'transparent',
            borderRadius: 6, paddingLeft: p.id === user.id ? 8 : 0,
          }}>
            <span style={{ fontSize: 18, minWidth: 28 }}>{medalhas[i] || `${i+1}º`}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: p.id === user.id ? 900 : 700, color: p.id === user.id ? '#f5c000' : '#fff' }}>
                {p.nome} {p.id === user.id ? '(você)' : ''}
              </div>
              {p.classe && <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{p.classe}</div>}
            </div>
            <div style={{ fontSize: 15, fontWeight: 900, color: '#f5c000' }}>{p.pontos ?? 0}</div>
          </div>
        ))}
      </div>

      {/* Histórico */}
      <div className="card">
        <div className="card-title">📋 Histórico</div>
        {historico.length === 0 ? (
          <div className="info-banner">Nenhum ponto registrado ainda.</div>
        ) : historico.map(h => (
          <div key={h.id} className="historico-item">
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
                {h.motivo || 'Pontos atribuídos'}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', marginTop: 2 }}>
                {new Date(h.criado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })}
              </div>
            </div>
            <div className={`historico-pts ${h.pontos < 0 ? 'negativo' : ''}`}>
              {h.pontos > 0 ? '+' : ''}{h.pontos}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

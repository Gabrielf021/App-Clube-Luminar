import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

function distMetros(lat1, lon1, lat2, lon2) {
  const R = 6371000, d2r = Math.PI/180
  const dLat = (lat2-lat1)*d2r, dLon = (lon2-lon1)*d2r
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*d2r)*Math.cos(lat2*d2r)*Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

export default function Checkin() {
  const { user, refreshUser } = useAuth()
  const [evento, setEvento] = useState(null)
  const [historico, setHistorico] = useState([])
  const [status, setStatus] = useState('idle') // idle|localizando|sucesso|fora|ja_feito|fora_horario|fora_dia|erro
  const [distM, setDistM] = useState(null)

  useEffect(() => {
    supabase.from('eventos').select('*').eq('ativo', true).limit(1).single()
      .then(({ data }) => setEvento(data))
    carregarHistorico()
  }, [])

  const carregarHistorico = async () => {
    const { data } = await supabase.from('checkins').select('*')
      .eq('perfil_id', user.id).order('criado_em', { ascending: false }).limit(10)
    setHistorico(data || [])
  }

  const verificarHorario = (ev) => {
    const agora = new Date()
    const [h, m] = (ev.horario_limite || '09:00:00').split(':').map(Number)
    if (agora.getDay() !== ev.dia_semana) return 'fora_dia'
    if (agora.getHours() > h || (agora.getHours() === h && agora.getMinutes() > m)) return 'fora_horario'
    return 'ok'
  }

  const jaFezHoje = async () => {
    const hoje = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('checkins').select('id')
      .eq('perfil_id', user.id).eq('aprovado', true)
      .gte('criado_em', `${hoje}T00:00:00`).limit(1)
    return data?.length > 0
  }

  const fazerCheckin = async () => {
    if (!evento) { setStatus('erro'); return }
    const horOk = verificarHorario(evento)
    if (horOk !== 'ok') { setStatus(horOk); return }
    const jaFeito = await jaFezHoje()
    if (jaFeito) { setStatus('ja_feito'); return }

    setStatus('localizando')
    if (!navigator.geolocation) { setStatus('erro'); return }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const dist = distMetros(coords.latitude, coords.longitude, evento.latitude, evento.longitude)
        setDistM(Math.round(dist))
        const aprovado = dist <= 100

        await supabase.from('checkins').insert({
          perfil_id: user.id, latitude: coords.latitude,
          longitude: coords.longitude, distancia_metros: dist,
          aprovado, evento_id: evento.id,
        })

        if (aprovado) {
          await supabase.from('perfis').update({ pontos: (user.pontos||0)+20 }).eq('id', user.id)
          await supabase.from('pontos_historico').insert({
            perfil_id: user.id, pontos: 20,
            motivo: 'Check-in na reunião', evento_id: evento.id,
          })
          await refreshUser()
          setStatus('sucesso')
        } else {
          setStatus('fora')
        }
        carregarHistorico()
      },
      () => setStatus('erro'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const btnClass = status === 'sucesso' || status === 'ja_feito' ? 'done'
    : status === 'fora_horario' || status === 'fora_dia' || status === 'fora' ? 'unavail'
    : status === 'localizando' ? 'unavail' : 'available'

  const btnLabel = {
    idle: '📍 Confirmar presença',
    localizando: 'Obtendo localização...',
    sucesso: '✅ Presença confirmada!',
    ja_feito: '✅ Já confirmado hoje',
    fora: '❌ Fora do raio permitido',
    fora_horario: '⏰ Fora do horário',
    fora_dia: '📅 Não é dia de reunião',
    erro: '⚠️ Erro de localização',
  }[status] || '📍 Confirmar presença'

  return (
    <div className="app-shell">
      <div className="scroll-area fade-in">
        <div className="page-header">
          <p className="page-header-eyebrow">📍 Localização</p>
          <p className="page-header-title">Check-in</p>
          {evento && (
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 4 }}>
              {evento.nome} · {DIAS[evento.dia_semana]} até {evento.horario_limite?.slice(0,5)}
            </p>
          )}
        </div>

        <div className="page-body">
          {/* Card principal */}
          <div className="card card-pad" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {status === 'sucesso' || status === 'ja_feito' ? '✅' : status === 'localizando' ? '🔍' : '📍'}
            </div>
            {status === 'localizando' && (
              <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 16 }}>
                Obtendo sua localização...
              </p>
            )}
            {status === 'fora' && distM && (
              <p style={{ fontSize: 13, color: 'var(--vermelho)', fontWeight: 600, marginBottom: 16 }}>
                Você está a <strong>{distM}m</strong> do local.<br/>
                <span style={{ fontWeight: 400, color: 'var(--texto-suave)' }}>Máximo permitido: 100 metros.</span>
              </p>
            )}
            {status === 'sucesso' && (
              <p style={{ fontSize: 14, color: '#15803d', fontWeight: 700, marginBottom: 16 }}>
                +20 pontos adicionados! 🎉
              </p>
            )}
            {status === 'fora_horario' && evento && (
              <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 16 }}>
                Check-in disponível até <strong>{evento.horario_limite?.slice(0,5)}</strong>
              </p>
            )}
            {status === 'fora_dia' && evento && (
              <p style={{ fontSize: 13, color: 'var(--texto-suave)', marginBottom: 16 }}>
                Reuniões às <strong>{DIAS[evento.dia_semana]}</strong>
              </p>
            )}

            <button className={`checkin-btn ${btnClass}`} onClick={fazerCheckin}
              disabled={status === 'localizando' || status === 'sucesso' || status === 'ja_feito' || status === 'fora_horario' || status === 'fora_dia'}>
              {status === 'localizando' ? <><div className="spinner" style={{ width:20, height:20, borderWidth:2 }} />{btnLabel}</> : btnLabel}
            </button>
          </div>

          {/* Info do local */}
          {evento && (
            <div className="card card-pad">
              <p className="card-title">Local da Reunião</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {[
                  ['📍 Local', evento.nome],
                  ['📅 Dia', DIAS[evento.dia_semana]],
                  ['⏰ Até', evento.horario_limite?.slice(0,5)],
                  ['🎯 Raio', '100 metros'],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between' }}>
                    <span style={{ fontSize:13, color:'var(--texto-suave)' }}>{k}</span>
                    <span style={{ fontSize:13, fontWeight:700 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Histórico */}
          {historico.length > 0 && (
            <div className="card">
              <div className="card-pad" style={{ paddingBottom: 0 }}>
                <p className="card-title">Histórico</p>
              </div>
              {historico.map(c => (
                <div key={c.id} className="list-row">
                  <div style={{ flex:1 }}>
                    <p style={{ fontSize:13, fontWeight:700, color: c.aprovado?'#15803d':'var(--texto)' }}>
                      {c.aprovado ? '✅ Aprovado' : '❌ Negado'}
                    </p>
                    <p style={{ fontSize:11, color:'var(--texto-suave)', marginTop:2 }}>
                      {new Date(c.criado_em).toLocaleDateString('pt-BR', { weekday:'short', day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                    </p>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    {c.aprovado && <span className="badge badge-ok">+20 pts</span>}
                    <span style={{ fontSize:11, color:'var(--texto-suave)' }}>{Math.round(c.distancia_metros||0)}m</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'

const R = 6371000 // raio da terra em metros

function distancia(lat1, lon1, lat2, lon2) {
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLon/2)**2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}

export default function Checkin() {
  const { user, refreshUser } = useAuth()
  const [evento, setEvento] = useState(null)
  const [status, setStatus] = useState('idle') // idle | localizando | sucesso | fora | ja_feito | fora_horario | erro
  const [distM, setDistM] = useState(null)
  const [historico, setHistorico] = useState([])

  useEffect(() => {
    // Busca evento ativo
    supabase.from('eventos').select('*').eq('ativo', true).limit(1).single()
      .then(({ data }) => setEvento(data))

    // Histórico de check-ins
    supabase.from('checkins').select('*')
      .eq('perfil_id', user.id)
      .order('criado_em', { ascending: false })
      .limit(10)
      .then(({ data }) => setHistorico(data || []))
  }, [user.id])

  const verificarHorario = (evento) => {
    const agora = new Date()
    const diaSemana = agora.getDay() // 0=Domingo
    const hora = agora.getHours()
    const minuto = agora.getMinutes()
    const [hLim, mLim] = (evento.horario_limite || '09:00:00').split(':').map(Number)

    if (agora.getDay() !== evento.dia_semana) return false
    if (hora > hLim || (hora === hLim && minuto > mLim)) return false
    return true
  }

  const verificarJaFeito = async (evento) => {
    const hoje = new Date().toISOString().split('T')[0]
    const { data } = await supabase.from('checkins')
      .select('id')
      .eq('perfil_id', user.id)
      .eq('aprovado', true)
      .gte('criado_em', `${hoje}T00:00:00`)
      .limit(1)
    return data && data.length > 0
  }

  const fazerCheckin = async () => {
    if (!evento) { setStatus('erro'); return }
    setStatus('localizando')

    // Verifica horário
    if (!verificarHorario(evento)) { setStatus('fora_horario'); return }

    // Verifica se já fez hoje
    const jaFeito = await verificarJaFeito(evento)
    if (jaFeito) { setStatus('ja_feito'); return }

    // Obtém localização
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const dist = distancia(latitude, longitude, evento.latitude, evento.longitude)
        setDistM(Math.round(dist))

        const aprovado = dist <= 100

        // Salva check-in
        await supabase.from('checkins').insert({
          perfil_id: user.id,
          latitude,
          longitude,
          distancia_metros: dist,
          aprovado,
          evento_id: evento.id,
        })

        if (aprovado) {
          // Adiciona 20 pontos automaticamente
          await supabase.from('perfis')
            .update({ pontos: (user.pontos || 0) + 20 })
            .eq('id', user.id)

          // Registra no histórico de pontos
          await supabase.from('pontos_historico').insert({
            perfil_id: user.id,
            pontos: 20,
            motivo: 'Check-in na reunião',
            categoria_id: null,
            evento_id: evento.id,
          })

          await refreshUser()
          setStatus('sucesso')
        } else {
          setStatus('fora')
        }

        // Atualiza histórico
        const { data } = await supabase.from('checkins').select('*')
          .eq('perfil_id', user.id)
          .order('criado_em', { ascending: false })
          .limit(10)
        setHistorico(data || [])
      },
      () => setStatus('erro')
    )
  }

  const diasSemana = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>
          📍 Localização
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#f5c000' }}>Check-in da Reunião</div>
        {evento && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            {evento.nome} · {diasSemana[evento.dia_semana]} até {evento.horario_limite?.slice(0,5)}
          </div>
        )}
      </div>

      {/* Botão de check-in */}
      <button
        className="checkin-btn"
        onClick={fazerCheckin}
        disabled={status === 'localizando' || status === 'sucesso' || status === 'ja_feito'}
      >
        {status === 'localizando' ? (
          <><div className="spinner" style={{ width: 24, height: 24, borderWidth: 2 }} /> Localizando...</>
        ) : status === 'sucesso' ? (
          <>✅ Check-in Realizado!</>
        ) : status === 'ja_feito' ? (
          <>✅ Já realizado hoje</>
        ) : (
          <>📍 Realizar Check-in</>
        )}
      </button>

      {/* Feedback */}
      {status === 'sucesso' && (
        <div className="success-banner" style={{ marginTop: 12 }}>
          🎉 Check-in aprovado! +20 pontos adicionados!
        </div>
      )}

      {status === 'fora' && (
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 10, padding: '12px 16px', color: '#fca5a5', fontSize: 13, fontWeight: 700, textAlign: 'center', marginTop: 12 }}>
          ❌ Você está a {distM}m do local.<br/>
          <span style={{ fontWeight: 400 }}>Máximo permitido: 100 metros.</span>
        </div>
      )}

      {status === 'fora_horario' && (
        <div style={{ background: 'rgba(245,192,0,0.1)', border: '1px solid rgba(245,192,0,0.3)', borderRadius: 10, padding: '12px 16px', color: '#f5c000', fontSize: 13, fontWeight: 700, textAlign: 'center', marginTop: 12 }}>
          ⏰ Check-in encerrado.<br/>
          <span style={{ fontWeight: 400 }}>Disponível apenas aos {evento && diasSemana[evento.dia_semana]} até {evento?.horario_limite?.slice(0,5)}.</span>
        </div>
      )}

      {status === 'erro' && (
        <div className="error-msg" style={{ marginTop: 12 }}>
          ⚠️ Não foi possível obter sua localização. Verifique as permissões.
        </div>
      )}

      {/* Histórico */}
      {historico.length > 0 && (
        <div className="card" style={{ marginTop: 20 }}>
          <div className="card-title">📋 Histórico</div>
          {historico.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: c.aprovado ? '#86efac' : '#fca5a5' }}>
                  {c.aprovado ? '✅ Aprovado' : '❌ Negado'}
                </div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>
                  {new Date(c.criado_em).toLocaleDateString('pt-BR', { day:'2-digit', month:'short', hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>
                {Math.round(c.distancia_metros || 0)}m
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

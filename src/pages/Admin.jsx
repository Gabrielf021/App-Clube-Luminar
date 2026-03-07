import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { ORDEM_CLASSES, getAvatarUrl } from '../lib/classes'

const TIPOS = ['desbravador','instrutor','conselheiro','diretoria']
const DIAS_SEMANA = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

export default function Admin() {
  const { user } = useAuth()
  const [aba, setAba] = useState('membros')
  const [membros, setMembros] = useState([])
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalMembro, setModalMembro] = useState(null) // null | 'novo' | objeto
  const [modalEvento, setModalEvento] = useState(false)
  const [modalPts, setModalPts] = useState(null)

  const carregar = async () => {
    setLoading(true)
    const [{ data: m }, { data: e }] = await Promise.all([
      supabase.from('perfis').select('*').order('nome'),
      supabase.from('eventos').select('*').order('criado_em', { ascending: false }),
    ])
    setMembros(m || [])
    setEventos(e || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const filtrados = membros.filter(m =>
    m.nome.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>
          ⚙️ Acesso Master
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#f5c000' }}>Administração</div>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {[
          { id: 'membros', label: '👥 Membros' },
          { id: 'eventos', label: '📍 Eventos' },
        ].map(a => (
          <button key={a.id} onClick={() => setAba(a.id)} style={{
            flex: 1, padding: '10px', borderRadius: 10, fontSize: 13, fontWeight: 800, cursor: 'pointer', fontFamily: 'Nunito',
            background: aba === a.id ? 'rgba(245,192,0,0.2)' : 'rgba(255,255,255,0.05)',
            border: `1.5px solid ${aba === a.id ? '#f5c000' : 'rgba(255,255,255,0.1)'}`,
            color: aba === a.id ? '#f5c000' : 'rgba(255,255,255,0.6)',
          }}>{a.label}</button>
        ))}
      </div>

      {loading ? <div className="spinner" style={{ margin: '30px auto' }} /> : (

        aba === 'membros' ? (
          <>
            <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
              <input
                className="field-input" style={{ flex: 1 }}
                placeholder="🔍 Buscar membro..."
                value={busca}
                onChange={e => setBusca(e.target.value)}
              />
              <button className="btn-primary" style={{ whiteSpace: 'nowrap', padding: '0 16px' }}
                onClick={() => setModalMembro('novo')}>
                ➕
              </button>
            </div>

            {/* Stats */}
            <div className="stat-row" style={{ marginBottom: 12 }}>
              <div className="stat-box">
                <div className="value">{membros.filter(m=>m.tipo==='desbravador').length}</div>
                <div className="label">Desbravadores</div>
              </div>
              <div className="stat-box">
                <div className="value">{membros.filter(m=>m.tipo!=='desbravador').length}</div>
                <div className="label">Diretoria</div>
              </div>
            </div>

            {filtrados.map(m => (
              <div key={m.id} className="member-row">
                <img src={m.foto_url || getAvatarUrl(m.nome)} alt={m.nome}
                  className="member-avatar-sm" onError={e => { e.target.src = getAvatarUrl(m.nome) }} />
                <div style={{ flex: 1 }}>
                  <div className="member-name">{m.nome}</div>
                  <div className="member-sub">
                    {m.tipo} {m.classe ? `· ${m.classe}` : ''} {m.unidade ? `· ${m.unidade}` : ''} · {m.pontos ?? 0} pts
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}
                    onClick={() => setModalPts(m)}>⭐</button>
                  <button className="btn-secondary" style={{ padding: '6px 10px', fontSize: 12 }}
                    onClick={() => setModalMembro(m)}>✏️</button>
                </div>
              </div>
            ))}
          </>
        ) : (
          <>
            <button className="btn-primary" onClick={() => setModalEvento(true)} style={{ marginBottom: 14 }}>
              ➕ Novo Evento / Local
            </button>

            {eventos.map(ev => (
              <div key={ev.id} className="card" style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, color: ev.ativo ? '#86efac' : 'rgba(255,255,255,0.4)', fontSize: 15 }}>
                      {ev.ativo ? '🟢' : '⚫'} {ev.nome}
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                      📅 {DIAS_SEMANA[ev.dia_semana]} · ⏰ até {ev.horario_limite?.slice(0,5)}<br/>
                      📍 {ev.latitude?.toFixed(5)}, {ev.longitude?.toFixed(5)}
                    </div>
                  </div>
                  <button className="btn-danger" onClick={async () => {
                    await supabase.from('eventos').update({ ativo: !ev.ativo }).eq('id', ev.id)
                    carregar()
                  }}>
                    {ev.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </div>
              </div>
            ))}
          </>
        )
      )}

      {/* Modal: Editar / Novo Membro */}
      {modalMembro && (
        <ModalMembro
          membro={modalMembro === 'novo' ? null : modalMembro}
          onClose={() => setModalMembro(null)}
          onSave={carregar}
        />
      )}

      {/* Modal: Novo Evento */}
      {modalEvento && (
        <ModalEvento onClose={() => setModalEvento(false)} onSave={carregar} />
      )}

      {/* Modal: Pontos */}
      {modalPts && (
        <ModalPontosAdmin membro={modalPts} onClose={() => setModalPts(null)} onSave={carregar} atribuidoPor={user.id} />
      )}
    </div>
  )
}

// ── MODAL: Editar/Criar Membro ────────────────────────────────
function ModalMembro({ membro, onClose, onSave }) {
  const [form, setForm] = useState({
    nome: membro?.nome || '',
    data_nascimento: membro?.data_nascimento || '',
    tipo: membro?.tipo || 'desbravador',
    classe: membro?.classe || '',
    unidade: membro?.unidade || '',
  })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const salvar = async () => {
    if (!form.nome.trim() || !form.data_nascimento) { setErro('Nome e data de nascimento são obrigatórios.'); return }
    setSaving(true)
    if (membro) {
      await supabase.from('perfis').update({ ...form }).eq('id', membro.id)
    } else {
      await supabase.from('perfis').insert({ ...form, pontos: 0 })
    }
    setSaving(false); onSave(); onClose()
  }

  const excluir = async () => {
    await supabase.from('perfis').delete().eq('id', membro.id)
    onSave(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">{membro ? 'Editar Membro' : 'Novo Membro'}</div>

        <div className="field-group">
          <label>Nome Completo</label>
          <input className="field-input" value={form.nome} onChange={e => set('nome', e.target.value)} />
        </div>
        <div className="field-group">
          <label>Data de Nascimento</label>
          <input className="field-input" type="date" value={form.data_nascimento} onChange={e => set('data_nascimento', e.target.value)} />
        </div>
        <div className="field-group">
          <label>Tipo de Acesso</label>
          <select className="field-select" value={form.tipo} onChange={e => set('tipo', e.target.value)}>
            {TIPOS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="field-group">
          <label>Classe</label>
          <select className="field-select" value={form.classe} onChange={e => set('classe', e.target.value)}>
            <option value="">— sem classe —</option>
            {ORDEM_CLASSES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="field-group">
          <label>Unidade</label>
          <input className="field-input" placeholder="Ex: Águia" value={form.unidade} onChange={e => set('unidade', e.target.value)} />
        </div>

        {erro && <div className="error-msg">{erro}</div>}

        <button className="btn-primary" onClick={salvar} disabled={saving} style={{ marginBottom: 8 }}>
          {saving ? 'Salvando...' : '💾 Salvar'}
        </button>

        {membro && !confirmDel && (
          <button className="btn-danger" style={{ width: '100%', padding: 12 }} onClick={() => setConfirmDel(true)}>
            🗑️ Excluir Membro
          </button>
        )}
        {confirmDel && (
          <div style={{ textAlign: 'center' }}>
            <p style={{ color: '#fca5a5', fontSize: 13, marginBottom: 8 }}>Tem certeza? Esta ação não pode ser desfeita.</p>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn-secondary" onClick={() => setConfirmDel(false)}>Cancelar</button>
              <button className="btn-danger" style={{ flex: 1, padding: 12 }} onClick={excluir}>Confirmar Exclusão</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── MODAL: Novo Evento ────────────────────────────────────────
function ModalEvento({ onClose, onSave }) {
  const [form, setForm] = useState({
    nome: '', latitude: -23.542245, longitude: -46.886757,
    dia_semana: 0, horario_limite: '09:00', ativo: true,
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const salvar = async () => {
    setSaving(true)
    // Desativa outros eventos se este for ativo
    if (form.ativo) await supabase.from('eventos').update({ ativo: false }).neq('id', 0)
    await supabase.from('eventos').insert({ ...form, horario_limite: form.horario_limite + ':00' })
    setSaving(false); onSave(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Novo Evento</div>

        <div className="field-group">
          <label>Nome do Evento</label>
          <input className="field-input" placeholder="Ex: Reunião Especial" value={form.nome} onChange={e => set('nome', e.target.value)} />
        </div>
        <div className="field-group">
          <label>Dia da Semana</label>
          <select className="field-select" value={form.dia_semana} onChange={e => set('dia_semana', parseInt(e.target.value))}>
            {DIAS_SEMANA.map((d,i) => <option key={i} value={i}>{d}</option>)}
          </select>
        </div>
        <div className="field-group">
          <label>Horário Limite</label>
          <input className="field-input" type="time" value={form.horario_limite} onChange={e => set('horario_limite', e.target.value)} />
        </div>
        <div className="field-group">
          <label>Latitude</label>
          <input className="field-input" type="number" step="0.000001" value={form.latitude} onChange={e => set('latitude', parseFloat(e.target.value))} />
        </div>
        <div className="field-group">
          <label>Longitude</label>
          <input className="field-input" type="number" step="0.000001" value={form.longitude} onChange={e => set('longitude', parseFloat(e.target.value))} />
        </div>

        <button className="btn-primary" onClick={salvar} disabled={saving}>
          {saving ? 'Criando...' : '📍 Criar Evento'}
        </button>
      </div>
    </div>
  )
}

// ── MODAL: Pontos Admin ───────────────────────────────────────
function ModalPontosAdmin({ membro, onClose, onSave, atribuidoPor }) {
  const [qtd, setQtd] = useState('')
  const [categoria, setCategoria] = useState('Disciplina')
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)
  const categorias = ['Disciplina','Participação','Evolução na classe','Espírito de equipe','Livre']

  const salvar = async () => {
    const pts = parseInt(qtd)
    if (!pts) return
    setSaving(true)
    await supabase.from('perfis').update({ pontos: (membro.pontos || 0) + pts }).eq('id', membro.id)
    await supabase.from('pontos_historico').insert({
      perfil_id: membro.id, pontos: pts,
      motivo: categoria === 'Livre' ? motivo : categoria,
      atribuido_por: atribuidoPor,
    })
    setSaving(false); onSave(); onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Pontos — {membro.nome}</div>
        <div style={{ textAlign: 'center', fontSize: 32, fontWeight: 900, color: '#f5c000', marginBottom: 16 }}>
          {membro.pontos ?? 0} pts atuais
        </div>

        <div className="field-group">
          <label>Categoria</label>
          <select className="field-select" value={categoria} onChange={e => setCategoria(e.target.value)}>
            {categorias.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        {categoria === 'Livre' && (
          <div className="field-group">
            <label>Motivo</label>
            <input className="field-input" placeholder="Descreva o motivo..." value={motivo} onChange={e => setMotivo(e.target.value)} />
          </div>
        )}
        <div className="field-group">
          <label>Quantidade (negativo para remover)</label>
          <input className="field-input" type="number" placeholder="Ex: 10 ou -5" value={qtd} onChange={e => setQtd(e.target.value)} />
        </div>

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={salvar} disabled={saving} style={{ flex: 1 }}>
            {saving ? 'Salvando...' : '⭐ Lançar'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { ORDEM_CLASSES, getAvatarUrl } from '../lib/classes'

const TIPOS = ['desbravador','instrutor','conselheiro','diretoria']
const DIAS = ['Domingo','Segunda','Terça','Quarta','Quinta','Sexta','Sábado']

export default function Admin() {
  const { user } = useAuth()
  const [aba, setAba] = useState('membros')
  const [membros, setMembros] = useState([])
  const [eventos, setEventos] = useState([])
  const [loading, setLoading] = useState(true)
  const [busca, setBusca] = useState('')
  const [modalMembro, setModalMembro] = useState(null)
  const [modalEvento, setModalEvento] = useState(false)
  const [modalPts, setModalPts] = useState(null)

  const carregar = async () => {
    setLoading(true)
    const [{ data:m }, { data:e }] = await Promise.all([
      supabase.from('perfis').select('*').order('nome'),
      supabase.from('eventos').select('*').order('criado_em', { ascending:false }),
    ])
    setMembros(m||[]); setEventos(e||[]); setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  const filtrados = membros.filter(m => m.nome.toLowerCase().includes(busca.toLowerCase()))
  const desbs = membros.filter(m => m.tipo==='desbravador')
  const diretoria = membros.filter(m => m.tipo!=='desbravador')

  return (
    <div className="app-shell">
      <div className="scroll-area fade-in">
        <div className="page-header">
          <p className="page-header-eyebrow">⚙️ Acesso Master</p>
          <p className="page-header-title">Administração</p>
          <div className="tabs">
            {[{id:'membros',l:'👥 Membros'},{id:'eventos',l:'📍 Eventos'}].map(a => (
              <button key={a.id} className={`tab ${aba===a.id?'active':'inactive'}`} onClick={() => setAba(a.id)}>{a.l}</button>
            ))}
          </div>
        </div>

        <div className="page-body">
          {loading ? (
            <div style={{ textAlign:'center', padding:40 }}><div className="spinner" style={{ margin:'0 auto', borderTopColor:'var(--azul)' }} /></div>
          ) : aba === 'membros' ? (
            <>
              {/* Stats */}
              <div className="stat-grid-3">
                <div className="stat-box"><div className="stat-value">{membros.length}</div><div className="stat-label">Total</div></div>
                <div className="stat-box"><div className="stat-value" style={{ color:'var(--azul)' }}>{desbs.length}</div><div className="stat-label">Desb.</div></div>
                <div className="stat-box"><div className="stat-value" style={{ color:'var(--dourado)' }}>{diretoria.length}</div><div className="stat-label">Direção</div></div>
              </div>

              {/* Busca + novo */}
              <div style={{ display:'flex', gap:8 }}>
                <div className="search-bar" style={{ flex:1 }}>
                  <span style={{ color:'var(--texto-suave)', fontSize:14 }}>🔍</span>
                  <input placeholder="Buscar membro..." value={busca} onChange={e => setBusca(e.target.value)} />
                </div>
                <button className="btn btn-blue btn-sm btn-icon" onClick={() => setModalMembro('novo')}>➕</button>
              </div>

              {filtrados.length === 0 ? (
                <div className="empty-state"><div className="empty-icon">👥</div>Nenhum membro encontrado.</div>
              ) : (
                <div className="card">
                  {filtrados.map(m => (
                    <div key={m.id} className="list-row">
                      <div className="avatar-init" style={{ width:40, height:40, background:'#eef2ff', color:'var(--azul)', fontSize:14, flexShrink:0 }}>
                        <img src={m.foto_url||getAvatarUrl(m.nome)} alt={m.nome} onError={e=>{e.target.style.display='none'}} />
                      </div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:13, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.nome}</p>
                        <p style={{ fontSize:11, color:'var(--texto-suave)', marginTop:1 }}>
                          {m.tipo}{m.classe?` · ${m.classe}`:''}{m.unidade?` · ${m.unidade}`:''} · {m.pontos??0} pts
                        </p>
                      </div>
                      <div style={{ display:'flex', gap:4 }}>
                        <button className="btn btn-outline-blue btn-sm" onClick={() => setModalPts(m)}>⭐</button>
                        <button className="btn btn-outline-blue btn-sm" onClick={() => setModalMembro(m)}>✏️</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <button className="btn btn-blue" onClick={() => setModalEvento(true)} style={{ minHeight:48 }}>
                ➕ Novo Evento / Local
              </button>
              {eventos.map(ev => (
                <div key={ev.id} className="card card-pad">
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                        <span style={{ width:8, height:8, borderRadius:'50%', background:ev.ativo?'#16a34a':'#9ca3af', display:'inline-block' }} />
                        <p style={{ fontSize:15, fontWeight:700 }}>{ev.nome}</p>
                      </div>
                      <p style={{ fontSize:12, color:'var(--texto-suave)' }}>
                        📅 {DIAS[ev.dia_semana]} · ⏰ até {ev.horario_limite?.slice(0,5)}<br/>
                        📍 {ev.latitude?.toFixed(5)}, {ev.longitude?.toFixed(5)}
                      </p>
                    </div>
                    <button className={`btn btn-sm ${ev.ativo?'btn-danger':'btn-outline-blue'}`}
                      onClick={async () => { await supabase.from('eventos').update({ ativo:!ev.ativo }).eq('id',ev.id); carregar() }}>
                      {ev.ativo ? 'Desativar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {modalMembro && <ModalMembro membro={modalMembro==='novo'?null:modalMembro} onClose={()=>setModalMembro(null)} onSave={carregar} />}
      {modalEvento && <ModalEvento onClose={()=>setModalEvento(false)} onSave={carregar} userId={user.id} />}
      {modalPts && <ModalPts membro={modalPts} onClose={()=>setModalPts(null)} onSave={carregar} userId={user.id} />}
    </div>
  )
}

function ModalMembro({ membro, onClose, onSave }) {
  const [form, setForm] = useState({ nome:membro?.nome||'', data_nascimento:membro?.data_nascimento||'', tipo:membro?.tipo||'desbravador', classe:membro?.classe||'', unidade:membro?.unidade||'' })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const [confirmDel, setConfirmDel] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const salvar = async () => {
    if (!form.nome.trim()||!form.data_nascimento) { setErro('Nome e data são obrigatórios.'); return }
    setSaving(true)
    if (membro) await supabase.from('perfis').update({...form}).eq('id',membro.id)
    else await supabase.from('perfis').insert({...form,pontos:0})
    setSaving(false); onSave(); onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle-bar" />
        <div className="modal-header"><p className="modal-title">{membro?'Editar Membro':'Novo Membro'}</p></div>
        <div className="modal-body">
          <div className="field-wrap-light"><label className="field-label">Nome Completo</label><input className="input-light" value={form.nome} onChange={e=>set('nome',e.target.value)} /></div>
          <div className="field-wrap-light"><label className="field-label">Data de Nascimento</label><input className="input-light" type="date" value={form.data_nascimento} onChange={e=>set('data_nascimento',e.target.value)} /></div>
          <div className="field-wrap-light"><label className="field-label">Tipo de Acesso</label><select className="select-light" value={form.tipo} onChange={e=>set('tipo',e.target.value)}>{TIPOS.map(t=><option key={t}>{t}</option>)}</select></div>
          <div className="field-wrap-light"><label className="field-label">Classe</label><select className="select-light" value={form.classe} onChange={e=>set('classe',e.target.value)}><option value="">— sem classe —</option>{ORDEM_CLASSES.map(c=><option key={c}>{c}</option>)}</select></div>
          <div className="field-wrap-light"><label className="field-label">Unidade</label><input className="input-light" placeholder="Ex: Águia" value={form.unidade} onChange={e=>set('unidade',e.target.value)} /></div>
          {erro && <div className="error-msg" style={{ marginBottom:12 }}>{erro}</div>}
          <button className="btn btn-blue" onClick={salvar} disabled={saving} style={{ marginBottom:8 }}>{saving?'Salvando...':'💾 Salvar'}</button>
          {membro && !confirmDel && <button className="btn btn-danger" onClick={()=>setConfirmDel(true)}>🗑️ Excluir Membro</button>}
          {confirmDel && (
            <div>
              <p style={{ color:'var(--vermelho)', fontSize:13, textAlign:'center', marginBottom:8 }}>Tem certeza? Esta ação não pode ser desfeita.</p>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-outline-blue" onClick={()=>setConfirmDel(false)} style={{ minHeight:44 }}>Cancelar</button>
                <button className="btn btn-danger" style={{ flex:1 }} onClick={async()=>{ await supabase.from('perfis').delete().eq('id',membro.id); onSave(); onClose() }}>Confirmar</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function ModalEvento({ onClose, onSave, userId }) {
  const [form, setForm] = useState({ nome:'', latitude:-23.542245, longitude:-46.886757, dia_semana:0, horario_limite:'09:00', ativo:true })
  const [saving, setSaving] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const salvar = async () => {
    if (!form.nome.trim()) return
    setSaving(true)
    if (form.ativo) await supabase.from('eventos').update({ ativo:false }).neq('id',0)
    await supabase.from('eventos').insert({ ...form, horario_limite:form.horario_limite+':00', criado_por:userId })
    setSaving(false); onSave(); onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle-bar" />
        <div className="modal-header"><p className="modal-title">Novo Evento</p></div>
        <div className="modal-body">
          <div className="field-wrap-light"><label className="field-label">Nome do Evento</label><input className="input-light" placeholder="Ex: Reunião Especial" value={form.nome} onChange={e=>set('nome',e.target.value)} /></div>
          <div className="field-wrap-light"><label className="field-label">Dia da Semana</label><select className="select-light" value={form.dia_semana} onChange={e=>set('dia_semana',parseInt(e.target.value))}>{DIAS.map((d,i)=><option key={i} value={i}>{d}</option>)}</select></div>
          <div className="field-wrap-light"><label className="field-label">Horário Limite</label><input className="input-light" type="time" value={form.horario_limite} onChange={e=>set('horario_limite',e.target.value)} /></div>
          <div className="field-wrap-light"><label className="field-label">Latitude</label><input className="input-light" type="number" step="0.000001" value={form.latitude} onChange={e=>set('latitude',parseFloat(e.target.value))} /></div>
          <div className="field-wrap-light"><label className="field-label">Longitude</label><input className="input-light" type="number" step="0.000001" value={form.longitude} onChange={e=>set('longitude',parseFloat(e.target.value))} /></div>
          <button className="btn btn-blue" onClick={salvar} disabled={saving}>{saving?'Criando...':'📍 Criar Evento'}</button>
        </div>
      </div>
    </div>
  )
}

function ModalPts({ membro, onClose, onSave, userId }) {
  const [qtd, setQtd] = useState('')
  const [cat, setCat] = useState('Disciplina')
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)
  const cats = ['Disciplina','Participação','Evolução na classe','Espírito de equipe','Livre']

  const salvar = async () => {
    const pts = parseInt(qtd); if (!pts) return
    setSaving(true)
    await supabase.from('perfis').update({ pontos:(membro.pontos||0)+pts }).eq('id',membro.id)
    await supabase.from('pontos_historico').insert({ perfil_id:membro.id, pontos:pts, motivo:cat==='Livre'?motivo:cat, atribuido_por:userId })
    setSaving(false); onSave(); onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e=>e.stopPropagation()}>
        <div className="modal-handle-bar" />
        <div className="modal-header"><p className="modal-title">Pontos — {membro.nome}</p><p style={{ fontSize:13, color:'var(--texto-suave)', marginTop:2 }}>{membro.pontos??0} pts atuais</p></div>
        <div className="modal-body">
          <div className="field-wrap-light"><label className="field-label">Categoria</label><select className="select-light" value={cat} onChange={e=>setCat(e.target.value)}>{cats.map(c=><option key={c}>{c}</option>)}</select></div>
          {cat==='Livre'&&<div className="field-wrap-light"><label className="field-label">Motivo</label><input className="input-light" placeholder="Descreva..." value={motivo} onChange={e=>setMotivo(e.target.value)} /></div>}
          <div className="field-wrap-light"><label className="field-label">Quantidade (negativo para remover)</label><input className="input-light" type="number" placeholder="Ex: 10 ou -5" value={qtd} onChange={e=>setQtd(e.target.value)} /></div>
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-outline-blue" onClick={onClose} style={{ minHeight:48 }}>Cancelar</button>
            <button className="btn btn-blue" onClick={salvar} disabled={saving} style={{ flex:1 }}>{saving?'Salvando...':'⭐ Lançar'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}

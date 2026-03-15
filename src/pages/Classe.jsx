import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { CLASSES, ORDEM_CLASSES, calcularPct, getAvatarUrl, totalRequisitos } from '../lib/classes'

function ProgBar({ pct, cor }) {
  return (
    <div className="prog-bg" style={{ marginTop:4 }}>
      <div className="prog-fill" style={{ width:`${pct}%`, background:`linear-gradient(90deg,${cor||'var(--azul)'},var(--dourado))` }} />
    </div>
  )
}

/* ── MODAL REQUISITOS ── */
function ModalRequisitos({ desb, onClose, onSave }) {
  const cd = CLASSES[desb.classe]
  const [prog, setProg] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [abertos, setAbertos] = useState({})

  useEffect(() => {
    supabase.from('progresso').select('*').eq('perfil_id', desb.id).eq('classe', desb.classe)
      .then(({ data }) => {
        const m = {}; data?.forEach(r => { m[`${r.secao}-${r.requisito_index}`] = r.concluido })
        setProg(m); setLoading(false)
        // Abre seções incompletas por padrão
        const ab = {}
        cd?.secoes.forEach(s => { const d = s.requisitos.filter((_,ri) => m[`${s.titulo}-${ri}`]).length; if (d < s.requisitos.length) ab[s.titulo] = true })
        setAbertos(ab)
      })
  }, [desb.id, desb.classe])

  const toggle = k => setProg(p => ({ ...p, [k]: !p[k] }))
  const toggleSec = t => setAbertos(a => ({ ...a, [t]: !a[t] }))

  const salvar = async () => {
    setSaving(true)
    const ups = []
    cd?.secoes.forEach(sec => sec.requisitos.forEach((_, ri) => {
      ups.push({ perfil_id:desb.id, classe:desb.classe, secao:sec.titulo, requisito_index:ri, concluido:prog[`${sec.titulo}-${ri}`]||false, atualizado_em: new Date().toISOString() })
    }))
    await supabase.from('progresso').upsert(ups, { onConflict:'perfil_id,classe,secao,requisito_index' })
    setSaving(false); onSave(); onClose()
  }

  const pct = calcularPct(prog, desb.classe)
  const cor = CLASSES[desb.classe]?.cor || 'var(--azul)'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle-bar" />
        <div className="modal-header">
          <p className="modal-title">{desb.nome}</p>
          <div style={{ marginTop:8 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}>
              <span style={{ fontSize:12, color:'var(--texto-suave)' }}>Progresso geral</span>
              <span style={{ fontSize:12, fontWeight:800, color:cor }}>{pct}%</span>
            </div>
            <ProgBar pct={pct} cor={cor} />
          </div>
        </div>

        {loading ? <div style={{ padding:40, textAlign:'center' }}><div className="spinner" style={{ margin:'0 auto', borderTopColor:'var(--azul)' }} /></div> : (
          <>
            {cd?.secoes.map(sec => {
              const ts = sec.requisitos.length
              const ds = sec.requisitos.filter((_,ri) => prog[`${sec.titulo}-${ri}`]).length
              const open = abertos[sec.titulo]
              return (
                <div key={sec.titulo}>
                  <div className="sec-header" onClick={() => toggleSec(sec.titulo)}>
                    <span className="sec-header-title">{sec.icone} {sec.titulo}</span>
                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <span className="sec-header-count">{ds}/{ts}</span>
                      <span style={{ fontSize:10, color:'var(--texto-suave)' }}>{open?'▲':'▼'}</span>
                    </div>
                  </div>
                  {open && sec.requisitos.map((req, ri) => {
                    const key = `${sec.titulo}-${ri}`
                    const done = prog[key]
                    return (
                      <div key={ri} className="req-row" onClick={() => toggle(key)}>
                        <div className={`req-check ${done?'checked':''}`}>
                          {done && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5"><polyline points="20 6 9 17 4 12"/></svg>}
                        </div>
                        <p className={`req-text ${done?'checked':''}`}>{req}</p>
                      </div>
                    )
                  })}
                </div>
              )
            })}
            <div style={{ padding:'16px 20px' }}>
              <button className="btn btn-blue" onClick={salvar} disabled={saving}>
                {saving ? 'Salvando...' : '💾 Salvar Progresso'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ── MODAL PONTOS ── */
function ModalPontos({ desb, onClose, onSave, currentUser }) {
  const [qtd, setQtd] = useState('')
  const [cat, setCat] = useState('Disciplina')
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)
  const cats = ['Disciplina','Participação','Evolução na classe','Espírito de equipe','Livre']

  const salvar = async () => {
    const pts = parseInt(qtd)
    if (!pts) return
    setSaving(true)
    await supabase.from('perfis').update({ pontos:(desb.pontos||0)+pts }).eq('id', desb.id)
    await supabase.from('pontos_historico').insert({ perfil_id:desb.id, pontos:pts, motivo:cat==='Livre'?motivo:cat, atribuido_por:currentUser.id })
    setSaving(false); onSave(); onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle-bar" />
        <div className="modal-header">
          <p className="modal-title">Lançar Pontos</p>
          <p style={{ fontSize:13, color:'var(--texto-suave)', marginTop:2 }}>{desb.nome} · {desb.pontos??0} pts atuais</p>
        </div>
        <div className="modal-body">
          <div className="field-wrap-light">
            <label className="field-label">Categoria</label>
            <select className="select-light" value={cat} onChange={e => setCat(e.target.value)}>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          {cat === 'Livre' && (
            <div className="field-wrap-light">
              <label className="field-label">Motivo</label>
              <input className="input-light" placeholder="Descreva o motivo..." value={motivo} onChange={e => setMotivo(e.target.value)} />
            </div>
          )}
          <div className="field-wrap-light">
            <label className="field-label">Quantidade (negativo para remover)</label>
            <input className="input-light" type="number" placeholder="Ex: 10 ou -5" value={qtd} onChange={e => setQtd(e.target.value)} />
          </div>
          <div style={{ display:'flex', gap:8, marginTop:4 }}>
            <button className="btn btn-outline-blue" onClick={onClose} style={{ minHeight:48 }}>Cancelar</button>
            <button className="btn btn-blue" onClick={salvar} disabled={saving} style={{ flex:1 }}>
              {saving ? 'Salvando...' : '⭐ Lançar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── MODAL NOVO DESBRAVADOR ── */
function ModalNovoDesb({ classeFixa, onClose, onSave }) {
  const [form, setForm] = useState({ nome:'', data_nascimento:'', classe:classeFixa||'Amigo', unidade:'' })
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const salvar = async () => {
    if (!form.nome.trim()||!form.data_nascimento) { setErro('Preencha nome e data de nascimento.'); return }
    setSaving(true)
    const { error } = await supabase.from('perfis').insert({ nome:form.nome.trim(), data_nascimento:form.data_nascimento, tipo:'desbravador', classe:classeFixa||form.classe, unidade:form.unidade||null, pontos:0 })
    setSaving(false)
    if (error) { setErro('Erro ao cadastrar.'); return }
    onSave(); onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle-bar" />
        <div className="modal-header"><p className="modal-title">Novo Desbravador</p></div>
        <div className="modal-body">
          <div className="field-wrap-light"><label className="field-label">Nome Completo</label><input className="input-light" placeholder="Nome do desbravador" value={form.nome} onChange={e => set('nome',e.target.value)} /></div>
          <div className="field-wrap-light"><label className="field-label">Data de Nascimento</label><input className="input-light" type="date" value={form.data_nascimento} onChange={e => set('data_nascimento',e.target.value)} /></div>
          {!classeFixa && (<div className="field-wrap-light"><label className="field-label">Classe</label><select className="select-light" value={form.classe} onChange={e => set('classe',e.target.value)}>{ORDEM_CLASSES.map(c=><option key={c}>{c}</option>)}</select></div>)}
          <div className="field-wrap-light"><label className="field-label">Unidade (opcional)</label><input className="input-light" placeholder="Ex: Águia" value={form.unidade} onChange={e => set('unidade',e.target.value)} /></div>
          {erro && <div className="error-msg" style={{ marginBottom:12 }}>{erro}</div>}
          <div style={{ display:'flex', gap:8 }}>
            <button className="btn btn-outline-blue" onClick={onClose} style={{ minHeight:48 }}>Cancelar</button>
            <button className="btn btn-blue" onClick={salvar} disabled={saving} style={{ flex:1 }}>
              {saving ? 'Cadastrando...' : '➕ Cadastrar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── PRINCIPAL ── */
export default function Classe() {
  const { user } = useAuth()
  const [desbs, setDesbs] = useState([])
  const [progs, setProgs] = useState({})
  const [loading, setLoading] = useState(true)
  const [classeVis, setClasseVis] = useState(user.classe||ORDEM_CLASSES[0])
  const [modalReq, setModalReq] = useState(null)
  const [modalPts, setModalPts] = useState(null)
  const [modalNovo, setModalNovo] = useState(false)

  const isDiretoria = user.tipo === 'diretoria'
  const isConselheiro = user.tipo === 'conselheiro'

  const carregar = async () => {
    setLoading(true)
    let q = supabase.from('perfis').select('*').eq('tipo','desbravador').order('nome')
    if (!isDiretoria) {
      if (user.tipo==='instrutor') q = q.eq('classe', user.classe)
      if (isConselheiro) q = q.eq('unidade', user.unidade)
    } else {
      q = q.eq('classe', classeVis)
    }
    const { data } = await q
    const lista = data || []
    setDesbs(lista)
    if (lista.length > 0) {
      const { data: pd } = await supabase.from('progresso').select('*').in('perfil_id', lista.map(d=>d.id))
      const m = {}
      pd?.forEach(r => { if(!m[r.perfil_id]) m[r.perfil_id]={}; m[r.perfil_id][`${r.secao}-${r.requisito_index}`]=r.concluido })
      setProgs(m)
    } else setProgs({})
    setLoading(false)
  }

  useEffect(() => { carregar() }, [classeVis, user])

  const classe = isDiretoria ? classeVis : user.classe
  const pcts = desbs.map(d => calcularPct(progs[d.id]||{}, d.classe))
  const media = pcts.length ? Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length) : 0
  const nApoio = pcts.filter(p=>p<50).length
  const nOk = pcts.filter(p=>p>=80).length

  return (
    <div className="app-shell">
      <div className="scroll-area fade-in">
        {/* Header */}
        <div className="page-header">
          <p className="page-header-eyebrow">{isDiretoria?'🎯 Visão Geral':isConselheiro?'👥 Minha Unidade':'📚 Minha Classe'}</p>
          <p className="page-header-title">{isDiretoria?'Classes':isConselheiro?`Unidade ${user.unidade||''}`:`Classe ${classe||''}`}</p>
          {isDiretoria && (
            <div className="tabs">
              {ORDEM_CLASSES.map(cl => (
                <button key={cl} className={`tab ${classeVis===cl?'active':'inactive'}`} onClick={() => setClasseVis(cl)}>
                  {CLASSES[cl].icone} {cl}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="page-body">
          {/* Stats */}
          <div className="stat-grid-3">
            <div className="stat-box"><div className="stat-value">{desbs.length}</div><div className="stat-label">👥 Membros</div></div>
            <div className="stat-box"><div className="stat-value">{media}%</div><div className="stat-label">📊 Média</div></div>
            <div className="stat-box"><div className="stat-value" style={{ color:nApoio>0?'var(--vermelho)':'var(--verde)' }}>{nApoio}</div><div className="stat-label">🚨 Apoio</div></div>
          </div>

          {/* Botão novo */}
          {!isConselheiro && (
            <button className="btn btn-blue" onClick={() => setModalNovo(true)} style={{ minHeight:48 }}>
              ➕ Novo Desbravador
            </button>
          )}

          {/* Lista */}
          {loading ? (
            <div style={{ textAlign:'center', padding:40 }}><div className="spinner" style={{ margin:'0 auto', borderTopColor:'var(--azul)' }} /></div>
          ) : desbs.length === 0 ? (
            <div className="empty-state"><div className="empty-icon">👥</div>Nenhum desbravador encontrado.</div>
          ) : (
            <div className="card">
              {desbs.sort((a,b) => calcularPct(progs[b.id]||{},b.classe)-calcularPct(progs[a.id]||{},a.classe))
                .map(d => {
                  const pct = calcularPct(progs[d.id]||{}, d.classe)
                  const cor = CLASSES[d.classe]?.cor||'var(--azul)'
                  const bdg = pct>=80?'badge-ok':pct>=50?'badge-warn':'badge-err'
                  const bdgL = pct>=80?'✅ Ótimo':pct>=50?'⚠️ Atenção':'🚨 Apoio'
                  return (
                    <div key={d.id} style={{ padding:'12px 16px', borderBottom:'1px solid #f3f4f6' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div className="avatar-init" style={{ width:40, height:40, background:'#eef2ff', color:'var(--azul)', fontSize:14, flexShrink:0 }}>
                          <img src={d.foto_url||getAvatarUrl(d.nome)} alt={d.nome} onError={e=>{e.target.style.display='none'}} />
                        </div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <p style={{ fontSize:14, fontWeight:700, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{d.nome}</p>
                          <p style={{ fontSize:11, color:'var(--texto-suave)', marginTop:1 }}>{d.classe}{d.unidade?` · ${d.unidade}`:''} · {d.pontos??0} pts</p>
                        </div>
                        <div style={{ textAlign:'right' }}>
                          <p style={{ fontSize:16, fontWeight:800, color:cor }}>{pct}%</p>
                          <span className={`badge ${bdg}`}>{bdgL}</span>
                        </div>
                      </div>
                      <ProgBar pct={pct} cor={cor} />
                      <div style={{ display:'flex', gap:6, marginTop:8 }}>
                        {!isConselheiro && (
                          <button className="btn btn-outline-blue btn-sm" style={{ flex:1 }} onClick={() => setModalReq(d)}>📋 Requisitos</button>
                        )}
                        <button className="btn btn-outline-blue btn-sm" style={{ flex:1 }} onClick={() => setModalPts(d)}>⭐ Pontos</button>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      </div>

      {modalReq && <ModalRequisitos desb={modalReq} onClose={()=>setModalReq(null)} onSave={carregar} />}
      {modalPts && <ModalPontos desb={modalPts} currentUser={user} onClose={()=>setModalPts(null)} onSave={carregar} />}
      {modalNovo && <ModalNovoDesb classeFixa={isDiretoria?null:user.classe} onClose={()=>setModalNovo(false)} onSave={carregar} />}
    </div>
  )
}

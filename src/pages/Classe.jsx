import { useState, useEffect } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { CLASSES, ORDEM_CLASSES, calcularPct, getAvatarUrl, totalRequisitos } from '../lib/classes'

function ProgressBar({ pct, cor }) {
  return (
    <div className="prog-bg" style={{ margin: '4px 0' }}>
      <div className="prog-fill" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${cor || '#1a2a8e'}, #f5c000)` }} />
    </div>
  )
}

// ── MODAL: Requisitos de um desbravador ──────────────────────
function ModalRequisitos({ desb, onClose, onSave }) {
  const classeData = CLASSES[desb.classe]
  const [prog, setProg] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    supabase.from('progresso').select('*')
      .eq('perfil_id', desb.id).eq('classe', desb.classe)
      .then(({ data }) => {
        const map = {}
        data?.forEach(r => { map[`${r.secao}-${r.requisito_index}`] = r.concluido })
        setProg(map)
        setLoading(false)
      })
  }, [desb.id, desb.classe])

  const toggle = (key) => setProg(p => ({ ...p, [key]: !p[key] }))

  const salvar = async () => {
    setSaving(true)
    const upserts = []
    classeData.secoes.forEach(sec => {
      sec.requisitos.forEach((_, ri) => {
        const key = `${sec.titulo}-${ri}`
        upserts.push({
          perfil_id: desb.id,
          classe: desb.classe,
          secao: sec.titulo,
          requisito_index: ri,
          concluido: prog[key] || false,
          atualizado_em: new Date().toISOString(),
        })
      })
    })
    await supabase.from('progresso').upsert(upserts, { onConflict: 'perfil_id,classe,secao,requisito_index' })
    setSaving(false)
    onSave()
    onClose()
  }

  const pct = calcularPct(prog, desb.classe)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" style={{ maxHeight: '92vh' }} onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">{desb.nome}</div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <span style={{ fontSize: 28, fontWeight: 900, color: '#f5c000' }}>{pct}%</span>
          <ProgressBar pct={pct} cor={classeData?.cor} />
        </div>

        {loading ? <div className="spinner" style={{ margin: '20px auto' }} /> : (
          classeData?.secoes.map(sec => {
            const ts = sec.requisitos.length
            const ds = sec.requisitos.filter((_, ri) => prog[`${sec.titulo}-${ri}`]).length
            return (
              <div key={sec.titulo} style={{ marginBottom: 16 }}>
                <div className="section-header" style={{ cursor: 'default' }}>
                  <span>{sec.icone} {sec.titulo}</span>
                  <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{ds}/{ts}</span>
                </div>
                {sec.requisitos.map((req, ri) => {
                  const key = `${sec.titulo}-${ri}`
                  const done = prog[key]
                  return (
                    <div key={ri} className={`req-item ${done ? 'done' : ''}`} onClick={() => toggle(key)}>
                      <div className={`req-check ${done ? 'done' : ''}`}>
                        {done && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>}
                      </div>
                      <div className={`req-text ${done ? 'done' : ''}`}>{req}</div>
                    </div>
                  )
                })}
              </div>
            )
          })
        )}

        <button className="btn-primary" onClick={salvar} disabled={saving} style={{ marginTop: 8 }}>
          {saving ? 'Salvando...' : '💾 Salvar Progresso'}
        </button>
      </div>
    </div>
  )
}

// ── MODAL: Lançar Pontos ─────────────────────────────────────
function ModalPontos({ desb, onClose, onSave }) {
  const { user } = useAuth()
  const [qtd, setQtd] = useState('')
  const [categoria, setCategoria] = useState('Disciplina')
  const [motivo, setMotivo] = useState('')
  const [saving, setSaving] = useState(false)

  const categorias = ['Disciplina','Participação','Evolução na classe','Espírito de equipe','Livre']

  const salvar = async () => {
    const pts = parseInt(qtd)
    if (!pts) return
    setSaving(true)
    await supabase.from('perfis').update({ pontos: (desb.pontos || 0) + pts }).eq('id', desb.id)
    await supabase.from('pontos_historico').insert({
      perfil_id: desb.id,
      pontos: pts,
      motivo: categoria === 'Livre' ? motivo : categoria,
      atribuido_por: user.id,
    })
    setSaving(false)
    onSave()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Pontos para {desb.nome}</div>

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
          <label>Quantidade (use negativo para remover)</label>
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

// ── MODAL: Novo Desbravador ───────────────────────────────────
function ModalNovoDesb({ classeFixa, onClose, onSave }) {
  const [nome, setNome] = useState('')
  const [dataNasc, setDataNasc] = useState('')
  const [classe, setClasse] = useState(classeFixa || 'Amigo')
  const [unidade, setUnidade] = useState('')
  const [saving, setSaving] = useState(false)
  const [erro, setErro] = useState('')

  const salvar = async () => {
    if (!nome.trim() || !dataNasc) { setErro('Preencha nome e data de nascimento.'); return }
    setSaving(true)
    const { error } = await supabase.from('perfis').insert({
      nome: nome.trim(),
      data_nascimento: dataNasc,
      tipo: 'desbravador',
      classe: classeFixa || classe,
      unidade: unidade.trim() || null,
      pontos: 0,
    })
    if (error) { setErro('Erro ao cadastrar. Tente novamente.'); setSaving(false); return }
    setSaving(false)
    onSave()
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle" />
        <div className="modal-title">Novo Desbravador</div>

        <div className="field-group">
          <label>Nome Completo</label>
          <input className="field-input" placeholder="Nome do desbravador" value={nome} onChange={e => setNome(e.target.value)} />
        </div>

        <div className="field-group">
          <label>Data de Nascimento</label>
          <input className="field-input" type="date" value={dataNasc} onChange={e => setDataNasc(e.target.value)} />
        </div>

        {!classeFixa && (
          <div className="field-group">
            <label>Classe</label>
            <select className="field-select" value={classe} onChange={e => setClasse(e.target.value)}>
              {ORDEM_CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
        )}

        <div className="field-group">
          <label>Unidade (opcional)</label>
          <input className="field-input" placeholder="Ex: Águia" value={unidade} onChange={e => setUnidade(e.target.value)} />
        </div>

        {erro && <div className="error-msg">{erro}</div>}

        <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" onClick={salvar} disabled={saving} style={{ flex: 1 }}>
            {saving ? 'Cadastrando...' : '➕ Cadastrar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── COMPONENTE PRINCIPAL ──────────────────────────────────────
export default function Classe() {
  const { user } = useAuth()
  const [desbs, setDesbs] = useState([])
  const [progs, setProgs] = useState({})
  const [loading, setLoading] = useState(true)
  const [modalReq, setModalReq] = useState(null)
  const [modalPts, setModalPts] = useState(null)
  const [modalNovoDesb, setModalNovoDesb] = useState(false)
  const [classeVis, setClasseVis] = useState(user.classe || ORDEM_CLASSES[0])

  const isDiretoria = user.tipo === 'diretoria'

  const carregar = async () => {
    setLoading(true)
    let query = supabase.from('perfis').select('*').eq('tipo', 'desbravador').order('nome')
    if (!isDiretoria) {
      if (user.tipo === 'instrutor') query = query.eq('classe', user.classe)
      if (user.tipo === 'conselheiro') query = query.eq('unidade', user.unidade)
    } else {
      query = query.eq('classe', classeVis)
    }
    const { data } = await query
    const lista = data || []
    setDesbs(lista)

    // Busca progresso de todos
    if (lista.length > 0) {
      const ids = lista.map(d => d.id)
      const { data: progData } = await supabase.from('progresso').select('*').in('perfil_id', ids)
      const map = {}
      progData?.forEach(r => {
        if (!map[r.perfil_id]) map[r.perfil_id] = {}
        map[r.perfil_id][`${r.secao}-${r.requisito_index}`] = r.concluido
      })
      setProgs(map)
    }
    setLoading(false)
  }

  useEffect(() => { carregar() }, [classeVis])

  const classe = isDiretoria ? classeVis : user.classe
  const classeData = CLASSES[classe]

  // Stats do dashboard
  const pcts = desbs.map(d => calcularPct(progs[d.id] || {}, d.classe))
  const media = pcts.length ? Math.round(pcts.reduce((a,b)=>a+b,0)/pcts.length) : 0
  const nApoio = pcts.filter(p => p < 50).length
  const nOk = pcts.filter(p => p >= 80).length

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>
          {isDiretoria ? '🎯 Visão Geral' : user.tipo === 'conselheiro' ? '👥 Minha Unidade' : '📚 Minha Classe'}
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#f5c000' }}>
          {isDiretoria ? 'Todas as Classes' : user.tipo === 'conselheiro' ? `Unidade ${user.unidade || ''}` : `Classe ${classe}`}
        </div>
      </div>

      {/* Seletor de classe (diretoria) */}
      {isDiretoria && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {ORDEM_CLASSES.map(cl => (
            <button key={cl} onClick={() => setClasseVis(cl)} style={{
              padding: '6px 14px', borderRadius: 99, fontSize: 12, fontWeight: 800, cursor: 'pointer', fontFamily: 'Nunito',
              background: classeVis === cl ? CLASSES[cl].cor : 'rgba(255,255,255,0.06)',
              border: `1.5px solid ${classeVis === cl ? CLASSES[cl].cor : 'rgba(255,255,255,0.1)'}`,
              color: classeVis === cl ? '#fff' : 'rgba(255,255,255,0.6)',
            }}>{CLASSES[cl].icone} {cl}</button>
          ))}
        </div>
      )}

      {/* Dashboard stats */}
      <div className="stat-row">
        <div className="stat-box">
          <div className="value">{desbs.length}</div>
          <div className="label">👥 Membros</div>
        </div>
        <div className="stat-box">
          <div className="value">{media}%</div>
          <div className="label">📊 Média</div>
        </div>
      </div>
      <div className="stat-row">
        <div className="stat-box" style={{ borderColor: 'rgba(239,68,68,0.4)' }}>
          <div className="value" style={{ color: '#fca5a5' }}>{nApoio}</div>
          <div className="label">🚨 Precisam apoio</div>
        </div>
        <div className="stat-box" style={{ borderColor: 'rgba(34,197,94,0.4)' }}>
          <div className="value" style={{ color: '#86efac' }}>{nOk}</div>
          <div className="label">✅ Indo bem</div>
        </div>
      </div>

      {/* Botão novo desbravador */}
      <button className="btn-primary" onClick={() => setModalNovoDesb(true)} style={{ marginBottom: 16 }}>
        ➕ Novo Desbravador
      </button>

      {/* Lista de desbravadores */}
      {loading ? <div className="spinner" style={{ margin: '30px auto' }} /> : (
        desbs.length === 0 ? (
          <div className="info-banner">Nenhum desbravador nesta {user.tipo === 'conselheiro' ? 'unidade' : 'classe'} ainda.</div>
        ) : (
          desbs.sort((a,b) => calcularPct(progs[b.id]||{}, b.classe) - calcularPct(progs[a.id]||{}, a.classe))
            .map(d => {
              const pct = calcularPct(progs[d.id] || {}, d.classe)
              const cor = CLASSES[d.classe]?.cor || '#1a2a8e'
              const badge = pct >= 80 ? 'badge-ok' : pct >= 50 ? 'badge-at' : 'badge-ap'
              const badgeLabel = pct >= 80 ? '✅ Ótimo' : pct >= 50 ? '⚠️ Atenção' : '🚨 Apoio'

              return (
                <div key={d.id} className="member-row" style={{ flexDirection: 'column', alignItems: 'stretch', gap: 8 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img
                      src={d.foto_url || getAvatarUrl(d.nome)}
                      alt={d.nome}
                      className="member-avatar-sm"
                      onError={e => { e.target.src = getAvatarUrl(d.nome) }}
                    />
                    <div style={{ flex: 1 }}>
                      <div className="member-name">{d.nome}</div>
                      <div className="member-sub">
                        {d.classe} {d.unidade ? `· ${d.unidade}` : ''} · {d.pontos ?? 0} pts
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 18, fontWeight: 900, color: '#f5c000' }}>{pct}%</div>
                      <span className={badge}>{badgeLabel}</span>
                    </div>
                  </div>
                  <ProgressBar pct={pct} cor={cor} />
                  <div style={{ display: 'flex', gap: 6 }}>
                    {user.tipo !== 'conselheiro' && (
                      <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: 12 }}
                        onClick={() => setModalReq(d)}>
                        📋 Requisitos
                      </button>
                    )}
                    <button className="btn-secondary" style={{ flex: 1, padding: '8px', fontSize: 12 }}
                      onClick={() => setModalPts(d)}>
                      ⭐ Pontos
                    </button>
                  </div>
                </div>
              )
            })
        )
      )}

      {/* Modais */}
      {modalReq && (
        <ModalRequisitos desb={modalReq} onClose={() => setModalReq(null)} onSave={carregar} />
      )}
      {modalPts && (
        <ModalPontos desb={modalPts} onClose={() => setModalPts(null)} onSave={carregar} />
      )}
      {modalNovoDesb && (
        <ModalNovoDesb
          classeFixa={isDiretoria ? null : user.classe}
          onClose={() => setModalNovoDesb(false)}
          onSave={carregar}
        />
      )}
    </div>
  )
}

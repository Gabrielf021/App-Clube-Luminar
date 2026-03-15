import { useState, useRef } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { getAvatarUrl, calcularPct, CLASSES } from '../lib/classes'

function calcIdade(d) {
  if (!d) return '—'
  const hoje = new Date(), nasc = new Date(d)
  let i = hoje.getFullYear() - nasc.getFullYear()
  if (hoje.getMonth() - nasc.getMonth() < 0 || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) i--
  return i
}

const TIPO_LABEL = { desbravador:'Desbravador', instrutor:'Instrutor', conselheiro:'Conselheiro', diretoria:'Diretoria' }

export default function Perfil() {
  const { user, logout, refreshUser } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [sucesso, setSucesso] = useState('')
  const [modalEdit, setModalEdit] = useState(false)
  const fileRef = useRef()

  const avatar = getAvatarUrl(user?.nome, user?.avatar_seed)
  const idade = calcIdade(user?.data_nascimento)
  const classeInfo = user?.classe ? CLASSES[user.classe] : null

  const handleFoto = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${user.id}/avatar.${ext}`
    const { error: upErr } = await supabase.storage.from('avatares').upload(path, file, { upsert: true })
    if (!upErr) {
      const { data } = supabase.storage.from('avatares').getPublicUrl(path)
      await supabase.from('perfis').update({ foto_url: data.publicUrl }).eq('id', user.id)
      await refreshUser()
      setSucesso('Foto atualizada!')
      setTimeout(() => setSucesso(''), 3000)
    }
    setUploading(false)
  }

  const secoes = [
    {
      titulo: 'CONTA',
      itens: [
        {
          label: uploading ? 'Enviando...' : '📷 Alterar foto de perfil',
          acao: () => fileRef.current?.click(),
        },
        { label: '✏️ Editar informações', acao: () => setModalEdit(true) },
      ],
    },
    {
      titulo: 'SISTEMA',
      itens: [
        user?.classe && { label: `📚 Classe ${user.classe}`, info: classeInfo?.livro },
        { label: '🎂 Aniversário', info: user?.data_nascimento ? new Date(user.data_nascimento + 'T00:00:00').toLocaleDateString('pt-BR') : '—' },
        { label: '🏅 Unidade', info: user?.unidade || 'Não definida' },
      ].filter(Boolean),
    },
  ]

  return (
    <div className="app-shell">
      <div className="scroll-area fade-in">
        {/* Header perfil */}
        <div className="profile-header" style={{ textAlign: 'center' }}>
          <div style={{ position: 'relative', width: 72, margin: '0 auto 12px' }}>
            <div className="profile-avatar" style={{ width: 72, height: 72, margin: '0 auto' }}>
              <img src={user?.foto_url || avatar} alt={user?.nome} onError={e => e.target.style.display='none'} />
            </div>
            <button onClick={() => fileRef.current?.click()}
              style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, background: '#fff', borderRadius: '50%', border: '1.5px solid #e0e0e0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--azul)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
          </div>
          <p className="profile-nome">{user?.nome}</p>
          <p className="profile-sub">{TIPO_LABEL[user?.tipo]} · {idade} anos</p>
          <span className="profile-badge">{TIPO_LABEL[user?.tipo]}</span>
          {sucesso && <p style={{ fontSize: 12, color: '#86efac', marginTop: 8, fontWeight: 600 }}>✅ {sucesso}</p>}
        </div>

        <input ref={fileRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFoto} />

        <div className="page-body">
          {/* Stats */}
          <div className="stat-grid">
            <div className="stat-box">
              <div className="stat-value" style={{ color: 'var(--dourado)' }}>{user?.pontos ?? 0}</div>
              <div className="stat-label">⭐ Pontos</div>
            </div>
            <div className="stat-box">
              <div className="stat-value">{user?.classe ? `${calcularPct({}, user.classe)}%` : '—'}</div>
              <div className="stat-label">📚 Progresso</div>
            </div>
          </div>

          {/* Seções de config */}
          {secoes.map(sec => (
            <div key={sec.titulo}>
              <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, color: 'var(--texto-suave)', textTransform: 'uppercase', marginBottom: 6 }}>{sec.titulo}</p>
              <div className="card">
                {sec.itens.map((item, i) => (
                  <div key={i} className="list-row" style={{ cursor: item.acao ? 'pointer' : 'default' }} onClick={item.acao}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--texto)' }}>{item.label}</p>
                      {item.info && <p style={{ fontSize: 11, color: 'var(--texto-suave)', marginTop: 1 }}>{item.info}</p>}
                    </div>
                    {item.acao && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Sair */}
          <button className="btn btn-danger" onClick={logout} style={{ marginTop: 4 }}>
            Sair da conta
          </button>
        </div>
      </div>

      {modalEdit && <ModalEditarPerfil user={user} onClose={() => setModalEdit(false)} onSave={refreshUser} />}
    </div>
  )
}

function ModalEditarPerfil({ user, onClose, onSave }) {
  const [nome, setNome] = useState(user?.nome || '')
  const [unidade, setUnidade] = useState(user?.unidade || '')
  const [saving, setSaving] = useState(false)

  const salvar = async () => {
    setSaving(true)
    await supabase.from('perfis').update({ nome: nome.trim(), unidade: unidade.trim() || null }).eq('id', user.id)
    await onSave()
    setSaving(false)
    onClose()
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle-bar" />
        <div className="modal-header"><p className="modal-title">Editar informações</p></div>
        <div className="modal-body">
          <div className="field-wrap-light">
            <label className="field-label">Nome completo</label>
            <input className="input-light" value={nome} onChange={e => setNome(e.target.value)} />
          </div>
          <div className="field-wrap-light">
            <label className="field-label">Unidade</label>
            <input className="input-light" placeholder="Ex: Águia" value={unidade} onChange={e => setUnidade(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-outline-blue" onClick={onClose} style={{ minHeight: 48 }}>Cancelar</button>
            <button className="btn btn-blue" onClick={salvar} disabled={saving} style={{ flex: 1 }}>
              {saving ? 'Salvando...' : '💾 Salvar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

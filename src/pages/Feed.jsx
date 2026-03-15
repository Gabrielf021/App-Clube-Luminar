import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../lib/AuthContext'
import { supabase } from '../lib/supabase'
import { getAvatarUrl } from '../lib/classes'

const IC_HEART = (filled) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? '#ef4444' : 'none'} stroke={filled ? '#ef4444' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
)
const IC_COMMENT = (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
)
const IC_SEND = (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f5c000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
)
const IC_PLUS = (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f5c000" strokeWidth="2.5" strokeLinecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
)

function timeAgo(date) {
  const diff = (Date.now() - new Date(date)) / 1000
  if (diff < 60) return 'agora'
  if (diff < 3600) return `${Math.floor(diff/60)}min`
  if (diff < 86400) return `${Math.floor(diff/3600)}h`
  return `${Math.floor(diff/86400)}d`
}

function PostCard({ post, currentUser }) {
  const [curtido, setCurtido] = useState(false)
  const [nCurtidas, setNCurtidas] = useState(0)
  const [nComents, setNComents] = useState(0)
  const [showComents, setShowComents] = useState(false)
  const [comentarios, setComentarios] = useState([])
  const [novoComent, setNovoComent] = useState('')
  const [enviando, setEnviando] = useState(false)

  useEffect(() => {
    const load = async () => {
      const [{ count: nc }, { count: nco }, { data: myCurtida }] = await Promise.all([
        supabase.from('curtidas').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
        supabase.from('comentarios').select('id', { count: 'exact', head: true }).eq('post_id', post.id),
        supabase.from('curtidas').select('id').eq('post_id', post.id).eq('perfil_id', currentUser.id),
      ])
      setNCurtidas(nc || 0)
      setNComents(nco || 0)
      setCurtido(myCurtida?.length > 0)
    }
    load()
  }, [post.id, currentUser.id])

  const toggleCurtir = async () => {
    if (curtido) {
      await supabase.from('curtidas').delete().eq('post_id', post.id).eq('perfil_id', currentUser.id)
      setCurtido(false); setNCurtidas(n => Math.max(0, n-1))
    } else {
      await supabase.from('curtidas').insert({ post_id: post.id, perfil_id: currentUser.id })
      setCurtido(true); setNCurtidas(n => n+1)
    }
  }

  const abrirComentarios = async () => {
    setShowComents(v => !v)
    if (!showComents) {
      const { data } = await supabase.from('comentarios')
        .select('*, autor:autor_id(id,nome,foto_url)')
        .eq('post_id', post.id).order('criado_em')
      setComentarios(data || [])
    }
  }

  const enviarComentario = async () => {
    if (!novoComent.trim()) return
    setEnviando(true)
    await supabase.from('comentarios').insert({ post_id: post.id, autor_id: currentUser.id, texto: novoComent.trim() })
    setNovoComent('')
    setNComents(n => n+1)
    const { data } = await supabase.from('comentarios')
      .select('*, autor:autor_id(id,nome,foto_url)')
      .eq('post_id', post.id).order('criado_em')
    setComentarios(data || [])
    setEnviando(false)
  }

  const autor = post.autor || {}
  const avatar = getAvatarUrl(autor.nome)

  return (
    <div className="post-card fade-in">
      <div className="post-header">
        <div className="avatar-init" style={{ width:38, height:38, background:'#eef2ff', color:'var(--azul)', fontSize:13, flexShrink:0 }}>
          <img src={autor.foto_url || avatar} alt={autor.nome} onError={e => { e.target.style.display='none' }} />
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:13, fontWeight:700, color:'var(--texto)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{autor.nome || 'Membro'}</p>
          <p style={{ fontSize:11, color:'var(--texto-suave)' }}>{autor.classe || autor.tipo || ''}{autor.classe ? '' : ''} · {timeAgo(post.criado_em)}</p>
        </div>
        {post.tipo === 'checkin' && <span className="badge badge-ok">+20 pts</span>}
      </div>

      {/* Check-in card */}
      {post.tipo === 'checkin' && (
        <div className="checkin-card">
          <div className="checkin-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <div>
            <p style={{ fontSize:11, fontWeight:800, color:'#15803d' }}>Check-in confirmado!</p>
            <p style={{ fontSize:10, color:'#4ade80' }}>{post.conteudo}</p>
          </div>
        </div>
      )}

      {/* Conquista */}
      {post.tipo === 'conquista' && post.requisito_info && (
        <div className="conquista-card">
          <p style={{ fontSize:9, fontWeight:700, color:'var(--azul)', textTransform:'uppercase', letterSpacing:1, marginBottom:3 }}>Requisito concluído</p>
          <p style={{ fontSize:12, fontWeight:700, color:'#374151' }}>{post.requisito_info.requisito}</p>
          <p style={{ fontSize:10, color:'var(--texto-suave)', marginTop:2 }}>{post.requisito_info.classe} · {post.requisito_info.secao}</p>
          <div className="prog-bg" style={{ marginTop:8 }}>
            <div className="prog-fill" style={{ width:`${post.requisito_info.pct||0}%` }} />
          </div>
        </div>
      )}

      {/* Texto */}
      {post.conteudo && post.tipo !== 'checkin' && (
        <div className="post-body">{post.conteudo}</div>
      )}

      {/* Mídia */}
      {post.midia_url && post.midia_tipo === 'imagem' && (
        <img src={post.midia_url} alt="Post" className="post-media" />
      )}
      {post.midia_url && post.midia_tipo === 'video' && (
        <video src={post.midia_url} controls className="post-media" style={{ maxHeight:280 }} playsInline />
      )}

      {/* Versículo */}
      {post.tipo === 'versiculo' && (
        <div style={{ margin:'8px 14px 0', background:'#fffbeb', borderLeft:'3px solid var(--dourado)', borderRadius:'0 8px 8px 0', padding:'8px 12px' }}>
          {post.conteudo && <p style={{ fontSize:12, color:'#78350f', fontStyle:'italic', lineHeight:1.6 }}>"{post.conteudo}"</p>}
          {post.versiculo_ref && <p style={{ fontSize:10, color:'var(--dourado)', fontWeight:700, marginTop:4 }}>{post.versiculo_ref}</p>}
        </div>
      )}

      {/* Ações */}
      <div className="post-actions">
        <button className={`post-action-btn ${curtido?'liked':''}`} onClick={toggleCurtir}>
          {IC_HEART(curtido)}
          <span style={{ color: curtido?'#ef4444':'#9ca3af' }}>{nCurtidas}</span>
        </button>
        <button className="post-action-btn" onClick={abrirComentarios}>
          {IC_COMMENT}
          <span>{nComents}</span>
        </button>
      </div>

      {/* Comentários */}
      {showComents && (
        <div style={{ borderTop:'1px solid #f3f4f6', padding:'10px 14px' }}>
          {comentarios.map(c => (
            <div key={c.id} style={{ display:'flex', gap:8, marginBottom:8, alignItems:'flex-start' }}>
              <div className="avatar-init" style={{ width:26, height:26, background:'#eef2ff', color:'var(--azul)', fontSize:10, flexShrink:0 }}>
                <img src={c.autor?.foto_url || getAvatarUrl(c.autor?.nome)} alt="" onError={e => { e.target.style.display='none' }} />
              </div>
              <div style={{ background:'#f5f5f5', borderRadius:'0 10px 10px 10px', padding:'7px 10px', flex:1 }}>
                <p style={{ fontSize:10, fontWeight:700, color:'var(--texto)', marginBottom:2 }}>{c.autor?.nome}</p>
                <p style={{ fontSize:12, color:'#444', lineHeight:1.5 }}>{c.texto}</p>
              </div>
            </div>
          ))}
          <div style={{ display:'flex', gap:8, alignItems:'center', background:'#f5f5f5', borderRadius:99, padding:'5px 5px 5px 12px', marginTop:4 }}>
            <input value={novoComent} onChange={e => setNovoComent(e.target.value)}
              placeholder="Comentar..."
              style={{ flex:1, border:'none', outline:'none', background:'transparent', fontFamily:'Plus Jakarta Sans', fontSize:14, color:'var(--texto)', minWidth:0 }}
              onKeyDown={e => e.key==='Enter' && enviarComentario()} />
            <button onClick={enviarComentario} disabled={enviando||!novoComent.trim()}
              style={{ width:30, height:30, background:'var(--azul)', borderRadius:'50%', border:'none', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, opacity: novoComent.trim()?1:0.4 }}>
              {IC_SEND}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ModalNovaPublicacao({ onClose, onPost, currentUser }) {
  const [tipo, setTipo] = useState('texto')
  const [texto, setTexto] = useState('')
  const [versiculo, setVersiculo] = useState('')
  const [midia, setMidia] = useState(null)
  const [midiaPreview, setMidiaPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const fileRefCamera = useRef()
  const fileRefGaleria = useRef()

  const selecionarMidia = (e) => {
    const file = e.target.files[0]
    if (!file) return
    setMidia(file)
    setMidiaPreview(URL.createObjectURL(file))
    setTipo(file.type.startsWith('video') ? 'video' : 'foto')
  }

  const publicar = async () => {
    if (!texto.trim() && !midia && tipo !== 'versiculo') { setErro('Escreva algo para publicar.'); return }
    if (tipo === 'versiculo' && !texto.trim()) { setErro('Escreva o texto do versículo.'); return }
    setLoading(true); setErro('')

    let midia_url = null, midia_tipo = null
    if (midia) {
      const ext = midia.name.split('.').pop()
      const path = `${currentUser.id}/${Date.now()}.${ext}`
      const { data: upData, error: upErr } = await supabase.storage
        .from('posts-midia').upload(path, midia, { upsert: true })
      if (!upErr && upData) {
        const { data: urlData } = supabase.storage.from('posts-midia').getPublicUrl(path)
        midia_url = urlData.publicUrl
        midia_tipo = midia.type.startsWith('video') ? 'video' : 'imagem'
      }
    }

    const { error } = await supabase.from('posts').insert({
      autor_id: currentUser.id,
      tipo,
      conteudo: texto.trim() || null,
      midia_url, midia_tipo,
      versiculo_ref: tipo === 'versiculo' ? versiculo.trim() || null : null,
    })

    setLoading(false)
    if (error) { setErro('Erro ao publicar. Tente novamente.'); return }
    onPost()
    onClose()
  }

  const tipos = [
    { id:'texto',     label:'✍️ Texto' },
    { id:'versiculo', label:'📖 Versículo' },
  ]

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={e => e.stopPropagation()}>
        <div className="modal-handle-bar" />
        <div className="modal-header"><p className="modal-title">Nova publicação</p></div>
        <div className="modal-body">

          {/* Tipo de post */}
          <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
            {tipos.map(t => (
              <button key={t.id} onClick={() => setTipo(t.id)}
                style={{ background: tipo===t.id?'var(--azul)':'#f3f4f6', color: tipo===t.id?'#fff':'var(--texto)', border:'none', borderRadius:99, padding:'6px 14px', fontSize:12, fontWeight:700, cursor:'pointer', fontFamily:'Plus Jakarta Sans' }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Mídia — câmera e galeria separados */}
          <div style={{ display:'flex', gap:8, marginBottom:14 }}>
            <button onClick={() => fileRefCamera.current?.click()}
              style={{ flex:1, background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:'var(--radius-sm)', padding:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:6, cursor:'pointer', fontSize:12, fontWeight:700, color:'var(--azul)', fontFamily:'Plus Jakarta Sans' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Câmera
            </button>
            <button onClick={() => fileRefGaleria.current?.click()}
              style={{ flex:1, background:'#eef2ff', border:'1px solid #c7d2fe', borderRadius:'var(--radius-sm)', padding:'10px', display:'flex', alignItems:'center', justifyContent:'center', gap:6, cursor:'pointer', fontSize:12, fontWeight:700, color:'var(--azul)', fontFamily:'Plus Jakarta Sans' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              Galeria
            </button>
          </div>

          {/* Input câmera — captura direto */}
          <input ref={fileRefCamera} type="file" accept="image/*,video/*" capture="environment" style={{ display:'none' }} onChange={selecionarMidia} />
          {/* Input galeria — sem capture */}
          <input ref={fileRefGaleria} type="file" accept="image/*,video/*" style={{ display:'none' }} onChange={selecionarMidia} />

          {/* Preview mídia */}
          {midiaPreview && (
            <div style={{ marginBottom:12, position:'relative' }}>
              {midia?.type.startsWith('video')
                ? <video src={midiaPreview} controls style={{ width:'100%', borderRadius:12, maxHeight:200 }} />
                : <img src={midiaPreview} alt="" style={{ width:'100%', borderRadius:12, maxHeight:200, objectFit:'cover' }} />
              }
              <button onClick={() => { setMidia(null); setMidiaPreview(null); setTipo('texto') }}
                style={{ position:'absolute', top:8, right:8, background:'rgba(0,0,0,0.6)', border:'none', borderRadius:'50%', width:26, height:26, color:'#fff', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14 }}>✕</button>
            </div>
          )}

          {/* Referência versículo */}
          {tipo === 'versiculo' && (
            <div className="field-wrap-light">
              <label className="field-label">Referência (ex: João 3:16)</label>
              <input className="input-light" placeholder="Livro capítulo:versículo" value={versiculo} onChange={e => setVersiculo(e.target.value)} />
            </div>
          )}

          {/* Texto */}
          <div className="field-wrap-light">
            <label className="field-label">{tipo==='versiculo' ? 'Texto do versículo' : 'O que quer compartilhar?'}</label>
            <textarea className="input-light" rows={3}
              placeholder={tipo==='versiculo' ? 'Cole o versículo aqui...' : 'Escreva algo...'}
              value={texto} onChange={e => setTexto(e.target.value)}
              style={{ resize:'none', minHeight:80 }} />
          </div>

          {erro && <div className="error-msg" style={{ marginBottom:12 }}>{erro}</div>}

          <button className="btn btn-blue" onClick={publicar} disabled={loading}>
            {loading ? 'Publicando...' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [totalMembros, setTotalMembros] = useState(0)

  const carregar = useCallback(async () => {
    setLoading(true)
    try {
      // Busca posts
      const { data: postsData, error } = await supabase
        .from('posts')
        .select('id, tipo, conteudo, midia_url, midia_tipo, versiculo_ref, requisito_info, criado_em, autor_id')
        .order('criado_em', { ascending: false })
        .limit(50)

      if (error) { console.error('Feed error:', error); setLoading(false); return }

      // Busca autores separadamente
      const autorIds = [...new Set((postsData || []).map(p => p.autor_id).filter(Boolean))]
      let autoresMap = {}
      if (autorIds.length > 0) {
        const { data: autoresData } = await supabase
          .from('perfis')
          .select('id, nome, foto_url, classe, tipo, avatar_seed')
          .in('id', autorIds)
        autoresData?.forEach(a => { autoresMap[a.id] = a })
      }

      // Combina posts com autores
      const postsComAutor = (postsData || []).map(p => ({
        ...p,
        autor: autoresMap[p.autor_id] || { nome: 'Membro', tipo: 'desbravador' }
      }))

      setPosts(postsComAutor)

      const { count } = await supabase.from('perfis').select('id', { count: 'exact', head: true })
      setTotalMembros(count || 0)
    } catch (e) {
      console.error('Feed catch error:', e)
    }
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  const avatar = getAvatarUrl(user?.nome, user?.avatar_seed)

  return (
    <div className="app-shell">
      <div className="scroll-area fade-in">
        {/* Header */}
        <div className="profile-header" style={{ paddingBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div>
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.45)', marginBottom:2 }}>Bem-vindo!</p>
              <p className="profile-nome">{user?.nome?.split(' ')[0]}</p>
            </div>
            <div style={{ position:'relative' }}>
              <div className="profile-avatar" style={{ width:44, height:44 }}>
                <img src={user?.foto_url || avatar} alt={user?.nome} onError={e => { e.target.style.display='none' }} />
              </div>
              <div style={{ position:'absolute', bottom:-2, right:-2, width:18, height:18, background:'#fff', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', border:'1.5px solid #eee' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--azul)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
            </div>
          </div>
          <div className="header-stats">
            <div className="header-stat"><div className="header-stat-value">{totalMembros}</div><div className="header-stat-label">Membros</div></div>
            <div className="header-stat"><div className="header-stat-value">{user?.pontos??0}</div><div className="header-stat-label">Seus pts</div></div>
            <div className="header-stat"><div className="header-stat-value">{posts.length}</div><div className="header-stat-label">Posts</div></div>
          </div>
        </div>

        <div style={{ padding:'14px 16px' }}>
          {loading ? (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div className="spinner" style={{ margin:'0 auto', borderTopColor:'var(--azul)' }} />
              <p style={{ fontSize:12, color:'var(--texto-suave)', marginTop:12 }}>Carregando feed...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize:40, marginBottom:8 }}>✨</div>
              <p style={{ fontWeight:600 }}>Nenhuma publicação ainda.</p>
              <p style={{ fontSize:12, marginTop:4, color:'var(--texto-suave)' }}>Seja o primeiro a compartilhar!</p>
            </div>
          ) : (
            posts.map(p => <PostCard key={p.id} post={p} currentUser={user} />)
          )}
        </div>
      </div>

      {/* FAB */}
      <button className="fab" onClick={() => setShowModal(true)}>{IC_PLUS}</button>

      {showModal && (
        <ModalNovaPublicacao currentUser={user} onClose={() => setShowModal(false)} onPost={carregar} />
      )}
    </div>
  )
}

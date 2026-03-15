import { useState, useEffect, useRef } from 'react'

const LIVROS = [
  { nome:'Gênesis',           abrev:'gn',  abrevEn:'genesis',           caps:50,  grupo:'AT' },
  { nome:'Êxodo',             abrev:'ex',  abrevEn:'exodus',             caps:40,  grupo:'AT' },
  { nome:'Levítico',          abrev:'lv',  abrevEn:'leviticus',          caps:27,  grupo:'AT' },
  { nome:'Números',           abrev:'nm',  abrevEn:'numbers',            caps:36,  grupo:'AT' },
  { nome:'Deuteronômio',      abrev:'dt',  abrevEn:'deuteronomy',        caps:34,  grupo:'AT' },
  { nome:'Josué',             abrev:'js',  abrevEn:'joshua',             caps:24,  grupo:'AT' },
  { nome:'Juízes',            abrev:'jz',  abrevEn:'judges',             caps:21,  grupo:'AT' },
  { nome:'Rute',              abrev:'rt',  abrevEn:'ruth',               caps:4,   grupo:'AT' },
  { nome:'1 Samuel',          abrev:'1sm', abrevEn:'1+samuel',           caps:31,  grupo:'AT' },
  { nome:'2 Samuel',          abrev:'2sm', abrevEn:'2+samuel',           caps:24,  grupo:'AT' },
  { nome:'1 Reis',            abrev:'1rs', abrevEn:'1+kings',            caps:22,  grupo:'AT' },
  { nome:'2 Reis',            abrev:'2rs', abrevEn:'2+kings',            caps:25,  grupo:'AT' },
  { nome:'1 Crônicas',        abrev:'1cr', abrevEn:'1+chronicles',       caps:29,  grupo:'AT' },
  { nome:'2 Crônicas',        abrev:'2cr', abrevEn:'2+chronicles',       caps:36,  grupo:'AT' },
  { nome:'Esdras',            abrev:'ed',  abrevEn:'ezra',               caps:10,  grupo:'AT' },
  { nome:'Neemias',           abrev:'ne',  abrevEn:'nehemiah',           caps:13,  grupo:'AT' },
  { nome:'Ester',             abrev:'et',  abrevEn:'esther',             caps:10,  grupo:'AT' },
  { nome:'Jó',                abrev:'jo',  abrevEn:'job',                caps:42,  grupo:'AT' },
  { nome:'Salmos',            abrev:'sl',  abrevEn:'psalms',             caps:150, grupo:'AT' },
  { nome:'Provérbios',        abrev:'pv',  abrevEn:'proverbs',           caps:31,  grupo:'AT' },
  { nome:'Eclesiastes',       abrev:'ec',  abrevEn:'ecclesiastes',       caps:12,  grupo:'AT' },
  { nome:'Cantares',          abrev:'ct',  abrevEn:'song+of+solomon',    caps:8,   grupo:'AT' },
  { nome:'Isaías',            abrev:'is',  abrevEn:'isaiah',             caps:66,  grupo:'AT' },
  { nome:'Jeremias',          abrev:'jr',  abrevEn:'jeremiah',           caps:52,  grupo:'AT' },
  { nome:'Lamentações',       abrev:'lm',  abrevEn:'lamentations',       caps:5,   grupo:'AT' },
  { nome:'Ezequiel',          abrev:'ez',  abrevEn:'ezekiel',            caps:48,  grupo:'AT' },
  { nome:'Daniel',            abrev:'dn',  abrevEn:'daniel',             caps:12,  grupo:'AT' },
  { nome:'Oséias',            abrev:'os',  abrevEn:'hosea',              caps:14,  grupo:'AT' },
  { nome:'Joel',              abrev:'jl',  abrevEn:'joel',               caps:3,   grupo:'AT' },
  { nome:'Amós',              abrev:'am',  abrevEn:'amos',               caps:9,   grupo:'AT' },
  { nome:'Obadias',           abrev:'ob',  abrevEn:'obadiah',            caps:1,   grupo:'AT' },
  { nome:'Jonas',             abrev:'jn',  abrevEn:'jonah',              caps:4,   grupo:'AT' },
  { nome:'Miquéias',          abrev:'mq',  abrevEn:'micah',              caps:7,   grupo:'AT' },
  { nome:'Naum',              abrev:'na',  abrevEn:'nahum',              caps:3,   grupo:'AT' },
  { nome:'Habacuque',         abrev:'hc',  abrevEn:'habakkuk',           caps:3,   grupo:'AT' },
  { nome:'Sofonias',          abrev:'sf',  abrevEn:'zephaniah',          caps:3,   grupo:'AT' },
  { nome:'Ageu',              abrev:'ag',  abrevEn:'haggai',             caps:2,   grupo:'AT' },
  { nome:'Zacarias',          abrev:'zc',  abrevEn:'zechariah',          caps:14,  grupo:'AT' },
  { nome:'Malaquias',         abrev:'ml',  abrevEn:'malachi',            caps:4,   grupo:'AT' },
  { nome:'Mateus',            abrev:'mt',  abrevEn:'matthew',            caps:28,  grupo:'NT' },
  { nome:'Marcos',            abrev:'mc',  abrevEn:'mark',               caps:16,  grupo:'NT' },
  { nome:'Lucas',             abrev:'lc',  abrevEn:'luke',               caps:24,  grupo:'NT' },
  { nome:'João',              abrev:'jo2', abrevEn:'john',               caps:21,  grupo:'NT' },
  { nome:'Atos',              abrev:'at',  abrevEn:'acts',               caps:28,  grupo:'NT' },
  { nome:'Romanos',           abrev:'rm',  abrevEn:'romans',             caps:16,  grupo:'NT' },
  { nome:'1 Coríntios',       abrev:'1co', abrevEn:'1+corinthians',      caps:16,  grupo:'NT' },
  { nome:'2 Coríntios',       abrev:'2co', abrevEn:'2+corinthians',      caps:13,  grupo:'NT' },
  { nome:'Gálatas',           abrev:'gl',  abrevEn:'galatians',          caps:6,   grupo:'NT' },
  { nome:'Efésios',           abrev:'ef',  abrevEn:'ephesians',          caps:6,   grupo:'NT' },
  { nome:'Filipenses',        abrev:'fp',  abrevEn:'philippians',        caps:4,   grupo:'NT' },
  { nome:'Colossenses',       abrev:'cl',  abrevEn:'colossians',         caps:4,   grupo:'NT' },
  { nome:'1 Tessalonicenses', abrev:'1ts', abrevEn:'1+thessalonians',    caps:5,   grupo:'NT' },
  { nome:'2 Tessalonicenses', abrev:'2ts', abrevEn:'2+thessalonians',    caps:3,   grupo:'NT' },
  { nome:'1 Timóteo',         abrev:'1tm', abrevEn:'1+timothy',          caps:6,   grupo:'NT' },
  { nome:'2 Timóteo',         abrev:'2tm', abrevEn:'2+timothy',          caps:4,   grupo:'NT' },
  { nome:'Tito',              abrev:'tt',  abrevEn:'titus',              caps:3,   grupo:'NT' },
  { nome:'Filemom',           abrev:'fm',  abrevEn:'philemon',           caps:1,   grupo:'NT' },
  { nome:'Hebreus',           abrev:'hb',  abrevEn:'hebrews',            caps:13,  grupo:'NT' },
  { nome:'Tiago',             abrev:'tg',  abrevEn:'james',              caps:5,   grupo:'NT' },
  { nome:'1 Pedro',           abrev:'1pe', abrevEn:'1+peter',            caps:5,   grupo:'NT' },
  { nome:'2 Pedro',           abrev:'2pe', abrevEn:'2+peter',            caps:3,   grupo:'NT' },
  { nome:'1 João',            abrev:'1jo', abrevEn:'1+john',             caps:5,   grupo:'NT' },
  { nome:'2 João',            abrev:'2jo', abrevEn:'2+john',             caps:1,   grupo:'NT' },
  { nome:'3 João',            abrev:'3jo', abrevEn:'3+john',             caps:1,   grupo:'NT' },
  { nome:'Judas',             abrev:'jd',  abrevEn:'jude',               caps:1,   grupo:'NT' },
  { nome:'Apocalipse',        abrev:'ap',  abrevEn:'revelation',         caps:22,  grupo:'NT' },
]

// Busca versículos com múltiplos fallbacks
async function fetchVersiculos(livro, cap) {
  // Tentativa 1: bible-api.com com almeida (funciona no browser sem CORS)
  try {
    const url = `https://bible-api.com/${livro.abrevEn}+${cap}?translation=almeida`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      if (data.verses && data.verses.length > 0) {
        return data.verses.map(v => ({ number: v.verse, text: v.text.trim() }))
      }
    }
  } catch {}

  // Tentativa 2: bible-api.com com tradução padrão
  try {
    const url = `https://bible-api.com/${livro.abrevEn}+${cap}`
    const res = await fetch(url)
    if (res.ok) {
      const data = await res.json()
      if (data.verses && data.verses.length > 0) {
        return data.verses.map(v => ({ number: v.verse, text: v.text.trim() }))
      }
    }
  } catch {}

  // Tentativa 3: ABB sem token
  try {
    const abrev = livro.abrev === 'jo2' ? 'jo' : livro.abrev
    const url = `https://www.abibliadigital.com.br/api/verses/nvi/${abrev}/${cap}`
    const res = await fetch(url, { headers: { 'Content-Type': 'application/json' } })
    if (res.ok) {
      const data = await res.json()
      if (data.verses && data.verses.length > 0) {
        return data.verses.map(v => ({ number: v.number, text: v.text }))
      }
    }
  } catch {}

  throw new Error('Não foi possível carregar este capítulo.')
}

export default function Biblia() {
  const [livroIdx, setLivroIdx] = useState(42) // João
  const [cap, setCap] = useState(1)
  const [versiculos, setVersiculos] = useState([])
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [showLivros, setShowLivros] = useState(false)
  const [busca, setBusca] = useState('')
  const scrollRef = useRef(null)

  const livro = LIVROS[livroIdx]

  useEffect(() => { buscarCap() }, [livroIdx, cap])

  const buscarCap = async () => {
    setLoading(true); setErro(''); setVersiculos([])
    try {
      const vers = await fetchVersiculos(livro, cap)
      setVersiculos(vers)
    } catch (e) {
      setErro(e.message)
    }
    setLoading(false)
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const irCap = (n) => setCap(Math.max(1, Math.min(livro.caps, n)))
  const irLivro = (idx) => { setLivroIdx(idx); setCap(1); setShowLivros(false); setBusca('') }

  const atFilt = LIVROS.filter((l,i) => l.grupo==='AT' && l.nome.toLowerCase().includes(busca.toLowerCase()))
  const ntFilt = LIVROS.filter((l,i) => l.grupo==='NT' && l.nome.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div className="app-shell">
      <div className="scroll-area fade-in" ref={scrollRef}>
        {/* Header */}
        <div className="page-header">
          <p className="page-header-eyebrow">📖 Palavra de Deus</p>
          <p className="page-header-title">Bíblia Sagrada</p>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={() => setShowLivros(true)} style={{
              flex:1, background:'rgba(255,255,255,0.12)', border:'none',
              borderRadius:'var(--radius-sm)', padding:'10px 12px',
              display:'flex', justifyContent:'space-between', alignItems:'center',
              cursor:'pointer', color:'var(--dourado)',
              fontFamily:'Plus Jakarta Sans', fontWeight:700, fontSize:14,
            }}>
              <span>{livro.nome}</span>
              <span style={{ color:'rgba(255,255,255,0.4)', fontSize:10 }}>▾</span>
            </button>
            <div style={{ display:'flex', alignItems:'center', background:'rgba(255,255,255,0.12)', borderRadius:'var(--radius-sm)', overflow:'hidden' }}>
              <button onClick={() => irCap(cap-1)} disabled={cap<=1} style={{ width:40, height:42, border:'none', background:'transparent', color: cap<=1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', fontSize:20, cursor: cap<=1 ? 'default':'pointer', fontFamily:'Plus Jakarta Sans' }}>‹</button>
              <span style={{ minWidth:32, textAlign:'center', fontSize:14, fontWeight:800, color:'var(--dourado)' }}>{cap}</span>
              <button onClick={() => irCap(cap+1)} disabled={cap>=livro.caps} style={{ width:40, height:42, border:'none', background:'transparent', color: cap>=livro.caps ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.7)', fontSize:20, cursor: cap>=livro.caps ? 'default':'pointer', fontFamily:'Plus Jakarta Sans' }}>›</button>
            </div>
          </div>
        </div>

        <div className="page-body">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <p style={{ fontSize:17, fontWeight:700, color:'var(--azul)' }}>{livro.nome} {cap}</p>
            <p style={{ fontSize:11, color:'var(--texto-suave)', fontWeight:600 }}>Almeida · NVI</p>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign:'center', padding:'48px 0' }}>
              <div className="spinner" style={{ margin:'0 auto', borderTopColor:'var(--azul)' }} />
              <p style={{ fontSize:12, color:'var(--texto-suave)', marginTop:12 }}>Carregando {livro.nome} {cap}...</p>
            </div>
          )}

          {/* Erro */}
          {!loading && erro && (
            <div>
              <div className="error-msg" style={{ marginBottom:12 }}>⚠️ {erro}</div>
              <button className="btn btn-blue" onClick={buscarCap} style={{ minHeight:44 }}>
                🔄 Tentar novamente
              </button>
            </div>
          )}

          {/* Versículos */}
          {!loading && !erro && versiculos.map((v, i) => (
            <div key={v.number} className={`verse-row ${i > 0 ? 'regular' : ''}`}>
              <p className={`verse-num ${i > 0 ? 'regular' : ''}`}>{v.number}</p>
              <p className="verse-text">{v.text}</p>
            </div>
          ))}

          {/* Navegação entre capítulos */}
          {!loading && versiculos.length > 0 && (
            <div style={{ display:'flex', gap:8, marginTop:4 }}>
              <button className="btn btn-outline-blue" onClick={() => irCap(cap-1)} disabled={cap<=1} style={{ minHeight:48, fontSize:14 }}>
                ← Anterior
              </button>
              <button className="btn btn-blue" onClick={() => irCap(cap+1)} disabled={cap>=livro.caps} style={{ minHeight:48, fontSize:14 }}>
                Próximo →
              </button>
            </div>
          )}

          {/* Info sobre capítulo */}
          {!loading && versiculos.length > 0 && (
            <p style={{ fontSize:11, color:'var(--texto-suave)', textAlign:'center' }}>
              Capítulo {cap} de {livro.caps} · {versiculos.length} versículos
            </p>
          )}
        </div>
      </div>

      {/* Modal seleção de livro */}
      {showLivros && (
        <div className="modal-backdrop" onClick={() => setShowLivros(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle-bar" />
            <div className="modal-header">
              <p className="modal-title">Escolher Livro</p>
              <div className="search-bar" style={{ marginTop:10 }}>
                <span style={{ color:'var(--texto-suave)', fontSize:16 }}>🔍</span>
                <input
                  placeholder="Buscar livro..."
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  autoFocus
                  style={{ fontSize:16 }}
                />
              </div>
            </div>
            <div className="modal-body" style={{ paddingTop:12 }}>
              {atFilt.length > 0 && (
                <>
                  <p style={{ fontSize:10, fontWeight:700, letterSpacing:1, color:'var(--texto-suave)', textTransform:'uppercase', marginBottom:8 }}>
                    Antigo Testamento
                  </p>
                  {atFilt.map(l => {
                    const idx = LIVROS.indexOf(l)
                    const ativo = idx === livroIdx
                    return (
                      <button key={l.abrev} onClick={() => irLivro(idx)} style={{
                        display:'block', width:'100%', padding:'12px 14px', marginBottom:4,
                        background: ativo ? '#eef2ff' : '#fafafa',
                        border: `1px solid ${ativo ? 'var(--azul)' : 'var(--borda)'}`,
                        borderRadius:'var(--radius-sm)',
                        color: ativo ? 'var(--azul)' : 'var(--texto)',
                        fontFamily:'Plus Jakarta Sans', fontSize:14,
                        fontWeight: ativo ? 700 : 500,
                        cursor:'pointer', textAlign:'left',
                      }}>
                        {ativo && <span style={{ marginRight:8 }}>✓</span>}{l.nome}
                      </button>
                    )
                  })}
                </>
              )}
              {ntFilt.length > 0 && (
                <>
                  <p style={{ fontSize:10, fontWeight:700, letterSpacing:1, color:'var(--texto-suave)', textTransform:'uppercase', margin:'16px 0 8px' }}>
                    Novo Testamento
                  </p>
                  {ntFilt.map(l => {
                    const idx = LIVROS.indexOf(l)
                    const ativo = idx === livroIdx
                    return (
                      <button key={l.abrev} onClick={() => irLivro(idx)} style={{
                        display:'block', width:'100%', padding:'12px 14px', marginBottom:4,
                        background: ativo ? '#eef2ff' : '#fafafa',
                        border: `1px solid ${ativo ? 'var(--azul)' : 'var(--borda)'}`,
                        borderRadius:'var(--radius-sm)',
                        color: ativo ? 'var(--azul)' : 'var(--texto)',
                        fontFamily:'Plus Jakarta Sans', fontSize:14,
                        fontWeight: ativo ? 700 : 500,
                        cursor:'pointer', textAlign:'left',
                      }}>
                        {ativo && <span style={{ marginRight:8 }}>✓</span>}{l.nome}
                      </button>
                    )
                  })}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

import { useState, useEffect, useRef } from 'react'

const LIVROS = [
  { nome:'Gênesis', abrev:'gn', caps:50, grupo:'AT' },
  { nome:'Êxodo', abrev:'ex', caps:40, grupo:'AT' },
  { nome:'Levítico', abrev:'lv', caps:27, grupo:'AT' },
  { nome:'Números', abrev:'nm', caps:36, grupo:'AT' },
  { nome:'Deuteronômio', abrev:'dt', caps:34, grupo:'AT' },
  { nome:'Josué', abrev:'js', caps:24, grupo:'AT' },
  { nome:'Juízes', abrev:'jz', caps:21, grupo:'AT' },
  { nome:'Rute', abrev:'rt', caps:4, grupo:'AT' },
  { nome:'1 Samuel', abrev:'1sm', caps:31, grupo:'AT' },
  { nome:'2 Samuel', abrev:'2sm', caps:24, grupo:'AT' },
  { nome:'1 Reis', abrev:'1rs', caps:22, grupo:'AT' },
  { nome:'2 Reis', abrev:'2rs', caps:25, grupo:'AT' },
  { nome:'1 Crônicas', abrev:'1cr', caps:29, grupo:'AT' },
  { nome:'2 Crônicas', abrev:'2cr', caps:36, grupo:'AT' },
  { nome:'Esdras', abrev:'ed', caps:10, grupo:'AT' },
  { nome:'Neemias', abrev:'ne', caps:13, grupo:'AT' },
  { nome:'Ester', abrev:'et', caps:10, grupo:'AT' },
  { nome:'Jó', abrev:'jo', caps:42, grupo:'AT' },
  { nome:'Salmos', abrev:'sl', caps:150, grupo:'AT' },
  { nome:'Provérbios', abrev:'pv', caps:31, grupo:'AT' },
  { nome:'Eclesiastes', abrev:'ec', caps:12, grupo:'AT' },
  { nome:'Cantares', abrev:'ct', caps:8, grupo:'AT' },
  { nome:'Isaías', abrev:'is', caps:66, grupo:'AT' },
  { nome:'Jeremias', abrev:'jr', caps:52, grupo:'AT' },
  { nome:'Lamentações', abrev:'lm', caps:5, grupo:'AT' },
  { nome:'Ezequiel', abrev:'ez', caps:48, grupo:'AT' },
  { nome:'Daniel', abrev:'dn', caps:12, grupo:'AT' },
  { nome:'Oséias', abrev:'os', caps:14, grupo:'AT' },
  { nome:'Joel', abrev:'jl', caps:3, grupo:'AT' },
  { nome:'Amós', abrev:'am', caps:9, grupo:'AT' },
  { nome:'Obadias', abrev:'ob', caps:1, grupo:'AT' },
  { nome:'Jonas', abrev:'jn', caps:4, grupo:'AT' },
  { nome:'Miquéias', abrev:'mq', caps:7, grupo:'AT' },
  { nome:'Naum', abrev:'na', caps:3, grupo:'AT' },
  { nome:'Habacuque', abrev:'hb', caps:3, grupo:'AT' },
  { nome:'Sofonias', abrev:'sf', caps:3, grupo:'AT' },
  { nome:'Ageu', abrev:'ag', caps:2, grupo:'AT' },
  { nome:'Zacarias', abrev:'zc', caps:14, grupo:'AT' },
  { nome:'Malaquias', abrev:'ml', caps:4, grupo:'AT' },
  { nome:'Mateus', abrev:'mt', caps:28, grupo:'NT' },
  { nome:'Marcos', abrev:'mc', caps:16, grupo:'NT' },
  { nome:'Lucas', abrev:'lc', caps:24, grupo:'NT' },
  { nome:'João', abrev:'jo', caps:21, grupo:'NT' },
  { nome:'Atos', abrev:'at', caps:28, grupo:'NT' },
  { nome:'Romanos', abrev:'rm', caps:16, grupo:'NT' },
  { nome:'1 Coríntios', abrev:'1co', caps:16, grupo:'NT' },
  { nome:'2 Coríntios', abrev:'2co', caps:13, grupo:'NT' },
  { nome:'Gálatas', abrev:'gl', caps:6, grupo:'NT' },
  { nome:'Efésios', abrev:'ef', caps:6, grupo:'NT' },
  { nome:'Filipenses', abrev:'fp', caps:4, grupo:'NT' },
  { nome:'Colossenses', abrev:'cl', caps:4, grupo:'NT' },
  { nome:'1 Tessalonicenses', abrev:'1ts', caps:5, grupo:'NT' },
  { nome:'2 Tessalonicenses', abrev:'2ts', caps:3, grupo:'NT' },
  { nome:'1 Timóteo', abrev:'1tm', caps:6, grupo:'NT' },
  { nome:'2 Timóteo', abrev:'2tm', caps:4, grupo:'NT' },
  { nome:'Tito', abrev:'tt', caps:3, grupo:'NT' },
  { nome:'Filemom', abrev:'fm', caps:1, grupo:'NT' },
  { nome:'Hebreus', abrev:'hb', caps:13, grupo:'NT' },
  { nome:'Tiago', abrev:'tg', caps:5, grupo:'NT' },
  { nome:'1 Pedro', abrev:'1pe', caps:5, grupo:'NT' },
  { nome:'2 Pedro', abrev:'2pe', caps:3, grupo:'NT' },
  { nome:'1 João', abrev:'1jo', caps:5, grupo:'NT' },
  { nome:'2 João', abrev:'2jo', caps:1, grupo:'NT' },
  { nome:'3 João', abrev:'3jo', caps:1, grupo:'NT' },
  { nome:'Judas', abrev:'jd', caps:1, grupo:'NT' },
  { nome:'Apocalipse', abrev:'ap', caps:22, grupo:'NT' },
]

export default function Biblia() {
  const [livroIdx, setLivroIdx] = useState(43) // João
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
      const res = await fetch(
        `https://www.abibliadigital.com.br/api/verses/nvi/${livro.abrev}/${cap}`,
        { headers: { 'Content-Type': 'application/json' } }
      )
      if (!res.ok) throw new Error()
      const data = await res.json()
      setVersiculos(data.verses || [])
    } catch {
      // Fallback: bible-api.com
      try {
        const abrevMap = { jo:'John', mt:'Matthew', mc:'Mark', lc:'Luke', at:'Acts', rm:'Romans', gn:'Genesis', ex:'Exodus', sl:'Psalms', pv:'Proverbs', ap:'Revelation' }
        const eng = abrevMap[livro.abrev]
        if (!eng) throw new Error()
        const res = await fetch(`https://bible-api.com/${eng}+${cap}?translation=almeida`)
        if (!res.ok) throw new Error()
        const data = await res.json()
        setVersiculos((data.verses||[]).map(v => ({ number: v.verse, text: v.text })))
      } catch {
        setErro('Não foi possível carregar. Verifique sua conexão.')
      }
    }
    setLoading(false)
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const livrosFiltrados = LIVROS.filter(l => l.nome.toLowerCase().includes(busca.toLowerCase()))
  const atFilt = livrosFiltrados.filter(l => l.grupo === 'AT')
  const ntFilt  = livrosFiltrados.filter(l => l.grupo === 'NT')

  const irCap = (n) => { const c = Math.max(1, Math.min(livro.caps, n)); setCap(c) }
  const irLivro = (idx) => { setLivroIdx(idx); setCap(1); setShowLivros(false); setBusca('') }

  return (
    <div className="app-shell">
      <div className="scroll-area fade-in" ref={scrollRef}>
        {/* Header */}
        <div className="page-header">
          <p className="page-header-eyebrow">📖 Palavra de Deus</p>
          <p className="page-header-title">Bíblia Sagrada</p>
          {/* Controles */}
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={() => setShowLivros(true)} style={{
              flex:1, background:'rgba(255,255,255,0.12)', border:'none', borderRadius:'var(--radius-sm)',
              padding:'9px 12px', display:'flex', justifyContent:'space-between', alignItems:'center',
              cursor:'pointer', color:'var(--dourado)', fontFamily:'Plus Jakarta Sans', fontWeight:700, fontSize:13,
            }}>
              <span>{livro.nome}</span>
              <span style={{ color:'rgba(255,255,255,0.4)', fontSize:10 }}>▾</span>
            </button>
            <div style={{ display:'flex', alignItems:'center', gap:0, background:'rgba(255,255,255,0.12)', borderRadius:'var(--radius-sm)', overflow:'hidden' }}>
              <button onClick={() => irCap(cap-1)} disabled={cap<=1} style={{ width:36, height:38, border:'none', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:18, cursor:'pointer', fontFamily:'Plus Jakarta Sans' }}>‹</button>
              <span style={{ minWidth:28, textAlign:'center', fontSize:13, fontWeight:700, color:'var(--dourado)' }}>{cap}</span>
              <button onClick={() => irCap(cap+1)} disabled={cap>=livro.caps} style={{ width:36, height:38, border:'none', background:'transparent', color:'rgba(255,255,255,0.6)', fontSize:18, cursor:'pointer', fontFamily:'Plus Jakarta Sans' }}>›</button>
            </div>
          </div>
        </div>

        <div className="page-body">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <p style={{ fontSize:16, fontWeight:700, color:'var(--azul)' }}>{livro.nome} {cap}</p>
            <p style={{ fontSize:11, color:'var(--texto-suave)' }}>NVI</p>
          </div>

          {loading && (
            <div style={{ textAlign:'center', padding:'40px 0' }}>
              <div className="spinner" style={{ margin:'0 auto', borderTopColor:'var(--azul)' }} />
            </div>
          )}

          {erro && <div className="error-msg">{erro}</div>}

          {!loading && !erro && versiculos.map((v, i) => (
            <div key={v.number || i} className={`verse-row ${i > 0 ? 'regular' : ''}`}>
              <p className={`verse-num ${i > 0 ? 'regular' : ''}`}>{v.number}</p>
              <p className="verse-text">{v.text}</p>
            </div>
          ))}

          {/* Nav caps */}
          {!loading && versiculos.length > 0 && (
            <div style={{ display:'flex', gap:8 }}>
              <button className="btn btn-outline-blue" onClick={() => irCap(cap-1)} disabled={cap<=1} style={{ minHeight:44, fontSize:13 }}>
                ← Anterior
              </button>
              <button className="btn btn-blue" onClick={() => irCap(cap+1)} disabled={cap>=livro.caps} style={{ minHeight:44, fontSize:13 }}>
                Próximo →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal livros */}
      {showLivros && (
        <div className="modal-backdrop" onClick={() => setShowLivros(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle-bar" />
            <div className="modal-header">
              <p className="modal-title">Escolher Livro</p>
              <div className="search-bar" style={{ marginTop:10 }}>
                <span style={{ color:'var(--texto-suave)', fontSize:14 }}>🔍</span>
                <input placeholder="Buscar livro..." value={busca} onChange={e => setBusca(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="modal-body" style={{ paddingTop:12 }}>
              {atFilt.length > 0 && (
                <>
                  <p style={{ fontSize:10, fontWeight:700, letterSpacing:1, color:'var(--texto-suave)', textTransform:'uppercase', marginBottom:8 }}>Antigo Testamento</p>
                  {atFilt.map(l => {
                    const idx = LIVROS.indexOf(l)
                    return (
                      <button key={l.abrev+l.grupo} onClick={() => irLivro(idx)} style={{
                        display:'block', width:'100%', padding:'11px 14px', marginBottom:4,
                        background: idx===livroIdx ? '#eef2ff' : '#fafafa',
                        border: `1px solid ${idx===livroIdx ? 'var(--azul)' : 'var(--borda)'}`,
                        borderRadius:'var(--radius-sm)', color: idx===livroIdx ? 'var(--azul)' : 'var(--texto)',
                        fontFamily:'Plus Jakarta Sans', fontSize:14, fontWeight: idx===livroIdx ? 700 : 500,
                        cursor:'pointer', textAlign:'left',
                      }}>{l.nome}</button>
                    )
                  })}
                </>
              )}
              {ntFilt.length > 0 && (
                <>
                  <p style={{ fontSize:10, fontWeight:700, letterSpacing:1, color:'var(--texto-suave)', textTransform:'uppercase', margin:'16px 0 8px' }}>Novo Testamento</p>
                  {ntFilt.map(l => {
                    const idx = LIVROS.indexOf(l)
                    return (
                      <button key={l.abrev+l.grupo} onClick={() => irLivro(idx)} style={{
                        display:'block', width:'100%', padding:'11px 14px', marginBottom:4,
                        background: idx===livroIdx ? '#eef2ff' : '#fafafa',
                        border: `1px solid ${idx===livroIdx ? 'var(--azul)' : 'var(--borda)'}`,
                        borderRadius:'var(--radius-sm)', color: idx===livroIdx ? 'var(--azul)' : 'var(--texto)',
                        fontFamily:'Plus Jakarta Sans', fontSize:14, fontWeight: idx===livroIdx ? 700 : 500,
                        cursor:'pointer', textAlign:'left',
                      }}>{l.nome}</button>
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

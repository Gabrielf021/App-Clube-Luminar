import { useState, useEffect, useRef } from 'react'

const ABB_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHIiOiJTdW4gTWFyIDE1IDIwMjYgMDI6NDE6MzQgR01UKzAwMDAuZ2FicmllbGZyYWdvc28zMUBnbWFpbC5jb20iLCJpYXQiOjE3NzM1NDI0OTR9.6pr5wltsB5NbJfNlwd7kZgCiJeb4sDb326o3IW0Acn9I'


const LIVROS = [
  { nome:'Gênesis',           abrev:'gn',  caps:50,  grupo:'AT' },
  { nome:'Êxodo',             abrev:'ex',  caps:40,  grupo:'AT' },
  { nome:'Levítico',          abrev:'lv',  caps:27,  grupo:'AT' },
  { nome:'Números',           abrev:'nm',  caps:36,  grupo:'AT' },
  { nome:'Deuteronômio',      abrev:'dt',  caps:34,  grupo:'AT' },
  { nome:'Josué',             abrev:'js',  caps:24,  grupo:'AT' },
  { nome:'Juízes',            abrev:'jz',  caps:21,  grupo:'AT' },
  { nome:'Rute',              abrev:'rt',  caps:4,   grupo:'AT' },
  { nome:'1 Samuel',          abrev:'1sm', caps:31,  grupo:'AT' },
  { nome:'2 Samuel',          abrev:'2sm', caps:24,  grupo:'AT' },
  { nome:'1 Reis',            abrev:'1rs', caps:22,  grupo:'AT' },
  { nome:'2 Reis',            abrev:'2rs', caps:25,  grupo:'AT' },
  { nome:'1 Crônicas',        abrev:'1cr', caps:29,  grupo:'AT' },
  { nome:'2 Crônicas',        abrev:'2cr', caps:36,  grupo:'AT' },
  { nome:'Esdras',            abrev:'ed',  caps:10,  grupo:'AT' },
  { nome:'Neemias',           abrev:'ne',  caps:13,  grupo:'AT' },
  { nome:'Ester',             abrev:'et',  caps:10,  grupo:'AT' },
  { nome:'Jó',                abrev:'jo',  caps:42,  grupo:'AT' },
  { nome:'Salmos',            abrev:'sl',  caps:150, grupo:'AT' },
  { nome:'Provérbios',        abrev:'pv',  caps:31,  grupo:'AT' },
  { nome:'Eclesiastes',       abrev:'ec',  caps:12,  grupo:'AT' },
  { nome:'Cantares',          abrev:'ct',  caps:8,   grupo:'AT' },
  { nome:'Isaías',            abrev:'is',  caps:66,  grupo:'AT' },
  { nome:'Jeremias',          abrev:'jr',  caps:52,  grupo:'AT' },
  { nome:'Lamentações',       abrev:'lm',  caps:5,   grupo:'AT' },
  { nome:'Ezequiel',          abrev:'ez',  caps:48,  grupo:'AT' },
  { nome:'Daniel',            abrev:'dn',  caps:12,  grupo:'AT' },
  { nome:'Oséias',            abrev:'os',  caps:14,  grupo:'AT' },
  { nome:'Joel',              abrev:'jl',  caps:3,   grupo:'AT' },
  { nome:'Amós',              abrev:'am',  caps:9,   grupo:'AT' },
  { nome:'Obadias',           abrev:'ob',  caps:1,   grupo:'AT' },
  { nome:'Jonas',             abrev:'jn',  caps:4,   grupo:'AT' },
  { nome:'Miquéias',          abrev:'mq',  caps:7,   grupo:'AT' },
  { nome:'Naum',              abrev:'na',  caps:3,   grupo:'AT' },
  { nome:'Habacuque',         abrev:'hc',  caps:3,   grupo:'AT' },
  { nome:'Sofonias',          abrev:'sf',  caps:3,   grupo:'AT' },
  { nome:'Ageu',              abrev:'ag',  caps:2,   grupo:'AT' },
  { nome:'Zacarias',          abrev:'zc',  caps:14,  grupo:'AT' },
  { nome:'Malaquias',         abrev:'ml',  caps:4,   grupo:'AT' },
  { nome:'Mateus',            abrev:'mt',  caps:28,  grupo:'NT' },
  { nome:'Marcos',            abrev:'mc',  caps:16,  grupo:'NT' },
  { nome:'Lucas',             abrev:'lc',  caps:24,  grupo:'NT' },
  { nome:'João',              abrev:'jo',  caps:21,  grupo:'NT' },
  { nome:'Atos',              abrev:'at',  caps:28,  grupo:'NT' },
  { nome:'Romanos',           abrev:'rm',  caps:16,  grupo:'NT' },
  { nome:'1 Coríntios',       abrev:'1co', caps:16,  grupo:'NT' },
  { nome:'2 Coríntios',       abrev:'2co', caps:13,  grupo:'NT' },
  { nome:'Gálatas',           abrev:'gl',  caps:6,   grupo:'NT' },
  { nome:'Efésios',           abrev:'ef',  caps:6,   grupo:'NT' },
  { nome:'Filipenses',        abrev:'fp',  caps:4,   grupo:'NT' },
  { nome:'Colossenses',       abrev:'cl',  caps:4,   grupo:'NT' },
  { nome:'1 Tessalonicenses', abrev:'1ts', caps:5,   grupo:'NT' },
  { nome:'2 Tessalonicenses', abrev:'2ts', caps:3,   grupo:'NT' },
  { nome:'1 Timóteo',         abrev:'1tm', caps:6,   grupo:'NT' },
  { nome:'2 Timóteo',         abrev:'2tm', caps:4,   grupo:'NT' },
  { nome:'Tito',              abrev:'tt',  caps:3,   grupo:'NT' },
  { nome:'Filemom',           abrev:'fm',  caps:1,   grupo:'NT' },
  { nome:'Hebreus',           abrev:'hb',  caps:13,  grupo:'NT' },
  { nome:'Tiago',             abrev:'tg',  caps:5,   grupo:'NT' },
  { nome:'1 Pedro',           abrev:'1pe', caps:5,   grupo:'NT' },
  { nome:'2 Pedro',           abrev:'2pe', caps:3,   grupo:'NT' },
  { nome:'1 João',            abrev:'1jo', caps:5,   grupo:'NT' },
  { nome:'2 João',            abrev:'2jo', caps:1,   grupo:'NT' },
  { nome:'3 João',            abrev:'3jo', caps:1,   grupo:'NT' },
  { nome:'Judas',             abrev:'jd',  caps:1,   grupo:'NT' },
  { nome:'Apocalipse',        abrev:'ap',  caps:22,  grupo:'NT' },
]

async function fetchCap(livro, cap) {
  // Usa proxy CORS do Supabase Edge Functions ou direto com modo no-cors workaround
  // Tentativa 1: ABB via fetch com headers CORS corretos
  const headers = {
    'Authorization': `Bearer ${ABB_TOKEN}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }

  for (const versao of ['nvi', 'aa', 'acf']) {
    try {
      const res = await fetch(
        `https://www.abibliadigital.com.br/api/verses/${versao}/${livro.abrev}/${cap}`,
        { method: 'GET', headers, mode: 'cors' }
      )
      if (res.ok) {
        const data = await res.json()
        if (data.verses?.length > 0) {
          return data.verses.map(v => ({ number: v.number, text: v.text }))
        }
      }
    } catch {}
  }

  // Tentativa 2: bible-api.com (tem CORS aberto)
  try {
    const engMap = {
      gn:'genesis', ex:'exodus', lv:'leviticus', nm:'numbers', dt:'deuteronomy',
      js:'joshua', jz:'judges', rt:'ruth', '1sm':'1+samuel', '2sm':'2+samuel',
      '1rs':'1+kings', '2rs':'2+kings', sl:'psalms', pv:'proverbs', ec:'ecclesiastes',
      is:'isaiah', jr:'jeremiah', ez:'ezekiel', dn:'daniel', jn:'jonah',
      mt:'matthew', mc:'mark', lc:'luke', jo:'john', at:'acts', rm:'romans',
      '1co':'1+corinthians', '2co':'2+corinthians', gl:'galatians', ef:'ephesians',
      fp:'philippians', cl:'colossians', hb:'hebrews', tg:'james',
      '1pe':'1+peter', '2pe':'2+peter', '1jo':'1+john', ap:'revelation',
    }
    const eng = engMap[livro.abrev]
    if (eng) {
      const res = await fetch(`https://bible-api.com/${eng}+${cap}?translation=almeida`)
      if (res.ok) {
        const data = await res.json()
        if (data.verses?.length > 0) {
          return data.verses.map(v => ({ number: v.verse, text: v.text.trim() }))
        }
      }
    }
  } catch {}

  // Tentativa 3: bible-api.com sem tradução específica
  try {
    const engMap2 = {
      gn:'genesis', ex:'exodus', sl:'psalms', pv:'proverbs',
      mt:'matthew', mc:'mark', lc:'luke', jo:'john', at:'acts', rm:'romans', ap:'revelation',
    }
    const eng = engMap2[livro.abrev]
    if (eng) {
      const res = await fetch(`https://bible-api.com/${eng}+${cap}`)
      if (res.ok) {
        const data = await res.json()
        if (data.verses?.length > 0) {
          return data.verses.map(v => ({ number: v.verse, text: v.text.trim() }))
        }
      }
    }
  } catch {}

  throw new Error(`Não foi possível carregar ${livro.nome} ${cap}. Verifique sua conexão.`)
}

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
      const vers = await fetchCap(livro, cap)
      setVersiculos(vers)
    } catch (e) {
      setErro(e.message)
    }
    setLoading(false)
    scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const irCap = (n) => setCap(Math.max(1, Math.min(livro.caps, n)))
  const irLivro = (idx) => { setLivroIdx(idx); setCap(1); setShowLivros(false); setBusca('') }

  const atFilt = LIVROS.filter(l => l.grupo==='AT' && l.nome.toLowerCase().includes(busca.toLowerCase()))
  const ntFilt = LIVROS.filter(l => l.grupo==='NT' && l.nome.toLowerCase().includes(busca.toLowerCase()))

  return (
    <div className="app-shell">
      <div className="scroll-area fade-in" ref={scrollRef}>
        <div className="page-header">
          <p className="page-header-eyebrow">📖 Palavra de Deus</p>
          <p className="page-header-title">Bíblia Sagrada</p>
          <div style={{ display:'flex', gap:8, marginTop:12 }}>
            <button onClick={() => setShowLivros(true)} style={{
              flex:1, background:'rgba(255,255,255,0.12)', border:'none',
              borderRadius:'var(--radius-sm)', padding:'10px 12px',
              display:'flex', justifyContent:'space-between', alignItems:'center',
              cursor:'pointer', color:'var(--dourado)', fontFamily:'Plus Jakarta Sans', fontWeight:700, fontSize:14,
            }}>
              <span>{livro.nome}</span>
              <span style={{ color:'rgba(255,255,255,0.4)', fontSize:10 }}>▾</span>
            </button>
            <div style={{ display:'flex', alignItems:'center', background:'rgba(255,255,255,0.12)', borderRadius:'var(--radius-sm)', overflow:'hidden' }}>
              <button onClick={() => irCap(cap-1)} disabled={cap<=1} style={{ width:40, height:42, border:'none', background:'transparent', color:cap<=1?'rgba(255,255,255,0.2)':'rgba(255,255,255,0.7)', fontSize:20, cursor:cap<=1?'default':'pointer', fontFamily:'Plus Jakarta Sans' }}>‹</button>
              <span style={{ minWidth:32, textAlign:'center', fontSize:14, fontWeight:800, color:'var(--dourado)' }}>{cap}</span>
              <button onClick={() => irCap(cap+1)} disabled={cap>=livro.caps} style={{ width:40, height:42, border:'none', background:'transparent', color:cap>=livro.caps?'rgba(255,255,255,0.2)':'rgba(255,255,255,0.7)', fontSize:20, cursor:cap>=livro.caps?'default':'pointer', fontFamily:'Plus Jakarta Sans' }}>›</button>
            </div>
          </div>
        </div>

        <div className="page-body">
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline' }}>
            <p style={{ fontSize:17, fontWeight:700, color:'var(--azul)' }}>{livro.nome} {cap}</p>
            <p style={{ fontSize:11, color:'var(--texto-suave)', fontWeight:600 }}>NVI</p>
          </div>

          {loading && (
            <div style={{ textAlign:'center', padding:'48px 0' }}>
              <div className="spinner" style={{ margin:'0 auto', borderTopColor:'var(--azul)' }} />
              <p style={{ fontSize:12, color:'var(--texto-suave)', marginTop:12 }}>Carregando {livro.nome} {cap}...</p>
            </div>
          )}

          {!loading && erro && (
            <div>
              <div className="error-msg" style={{ marginBottom:12 }}>⚠️ {erro}</div>
              <button className="btn btn-blue" onClick={buscarCap} style={{ minHeight:44 }}>🔄 Tentar novamente</button>
            </div>
          )}

          {!loading && !erro && versiculos.map((v, i) => (
            <div key={v.number} className={`verse-row ${i > 0 ? 'regular' : ''}`}>
              <p className={`verse-num ${i > 0 ? 'regular' : ''}`}>{v.number}</p>
              <p className="verse-text">{v.text}</p>
            </div>
          ))}

          {!loading && versiculos.length > 0 && (
            <>
              <div style={{ display:'flex', gap:8 }}>
                <button className="btn btn-outline-blue" onClick={() => irCap(cap-1)} disabled={cap<=1} style={{ minHeight:48, fontSize:14 }}>← Anterior</button>
                <button className="btn btn-blue" onClick={() => irCap(cap+1)} disabled={cap>=livro.caps} style={{ minHeight:48, fontSize:14 }}>Próximo →</button>
              </div>
              <p style={{ fontSize:11, color:'var(--texto-suave)', textAlign:'center' }}>
                Capítulo {cap} de {livro.caps} · {versiculos.length} versículos
              </p>
            </>
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
                <span style={{ color:'var(--texto-suave)', fontSize:16 }}>🔍</span>
                <input placeholder="Buscar livro..." value={busca} onChange={e => setBusca(e.target.value)} autoFocus style={{ fontSize:16 }} />
              </div>
            </div>
            <div className="modal-body" style={{ paddingTop:12 }}>
              {atFilt.length > 0 && (
                <>
                  <p style={{ fontSize:10, fontWeight:700, letterSpacing:1, color:'var(--texto-suave)', textTransform:'uppercase', marginBottom:8 }}>Antigo Testamento</p>
                  {atFilt.map(l => {
                    const idx = LIVROS.indexOf(l)
                    const ativo = idx === livroIdx
                    return (
                      <button key={`at-${l.abrev}`} onClick={() => irLivro(idx)} style={{
                        display:'block', width:'100%', padding:'12px 14px', marginBottom:4,
                        background: ativo?'#eef2ff':'#fafafa',
                        border: `1px solid ${ativo?'var(--azul)':'var(--borda)'}`,
                        borderRadius:'var(--radius-sm)', color: ativo?'var(--azul)':'var(--texto)',
                        fontFamily:'Plus Jakarta Sans', fontSize:14, fontWeight: ativo?700:500,
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
                  <p style={{ fontSize:10, fontWeight:700, letterSpacing:1, color:'var(--texto-suave)', textTransform:'uppercase', margin:'16px 0 8px' }}>Novo Testamento</p>
                  {ntFilt.map(l => {
                    const idx = LIVROS.indexOf(l)
                    const ativo = idx === livroIdx
                    return (
                      <button key={`nt-${l.abrev}`} onClick={() => irLivro(idx)} style={{
                        display:'block', width:'100%', padding:'12px 14px', marginBottom:4,
                        background: ativo?'#eef2ff':'#fafafa',
                        border: `1px solid ${ativo?'var(--azul)':'var(--borda)'}`,
                        borderRadius:'var(--radius-sm)', color: ativo?'var(--azul)':'var(--texto)',
                        fontFamily:'Plus Jakarta Sans', fontSize:14, fontWeight: ativo?700:500,
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

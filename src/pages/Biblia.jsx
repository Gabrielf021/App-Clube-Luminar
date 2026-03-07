import { useState, useEffect } from 'react'

const LIVROS_AT = [
  'Gênesis','Êxodo','Levítico','Números','Deuteronômio','Josué','Juízes','Rute',
  '1 Samuel','2 Samuel','1 Reis','2 Reis','1 Crônicas','2 Crônicas','Esdras','Neemias',
  'Ester','Jó','Salmos','Provérbios','Eclesiastes','Cantares','Isaías','Jeremias',
  'Lamentações','Ezequiel','Daniel','Oséias','Joel','Amós','Obadias','Jonas','Miquéias',
  'Naum','Habacuque','Sofonias','Ageu','Zacarias','Malaquias',
]
const LIVROS_NT = [
  'Mateus','Marcos','Lucas','João','Atos','Romanos','1 Coríntios','2 Coríntios',
  'Gálatas','Efésios','Filipenses','Colossenses','1 Tessalonicenses','2 Tessalonicenses',
  '1 Timóteo','2 Timóteo','Tito','Filemom','Hebreus','Tiago','1 Pedro','2 Pedro',
  '1 João','2 João','3 João','Judas','Apocalipse',
]
const TODOS_LIVROS = [...LIVROS_AT, ...LIVROS_NT]

// Mapeamento para a API
const API_MAP = {
  'Gênesis':'GN','Êxodo':'EX','Levítico':'LV','Números':'NM','Deuteronômio':'DT',
  'Josué':'JS','Juízes':'JZ','Rute':'RT','1 Samuel':'1SM','2 Samuel':'2SM',
  '1 Reis':'1RS','2 Reis':'2RS','1 Crônicas':'1CR','2 Crônicas':'2CR','Esdras':'ED',
  'Neemias':'NE','Ester':'ET','Jó':'JO','Salmos':'SL','Provérbios':'PV',
  'Eclesiastes':'EC','Cantares':'CT','Isaías':'IS','Jeremias':'JR',
  'Lamentações':'LM','Ezequiel':'EZ','Daniel':'DN','Oséias':'OS','Joel':'JL',
  'Amós':'AM','Obadias':'OB','Jonas':'JN','Miquéias':'MQ','Naum':'NA',
  'Habacuque':'HB','Sofonias':'SF','Ageu':'AG','Zacarias':'ZC','Malaquias':'ML',
  'Mateus':'MT','Marcos':'MC','Lucas':'LC','João':'JO','Atos':'AT','Romanos':'RM',
  '1 Coríntios':'1CO','2 Coríntios':'2CO','Gálatas':'GL','Efésios':'EF',
  'Filipenses':'FP','Colossenses':'CL','1 Tessalonicenses':'1TS','2 Tessalonicenses':'2TS',
  '1 Timóteo':'1TM','2 Timóteo':'2TM','Tito':'TT','Filemom':'FM','Hebreus':'HB',
  'Tiago':'TG','1 Pedro':'1PE','2 Pedro':'2PE','1 João':'1JO','2 João':'2JO',
  '3 João':'3JO','Judas':'JD','Apocalipse':'AP',
}

export default function Biblia() {
  const [livro, setLivro] = useState('João')
  const [capitulo, setCapitulo] = useState(1)
  const [versiculos, setVersiculos] = useState([])
  const [loading, setLoading] = useState(false)
  const [totalCaps, setTotalCaps] = useState(21)
  const [busca, setBusca] = useState('')
  const [showLivros, setShowLivros] = useState(false)

  useEffect(() => { buscarCapitulo() }, [livro, capitulo])

  const buscarCapitulo = async () => {
    setLoading(true)
    try {
      const abrev = API_MAP[livro] || 'JO'
      const res = await fetch(`https://bible-api.com/${abrev}+${capitulo}?translation=almeida`)
      if (!res.ok) throw new Error()
      const data = await res.json()
      setVersiculos(data.verses || [])
    } catch {
      // Fallback para API alternativa em português
      try {
        const res = await fetch(`https://www.abibliadigital.com.br/api/verses/nvi/${API_MAP[livro]?.toLowerCase()}/${capitulo}`, {
          headers: { 'Authorization': 'Bearer sem-token' }
        })
        const data = await res.json()
        if (data.verses) setVersiculos(data.verses.map(v => ({ verse: v.number, text: v.text })))
      } catch {
        setVersiculos([{ verse: 1, text: 'Não foi possível carregar. Verifique sua conexão.' }])
      }
    }
    setLoading(false)
  }

  const livrosFiltrados = TODOS_LIVROS.filter(l =>
    l.toLowerCase().includes(busca.toLowerCase())
  )

  return (
    <div className="page">
      <div className="page-header" style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 2, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', marginBottom: 4 }}>
          📖 Palavra de Deus
        </div>
        <div style={{ fontSize: 20, fontWeight: 900, color: '#f5c000' }}>Bíblia Sagrada</div>
      </div>

      {/* Seletor */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => setShowLivros(true)}
          style={{ flex: 1, padding: '10px 14px', background: 'rgba(26,42,142,0.6)', border: '1.5px solid rgba(245,192,0,0.3)', borderRadius: 10, color: '#f5c000', fontFamily: 'Nunito', fontWeight: 800, fontSize: 14, cursor: 'pointer', textAlign: 'left' }}
        >
          📖 {livro}
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <button
            onClick={() => setCapitulo(c => Math.max(1, c-1))}
            style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(245,192,0,0.2)', borderRadius: 8, color: '#fff', fontSize: 18, cursor: 'pointer' }}
          >‹</button>
          <span style={{ fontSize: 16, fontWeight: 800, color: '#f5c000', minWidth: 24, textAlign: 'center' }}>{capitulo}</span>
          <button
            onClick={() => setCapitulo(c => c+1)}
            style={{ width: 36, height: 36, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(245,192,0,0.2)', borderRadius: 8, color: '#fff', fontSize: 18, cursor: 'pointer' }}
          >›</button>
        </div>
      </div>

      {/* Versículos */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : (
        <div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#f5c000', marginBottom: 12 }}>
            {livro} {capitulo}
          </div>
          {versiculos.map(v => (
            <div key={v.verse} className="bible-verse">
              <strong>{v.verse}</strong>
              {v.text}
            </div>
          ))}
          {/* Navegação inferior */}
          <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
            <button
              className="btn-secondary"
              onClick={() => setCapitulo(c => Math.max(1, c-1))}
              disabled={capitulo <= 1}
            >← Anterior</button>
            <button
              className="btn-secondary"
              onClick={() => setCapitulo(c => c+1)}
            >Próximo →</button>
          </div>
        </div>
      )}

      {/* Modal de seleção de livro */}
      {showLivros && (
        <div className="modal-overlay" onClick={() => setShowLivros(false)}>
          <div className="modal-sheet" onClick={e => e.stopPropagation()}>
            <div className="modal-handle" />
            <div className="modal-title">Escolher Livro</div>
            <input
              className="field-input"
              placeholder="🔍 Buscar livro..."
              value={busca}
              onChange={e => setBusca(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>Antigo Testamento</div>
            {livrosFiltrados.filter(l => LIVROS_AT.includes(l)).map(l => (
              <button key={l} onClick={() => { setLivro(l); setCapitulo(1); setShowLivros(false) }}
                style={{ display: 'block', width: '100%', padding: '10px 14px', background: livro===l ? 'rgba(245,192,0,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${livro===l ? '#f5c000' : 'rgba(255,255,255,0.06)'}`, borderRadius: 8, color: livro===l ? '#f5c000' : '#fff', fontFamily: 'Nunito', fontSize: 14, fontWeight: livro===l ? 800 : 600, cursor: 'pointer', textAlign: 'left', marginBottom: 4 }}>
                {l}
              </button>
            ))}
            <div style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.4)', letterSpacing: 1, textTransform: 'uppercase', margin: '12px 0 8px' }}>Novo Testamento</div>
            {livrosFiltrados.filter(l => LIVROS_NT.includes(l)).map(l => (
              <button key={l} onClick={() => { setLivro(l); setCapitulo(1); setShowLivros(false) }}
                style={{ display: 'block', width: '100%', padding: '10px 14px', background: livro===l ? 'rgba(245,192,0,0.15)' : 'rgba(255,255,255,0.04)', border: `1px solid ${livro===l ? '#f5c000' : 'rgba(255,255,255,0.06)'}`, borderRadius: 8, color: livro===l ? '#f5c000' : '#fff', fontFamily: 'Nunito', fontSize: 14, fontWeight: livro===l ? 800 : 600, cursor: 'pointer', textAlign: 'left', marginBottom: 4 }}>
                {l}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

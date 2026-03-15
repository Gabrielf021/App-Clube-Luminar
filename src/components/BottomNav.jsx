import { useAuth } from '../lib/AuthContext'

const ICONS = {
  home: (active) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={active ? '#f5c000' : 'currentColor'} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  checkin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  biblia: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
    </svg>
  ),
  pontos: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  classe: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  admin: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
    </svg>
  ),
  perfil: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
    </svg>
  ),
}

export default function BottomNav({ active, onChange }) {
  const { user } = useAuth()
  const tipo = user?.tipo

  const tabs = [
    { id: 'home',    label: 'Início',   icon: ICONS.home },
    { id: 'checkin', label: 'Check-in', icon: ICONS.checkin },
    { id: 'biblia',  label: 'Bíblia',   icon: ICONS.biblia },
    { id: 'pontos',  label: 'Pontos',   icon: ICONS.pontos },
  ]

  if (tipo === 'instrutor') tabs.push({ id: 'classe', label: 'Classe',   icon: ICONS.classe })
  if (tipo === 'conselheiro') tabs.push({ id: 'classe', label: 'Unidade', icon: ICONS.classe })
  if (tipo === 'diretoria') {
    tabs.push({ id: 'classe', label: 'Classes', icon: ICONS.classe })
    tabs.push({ id: 'admin',  label: 'Admin',   icon: ICONS.admin })
  }
  tabs.push({ id: 'perfil', label: 'Perfil', icon: ICONS.perfil })

  return (
    <nav className="bottom-nav">
      <div className="bottom-nav-pill">
        {tabs.map(t => {
          const isActive = active === t.id
          return (
            <button key={t.id} className={`nav-item ${isActive ? 'active' : ''}`} onClick={() => onChange(t.id)}>
              {isActive ? (
                <div className="nav-item-circle">
                  {t.icon(true)}
                </div>
              ) : (
                t.icon(false)
              )}
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}

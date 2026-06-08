import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { familyAPI } from '../services/api'
import './Layout.css'

const IconHome = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><path d="M9 21V12h6v9"/>
  </svg>
)
const IconUsers = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 014-4h4a4 4 0 014 4v2"/>
    <circle cx="17" cy="7" r="3" opacity=".5"/><path d="M23 21v-2a4 4 0 00-3-3.87" opacity=".5"/>
  </svg>
)
const IconMap = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>
    <line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/>
  </svg>
)
const IconLogout = () => (
  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
)

export default function Layout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [families, setFamilies] = useState([])
  const [sideOpen, setSideOpen] = useState(false)

  useEffect(() => {
    familyAPI.viewAll().then(r => setFamilies(r.data)).catch(() => {})
  }, [])

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="layout">
      <button className="sidebar-toggle" onClick={() => setSideOpen(o => !o)}>
        <span /><span /><span />
      </button>

      <aside className={`sidebar ${sideOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <span className="brand-icon">◈</span>
          <span className="brand-name">FamilyTrace</span>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section-label">Main</div>
          <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={() => setSideOpen(false)}>
            <IconHome /> Dashboard
          </NavLink>

          {families.length > 0 && (
            <>
              <div className="nav-section-label" style={{ marginTop: 20 }}>Families</div>
              {families.map(f => (
                <div key={f.id} className="nav-family-group">
                  <NavLink to={`/family/${f.id}`}
                    className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    onClick={() => setSideOpen(false)}>
                    <IconUsers /> {f.familyName}
                  </NavLink>
                  <NavLink to={`/map/${f.id}`}
                    className={({ isActive }) => `nav-item nav-item-sub ${isActive ? 'active' : ''}`}
                    onClick={() => setSideOpen(false)}>
                    <IconMap /> Live Map
                  </NavLink>
                </div>
              ))}
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-chip">
            <div className="user-avatar">{user?.sub?.[0]?.toUpperCase() ?? 'U'}</div>
            <div className="user-info">
              <div className="user-name">{user?.sub ?? 'User'}</div>
              <div className="user-role">{user?.role ?? ''}</div>
            </div>
          </div>
          <button className="btn btn-ghost logout-btn" onClick={handleLogout}>
            <IconLogout /> Logout
          </button>
        </div>
      </aside>

      {sideOpen && <div className="sidebar-overlay" onClick={() => setSideOpen(false)} />}

      <main className="main-content">
        <Outlet context={{ families, setFamilies }} />
      </main>
    </div>
  )
}

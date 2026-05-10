import { useState, useEffect } from 'react'
import { Activity, ClipboardList, Calendar, ClipboardCheck, BarChart2, UserPlus, LogOut, User } from 'lucide-react'
import NuevaAtencion from './components/NuevaAtencion'
import RegistroPacientes from './components/RegistroPacientes'
import Agenda from './components/Agenda'
import ListaDia from './components/ListaDia'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import CrearUsuario from './components/CrearUsuario'
import { useAuth } from './context/AuthContext'

const ADMIN_EMAIL = 'martinlino541@gmail.com'

export default function App() {
  const { user, perfil, loading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('lista')
  const [refresh, setRefresh] = useState(0)
  const [today, setToday] = useState('')
  const [showCrearUsuario, setShowCrearUsuario] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)

  useEffect(() => {
    const d = new Date()
    setToday(d.toLocaleDateString('es-EC', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }))
  }, [])

  // Mostrar spinner mientras carga la sesión
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏥</div>
        <div className="loading-spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--border)', width: 32, height: 32, margin: '0 auto' }} />
        <div style={{ marginTop: 12, color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>Cargando sistema...</div>
      </div>
    </div>
  )

  // Mostrar login si no hay sesión
  if (!user) return <Login />

  const handleSaved = () => {
    setRefresh(r => r + 1)
    setActiveTab('registro')
  }

  const nombre = perfil?.nombre || user.email.split('@')[0]
  const isAdmin = user.email === ADMIN_EMAIL

  return (
    <>
      <nav className="topbar">
        <div className="topbar-logo">
          <div className="topbar-logo-icon">🏥</div>
          <div>
            <div className="topbar-logo-text">CASISO</div>
            <div className="topbar-logo-sub">Sistema Médico</div>
          </div>
        </div>

        <div className="topbar-divider" />

        <button className={`nav-btn ${activeTab === 'lista' ? 'active' : ''}`} onClick={() => setActiveTab('lista')}>
          <ClipboardCheck size={17} /> Lista del Día
        </button>

        <button className={`nav-btn ${activeTab === 'nueva' ? 'active' : ''}`} onClick={() => setActiveTab('nueva')}>
          <Activity size={17} /> Nueva Atención
        </button>

        <button className={`nav-btn ${activeTab === 'agenda' ? 'active' : ''}`} onClick={() => setActiveTab('agenda')}>
          <Calendar size={17} /> Agenda
        </button>

        <button className={`nav-btn ${activeTab === 'registro' ? 'active' : ''}`} onClick={() => setActiveTab('registro')}>
          <ClipboardList size={17} /> Registro
        </button>

        <button className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
          <BarChart2 size={17} /> Estadísticas
        </button>

        <div className="topbar-spacer" />

        {/* Info del usuario + menú */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '6px 12px', borderRadius: 8, border: 'none',
              background: 'rgba(255,255,255,0.1)', cursor: 'pointer',
              color: 'white', fontFamily: 'var(--font-body)', fontSize: 13
            }}>
            <div style={{
              width: 30, height: 30, borderRadius: '50%',
              background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 14, fontWeight: 700, flexShrink: 0
            }}>
              {nombre.charAt(0).toUpperCase()}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 600, fontSize: 12 }}>{perfil ? `${perfil.nombre} ${perfil.apellido || ''}` : nombre}</div>
              {perfil?.especialidad && <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.6)' }}>{perfil.especialidad}</div>}
            </div>
          </button>

          {showUserMenu && (
            <div style={{
              position: 'absolute', top: '110%', right: 0, minWidth: 200,
              background: 'white', borderRadius: 10, boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-light)', zIndex: 200, overflow: 'hidden'
            }} onClick={() => setShowUserMenu(false)}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-light)', background: 'var(--surface-2)' }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)' }}>
                  {perfil ? `${perfil.nombre} ${perfil.apellido || ''}` : nombre}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
                {perfil?.especialidad && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{perfil.especialidad}</div>}
              </div>

              {isAdmin && (
                <button
                  onClick={() => { setShowCrearUsuario(true); setShowUserMenu(false) }}
                  style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontWeight: 500 }}>
                  <UserPlus size={15}/> Crear nuevo usuario
                </button>
              )}

              <button
                onClick={signOut}
                style={{ width: '100%', padding: '10px 16px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'var(--font-body)', fontWeight: 500, borderTop: '1px solid var(--border-light)' }}>
                <LogOut size={15}/> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </nav>

      <div className="main-content" onClick={() => setShowUserMenu(false)}>
        {activeTab === 'lista'     && <ListaDia key={refresh} />}
        {activeTab === 'nueva'     && <NuevaAtencion onSaved={handleSaved} />}
        {activeTab === 'agenda'    && <Agenda key={refresh} />}
        {activeTab === 'registro'  && <RegistroPacientes key={refresh} />}
        {activeTab === 'dashboard' && <Dashboard key={refresh} />}
      </div>

      {showCrearUsuario && <CrearUsuario onClose={() => setShowCrearUsuario(false)} />}
    </>
  )
}

import { useState, useEffect } from 'react'
import { Activity, ClipboardList, Calendar, ClipboardCheck, BarChart2 } from 'lucide-react'
import NuevaAtencion from './components/NuevaAtencion'
import RegistroPacientes from './components/RegistroPacientes'
import Agenda from './components/Agenda'
import ListaDia from './components/ListaDia'
import Dashboard from './components/Dashboard'

export default function App() {
  const [activeTab, setActiveTab] = useState('lista')
  const [refresh, setRefresh] = useState(0)
  const [today, setToday] = useState('')

  useEffect(() => {
    const d = new Date()
    setToday(d.toLocaleDateString('es-EC', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    }))
  }, [])

  const handleSaved = () => {
    setRefresh(r => r + 1)
    setActiveTab('registro')
  }

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
        <div className="topbar-date" style={{ textTransform: 'capitalize' }}>{today}</div>
      </nav>

      <div className="main-content">
        {activeTab === 'lista'     && <ListaDia key={refresh} />}
        {activeTab === 'nueva'     && <NuevaAtencion onSaved={handleSaved} />}
        {activeTab === 'agenda'    && <Agenda key={refresh} />}
        {activeTab === 'registro'  && <RegistroPacientes key={refresh} />}
        {activeTab === 'dashboard' && <Dashboard key={refresh} />}
      </div>
    </>
  )
}

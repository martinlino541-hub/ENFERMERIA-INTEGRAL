import { useState, useEffect, useCallback } from 'react'
import {
  ClipboardList, Plus, Trash2, CheckCircle, Clock,
  User, Phone, Briefcase, ChevronUp, ChevronDown,
  AlertCircle, Save, X
} from 'lucide-react'
import { supabase } from '../supabaseClient'

const ESTADOS = ['Pendiente', 'En consulta', 'Atendido', 'No asistió']
const ESTADO_STYLE = {
  'Pendiente':   { bg: '#EBF8FF', color: '#2B6CB0', border: '#BEE3F8' },
  'En consulta': { bg: '#FFFFF0', color: '#744210', border: '#FAF089' },
  'Atendido':    { bg: '#F0FFF4', color: '#2F855A', border: '#9AE6B4' },
  'No asistió':  { bg: '#FFF5F5', color: '#C53030', border: '#FEB2B2' },
}

function formatHora(h) {
  if (!h) return ''
  const [hh, mm] = h.split(':')
  const n = parseInt(hh)
  return `${n > 12 ? n - 12 : n || 12}:${mm} ${n >= 12 ? 'PM' : 'AM'}`
}

export default function ListaDia() {
  const hoy = new Date().toISOString().split('T')[0]
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [saving, setSaving] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(null)

  // Busqueda de paciente existente
  const [busqueda, setBusqueda] = useState('')
  const [resultados, setResultados] = useState([])
  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)

  const [nuevaCita, setNuevaCita] = useState({
    nombres: '', apellidos: '', cedula: '', telefono: '',
    hora: '', motivo: '', prioridad: 'Normal'
  })

  const fetchCitas = useCallback(async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('lista_dia')
      .select('*')
      .eq('fecha', hoy)
      .order('orden', { ascending: true })
    if (!error) setCitas(data || [])
    setLoading(false)
  }, [hoy])

  useEffect(() => { fetchCitas() }, [fetchCitas])

  // Buscar paciente existente
  useEffect(() => {
    const buscar = async () => {
      if (busqueda.length < 2) { setResultados([]); return }
      const { data } = await supabase
        .from('pacientes')
        .select('id, nombres, apellidos, cedula, telefono, ocupacion')
        .or(`nombres.ilike.%${busqueda}%,apellidos.ilike.%${busqueda}%,cedula.ilike.%${busqueda}%`)
        .limit(6)
      setResultados(data || [])
    }
    const t = setTimeout(buscar, 300)
    return () => clearTimeout(t)
  }, [busqueda])

  const seleccionarPaciente = (p) => {
    setPacienteSeleccionado(p)
    setNuevaCita(prev => ({
      ...prev,
      nombres: p.nombres,
      apellidos: p.apellidos,
      cedula: p.cedula || '',
      telefono: p.telefono || '',
    }))
    setBusqueda('')
    setResultados([])
  }

  const handleAgregar = async () => {
    if (!nuevaCita.nombres || !nuevaCita.apellidos) return
    setSaving(true)
    try {
      const maxOrden = citas.length ? Math.max(...citas.map(c => c.orden || 0)) : 0
      await supabase.from('lista_dia').insert({
        fecha: hoy,
        paciente_id: pacienteSeleccionado?.id || null,
        nombres: nuevaCita.nombres,
        apellidos: nuevaCita.apellidos,
        cedula: nuevaCita.cedula || null,
        telefono: nuevaCita.telefono || null,
        hora: nuevaCita.hora || null,
        motivo: nuevaCita.motivo || null,
        prioridad: nuevaCita.prioridad,
        estado: 'Pendiente',
        orden: maxOrden + 1,
      })
      setNuevaCita({ nombres: '', apellidos: '', cedula: '', telefono: '', hora: '', motivo: '', prioridad: 'Normal' })
      setPacienteSeleccionado(null)
      setBusqueda('')
      setShowForm(false)
      fetchCitas()
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const updateEstado = async (id, estado) => {
    await supabase.from('lista_dia').update({ estado }).eq('id', id)
    setCitas(c => c.map(x => x.id === id ? { ...x, estado } : x))
  }

  const moverOrden = async (id, dir) => {
    const idx = citas.findIndex(c => c.id === id)
    const newIdx = idx + dir
    if (newIdx < 0 || newIdx >= citas.length) return
    const updated = [...citas]
    const tmp = updated[idx].orden
    updated[idx] = { ...updated[idx], orden: updated[newIdx].orden }
    updated[newIdx] = { ...updated[newIdx], orden: tmp }
    ;[updated[idx], updated[newIdx]] = [updated[newIdx], updated[idx]]
    setCitas(updated)
    await supabase.from('lista_dia').update({ orden: updated[idx].orden }).eq('id', updated[idx].id)
    await supabase.from('lista_dia').update({ orden: updated[newIdx].orden }).eq('id', updated[newIdx].id)
  }

  const eliminarCita = async (id) => {
    await supabase.from('lista_dia').delete().eq('id', id)
    setCitas(c => c.filter(x => x.id !== id))
    setConfirmDelete(null)
  }

  const stats = {
    total: citas.length,
    pendientes: citas.filter(c => c.estado === 'Pendiente').length,
    enConsulta: citas.filter(c => c.estado === 'En consulta').length,
    atendidos: citas.filter(c => c.estado === 'Atendido').length,
    noAsistio: citas.filter(c => c.estado === 'No asistió').length,
  }

  const fechaFormateada = new Date(hoy + 'T00:00:00').toLocaleDateString('es-EC', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div className="page-title">
              <ClipboardList size={22} />
              Lista del Día
              <span className="page-title-badge">Hoy</span>
            </div>
            <div className="page-subtitle" style={{ textTransform: 'capitalize' }}>{fechaFormateada}</div>
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)} style={{ gap: 8 }}>
            <Plus size={16} /> Agregar paciente
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total', value: stats.total, color: '#0B4F71', bg: '#EBF8FF' },
          { label: 'Pendientes', value: stats.pendientes, color: '#2B6CB0', bg: '#EBF8FF' },
          { label: 'En consulta', value: stats.enConsulta, color: '#744210', bg: '#FFFFF0' },
          { label: 'Atendidos', value: stats.atendidos, color: '#2F855A', bg: '#F0FFF4' },
          { label: 'No asistió', value: stats.noAsistio, color: '#C53030', bg: '#FFF5F5' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '12px 16px' }}>
            <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div className="loading-spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--border)', width: 28, height: 28, margin: '0 auto 12px' }} />
          Cargando lista del día...
        </div>
      ) : citas.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <ClipboardList size={48} color="var(--border)" style={{ margin: '0 auto 16px' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-muted)', marginBottom: 8 }}>
            No hay pacientes en la lista de hoy
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
            Agrega pacientes para comenzar la jornada
          </div>
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>
            <Plus size={16} /> Agregar primer paciente
          </button>
        </div>
      ) : (
        <div className="card">
          {/* Cabecera tabla */}
          <div style={{ display: 'grid', gridTemplateColumns: '40px 50px 1fr 120px 160px 180px 120px 100px', gap: 8, padding: '10px 16px', background: 'var(--surface-2)', borderBottom: '2px solid var(--border-light)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            <div>#</div>
            <div>Hora</div>
            <div>Paciente</div>
            <div>Prioridad</div>
            <div>Motivo</div>
            <div>Estado</div>
            <div>Orden</div>
            <div>Acción</div>
          </div>

          {citas.map((cita, idx) => {
            const est = ESTADO_STYLE[cita.estado] || ESTADO_STYLE['Pendiente']
            const prioStyle = cita.prioridad === 'Urgente'
              ? { bg: '#FFF5F5', color: '#C53030' }
              : cita.prioridad === 'Prioritario'
              ? { bg: '#FFFFF0', color: '#744210' }
              : { bg: 'var(--surface-2)', color: 'var(--text-muted)' }

            return (
              <div key={cita.id} style={{
                display: 'grid',
                gridTemplateColumns: '40px 50px 1fr 120px 160px 180px 120px 100px',
                gap: 8,
                padding: '12px 16px',
                borderBottom: '1px solid var(--border-light)',
                alignItems: 'center',
                background: cita.estado === 'Atendido' ? 'rgba(240,255,244,0.5)' : cita.estado === 'No asistió' ? 'rgba(255,245,245,0.5)' : 'white',
                transition: 'background 0.2s',
              }}>
                {/* Número */}
                <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 16, color: 'var(--text-muted)', textAlign: 'center' }}>{idx + 1}</div>

                {/* Hora */}
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                  {cita.hora ? formatHora(cita.hora) : <span style={{ color: 'var(--border)' }}>—</span>}
                </div>

                {/* Paciente */}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{cita.nombres} {cita.apellidos}</div>
                  <div style={{ display: 'flex', gap: 10, marginTop: 2, flexWrap: 'wrap' }}>
                    {cita.cedula && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>CI: {cita.cedula}</span>}
                    {cita.telefono && <span style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 3 }}><Phone size={10} />{cita.telefono}</span>}
                  </div>
                </div>

                {/* Prioridad */}
                <div>
                  <span style={{ background: prioStyle.bg, color: prioStyle.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>
                    {cita.prioridad === 'Urgente' ? '🚨' : cita.prioridad === 'Prioritario' ? '⚠️' : '●'} {cita.prioridad}
                  </span>
                </div>

                {/* Motivo */}
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {cita.motivo || <span style={{ color: 'var(--border)' }}>Sin especificar</span>}
                </div>

                {/* Estado selector */}
                <div>
                  <select
                    value={cita.estado}
                    onChange={e => updateEstado(cita.id, e.target.value)}
                    style={{
                      background: est.bg,
                      color: est.color,
                      border: `1.5px solid ${est.border}`,
                      borderRadius: 20,
                      padding: '4px 10px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      outline: 'none',
                      fontFamily: 'var(--font-body)',
                      width: '100%',
                    }}
                  >
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                {/* Ordenar */}
                <div style={{ display: 'flex', gap: 4, justifyContent: 'center' }}>
                  <button onClick={() => moverOrden(cita.id, -1)} disabled={idx === 0}
                    style={{ border: '1px solid var(--border)', background: 'white', borderRadius: 6, width: 28, height: 28, cursor: idx === 0 ? 'not-allowed' : 'pointer', opacity: idx === 0 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronUp size={14} />
                  </button>
                  <button onClick={() => moverOrden(cita.id, 1)} disabled={idx === citas.length - 1}
                    style={{ border: '1px solid var(--border)', background: 'white', borderRadius: 6, width: 28, height: 28, cursor: idx === citas.length - 1 ? 'not-allowed' : 'pointer', opacity: idx === citas.length - 1 ? 0.3 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ChevronDown size={14} />
                  </button>
                </div>

                {/* Eliminar */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button onClick={() => setConfirmDelete(cita)} className="btn-danger-ghost" title="Quitar de la lista">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Agregar paciente */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Agregar paciente a la lista</div>
              <button onClick={() => setShowForm(false)} className="btn btn-ghost" style={{ padding: 8 }}><X size={18} /></button>
            </div>
            <div className="modal-body">

              {/* Búsqueda paciente existente */}
              <div className="form-group" style={{ marginBottom: 16 }}>
                <label className="form-label">Buscar paciente existente (opcional)</label>
                <div style={{ position: 'relative' }}>
                  <input className="form-input" value={busqueda} onChange={e => setBusqueda(e.target.value)}
                    placeholder="Escriba nombre o cédula para buscar..." />
                  {resultados.length > 0 && (
                    <div className="cie10-dropdown">
                      {resultados.map(p => (
                        <div key={p.id} className="cie10-option" onMouseDown={() => seleccionarPaciente(p)}>
                          <span className="cie10-code" style={{ minWidth: 120 }}>{p.nombres} {p.apellidos}</span>
                          <span className="cie10-name">{p.cedula || 'Sin cédula'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {pacienteSeleccionado && (
                  <div style={{ marginTop: 6, padding: '6px 12px', background: 'var(--accent-soft)', borderRadius: 8, fontSize: 12, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CheckCircle size={13} /> Paciente seleccionado: <strong>{pacienteSeleccionado.nombres} {pacienteSeleccionado.apellidos}</strong>
                    <button onClick={() => { setPacienteSeleccionado(null); setNuevaCita(p => ({ ...p, nombres: '', apellidos: '', cedula: '', telefono: '' })) }}
                      style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--accent)' }}>
                      <X size={13} />
                    </button>
                  </div>
                )}
              </div>

              <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
                <div className="form-grid form-grid-2">
                  <div className="form-group">
                    <label className="form-label required">Nombres</label>
                    <input className="form-input" value={nuevaCita.nombres} onChange={e => setNuevaCita(p => ({ ...p, nombres: e.target.value }))} placeholder="Nombres" />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Apellidos</label>
                    <input className="form-input" value={nuevaCita.apellidos} onChange={e => setNuevaCita(p => ({ ...p, apellidos: e.target.value }))} placeholder="Apellidos" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cédula</label>
                    <input className="form-input" value={nuevaCita.cedula} onChange={e => setNuevaCita(p => ({ ...p, cedula: e.target.value }))} placeholder="0912345678" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Teléfono</label>
                    <input className="form-input" value={nuevaCita.telefono} onChange={e => setNuevaCita(p => ({ ...p, telefono: e.target.value }))} placeholder="0991234567" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Hora de cita</label>
                    <input type="time" className="form-input" value={nuevaCita.hora} onChange={e => setNuevaCita(p => ({ ...p, hora: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Prioridad</label>
                    <select className="form-select" value={nuevaCita.prioridad} onChange={e => setNuevaCita(p => ({ ...p, prioridad: e.target.value }))}>
                      <option value="Normal">Normal</option>
                      <option value="Prioritario">Prioritario ⚠️</option>
                      <option value="Urgente">Urgente 🚨</option>
                    </select>
                  </div>
                  <div className="form-group col-span-2">
                    <label className="form-label">Motivo de visita</label>
                    <input className="form-input" value={nuevaCita.motivo} onChange={e => setNuevaCita(p => ({ ...p, motivo: e.target.value }))} placeholder="Control, examen médico, consulta..." />
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
                <button className="btn btn-primary" onClick={handleAgregar} disabled={saving || !nuevaCita.nombres || !nuevaCita.apellidos}>
                  {saving ? <span className="loading-spinner" /> : <Plus size={15} />}
                  Agregar a la lista
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Confirmar eliminar */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: 'var(--danger)' }}>
                <AlertCircle size={18} style={{ marginRight: 8 }} />
                Quitar de la lista
              </div>
              <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost" style={{ padding: 8 }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
                ¿Quitar a <strong>{confirmDelete.nombres} {confirmDelete.apellidos}</strong> de la lista de hoy?
              </p>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                <button className="btn" style={{ background: 'var(--danger)', color: 'white' }} onClick={() => eliminarCita(confirmDelete.id)}>
                  <Trash2 size={15} /> Quitar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

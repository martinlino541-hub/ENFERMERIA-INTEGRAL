import { useState, useEffect, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Clock, User, Phone, Briefcase, X, Eye } from 'lucide-react'
import { supabase } from '../supabaseClient'

const MESES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
const DIAS_SEMANA = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb']

export default function Agenda() {
  const hoy = new Date()
  const [mes, setMes] = useState(hoy.getMonth())
  const [anio, setAnio] = useState(hoy.getFullYear())
  const [diaSeleccionado, setDiaSeleccionado] = useState(null)
  const [citas, setCitas] = useState([])
  const [loading, setLoading] = useState(true)
  const [detalle, setDetalle] = useState(null)

  const fetchCitas = useCallback(async () => {
    setLoading(true)
    const inicio = `${anio}-${String(mes + 1).padStart(2, '0')}-01`
    const fin = new Date(anio, mes + 1, 0)
    const finStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(fin.getDate()).padStart(2, '0')}`

    const { data, error } = await supabase
      .from('atenciones')
      .select(`
        id, fecha_atencion, motivo_consulta, proxima_consulta,
        requiere_seguimiento, estado_consciencia,
        pacientes ( id, nombres, apellidos, cedula, telefono, edad, sexo, ocupacion ),
        diagnosticos ( codigo_cie10, nombre_cie10, tipo )
      `)
      .or(`fecha_atencion.gte.${inicio},proxima_consulta.gte.${inicio}`)
      .or(`fecha_atencion.lte.${finStr},proxima_consulta.lte.${finStr}`)
      .order('fecha_atencion', { ascending: true })

    if (!error) setCitas(data || [])
    setLoading(false)
  }, [mes, anio])

  useEffect(() => { fetchCitas() }, [fetchCitas])

  // Build calendar grid
  const primerDia = new Date(anio, mes, 1).getDay()
  const diasEnMes = new Date(anio, mes + 1, 0).getDate()

  const celdas = []
  for (let i = 0; i < primerDia; i++) celdas.push(null)
  for (let d = 1; d <= diasEnMes; d++) celdas.push(d)

  const fechaStr = (d) => `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  const citasDelDia = (d) => {
    const f = fechaStr(d)
    return citas.filter(c => c.fecha_atencion === f || c.proxima_consulta === f)
  }

  const citasDiaSeleccionado = diaSeleccionado ? citasDelDia(diaSeleccionado) : []

  const esHoy = (d) => {
    return d === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear()
  }

  const mesAnterior = () => {
    if (mes === 0) { setMes(11); setAnio(a => a - 1) }
    else setMes(m => m - 1)
    setDiaSeleccionado(null)
  }

  const mesSiguiente = () => {
    if (mes === 11) { setMes(0); setAnio(a => a + 1) }
    else setMes(m => m + 1)
    setDiaSeleccionado(null)
  }

  const formatFecha = (f) => {
    if (!f) return '—'
    return new Date(f + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  // Stats
  const totalMes = citas.filter(c => {
    const f = `${anio}-${String(mes + 1).padStart(2, '0')}`
    return c.fecha_atencion?.startsWith(f)
  }).length

  const seguimientosMes = citas.filter(c => {
    const f = `${anio}-${String(mes + 1).padStart(2, '0')}`
    return c.proxima_consulta?.startsWith(f)
  }).length

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <Calendar size={22} />
          Agenda de Citas
          <span className="page-title-badge">Calendario</span>
        </div>
        <div className="page-subtitle">Visualiza atenciones y seguimientos programados por fecha</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Atenciones en el mes', value: totalMes, color: '#0B4F71', bg: '#EBF8FF' },
          { label: 'Seguimientos programados', value: seguimientosMes, color: '#2F855A', bg: '#F0FFF4' },
          { label: 'Día seleccionado', value: diaSeleccionado ? citasDiaSeleccionado.length : '—', color: '#553C9A', bg: '#FAF5FF' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '14px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 4 }}>{s.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 16 }}>

        {/* ── Calendario ── */}
        <div className="card">
          <div className="card-header" style={{ justifyContent: 'space-between' }}>
            <button onClick={mesAnterior} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--primary)' }}>
              <ChevronLeft size={20} />
            </button>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--primary)' }}>
              {MESES[mes]} {anio}
            </div>
            <button onClick={mesSiguiente} style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 6, borderRadius: 6, color: 'var(--primary)' }}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="card-body" style={{ padding: '12px 16px' }}>
            {/* Header días */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4, marginBottom: 8 }}>
              {DIAS_SEMANA.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '4px 0' }}>{d}</div>
              ))}
            </div>

            {/* Grid días */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                <div className="loading-spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--border)', width: 24, height: 24, margin: '0 auto 8px' }} />
                Cargando...
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 4 }}>
                {celdas.map((d, i) => {
                  if (!d) return <div key={`e-${i}`} />
                  const citasD = citasDelDia(d)
                  const atenciones = citasD.filter(c => c.fecha_atencion === fechaStr(d))
                  const seguimientos = citasD.filter(c => c.proxima_consulta === fechaStr(d))
                  const seleccionado = diaSeleccionado === d
                  const hoyFlag = esHoy(d)

                  return (
                    <div key={d}
                      onClick={() => setDiaSeleccionado(seleccionado ? null : d)}
                      style={{
                        minHeight: 72,
                        borderRadius: 10,
                        padding: '6px 8px',
                        cursor: 'pointer',
                        background: seleccionado ? 'var(--primary)' : hoyFlag ? '#EBF8FF' : 'var(--surface-2)',
                        border: seleccionado ? '2px solid var(--primary)' : hoyFlag ? '2px solid var(--secondary)' : '1.5px solid var(--border-light)',
                        transition: 'all 0.15s',
                        position: 'relative',
                      }}
                    >
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: hoyFlag || seleccionado ? 700 : 500,
                        fontSize: 14,
                        color: seleccionado ? 'white' : hoyFlag ? 'var(--secondary)' : 'var(--text-primary)',
                        marginBottom: 4,
                      }}>{d}</div>

                      {atenciones.length > 0 && (
                        <div style={{
                          background: seleccionado ? 'rgba(255,255,255,0.25)' : 'var(--primary)',
                          color: 'white',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 5px',
                          borderRadius: 8,
                          marginBottom: 2,
                          display: 'inline-block',
                        }}>
                          {atenciones.length} atenc.
                        </div>
                      )}

                      {seguimientos.length > 0 && (
                        <div style={{
                          background: seleccionado ? 'rgba(255,255,255,0.25)' : 'var(--accent)',
                          color: 'white',
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 5px',
                          borderRadius: 8,
                          display: 'inline-block',
                          marginLeft: atenciones.length ? 2 : 0,
                        }}>
                          {seguimientos.length} seg.
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Leyenda */}
            <div style={{ display: 'flex', gap: 16, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-light)', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--primary)' }} />
                Atención médica
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: 'var(--accent)' }} />
                Seguimiento programado
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-muted)' }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: '#EBF8FF', border: '2px solid var(--secondary)' }} />
                Hoy
              </div>
            </div>
          </div>
        </div>

        {/* ── Panel lateral ── */}
        <div className="card" style={{ height: 'fit-content', position: 'sticky', top: 100 }}>
          <div className="card-header">
            <div className="card-header-icon"><Calendar size={16} /></div>
            <div>
              <div className="card-header-title">
                {diaSeleccionado
                  ? formatFecha(fechaStr(diaSeleccionado))
                  : 'Selecciona un día'}
              </div>
              <div className="card-header-sub">
                {diaSeleccionado ? `${citasDiaSeleccionado.length} registro(s)` : 'Click en cualquier día del calendario'}
              </div>
            </div>
          </div>

          <div className="card-body" style={{ padding: '12px 16px' }}>
            {!diaSeleccionado && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <Calendar size={40} color="var(--border)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 13 }}>Haz click en un día para ver sus registros</div>
              </div>
            )}

            {diaSeleccionado && citasDiaSeleccionado.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>📭</div>
                <div style={{ fontSize: 13 }}>Sin registros para este día</div>
              </div>
            )}

            {diaSeleccionado && citasDiaSeleccionado.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {citasDiaSeleccionado.map(c => {
                  const esSeguimiento = c.proxima_consulta === fechaStr(diaSeleccionado)
                  const esAtencion = c.fecha_atencion === fechaStr(diaSeleccionado)
                  const p = c.pacientes || {}

                  return (
                    <div key={c.id} style={{
                      background: esSeguimiento && !esAtencion ? 'var(--accent-soft)' : 'var(--surface-2)',
                      border: `1.5px solid ${esSeguimiento && !esAtencion ? 'rgba(0,201,167,0.3)' : 'var(--border-light)'}`,
                      borderRadius: 10,
                      padding: 12,
                    }}>
                      {/* Tipo badge */}
                      <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                        {esAtencion && (
                          <span style={{ background: 'var(--primary)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>
                            🩺 Atención
                          </span>
                        )}
                        {esSeguimiento && (
                          <span style={{ background: 'var(--accent)', color: 'white', fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 12 }}>
                            📅 Seguimiento
                          </span>
                        )}
                      </div>

                      {/* Paciente */}
                      <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)', marginBottom: 4 }}>
                        {p.nombres} {p.apellidos}
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                        {p.cedula && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <User size={11} /> CI: {p.cedula}
                          </div>
                        )}
                        {p.telefono && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Phone size={11} /> {p.telefono}
                          </div>
                        )}
                        {p.ocupacion && (
                          <div style={{ fontSize: 12, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 5 }}>
                            <Briefcase size={11} /> {p.ocupacion}
                          </div>
                        )}
                        {c.motivo_consulta && (
                          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, fontStyle: 'italic' }}>
                            "{c.motivo_consulta.substring(0, 80)}{c.motivo_consulta.length > 80 ? '...' : ''}"
                          </div>
                        )}
                        {c.diagnosticos?.length > 0 && (
                          <div style={{ marginTop: 4, display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {c.diagnosticos.map((d, i) => (
                              <span key={i} style={{ background: '#EBF8FF', color: '#2B6CB0', fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 8 }}>
                                {d.codigo_cie10}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => setDetalle(c)}
                        style={{ marginTop: 10, width: '100%', padding: '7px', background: 'white', border: '1.5px solid var(--border)', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                        <Eye size={13} /> Ver detalle completo
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Modal detalle ── */}
      {detalle && (
        <div className="modal-overlay" onClick={() => setDetalle(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{detalle.pacientes?.nombres} {detalle.pacientes?.apellidos}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Atención: {formatFecha(detalle.fecha_atencion)}
                  {detalle.proxima_consulta && ` · Seguimiento: ${formatFecha(detalle.proxima_consulta)}`}
                </div>
              </div>
              <button onClick={() => setDetalle(null)} className="btn btn-ghost" style={{ padding: 8 }}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div>
                  <DetalleSeccion titulo="👤 Paciente">
                    <DetalleRow label="Nombre" value={`${detalle.pacientes?.nombres} ${detalle.pacientes?.apellidos}`} />
                    <DetalleRow label="Cédula" value={detalle.pacientes?.cedula} />
                    <DetalleRow label="Edad" value={detalle.pacientes?.edad ? `${detalle.pacientes.edad} años` : null} />
                    <DetalleRow label="Sexo" value={detalle.pacientes?.sexo} />
                    <DetalleRow label="Teléfono" value={detalle.pacientes?.telefono} />
                    <DetalleRow label="Ocupación" value={detalle.pacientes?.ocupacion} />
                  </DetalleSeccion>

                  <DetalleSeccion titulo="🔬 Signos Vitales">
                    <DetalleRow label="Presión arterial" value={detalle.presion_arterial} />
                    <DetalleRow label="Temperatura" value={detalle.temperatura ? `${detalle.temperatura}°C` : null} />
                    <DetalleRow label="Saturación O₂" value={detalle.saturacion ? `${detalle.saturacion}%` : null} />
                    <DetalleRow label="Frec. Respiratoria" value={detalle.frecuencia_respiratoria ? `${detalle.frecuencia_respiratoria} rpm` : null} />
                    <DetalleRow label="Peso / Talla" value={detalle.peso && detalle.talla ? `${detalle.peso}kg / ${detalle.talla}cm` : null} />
                    <DetalleRow label="IMC" value={detalle.imc ? `${detalle.imc} kg/m²` : null} />
                    <DetalleRow label="Consciencia" value={detalle.estado_consciencia} />
                  </DetalleSeccion>
                </div>

                <div>
                  <DetalleSeccion titulo="📋 Motivo de Consulta">
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{detalle.motivo_consulta || '—'}</p>
                  </DetalleSeccion>

                  <DetalleSeccion titulo="🏷 Diagnósticos">
                    {detalle.diagnosticos?.length ? detalle.diagnosticos.map((d, i) => (
                      <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: 13, minWidth: 56 }}>{d.codigo_cie10}</span>
                        <div>
                          <div style={{ fontSize: 13 }}>{d.nombre_cie10}</div>
                          <span style={{ fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 8, background: d.tipo === 'definitivo' ? '#EBF8FF' : '#FFFFF0', color: d.tipo === 'definitivo' ? '#2B6CB0' : '#744210' }}>{d.tipo}</span>
                        </div>
                      </div>
                    )) : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin diagnósticos</p>}
                  </DetalleSeccion>

                  {detalle.proxima_consulta && (
                    <div style={{ padding: 12, background: 'var(--accent-soft)', borderRadius: 10, border: '1px solid rgba(0,201,167,0.2)', marginTop: 12 }}>
                      <div style={{ fontWeight: 700, color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Clock size={14} /> Próxima consulta programada
                      </div>
                      <div style={{ fontSize: 14, marginTop: 4, color: 'var(--text-primary)', fontWeight: 600 }}>
                        {formatFecha(detalle.proxima_consulta)}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetalleSeccion({ titulo, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)', fontSize: 13, marginBottom: 8, paddingBottom: 4, borderBottom: '2px solid var(--accent)', display: 'inline-block' }}>{titulo}</div>
      {children}
    </div>
  )
}

function DetalleRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: 8, marginBottom: 6 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', minWidth: 140 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{value || '—'}</span>
    </div>
  )
}

import { useState, useEffect, useCallback } from 'react'
import {
  Search, Eye, Users, Activity, Calendar, Clock,
  FileText, X, Stethoscope, Phone, Briefcase, Heart,
  Clipboard, Trash2, AlertTriangle, CheckCircle
} from 'lucide-react'
import { supabase } from '../supabaseClient'

export default function RegistroPacientes() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filterSexo, setFilterSexo] = useState('')
  const [selected, setSelected] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [alertMsg, setAlertMsg] = useState(null)
  const [stats, setStats] = useState({ total: 0, masculinos: 0, femeninos: 0, seguimientos: 0 })

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('atenciones')
        .select(`
          id, fecha_atencion, motivo_consulta, presion_arterial,
          temperatura, saturacion, frecuencia_respiratoria, estado_consciencia,
          peso, talla, imc, perimetro_abdominal, evolucion,
          requiere_seguimiento, proxima_consulta,
          pacientes (
            id, nombres, apellidos, cedula, telefono, edad, sexo, ocupacion,
            fecha_nacimiento, estado_civil, grupo_sanguineo, correo, direccion
          ),
          diagnosticos ( id, codigo_cie10, nombre_cie10, tipo ),
          tratamientos ( id, medicamento, cantidad, posologia )
        `)
        .order('fecha_atencion', { ascending: false })

      if (error) throw error
      setRecords(data || [])
      setFiltered(data || [])
      const all = data || []
      const pacs = {}
      all.forEach(a => { if (a.pacientes?.id) pacs[a.pacientes.id] = a.pacientes })
      const pacList = Object.values(pacs)
      setStats({
        total: all.length,
        masculinos: pacList.filter(p => p.sexo === 'Masculino').length,
        femeninos: pacList.filter(p => p.sexo === 'Femenino').length,
        seguimientos: all.filter(a => a.requiere_seguimiento).length,
      })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    let f = [...records]
    if (search) {
      const q = search.toLowerCase()
      f = f.filter(r =>
        r.pacientes?.nombres?.toLowerCase().includes(q) ||
        r.pacientes?.apellidos?.toLowerCase().includes(q) ||
        r.pacientes?.cedula?.includes(q) ||
        r.motivo_consulta?.toLowerCase().includes(q) ||
        r.diagnosticos?.some(d => d.nombre_cie10?.toLowerCase().includes(q) || d.codigo_cie10?.toLowerCase().includes(q))
      )
    }
    if (filterSexo) f = f.filter(r => r.pacientes?.sexo === filterSexo)
    setFiltered(f)
  }, [search, filterSexo, records])

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  /* ── Eliminar historia clínica completa ── */
  const handleEliminar = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const atencionId = confirmDelete.id
      const pacienteId = confirmDelete.pacientes?.id

      // Eliminar registros relacionados con la atención
      await supabase.from('diagnosticos').delete().eq('atencion_id', atencionId)
      await supabase.from('tratamientos').delete().eq('atencion_id', atencionId)
      await supabase.from('examen_fisico').delete().eq('atencion_id', atencionId)
      await supabase.from('atenciones').delete().eq('id', atencionId)

      // Verificar si el paciente tiene más atenciones
      if (pacienteId) {
        const { data: otrasAtenciones } = await supabase
          .from('atenciones')
          .select('id')
          .eq('paciente_id', pacienteId)

        // Si no tiene más atenciones, eliminar antecedentes y paciente
        if (!otrasAtenciones || otrasAtenciones.length === 0) {
          await supabase.from('antecedentes').delete().eq('paciente_id', pacienteId)
          await supabase.from('pacientes').delete().eq('id', pacienteId)
        }
      }

      setRecords(r => r.filter(x => x.id !== atencionId))
      setConfirmDelete(null)
      setSelected(null)
      setAlertMsg({ type: 'success', msg: `Historia clínica eliminada correctamente.` })
      setTimeout(() => setAlertMsg(null), 4000)
      fetchData()
    } catch (err) {
      setAlertMsg({ type: 'error', msg: `Error al eliminar: ${err.message}` })
    } finally {
      setDeleting(false)
    }
  }

  const StatCard = ({ icon: Icon, label, value, color, bg }) => (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg }}><Icon size={20} color={color} /></div>
      <div><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <div className="page-title"><Users size={22} />Registro de Pacientes<span className="page-title-badge">Matriz clínica</span></div>
        <div className="page-subtitle">Historial completo de atenciones médicas ocupacionales</div>
      </div>

      {alertMsg && (
        <div className={`alert ${alertMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>
          {alertMsg.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {alertMsg.msg}
        </div>
      )}

      <div className="stats-row">
        <StatCard icon={Stethoscope} label="Total atenciones" value={stats.total} color="#0B4F71" bg="#EBF8FF" />
        <StatCard icon={Users} label="Pacientes masculinos" value={stats.masculinos} color="#2B6CB0" bg="#EBF8FF" />
        <StatCard icon={Heart} label="Pacientes femeninas" value={stats.femeninos} color="#97266D" bg="#FFF0F6" />
        <StatCard icon={Clock} label="Con seguimiento" value={stats.seguimientos} color="#2F855A" bg="#F0FFF4" />
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
            <Search size={16} color="var(--text-muted)" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, cédula, diagnóstico..." />
            {search && <button onClick={() => setSearch('')} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={14} /></button>}
          </div>
          <select className="form-select" value={filterSexo} onChange={e => setFilterSexo(e.target.value)} style={{ width: 160 }}>
            <option value="">Todos los sexos</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} registros</div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <div className="loading-spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--border)', width: 28, height: 28, margin: '0 auto 12px' }} />
          Cargando registros...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <FileText size={40} color="var(--border)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--text-muted)' }}>No hay atenciones registradas</div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Paciente</th>
                <th>Cédula</th>
                <th>Edad</th>
                <th>Sexo</th>
                <th>Teléfono</th>
                <th>Ocupación</th>
                <th>Motivo de Consulta</th>
                <th>P/A</th>
                <th>Diagnóstico CIE-10</th>
                <th>Evolución</th>
                <th>Tratamiento</th>
                <th>Próx. Consulta</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const p = r.pacientes || {}
                const diags = r.diagnosticos || []
                const trats = r.tratamientos || []
                return (
                  <tr key={r.id}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-secondary)', fontSize: 12 }}>{formatDate(r.fecha_atencion)}</td>
                    <td style={{ whiteSpace: 'nowrap', fontWeight: 600 }}>{p.nombres} {p.apellidos}</td>
                    <td style={{ fontFamily: 'var(--font-display)', fontSize: 12 }}>{p.cedula || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{p.edad ? `${p.edad}a` : '—'}</td>
                    <td>
                      {p.sexo ? (
                        <span className={`table-badge ${p.sexo === 'Masculino' ? 'badge-m' : 'badge-f'}`}>
                          {p.sexo === 'Masculino' ? '♂' : '♀'} {p.sexo}
                        </span>
                      ) : '—'}
                    </td>
                    <td style={{ fontSize: 12 }}>{p.telefono || '—'}</td>
                    <td style={{ fontSize: 12, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.ocupacion || '—'}</td>
                    <td style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>{r.motivo_consulta || '—'}</td>
                    <td style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap' }}>{r.presion_arterial || '—'}</td>
                    <td>
                      {diags.length ? diags.map(d => (
                        <div key={d.id} style={{ marginBottom: 4 }}>
                          <span className={`table-badge ${d.tipo === 'definitivo' ? 'badge-def' : 'badge-pre'}`}>{d.codigo_cie10}</span>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{d.nombre_cie10}</div>
                        </div>
                      )) : '—'}
                    </td>
                    <td style={{ maxWidth: 180, fontSize: 12 }}>
                      {r.evolucion ? <span title={r.evolucion}>{r.evolucion.substring(0, 60)}{r.evolucion.length > 60 ? '...' : ''}</span> : '—'}
                    </td>
                    <td>
                      {trats.length ? trats.map(t => (
                        <div key={t.id} style={{ fontSize: 11, marginBottom: 3 }}>
                          <strong>{t.medicamento}</strong>
                          {t.cantidad && <span style={{ color: 'var(--text-muted)' }}> · {t.cantidad}</span>}
                          {t.posologia && <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{t.posologia}</div>}
                        </div>
                      )) : '—'}
                    </td>
                    <td style={{ whiteSpace: 'nowrap', fontSize: 12 }}>
                      {r.requiere_seguimiento
                        ? <span style={{ color: 'var(--accent)', fontWeight: 600 }}>📅 {r.proxima_consulta ? formatDate(r.proxima_consulta) : 'Pendiente'}</span>
                        : <span style={{ color: 'var(--text-muted)' }}>No requiere</span>}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-ghost" style={{ padding: '6px 10px', fontSize: 12 }}
                          onClick={() => setSelected(r)} title="Ver detalle">
                          <Eye size={14} />
                        </button>
                        <button className="btn-danger-ghost" style={{ padding: '6px 8px' }}
                          onClick={() => setConfirmDelete(r)} title="Eliminar historia clínica">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal detalle */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selected.pacientes?.nombres} {selected.pacientes?.apellidos}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
                  Atención: {formatDate(selected.fecha_atencion)} · Cédula: {selected.pacientes?.cedula || 'N/D'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn" style={{ background: 'var(--danger-soft)', color: 'var(--danger)', border: '1px solid #FEB2B2', padding: '6px 12px', fontSize: 12 }}
                  onClick={() => { setSelected(null); setConfirmDelete(selected) }}>
                  <Trash2 size={14} /> Eliminar
                </button>
                <button onClick={() => setSelected(null)} className="btn btn-ghost" style={{ padding: 8 }}><X size={18} /></button>
              </div>
            </div>
            <div className="modal-body">
              <DetailView r={selected} formatDate={formatDate} />
            </div>
          </div>
        </div>
      )}

      {/* Modal confirmar eliminar */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{ maxWidth: 440 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={20} /> Eliminar Historia Clínica
              </div>
              <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost" style={{ padding: 8 }}><X size={18} /></button>
            </div>
            <div className="modal-body">
              <div style={{ background: 'var(--danger-soft)', border: '1px solid #FEB2B2', borderRadius: 10, padding: 14, marginBottom: 16 }}>
                <p style={{ fontSize: 14, color: 'var(--danger)', fontWeight: 600, marginBottom: 6 }}>⚠️ Esta acción no se puede deshacer</p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  Se eliminará la atención del <strong>{formatDate(confirmDelete.fecha_atencion)}</strong> de <strong>{confirmDelete.pacientes?.nombres} {confirmDelete.pacientes?.apellidos}</strong>, incluyendo diagnósticos, tratamientos y examen físico.
                </p>
                <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 8 }}>
                  Si es la única atención del paciente, también se eliminará su ficha completa.
                </p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                <button className="btn" style={{ background: 'var(--danger)', color: 'white' }}
                  onClick={handleEliminar} disabled={deleting}>
                  {deleting ? <span className="loading-spinner" /> : <Trash2 size={15} />}
                  {deleting ? 'Eliminando...' : 'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailView({ r, formatDate }) {
  const p = r.pacientes || {}
  const Row = ({ label, value }) => (
    <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
      <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', minWidth: 160 }}>{label}</span>
      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{value || '—'}</span>
    </div>
  )
  const Section = ({ title, children }) => (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)', fontSize: 14, marginBottom: 10, paddingBottom: 6, borderBottom: '2px solid var(--accent)', display: 'inline-block' }}>{title}</div>
      {children}
    </div>
  )
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
      <div>
        <Section title="👤 Datos del Paciente">
          <Row label="Nombre completo" value={`${p.nombres} ${p.apellidos}`} />
          <Row label="Cédula" value={p.cedula} />
          <Row label="Edad" value={p.edad ? `${p.edad} años` : null} />
          <Row label="Sexo" value={p.sexo} />
          <Row label="Estado civil" value={p.estado_civil} />
          <Row label="Grupo sanguíneo" value={p.grupo_sanguineo} />
          <Row label="Teléfono" value={p.telefono} />
          <Row label="Correo" value={p.correo} />
          <Row label="Dirección" value={p.direccion} />
          <Row label="Ocupación" value={p.ocupacion} />
        </Section>
        <Section title="🔬 Signos Vitales">
          <Row label="Presión arterial" value={r.presion_arterial} />
          <Row label="Temperatura" value={r.temperatura ? `${r.temperatura} °C` : null} />
          <Row label="Saturación O₂" value={r.saturacion ? `${r.saturacion}%` : null} />
          <Row label="Frec. Respiratoria" value={r.frecuencia_respiratoria ? `${r.frecuencia_respiratoria} rpm` : null} />
          <Row label="Peso / Talla" value={r.peso && r.talla ? `${r.peso} kg / ${r.talla} cm` : null} />
          <Row label="IMC" value={r.imc ? `${r.imc} kg/m²` : null} />
          <Row label="Perím. Abdominal" value={r.perimetro_abdominal ? `${r.perimetro_abdominal} cm` : null} />
          <Row label="Consciencia" value={r.estado_consciencia} />
        </Section>
      </div>
      <div>
        <Section title="📋 Motivo de Consulta">
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.motivo_consulta || '—'}</p>
        </Section>
        <Section title="🩺 Evolución">
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>{r.evolucion || '—'}</p>
        </Section>
        <Section title="🏷 Diagnósticos CIE-10">
          {(r.diagnosticos || []).length ? r.diagnosticos.map(d => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--primary)', fontSize: 14, minWidth: 56 }}>{d.codigo_cie10}</span>
              <div>
                <div style={{ fontSize: 13 }}>{d.nombre_cie10}</div>
                <span className={`table-badge ${d.tipo === 'definitivo' ? 'badge-def' : 'badge-pre'}`} style={{ marginTop: 3 }}>{d.tipo}</span>
              </div>
            </div>
          )) : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin diagnósticos registrados</p>}
        </Section>
        <Section title="💊 Tratamiento">
          {(r.tratamientos || []).length ? (
            <table style={{ width: '100%', fontSize: 12 }}>
              <thead>
                <tr>{['Medicamento','Cantidad','Posología'].map(h => (<th key={h} style={{ textAlign: 'left', padding: '4px 8px', color: 'var(--text-muted)', fontWeight: 700, fontSize: 11, textTransform: 'uppercase', borderBottom: '1px solid var(--border-light)' }}>{h}</th>))}</tr>
              </thead>
              <tbody>
                {r.tratamientos.map(t => (
                  <tr key={t.id}>
                    <td style={{ padding: '6px 8px', fontWeight: 600 }}>{t.medicamento}</td>
                    <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>{t.cantidad}</td>
                    <td style={{ padding: '6px 8px', color: 'var(--text-secondary)' }}>{t.posologia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sin tratamiento registrado</p>}
        </Section>
        {r.requiere_seguimiento && (
          <div style={{ padding: 12, background: 'var(--accent-soft)', borderRadius: 'var(--radius)', border: '1px solid rgba(0,201,167,0.2)' }}>
            <div style={{ fontWeight: 600, color: 'var(--accent)' }}>📅 Próxima consulta programada</div>
            {r.proxima_consulta && <div style={{ fontSize: 13, marginTop: 4, fontWeight: 600 }}>{formatDate(r.proxima_consulta)}</div>}
          </div>
        )}
      </div>
    </div>
  )
}

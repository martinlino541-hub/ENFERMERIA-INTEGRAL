import { useState, useEffect, useCallback } from 'react'
import { Search, Eye, Users, Clock, FileText, X, Heart, Trash2, AlertTriangle, CheckCircle, FlaskConical, Activity } from 'lucide-react'
import { supabase } from '../supabaseClient'

const EF_REGIONES = [
  { key:'cabeza_cara',             label:'Cabeza y Cara',              emoji:'🧠' },
  { key:'cuello',                  label:'Cuello',                     emoji:'🦴' },
  { key:'torax',                   label:'Tórax',                      emoji:'🫁' },
  { key:'abdomen',                 label:'Abdomen',                    emoji:'🫃' },
  { key:'extremidades_superiores', label:'Extremidades Superiores (A)',emoji:'💪' },
  { key:'extremidades_inferiores', label:'Extremidades Inferiores (B)',emoji:'🦵' },
  { key:'columna_vertebral',       label:'Columna Vertebral',          emoji:'🦴' },
  { key:'sistema_neurologico',     label:'Sistema Neurológico',        emoji:'🧬' },
  { key:'piel_anexos',             label:'Piel y Anexos',              emoji:'🩹' },
  { key:'genitourinario',          label:'Genitourinario',             emoji:'🔵' },
  { key:'region_rectal',           label:'Región Rectal',              emoji:'🔴' },
]

export default function RegistroPacientes() {
  const [loading, setLoading] = useState(true)
  const [records, setRecords] = useState([])
  const [filtered, setFiltered] = useState([])
  const [search, setSearch] = useState('')
  const [filterSexo, setFilterSexo] = useState('')
  const [selected, setSelected] = useState(null)
  const [selectedAnt, setSelectedAnt] = useState(null)
  const [selectedEF, setSelectedEF] = useState(null)
  const [selectedExamenes, setSelectedExamenes] = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)
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
          temperatura, saturacion, frecuencia_respiratoria,
          peso, talla, imc, perimetro_abdominal, evolucion,
          observaciones, recomendaciones,
          requiere_seguimiento, proxima_consulta, hora_proxima_consulta,
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

  const openDetail = async (r) => {
    setSelected(r)
    setSelectedAnt(null)
    setSelectedEF(null)
    setSelectedExamenes([])
    setLoadingDetail(true)
    try {
      const [antRes, efRes, exRes] = await Promise.all([
        supabase.from('antecedentes').select('*').eq('paciente_id', r.pacientes?.id).single(),
        supabase.from('examen_fisico').select('*').eq('atencion_id', r.id).single(),
        supabase.from('examenes_resultados').select('*').eq('atencion_id', r.id).order('tipo'),
      ])
      if (antRes.data) setSelectedAnt(antRes.data)
      if (efRes.data) setSelectedEF(efRes.data)
      if (exRes.data) setSelectedExamenes(exRes.data)
    } catch (e) { console.error(e) }
    finally { setLoadingDetail(false) }
  }

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d + 'T00:00:00').toLocaleDateString('es-EC', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const handleEliminar = async () => {
    if (!confirmDelete) return
    setDeleting(true)
    try {
      const atencionId = confirmDelete.id
      const pacienteId = confirmDelete.pacientes?.id
      await supabase.from('diagnosticos').delete().eq('atencion_id', atencionId)
      await supabase.from('tratamientos').delete().eq('atencion_id', atencionId)
      await supabase.from('examen_fisico').delete().eq('atencion_id', atencionId)
      await supabase.from('examenes_resultados').delete().eq('atencion_id', atencionId)
      await supabase.from('atenciones').delete().eq('id', atencionId)
      if (pacienteId) {
        const { data: otras } = await supabase.from('atenciones').select('id').eq('paciente_id', pacienteId)
        if (!otras || otras.length === 0) {
          await supabase.from('antecedentes').delete().eq('paciente_id', pacienteId)
          await supabase.from('pacientes').delete().eq('id', pacienteId)
        }
      }
      setConfirmDelete(null)
      setSelected(null)
      setAlertMsg({ type: 'success', msg: 'Historia clínica eliminada correctamente.' })
      setTimeout(() => setAlertMsg(null), 4000)
      fetchData()
    } catch (err) {
      setAlertMsg({ type: 'error', msg: `Error al eliminar: ${err.message}` })
    } finally { setDeleting(false) }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title"><Users size={22}/>Registro de Pacientes<span className="page-title-badge">Historial</span></div>
        <div className="page-subtitle">Historial completo de atenciones médicas</div>
      </div>

      {alertMsg && (
        <div className={`alert ${alertMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>
          {alertMsg.type === 'success' ? <CheckCircle size={16}/> : <AlertTriangle size={16}/>}
          {alertMsg.msg}
        </div>
      )}

      {/* Stats */}
      <div className="stats-row">
        {[
          {icon:Users,label:'Total atenciones',value:stats.total,color:'#0B4F71',bg:'#EBF8FF'},
          {icon:Users,label:'Masculinos',value:stats.masculinos,color:'#2B6CB0',bg:'#EBF8FF'},
          {icon:Heart,label:'Femeninas',value:stats.femeninos,color:'#97266D',bg:'#FFF0F6'},
          {icon:Clock,label:'Con seguimiento',value:stats.seguimientos,color:'#2F855A',bg:'#F0FFF4'},
        ].map((s,i)=>(
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{background:s.bg}}><s.icon size={20} color={s.color}/></div>
            <div><div className="stat-value">{s.value}</div><div className="stat-label">{s.label}</div></div>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-body" style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ flex: 1, minWidth: 220 }}>
            <Search size={16} color="var(--text-muted)"/>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar por nombre, cédula, diagnóstico..."/>
            {search && <button onClick={() => setSearch('')} style={{ border:'none',background:'none',cursor:'pointer',color:'var(--text-muted)' }}><X size={14}/></button>}
          </div>
          <select className="form-select" value={filterSexo} onChange={e => setFilterSexo(e.target.value)} style={{ width: 160 }}>
            <option value="">Todos los sexos</option>
            <option value="Masculino">Masculino</option>
            <option value="Femenino">Femenino</option>
          </select>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginLeft: 'auto' }}>{filtered.length} registros</div>
        </div>
      </div>

      {/* Tabla */}
      {loading ? (
        <div style={{ textAlign:'center', padding:60, color:'var(--text-muted)' }}>
          <div className="loading-spinner" style={{ borderTopColor:'var(--primary)',borderColor:'var(--border)',width:28,height:28,margin:'0 auto 12px'}}/>
          Cargando registros...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign:'center', padding:60 }}>
          <FileText size={40} color="var(--border)" style={{ margin:'0 auto 12px'}}/>
          <div style={{ fontFamily:'var(--font-display)',fontSize:16,color:'var(--text-muted)' }}>No hay atenciones registradas</div>
        </div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Fecha</th><th>Paciente</th><th>Cédula</th><th>Edad</th><th>Sexo</th>
                <th>Motivo de Consulta</th><th>Diagnóstico CIE-10</th><th>Próx. Consulta</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const p = r.pacientes || {}
                return (
                  <tr key={r.id}>
                    <td style={{whiteSpace:'nowrap',color:'var(--text-secondary)',fontSize:12}}>{formatDate(r.fecha_atencion)}</td>
                    <td style={{whiteSpace:'nowrap',fontWeight:600}}>{p.nombres} {p.apellidos}</td>
                    <td style={{fontFamily:'var(--font-display)',fontSize:12}}>{p.cedula||'—'}</td>
                    <td style={{textAlign:'center'}}>{p.edad?`${p.edad}a`:'—'}</td>
                    <td>{p.sexo?<span className={`table-badge ${p.sexo==='Masculino'?'badge-m':'badge-f'}`}>{p.sexo==='Masculino'?'♂':'♀'} {p.sexo}</span>:'—'}</td>
                    <td style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',fontSize:12}}>{r.motivo_consulta||'—'}</td>
                    <td>
                      {(r.diagnosticos||[]).length ? r.diagnosticos.slice(0,2).map(d=>(
                        <div key={d.id} style={{marginBottom:2}}>
                          <span className={`table-badge ${d.tipo==='definitivo'?'badge-def':'badge-pre'}`}>{d.codigo_cie10}</span>
                        </div>
                      )) : '—'}
                    </td>
                    <td style={{whiteSpace:'nowrap',fontSize:12}}>
                      {r.requiere_seguimiento
                        ?<span style={{color:'var(--accent)',fontWeight:600}}>📅 {r.proxima_consulta?formatDate(r.proxima_consulta):'Pendiente'}{r.hora_proxima_consulta?` · ${r.hora_proxima_consulta.substring(0,5)}`:''}</span>
                        :<span style={{color:'var(--text-muted)'}}>No requiere</span>}
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="btn btn-ghost" style={{padding:'6px 10px',fontSize:12}} onClick={() => openDetail(r)} title="Ver detalle completo"><Eye size={14}/></button>
                        <button className="btn-danger-ghost" style={{padding:'6px 8px'}} onClick={() => setConfirmDelete(r)} title="Eliminar"><Trash2 size={14}/></button>
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
          <div className="modal" style={{ maxWidth: 1100 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="modal-title">{selected.pacientes?.nombres} {selected.pacientes?.apellidos}</div>
                <div style={{fontSize:13,color:'var(--text-muted)',marginTop:2}}>
                  Atención: {formatDate(selected.fecha_atencion)} · Cédula: {selected.pacientes?.cedula||'N/D'}
                </div>
              </div>
              <div style={{display:'flex',gap:8}}>
                <button className="btn" style={{background:'var(--danger-soft)',color:'var(--danger)',border:'1px solid #FEB2B2',padding:'6px 12px',fontSize:12}}
                  onClick={() => { setSelected(null); setConfirmDelete(selected) }}>
                  <Trash2 size={14}/> Eliminar
                </button>
                <button onClick={() => setSelected(null)} className="btn btn-ghost" style={{padding:8}}><X size={18}/></button>
              </div>
            </div>
            <div className="modal-body">
              {loadingDetail ? (
                <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>
                  <div className="loading-spinner" style={{borderTopColor:'var(--primary)',borderColor:'var(--border)',width:24,height:24,margin:'0 auto 10px'}}/>
                  Cargando información completa...
                </div>
              ) : (
                <DetailView r={selected} ant={selectedAnt} ef={selectedEF} examenes={selectedExamenes} formatDate={formatDate}/>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal eliminar */}
      {confirmDelete && (
        <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
          <div className="modal" style={{maxWidth:440}} onClick={e=>e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{color:'var(--danger)',display:'flex',alignItems:'center',gap:8}}>
                <AlertTriangle size={20}/> Eliminar Historia Clínica
              </div>
              <button onClick={() => setConfirmDelete(null)} className="btn btn-ghost" style={{padding:8}}><X size={18}/></button>
            </div>
            <div className="modal-body">
              <div style={{background:'var(--danger-soft)',border:'1px solid #FEB2B2',borderRadius:10,padding:14,marginBottom:16}}>
                <p style={{fontSize:14,color:'var(--danger)',fontWeight:600,marginBottom:6}}>⚠️ Esta acción no se puede deshacer</p>
                <p style={{fontSize:13,color:'var(--text-secondary)'}}>
                  Se eliminará la atención del <strong>{formatDate(confirmDelete.fecha_atencion)}</strong> de <strong>{confirmDelete.pacientes?.nombres} {confirmDelete.pacientes?.apellidos}</strong>.
                  Si es la única atención, también se eliminará la ficha completa.
                </p>
              </div>
              <div style={{display:'flex',justifyContent:'flex-end',gap:10}}>
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
                <button className="btn" style={{background:'var(--danger)',color:'white'}} onClick={handleEliminar} disabled={deleting}>
                  {deleting?<span className="loading-spinner"/>:<Trash2 size={15}/>}
                  {deleting?'Eliminando...':'Sí, eliminar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ══ DETAIL VIEW CON TODAS LAS PESTAÑAS ══ */
function DetailView({ r, ant, ef, examenes, formatDate }) {
  const [tab, setTab] = useState('datos')
  const p = r.pacientes || {}

  const Row = ({ label, value }) => (
    <div style={{display:'flex',gap:8,marginBottom:8}}>
      <span style={{fontSize:12,fontWeight:600,color:'var(--text-muted)',minWidth:170,flexShrink:0}}>{label}</span>
      <span style={{fontSize:13,color:'var(--text-primary)',lineHeight:1.5}}>{value||'—'}</span>
    </div>
  )

  const Sec = ({ title, children }) => (
    <div style={{marginBottom:20}}>
      <div style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--primary)',fontSize:13,marginBottom:10,paddingBottom:5,borderBottom:'2px solid var(--accent)',display:'inline-block'}}>{title}</div>
      {children}
    </div>
  )

  const examLab = (examenes||[]).filter(e => e.tipo === 'Laboratorio')
  const examImg = (examenes||[]).filter(e => e.tipo === 'Imagenología')
  const examOtro = (examenes||[]).filter(e => e.tipo === 'Otro')
  const totalExamenes = (examenes||[]).length

  // Regiones del examen físico con hallazgos
  const hallazgos = ef ? EF_REGIONES.filter(reg => ef[reg.key] && ef[reg.key].trim() !== '') : []

  const tabs = [
    { id:'datos',       label:'👤 Datos y Signos' },
    { id:'antecedentes',label:'📋 Antecedentes' },
    { id:'examen_fis',  label:`🔬 Examen Físico${hallazgos.length > 0 ? ` (${hallazgos.length})` : ''}` },
    { id:'clinica',     label:'🩺 Evolución y Diagnóstico' },
    { id:'examenes',    label:`🧪 Exámenes${totalExamenes > 0 ? ` (${totalExamenes})` : ''}` },
    { id:'tratamiento', label:'💊 Tratamiento' },
  ]

  return (
    <div>
      {/* Tabs */}
      <div style={{display:'flex',gap:2,marginBottom:20,borderBottom:'2px solid var(--border-light)',flexWrap:'wrap'}}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'8px 14px',border:'none',background:'none',cursor:'pointer',
            fontFamily:'var(--font-body)',fontSize:12,fontWeight:tab===t.id?700:400,
            color:tab===t.id?'var(--primary)':'var(--text-muted)',
            borderBottom:tab===t.id?'2px solid var(--primary)':'2px solid transparent',
            marginBottom:-2,transition:'all 0.15s',whiteSpace:'nowrap'
          }}>{t.label}</button>
        ))}
      </div>

      {/* ── TAB: DATOS Y SIGNOS ── */}
      {tab==='datos' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          <Sec title="👤 Datos del Paciente">
            <Row label="Nombre completo" value={`${p.nombres} ${p.apellidos}`}/>
            <Row label="Cédula" value={p.cedula}/>
            <Row label="Fecha nacimiento" value={p.fecha_nacimiento?new Date(p.fecha_nacimiento+'T00:00:00').toLocaleDateString('es-EC'):null}/>
            <Row label="Edad" value={p.edad?`${p.edad} años`:null}/>
            <Row label="Sexo" value={p.sexo}/>
            <Row label="Estado civil" value={p.estado_civil}/>
            <Row label="Grupo sanguíneo" value={p.grupo_sanguineo}/>
            <Row label="Teléfono" value={p.telefono}/>
            <Row label="Correo" value={p.correo}/>
            <Row label="Dirección" value={p.direccion}/>
            <Row label="Ocupación" value={p.ocupacion}/>
          </Sec>
          <Sec title="🔬 Signos Vitales">
            <Row label="Presión arterial" value={r.presion_arterial}/>
            <Row label="Temperatura" value={r.temperatura?`${r.temperatura} °C`:null}/>
            <Row label="Saturación O₂" value={r.saturacion?`${r.saturacion}%`:null}/>
            <Row label="Frec. Respiratoria" value={r.frecuencia_respiratoria?`${r.frecuencia_respiratoria} rpm`:null}/>
            <Row label="Peso / Talla" value={r.peso&&r.talla?`${r.peso} kg / ${r.talla} cm`:null}/>
            <Row label="IMC" value={r.imc?`${r.imc} kg/m²`:null}/>
            <Row label="Perím. Abdominal" value={r.perimetro_abdominal?`${r.perimetro_abdominal} cm`:null}/>
          </Sec>
        </div>
      )}

      {/* ── TAB: ANTECEDENTES ── */}
      {tab==='antecedentes' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          <div>
            <Sec title="🏥 Antecedentes Personales">
              <Row label="Patológicos personales" value={ant?.patologicos_personales}/>
              <Row label="Alérgicos" value={ant?.alergicos}/>
              <Row label="Quirúrgicos" value={ant?.quirurgicos}/>
            </Sec>
            <Sec title="👨‍👩‍👧 Antecedentes Familiares">
              <p style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.6}}>{ant?.patologicos_familiares||'—'}</p>
            </Sec>
          </div>
          <Sec title="👶 Antecedentes Ginecobstétricos">
            {ant?.gestas!=null ? (<>
              <Row label="Gestas" value={ant?.gestas?.toString()}/>
              <Row label="Partos vaginales" value={ant?.partos_vaginales?.toString()}/>
              <Row label="Cesáreas" value={ant?.cesareas?.toString()}/>
              <Row label="Abortos" value={ant?.abortos?.toString()}/>
              <Row label="Método planificación" value={ant?.metodo_planificacion}/>
            </>) : <p style={{fontSize:13,color:'var(--text-muted)'}}>No aplica o no registrado</p>}
          </Sec>
        </div>
      )}

      {/* ── TAB: EXAMEN FÍSICO ── */}
      {tab==='examen_fis' && (
        <div>
          {hallazgos.length === 0 ? (
            <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>
              <div style={{fontSize:36,marginBottom:12}}>✅</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:15,fontWeight:600}}>Examen físico sin hallazgos</div>
              <div style={{fontSize:13,marginTop:4}}>Todos los sistemas dentro de la normalidad</div>
            </div>
          ) : (
            <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))',gap:12}}>
              {hallazgos.map(reg => (
                <div key={reg.key} style={{border:'1.5px solid var(--border-light)',borderRadius:10,overflow:'hidden'}}>
                  <div style={{background:'var(--primary)',color:'white',padding:'7px 12px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:6}}>
                    <span>{reg.emoji}</span> {reg.label}
                    <span style={{marginLeft:'auto',fontSize:10,background:'#FEB2B2',color:'#C53030',padding:'1px 8px',borderRadius:10,fontWeight:800}}>CON HALLAZGO</span>
                  </div>
                  <div style={{padding:'10px 14px',fontSize:13,color:'var(--text-secondary)',lineHeight:1.6,background:'white'}}>
                    {ef[reg.key]}
                  </div>
                </div>
              ))}
            </div>
          )}
          {/* Regiones normales */}
          {ef && EF_REGIONES.filter(reg => !ef[reg.key] || ef[reg.key].trim() === '').length > 0 && (
            <div style={{marginTop:16,padding:'10px 14px',background:'var(--surface-2)',borderRadius:8,border:'1px solid var(--border-light)'}}>
              <div style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:8}}>✅ Regiones normales</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                {EF_REGIONES.filter(reg => !ef[reg.key] || ef[reg.key].trim() === '').map(reg => (
                  <span key={reg.key} style={{fontSize:11,background:'#F0FFF4',color:'#2F855A',padding:'3px 10px',borderRadius:12,fontWeight:600,border:'1px solid #9AE6B4'}}>
                    {reg.emoji} {reg.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: EVOLUCIÓN Y DIAGNÓSTICO ── */}
      {tab==='clinica' && (
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:24}}>
          <div>
            <Sec title="📋 Motivo de Consulta">
              <div style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.6,padding:'10px 12px',background:'var(--surface-2)',borderRadius:8,border:'1px solid var(--border-light)'}}>
                {r.motivo_consulta||'—'}
              </div>
            </Sec>
            <Sec title="🩺 Evolución">
              <div style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.6,padding:'10px 12px',background:'var(--surface-2)',borderRadius:8,border:'1px solid var(--border-light)'}}>
                {r.evolucion||'—'}
              </div>
            </Sec>
            {r.observaciones && (
              <Sec title="📝 Observaciones">
                <div style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.6,padding:'10px 12px',background:'var(--surface-2)',borderRadius:8,border:'1px solid var(--border-light)'}}>
                  {r.observaciones}
                </div>
              </Sec>
            )}
            {r.recomendaciones && (
              <Sec title="💡 Recomendaciones">
                <div style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.6,padding:'10px 12px',background:'#FFFFF0',borderRadius:8,border:'1px solid #FAF089'}}>
                  {r.recomendaciones}
                </div>
              </Sec>
            )}
          </div>
          <div>
            <Sec title="🏷 Diagnósticos CIE-10">
              {(r.diagnosticos||[]).length ? r.diagnosticos.map(d => (
                <div key={d.id} style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:10,padding:'8px 12px',background:'var(--surface-2)',borderRadius:8,border:'1px solid var(--border-light)'}}>
                  <span style={{fontFamily:'var(--font-display)',fontWeight:700,color:'var(--primary)',fontSize:14,minWidth:56,flexShrink:0}}>{d.codigo_cie10}</span>
                  <div>
                    <div style={{fontSize:13,fontWeight:500}}>{d.nombre_cie10}</div>
                    <span className={`table-badge ${d.tipo==='definitivo'?'badge-def':'badge-pre'}`} style={{marginTop:4,display:'inline-block'}}>{d.tipo}</span>
                  </div>
                </div>
              )) : <p style={{fontSize:13,color:'var(--text-muted)'}}>Sin diagnósticos registrados</p>}
            </Sec>
            {r.requiere_seguimiento && (
              <div style={{padding:14,background:'var(--accent-soft)',borderRadius:12,border:'1px solid rgba(0,201,167,0.2)'}}>
                <div style={{fontWeight:700,color:'var(--accent)',fontSize:14,marginBottom:6}}>📅 Próxima consulta programada</div>
                <div style={{fontSize:15,fontWeight:700,color:'var(--primary)'}}>
                  {formatDate(r.proxima_consulta)}
                  {r.hora_proxima_consulta&&<span style={{marginLeft:10,color:'var(--secondary)'}}>🕐 {r.hora_proxima_consulta.substring(0,5)}</span>}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: EXÁMENES ── */}
      {tab==='examenes' && (
        <div>
          {totalExamenes === 0 ? (
            <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>
              <div style={{fontSize:36,marginBottom:12}}>🧪</div>
              <div style={{fontFamily:'var(--font-display)',fontSize:15,fontWeight:600}}>Sin exámenes registrados en esta atención</div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:24}}>
              {[{tipo:'Laboratorio',emoji:'🧪',data:examLab},{tipo:'Imagenología',emoji:'🩻',data:examImg},{tipo:'Otro',emoji:'📋',data:examOtro}]
                .filter(g => g.data.length > 0)
                .map(g => (
                  <div key={g.tipo}>
                    <div style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:14,color:'var(--primary)',marginBottom:12,display:'flex',alignItems:'center',gap:6}}>
                      {g.emoji} {g.tipo}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:10}}>
                      {g.data.map((ex,i) => (
                        <div key={i} style={{border:'1.5px solid var(--border-light)',borderRadius:12,overflow:'hidden',boxShadow:'var(--shadow-sm)'}}>
                          {/* Header */}
                          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'8px 14px',background:'var(--primary)',borderBottom:'1px solid var(--border-light)'}}>
                            <span style={{fontWeight:700,fontSize:14,color:'white'}}>{ex.nombre_examen||'Sin nombre'}</span>
                            {ex.fecha_examen&&<span style={{fontSize:12,color:'rgba(255,255,255,0.8)'}}>📅 {formatDate(ex.fecha_examen)}</span>}
                          </div>
                          {/* Resultados y Observaciones */}
                          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',background:'white'}}>
                            <div style={{padding:'12px 14px',borderRight:'1px solid var(--border-light)'}}>
                              <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:6}}>📊 Resultados</div>
                              <div style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.6,whiteSpace:'pre-wrap'}}>
                                {ex.resultado || <span style={{color:'var(--border)',fontStyle:'italic'}}>Sin resultados</span>}
                              </div>
                            </div>
                            <div style={{padding:'12px 14px'}}>
                              <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.8px',marginBottom:6}}>💬 Observaciones</div>
                              <div style={{fontSize:13,color:'var(--text-secondary)',lineHeight:1.6,whiteSpace:'pre-wrap'}}>
                                {ex.observacion || <span style={{color:'var(--border)',fontStyle:'italic'}}>Sin observaciones</span>}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: TRATAMIENTO ── */}
      {tab==='tratamiento' && (
        <div>
          {(r.tratamientos||[]).length === 0 ? (
            <div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>
              <div style={{fontSize:36,marginBottom:12}}>💊</div>
              <div style={{fontSize:14,fontWeight:600}}>Sin tratamiento registrado</div>
            </div>
          ) : (
            <div style={{display:'flex',flexDirection:'column',gap:10}}>
              {r.tratamientos.map((t,i) => (
                <div key={t.id} style={{display:'grid',gridTemplateColumns:'2fr 1fr 3fr',gap:12,padding:'12px 16px',background: i%2===0?'white':'var(--surface-2)',borderRadius:8,border:'1px solid var(--border-light)',alignItems:'start'}}>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:4}}>Medicamento</div>
                    <div style={{fontSize:14,fontWeight:700,color:'var(--primary)'}}>{t.medicamento}</div>
                  </div>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:4}}>Cantidad</div>
                    <div style={{fontSize:13}}>{t.cantidad||'—'}</div>
                  </div>
                  <div>
                    <div style={{fontSize:10,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:4}}>Posología</div>
                    <div style={{fontSize:13,color:'var(--text-secondary)'}}>{t.posologia||'—'}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}


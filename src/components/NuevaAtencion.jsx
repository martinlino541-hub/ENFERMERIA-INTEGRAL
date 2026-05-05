import { useState, useRef, useEffect } from 'react'
import {
  User, Calendar, Heart, AlertTriangle,
  Users, Baby, FileText, Activity,
  Clipboard, Plus, Trash2, Save, CheckCircle,
  Search, Clock
} from 'lucide-react'
import { supabase } from '../supabaseClient'

/* ── Section component OUTSIDE main component ── */
function Section({ icon: Icon, title, subtitle, color = 'var(--primary)', children }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-icon" style={{ background: color }}>
          <Icon size={16} />
        </div>
        <div>
          <div className="card-header-title">{title}</div>
          {subtitle && <div className="card-header-sub">{subtitle}</div>}
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  )
}

/* ── CIE-10 codes ── */
const CIE10_LIST = [
  { code: 'Z00.0', name: 'Examen médico general' },
  { code: 'Z00.1', name: 'Examen de salud de rutina del niño' },
  { code: 'Z10.0', name: 'Examen médico ocupacional' },
  { code: 'J00', name: 'Rinofaringitis aguda (resfriado común)' },
  { code: 'J06.9', name: 'Infección aguda de vías respiratorias superiores' },
  { code: 'J45.9', name: 'Asma, no especificada' },
  { code: 'K21.0', name: 'Enfermedad por reflujo gastroesofágico con esofagitis' },
  { code: 'K29.7', name: 'Gastritis, no especificada' },
  { code: 'L23.9', name: 'Dermatitis alérgica de contacto, causa no especificada' },
  { code: 'M54.5', name: 'Lumbalgia (dolor lumbar)' },
  { code: 'M54.2', name: 'Cervicalgia' },
  { code: 'M79.1', name: 'Mialgia' },
  { code: 'G43.9', name: 'Migraña, no especificada' },
  { code: 'G44.2', name: 'Cefalea tensional' },
  { code: 'I10', name: 'Hipertensión esencial (primaria)' },
  { code: 'I25.1', name: 'Enfermedad aterosclerótica del corazón' },
  { code: 'E11.9', name: 'Diabetes mellitus tipo 2 sin complicaciones' },
  { code: 'E03.9', name: 'Hipotiroidismo, no especificado' },
  { code: 'E78.5', name: 'Hiperlipidemia, no especificada' },
  { code: 'F32.9', name: 'Episodio depresivo, no especificado' },
  { code: 'F41.1', name: 'Trastorno de ansiedad generalizada' },
  { code: 'F43.1', name: 'Trastorno de estrés postraumático' },
  { code: 'N39.0', name: 'Infección de vías urinarias, sitio no especificado' },
  { code: 'N92.0', name: 'Menstruación excesiva y frecuente con ciclo regular' },
  { code: 'S60.9', name: 'Traumatismo superficial de la muñeca y la mano' },
  { code: 'S80.9', name: 'Traumatismo superficial de la pierna' },
  { code: 'T14.0', name: 'Herida de región no especificada del cuerpo' },
  { code: 'W19', name: 'Caída no especificada' },
  { code: 'X50', name: 'Exceso de esfuerzo y movimientos extenuantes' },
  { code: 'Z57.0', name: 'Exposición ocupacional al ruido' },
  { code: 'Z57.1', name: 'Exposición ocupacional a la radiación' },
  { code: 'Z57.2', name: 'Exposición ocupacional al polvo' },
  { code: 'Z57.5', name: 'Exposición ocupacional a agentes tóxicos' },
  { code: 'Z57.7', name: 'Exposición ocupacional a vibraciones' },
  { code: 'T66', name: 'Efectos no especificados de la radiación' },
  { code: 'T67.0', name: 'Golpe de calor e insolación' },
  { code: 'T70.0', name: 'Barotrauma ótico' },
  { code: 'H83.3', name: 'Pérdida de audición por ruido' },
  { code: 'J60', name: 'Neumoconiosis de los trabajadores del carbón' },
  { code: 'J68.0', name: 'Bronquitis y neumonitis debida a vapores' },
]

function searchCIE10(query) {
  if (!query || query.length < 2) return []
  const q = query.toLowerCase()
  return CIE10_LIST.filter(
    c => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q)
  ).slice(0, 8)
}

/* ── CIE10 Search OUTSIDE main component ── */
function CIE10Search({ value, onChange, onSelect, placeholder }) {
  const [open, setOpen] = useState(false)
  const [results, setResults] = useState([])
  const ref = useRef()

  useEffect(() => {
    setResults(searchCIE10(value))
    setOpen(value.length >= 2)
  }, [value])

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div className="pos-relative" ref={ref}>
      <input className="form-input" value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder || 'Buscar diagnóstico...'}
        autoComplete="off" />
      {open && results.length > 0 && (
        <div className="cie10-dropdown">
          {results.map(r => (
            <div key={r.code} className="cie10-option"
              onMouseDown={() => { onSelect(r); setOpen(false) }}>
              <span className="cie10-code">{r.code}</span>
              <span className="cie10-name">{r.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const emptyDiag = () => ({ id: Date.now() + Math.random(), codigo: '', nombre: '', tipo: 'presuntivo' })
const emptyTrat = () => ({ id: Date.now() + Math.random(), medicamento: '', cantidad: '', posologia: '' })

export default function NuevaAtencion({ onSaved }) {
  const today = new Date().toISOString().split('T')[0]
  const [saving, setSaving] = useState(false)
  const [alert, setAlert] = useState(null)
  const [fecha, setFecha] = useState(today)
  const [generales, setGenerales] = useState({ nombres: '', apellidos: '', cedula: '', telefono: '', edad: '', sexo: '', ocupacion: '' })
  const [antecedentes, setAntecedentes] = useState({ patologicos: '', alergicos: '', quirurgicos: '', familiares: '', gestas: '', partos: '', cesareas: '', abortos: '', planificacion: '' })
  const [motivo, setMotivo] = useState('')
  const [vitales, setVitales] = useState({ pa: '', temperatura: '', saturacion: '', fr: '', consciencia: 'Alerta', peso: '', talla: '', perimetro: '' })
  const [evolucion, setEvolucion] = useState('')
  const [diagnosticos, setDiagnosticos] = useState([emptyDiag()])
  const [tratamientos, setTratamientos] = useState([emptyTrat()])
  const [seguimiento, setSeguimiento] = useState(false)
  const [proximaConsulta, setProximaConsulta] = useState('')

  const imc = (() => {
    const p = parseFloat(vitales.peso)
    const t = parseFloat(vitales.talla)
    if (p > 0 && t > 0) return (p / ((t / 100) ** 2)).toFixed(1)
    return ''
  })()

  const imcClass = (() => {
    const v = parseFloat(imc)
    if (!v) return ''
    if (v < 18.5) return 'Bajo peso'
    if (v < 25) return 'Normal'
    if (v < 30) return 'Sobrepeso'
    return 'Obesidad'
  })()

  const setGen = (k, v) => setGenerales(p => ({ ...p, [k]: v }))
  const setAnt = (k, v) => setAntecedentes(p => ({ ...p, [k]: v }))
  const setVit = (k, v) => setVitales(p => ({ ...p, [k]: v }))
  const addDiag = () => setDiagnosticos(d => [...d, emptyDiag()])
  const removeDiag = (id) => setDiagnosticos(d => d.filter(x => x.id !== id))
  const setDiagField = (id, k, v) => setDiagnosticos(d => d.map(x => x.id === id ? { ...x, [k]: v } : x))
  const addTrat = () => setTratamientos(t => [...t, emptyTrat()])
  const removeTrat = (id) => setTratamientos(t => t.filter(x => x.id !== id))
  const setTratField = (id, k, v) => setTratamientos(t => t.map(x => x.id === id ? { ...x, [k]: v } : x))

  const handleSave = async () => {
    if (!generales.nombres || !generales.apellidos) {
      setAlert({ type: 'error', msg: 'Por favor ingrese nombres y apellidos del paciente.' })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setSaving(true)
    setAlert(null)
    try {
      let pacienteId = null
      if (generales.cedula) {
        const { data: existing } = await supabase.from('pacientes').select('id').eq('cedula', generales.cedula).single()
        if (existing) {
          pacienteId = existing.id
          await supabase.from('pacientes').update({ nombres: generales.nombres, apellidos: generales.apellidos, telefono: generales.telefono, edad: parseInt(generales.edad) || null, sexo: generales.sexo, ocupacion: generales.ocupacion }).eq('id', pacienteId)
        }
      }
      if (!pacienteId) {
        const { data: newPac, error: pacErr } = await supabase.from('pacientes').insert({ nombres: generales.nombres, apellidos: generales.apellidos, cedula: generales.cedula || null, telefono: generales.telefono, edad: parseInt(generales.edad) || null, sexo: generales.sexo, ocupacion: generales.ocupacion }).select('id').single()
        if (pacErr) throw pacErr
        pacienteId = newPac.id
      }
      const { data: antExist } = await supabase.from('antecedentes').select('id').eq('paciente_id', pacienteId).single()
      const antData = { paciente_id: pacienteId, patologicos_personales: antecedentes.patologicos, alergicos: antecedentes.alergicos, quirurgicos: antecedentes.quirurgicos, patologicos_familiares: antecedentes.familiares, gestas: parseInt(antecedentes.gestas) || null, partos_vaginales: parseInt(antecedentes.partos) || null, cesareas: parseInt(antecedentes.cesareas) || null, abortos: parseInt(antecedentes.abortos) || null, metodo_planificacion: antecedentes.planificacion }
      if (antExist) { await supabase.from('antecedentes').update(antData).eq('id', antExist.id) } else { await supabase.from('antecedentes').insert(antData) }
      const { data: atencion, error: atErr } = await supabase.from('atenciones').insert({ paciente_id: pacienteId, fecha_atencion: fecha, motivo_consulta: motivo, presion_arterial: vitales.pa, temperatura: parseFloat(vitales.temperatura) || null, saturacion: parseFloat(vitales.saturacion) || null, frecuencia_respiratoria: parseInt(vitales.fr) || null, estado_consciencia: vitales.consciencia, peso: parseFloat(vitales.peso) || null, talla: parseFloat(vitales.talla) || null, imc: parseFloat(imc) || null, perimetro_abdominal: parseFloat(vitales.perimetro) || null, evolucion, requiere_seguimiento: seguimiento, proxima_consulta: seguimiento && proximaConsulta ? proximaConsulta : null }).select('id').single()
      if (atErr) throw atErr
      const diagsToSave = diagnosticos.filter(d => d.codigo || d.nombre)
      if (diagsToSave.length) { await supabase.from('diagnosticos').insert(diagsToSave.map(d => ({ atencion_id: atencion.id, codigo_cie10: d.codigo, nombre_cie10: d.nombre, tipo: d.tipo }))) }
      const tratsToSave = tratamientos.filter(t => t.medicamento)
      if (tratsToSave.length) { await supabase.from('tratamientos').insert(tratsToSave.map(t => ({ atencion_id: atencion.id, medicamento: t.medicamento, cantidad: t.cantidad, posologia: t.posologia }))) }
      setAlert({ type: 'success', msg: `✓ Atención guardada para ${generales.nombres} ${generales.apellidos}.` })
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setTimeout(() => onSaved(), 1200)
    } catch (err) {
      setAlert({ type: 'error', msg: `Error al guardar: ${err.message}` })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <div className="page-title">
          <Activity size={22} />
          Nueva Atención Médica
          <span className="page-title-badge">Ocupacional</span>
        </div>
        <div className="page-subtitle">Complete los datos del paciente y la atención médica</div>
      </div>

      {alert && (
        <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16 }}>
          {alert.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {alert.msg}
        </div>
      )}

      <div className="section-stack">
        <Section icon={Calendar} title="Fecha de Atención" subtitle="Registro de la consulta médica">
          <div className="form-grid form-grid-4">
            <div className="form-group">
              <label className="form-label required">Fecha de la atención</label>
              <input type="date" className="form-input" value={fecha} onChange={e => setFecha(e.target.value)} />
            </div>
          </div>
        </Section>

        <Section icon={User} title="Datos Generales del Paciente" subtitle="Información personal y de contacto">
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label required">Nombres</label>
              <input className="form-input" value={generales.nombres} onChange={e => setGen('nombres', e.target.value)} placeholder="Nombres del paciente" />
            </div>
            <div className="form-group">
              <label className="form-label required">Apellidos</label>
              <input className="form-input" value={generales.apellidos} onChange={e => setGen('apellidos', e.target.value)} placeholder="Apellidos del paciente" />
            </div>
            <div className="form-group">
              <label className="form-label">Número de Cédula</label>
              <input className="form-input" value={generales.cedula} onChange={e => setGen('cedula', e.target.value)} placeholder="0912345678" maxLength={13} />
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input className="form-input" value={generales.telefono} onChange={e => setGen('telefono', e.target.value)} placeholder="0991234567" />
            </div>
            <div className="form-group">
              <label className="form-label">Edad</label>
              <input type="number" className="form-input" value={generales.edad} onChange={e => setGen('edad', e.target.value)} placeholder="Años" min={0} max={120} />
            </div>
            <div className="form-group">
              <label className="form-label">Sexo</label>
              <select className="form-select" value={generales.sexo} onChange={e => setGen('sexo', e.target.value)}>
                <option value="">Seleccionar</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div className="form-group col-span-2">
              <label className="form-label">Ocupación</label>
              <input className="form-input" value={generales.ocupacion} onChange={e => setGen('ocupacion', e.target.value)} placeholder="Cargo o función del trabajador" />
            </div>
          </div>
        </Section>

        <Section icon={Heart} title="Antecedentes Personales" subtitle="Historial médico personal" color="#D69E2E">
          <div className="form-grid form-grid-3">
            <div className="form-group">
              <label className="form-label">Antecedentes Patológicos Personales</label>
              <textarea className="form-textarea" value={antecedentes.patologicos} onChange={e => setAnt('patologicos', e.target.value)} placeholder="HTA, DM2, asma, hipotiroidismo..." />
            </div>
            <div className="form-group">
              <label className="form-label">Antecedentes Alérgicos</label>
              <textarea className="form-textarea" value={antecedentes.alergicos} onChange={e => setAnt('alergicos', e.target.value)} placeholder="Alergias a medicamentos, alimentos..." />
            </div>
            <div className="form-group">
              <label className="form-label">Antecedentes Quirúrgicos</label>
              <textarea className="form-textarea" value={antecedentes.quirurgicos} onChange={e => setAnt('quirurgicos', e.target.value)} placeholder="Cirugías previas y año..." />
            </div>
          </div>
        </Section>

        <Section icon={Users} title="Antecedentes Patológicos Familiares" subtitle="Historial de enfermedades en familia directa" color="#744210">
          <div className="form-group">
            <label className="form-label">Antecedentes Patológicos Familiares</label>
            <textarea className="form-textarea" value={antecedentes.familiares} onChange={e => setAnt('familiares', e.target.value)} placeholder="Padre: HTA, Madre: DM2..." style={{ minHeight: 70 }} />
          </div>
        </Section>

        {(generales.sexo === 'Femenino' || generales.sexo === '') && (
          <Section icon={Baby} title="Antecedentes Ginecobstétricos" subtitle="Solo aplica para pacientes femeninas" color="#97266D">
            <div className="form-grid form-grid-5">
              <div className="form-group">
                <label className="form-label">Gestas</label>
                <input type="number" className="form-input" value={antecedentes.gestas} onChange={e => setAnt('gestas', e.target.value)} placeholder="0" min={0} />
              </div>
              <div className="form-group">
                <label className="form-label">Partos Vaginales</label>
                <input type="number" className="form-input" value={antecedentes.partos} onChange={e => setAnt('partos', e.target.value)} placeholder="0" min={0} />
              </div>
              <div className="form-group">
                <label className="form-label">Cesáreas</label>
                <input type="number" className="form-input" value={antecedentes.cesareas} onChange={e => setAnt('cesareas', e.target.value)} placeholder="0" min={0} />
              </div>
              <div className="form-group">
                <label className="form-label">Abortos</label>
                <input type="number" className="form-input" value={antecedentes.abortos} onChange={e => setAnt('abortos', e.target.value)} placeholder="0" min={0} />
              </div>
              <div className="form-group">
                <label className="form-label">Método de Planificación</label>
                <select className="form-select" value={antecedentes.planificacion} onChange={e => setAnt('planificacion', e.target.value)}>
                  <option value="">Ninguno</option>
                  <option value="ACO">ACO (Píldora)</option>
                  <option value="DIU">DIU</option>
                  <option value="Preservativo">Preservativo</option>
                  <option value="Implante">Implante</option>
                  <option value="Inyectable">Inyectable</option>
                  <option value="Ligadura">Ligadura de trompas</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>
          </Section>
        )}

        <Section icon={FileText} title="Motivo de Consulta" color="#2B6CB0">
          <div className="form-group">
            <label className="form-label required">Motivo de consulta</label>
            <textarea className="form-textarea" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Describa el motivo principal de la consulta..." style={{ minHeight: 80 }} />
          </div>
        </Section>

        <Section icon={Activity} title="Signos Vitales" subtitle="Parámetros fisiológicos del paciente" color="#2F855A">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px,1fr))', gap: 12 }}>
            {[
              { key: 'pa', label: 'Presión Arterial', unit: 'mmHg', placeholder: '120/80' },
              { key: 'temperatura', label: 'Temperatura', unit: '°C', placeholder: '36.5' },
              { key: 'saturacion', label: 'Saturación O₂', unit: '%', placeholder: '98' },
              { key: 'fr', label: 'Frec. Respiratoria', unit: 'rpm', placeholder: '18' },
              { key: 'peso', label: 'Peso', unit: 'kg', placeholder: '70' },
              { key: 'talla', label: 'Talla', unit: 'cm', placeholder: '170' },
              { key: 'perimetro', label: 'Perím. Abdominal', unit: 'cm', placeholder: '85' },
            ].map(({ key, label, unit, placeholder }) => (
              <div key={key} className="vital-card">
                <div className="vital-card-label">{label}</div>
                <input value={vitales[key]} onChange={e => setVit(key, e.target.value)} placeholder={placeholder} />
                <div className="vital-card-unit">{unit}</div>
              </div>
            ))}
            <div className="vital-card" style={{ background: 'var(--accent-soft)', borderColor: 'rgba(0,201,167,0.3)' }}>
              <div className="vital-card-label">IMC</div>
              <input value={imc || '—'} readOnly style={{ color: 'var(--accent)', cursor: 'default' }} />
              <div className="vital-card-unit">{imcClass || 'kg/m²'}</div>
            </div>
          </div>
          <div className="form-group mt-3">
            <label className="form-label">Estado de Consciencia</label>
            <div className="consciousness-grid mt-1">
              {['Alerta', 'Somnoliento', 'Obnubilación', 'Estupor', 'Coma'].map(c => (
                <button key={c} className={`consciousness-btn ${vitales.consciencia === c ? 'selected' : ''}`} onClick={() => setVit('consciencia', c)}>{c}</button>
              ))}
            </div>
          </div>
        </Section>

        <Section icon={Clipboard} title="Evolución del Paciente" subtitle="Descripción clínica y seguimiento" color="#553C9A">
          <div className="form-group">
            <label className="form-label">Evolución</label>
            <textarea className="form-textarea" value={evolucion} onChange={e => setEvolucion(e.target.value)} placeholder="Descripción de la evolución clínica, hallazgos al examen físico..." style={{ minHeight: 120 }} />
          </div>
        </Section>

        <Section icon={Search} title="Diagnóstico CIE-10" subtitle="Clasificación Internacional de Enfermedades" color="#2B6CB0">
          <div className="section-stack">
            {diagnosticos.map((diag) => (
              <div key={diag.id} className="diagnostico-row">
                <div className="form-group">
                  <input className="form-input" value={diag.codigo} onChange={e => setDiagField(diag.id, 'codigo', e.target.value.toUpperCase())} placeholder="J45.9" style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }} />
                </div>
                <div className="pos-relative">
                  <CIE10Search value={diag.nombre} onChange={v => setDiagField(diag.id, 'nombre', v)} onSelect={r => { setDiagField(diag.id, 'nombre', r.name); setDiagField(diag.id, 'codigo', r.code) }} placeholder="Nombre del diagnóstico..." />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <button className={`tipo-badge ${diag.tipo}`} onClick={() => setDiagField(diag.id, 'tipo', diag.tipo === 'definitivo' ? 'presuntivo' : 'definitivo')}>
                    {diag.tipo === 'definitivo' ? '● Definitivo' : '◌ Presuntivo'}
                  </button>
                </div>
                {diagnosticos.length > 1 && (
                  <button className="btn-danger-ghost" onClick={() => removeDiag(diag.id)}><Trash2 size={15} /></button>
                )}
              </div>
            ))}
            <button className="btn-add" onClick={addDiag}><Plus size={14} /> Agregar diagnóstico</button>
          </div>
        </Section>

        <Section icon={Heart} title="Tratamiento" subtitle="Medicamentos prescritos" color="#E53E3E">
          <div style={{ marginBottom: 8, display: 'grid', gridTemplateColumns: '1fr 100px 1fr 36px', gap: 8 }}>
            {['Medicamento', 'Cantidad', 'Posología', ''].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', paddingLeft: 12 }}>{h}</div>
            ))}
          </div>
          <div className="section-stack">
            {tratamientos.map((trat) => (
              <div key={trat.id} className="tratamiento-row">
                <input className="form-input" value={trat.medicamento} onChange={e => setTratField(trat.id, 'medicamento', e.target.value)} placeholder="Paracetamol 500mg" />
                <input className="form-input" value={trat.cantidad} onChange={e => setTratField(trat.id, 'cantidad', e.target.value)} placeholder="10 tab." />
                <input className="form-input" value={trat.posologia} onChange={e => setTratField(trat.id, 'posologia', e.target.value)} placeholder="1 tab. cada 8h por 3 días" />
                {tratamientos.length > 1 && (
                  <button className="btn-danger-ghost" onClick={() => removeTrat(trat.id)}><Trash2 size={15} /></button>
                )}
              </div>
            ))}
            <button className="btn-add" onClick={addTrat}><Plus size={14} /> Agregar medicamento</button>
          </div>
        </Section>

        <div className="seguimiento-panel">
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: 'var(--primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Clock size={16} /> Seguimiento del paciente
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>¿Requiere próxima consulta de seguimiento?</div>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={seguimiento} onChange={e => setSeguimiento(e.target.checked)} />
            <span className="toggle-slider" />
          </label>
          {seguimiento && (
            <div className="form-group" style={{ flex: 1, maxWidth: 240 }}>
              <label className="form-label">Fecha próxima consulta</label>
              <input type="date" className="form-input" value={proximaConsulta} onChange={e => setProximaConsulta(e.target.value)} min={today} />
            </div>
          )}
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn-save" onClick={handleSave} disabled={saving}>
              {saving ? <span className="loading-spinner" /> : <Save size={18} />}
              {saving ? 'Guardando...' : 'Guardar Atención'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

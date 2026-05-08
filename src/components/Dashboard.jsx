import { useState, useEffect, useCallback } from 'react'
import { BarChart2, TrendingUp, Users, Calendar, Activity, Heart, FileText, Filter, RefreshCw } from 'lucide-react'
import { supabase } from '../supabaseClient'

const MESES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
const MESES_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

/* ── Mini barra horizontal ── */
function BarraH({ label, value, max, color = 'var(--primary)', badge, total }) {
  const pct = max > 0 ? (value / max) * 100 : 0
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500, flex: 1, marginRight: 8 }}>
          {badge && <span style={{ background: '#EBF8FF', color: 'var(--primary)', fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 4, marginRight: 6, fontFamily: 'var(--font-display)' }}>{badge}</span>}
          {label}
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, color, fontFamily: 'var(--font-display)', minWidth: 30, textAlign: 'right' }}>{value}</div>
        {total && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>({((value/total)*100).toFixed(0)}%)</div>}
      </div>
      <div style={{ height: 7, background: 'var(--border-light)', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 4, transition: 'width 0.6s ease' }} />
      </div>
    </div>
  )
}

/* ── Tarjeta de stat grande ── */
function StatGrande({ icon: Icon, label, value, sub, color, bg, trend }) {
  return (
    <div style={{ background: 'white', border: '1px solid var(--border-light)', borderRadius: 14, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: 'var(--shadow-sm)' }}>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={24} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'var(--font-display)', color, lineHeight: 1 }}>{value}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>{sub}</div>}
      </div>
      {trend !== undefined && (
        <div style={{ fontSize: 12, fontWeight: 700, color: trend >= 0 ? '#2F855A' : '#C53030', background: trend >= 0 ? '#F0FFF4' : '#FFF5F5', padding: '4px 10px', borderRadius: 20 }}>
          {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
        </div>
      )}
    </div>
  )
}

/* ── Gráfico de barras verticales simple ── */
function BarrasV({ datos, color = 'var(--primary)', height = 120 }) {
  const max = Math.max(...datos.map(d => d.v), 1)
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height, paddingTop: 8 }}>
      {datos.map((d, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', fontWeight: 600 }}>{d.v > 0 ? d.v : ''}</div>
          <div style={{ width: '100%', background: 'var(--border-light)', borderRadius: '4px 4px 0 0', height: height - 28, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{
              width: '100%', background: color, borderRadius: '4px 4px 0 0',
              height: `${(d.v / max) * 100}%`, minHeight: d.v > 0 ? 4 : 0,
              transition: 'height 0.5s ease'
            }} />
          </div>
          <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', whiteSpace: 'nowrap' }}>{d.l}</div>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [periodo, setPeriodo] = useState('mes') // 'semana' | 'mes' | 'anio' | 'todo'
  const [datos, setDatos] = useState(null)

  const calcularFechaDesde = (p) => {
    const hoy = new Date()
    if (p === 'semana') { const d = new Date(hoy); d.setDate(hoy.getDate() - 7); return d.toISOString().split('T')[0] }
    if (p === 'mes') { const d = new Date(hoy); d.setMonth(hoy.getMonth() - 1); return d.toISOString().split('T')[0] }
    if (p === 'anio') { const d = new Date(hoy); d.setFullYear(hoy.getFullYear() - 1); return d.toISOString().split('T')[0] }
    return null
  }

  const fetchDatos = useCallback(async () => {
    setLoading(true)
    try {
      const desde = calcularFechaDesde(periodo)

      let q = supabase.from('atenciones').select(`
        id, fecha_atencion, motivo_consulta, evolucion,
        pacientes ( id, nombres, apellidos, edad, sexo, fecha_nacimiento ),
        diagnosticos ( codigo_cie10, nombre_cie10, tipo ),
        tratamientos ( medicamento )
      `)
      if (desde) q = q.gte('fecha_atencion', desde)
      q = q.order('fecha_atencion', { ascending: true })

      const { data: atenciones } = await q

      if (!atenciones) { setLoading(false); return }

      const hoy = new Date()

      // ── Totales generales ──
      const totalAtenciones = atenciones.length
      const pacientesUnicos = new Set(atenciones.map(a => a.pacientes?.id).filter(Boolean)).size

      // ── Por sexo ──
      const porSexo = { Masculino: 0, Femenino: 0, Otro: 0, 'No especificado': 0 }
      atenciones.forEach(a => {
        const s = a.pacientes?.sexo || 'No especificado'
        porSexo[s] = (porSexo[s] || 0) + 1
      })

      // ── Por grupos de edad ──
      const gruposEdad = { 'Niños (0-12)': 0, 'Adolescentes (13-17)': 0, 'Adultos jóvenes (18-35)': 0, 'Adultos (36-59)': 0, 'Adultos mayores (60+)': 0, 'Sin dato': 0 }
      atenciones.forEach(a => {
        const edad = a.pacientes?.edad
        if (!edad) { gruposEdad['Sin dato']++; return }
        if (edad <= 12) gruposEdad['Niños (0-12)']++
        else if (edad <= 17) gruposEdad['Adolescentes (13-17)']++
        else if (edad <= 35) gruposEdad['Adultos jóvenes (18-35)']++
        else if (edad <= 59) gruposEdad['Adultos (36-59)']++
        else gruposEdad['Adultos mayores (60+)']++
      })

      // ── Diagnósticos más frecuentes ──
      const diagCount = {}
      atenciones.forEach(a => {
        (a.diagnosticos || []).forEach(d => {
          if (!d.codigo_cie10) return
          const key = `${d.codigo_cie10}|${d.nombre_cie10}`
          diagCount[key] = (diagCount[key] || 0) + 1
        })
      })
      const topDiags = Object.entries(diagCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([k, v]) => { const [code, name] = k.split('|'); return { code, name, v } })

      // ── Medicamentos más recetados ──
      const medCount = {}
      atenciones.forEach(a => {
        (a.tratamientos || []).forEach(t => {
          if (!t.medicamento) return
          // Tomar solo el nombre base (antes del primer espacio + número)
          const base = t.medicamento.split(/\s\d/)[0].trim()
          medCount[base] = (medCount[base] || 0) + 1
        })
      })
      const topMeds = Object.entries(medCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([name, v]) => ({ name, v }))

      // ── Atenciones por día de la semana ──
      const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
      const porDia = [0, 0, 0, 0, 0, 0, 0]
      atenciones.forEach(a => {
        const d = new Date(a.fecha_atencion + 'T00:00:00')
        porDia[d.getDay()]++
      })

      // ── Atenciones por mes (últimos 6 meses) ──
      const porMes = {}
      for (let i = 5; i >= 0; i--) {
        const d = new Date(hoy.getFullYear(), hoy.getMonth() - i, 1)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        porMes[key] = { l: MESES[d.getMonth()], v: 0 }
      }
      atenciones.forEach(a => {
        const key = a.fecha_atencion?.substring(0, 7)
        if (porMes[key]) porMes[key].v++
      })

      // ── Atenciones hoy ──
      const hoyStr = hoy.toISOString().split('T')[0]
      const atencionesHoy = atenciones.filter(a => a.fecha_atencion === hoyStr).length

      // ── % con diagnóstico ──
      const conDiag = atenciones.filter(a => (a.diagnosticos || []).length > 0).length
      const pctDiag = totalAtenciones > 0 ? Math.round((conDiag / totalAtenciones) * 100) : 0

      // ── % con tratamiento ──
      const conTrat = atenciones.filter(a => (a.tratamientos || []).length > 0).length
      const pctTrat = totalAtenciones > 0 ? Math.round((conTrat / totalAtenciones) * 100) : 0

      // ── Promedio de edad ──
      const edades = atenciones.map(a => a.pacientes?.edad).filter(Boolean)
      const promedioEdad = edades.length > 0 ? Math.round(edades.reduce((a, b) => a + b, 0) / edades.length) : null

      setDatos({
        totalAtenciones, pacientesUnicos, atencionesHoy,
        pctDiag, pctTrat, promedioEdad,
        porSexo, gruposEdad, topDiags, topMeds,
        porDia: diasSemana.map((l, i) => ({ l, v: porDia[i] })),
        porMes: Object.values(porMes),
      })
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [periodo])

  useEffect(() => { fetchDatos() }, [fetchDatos])

  const periodos = [
    { id: 'semana', label: 'Última semana' },
    { id: 'mes', label: 'Último mes' },
    { id: 'anio', label: 'Último año' },
    { id: 'todo', label: 'Todo el historial' },
  ]

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80 }}>
      <div className="loading-spinner" style={{ borderTopColor: 'var(--primary)', borderColor: 'var(--border)', width: 32, height: 32, margin: '0 auto 16px' }} />
      <div style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-display)' }}>Calculando estadísticas...</div>
    </div>
  )

  if (!datos) return null

  const maxDiag = datos.topDiags[0]?.v || 1
  const maxMed = datos.topMeds[0]?.v || 1
  const maxEdad = Math.max(...Object.values(datos.gruposEdad), 1)

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-title"><BarChart2 size={22} />Dashboard Estadístico<span className="page-title-badge">Clínico</span></div>
          <div className="page-subtitle">Indicadores de atención médica espontánea · {periodos.find(p => p.id === periodo)?.label}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <Filter size={14} color="var(--text-muted)" />
          {periodos.map(p => (
            <button key={p.id} onClick={() => setPeriodo(p.id)}
              style={{
                padding: '6px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
                fontFamily: 'var(--font-body)', fontSize: 12, fontWeight: 600,
                background: periodo === p.id ? 'var(--primary)' : 'var(--surface)',
                color: periodo === p.id ? 'white' : 'var(--text-secondary)',
                border: `1.5px solid ${periodo === p.id ? 'var(--primary)' : 'var(--border)'}`,
                transition: 'all 0.2s'
              }}>
              {p.label}
            </button>
          ))}
          <button onClick={fetchDatos} style={{ padding: '6px 10px', border: '1.5px solid var(--border)', borderRadius: 8, background: 'white', cursor: 'pointer', color: 'var(--text-muted)' }}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Stats principales */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        <StatGrande icon={Activity} label="Total atenciones" value={datos.totalAtenciones} sub={`${datos.atencionesHoy} hoy`} color="#0B4F71" bg="#EBF8FF" />
        <StatGrande icon={Users} label="Pacientes únicos" value={datos.pacientesUnicos} sub="Pacientes distintos" color="#553C9A" bg="#FAF5FF" />
        <StatGrande icon={FileText} label="Con diagnóstico CIE-10" value={`${datos.pctDiag}%`} sub={`${datos.pctTrat}% con tratamiento`} color="#2F855A" bg="#F0FFF4" />
        <StatGrande icon={Heart} label="Promedio de edad" value={datos.promedioEdad ? `${datos.promedioEdad} a` : '—'} sub="De los pacientes atendidos" color="#C53030" bg="#FFF5F5" />
      </div>

      {/* Fila 1: Diagnósticos + Sexo */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Top diagnósticos */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon" style={{ background: '#2B6CB0' }}><FileText size={16} /></div>
            <div>
              <div className="card-header-title">Top 10 Diagnósticos CIE-10</div>
              <div className="card-header-sub">Diagnósticos más frecuentes en el período</div>
            </div>
          </div>
          <div className="card-body">
            {datos.topDiags.length === 0
              ? <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 13 }}>Sin diagnósticos registrados en este período</div>
              : datos.topDiags.map((d, i) => (
                <BarraH key={i} label={d.name || 'Sin nombre'} badge={d.code}
                  value={d.v} max={maxDiag} total={datos.totalAtenciones}
                  color={i === 0 ? 'var(--primary)' : i < 3 ? 'var(--secondary)' : '#90CDF4'} />
              ))
            }
          </div>
        </div>

        {/* Distribución por sexo */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon" style={{ background: '#97266D' }}><Users size={16} /></div>
            <div>
              <div className="card-header-title">Distribución por Sexo</div>
              <div className="card-header-sub">Pacientes atendidos</div>
            </div>
          </div>
          <div className="card-body">
            {[
              { k: 'Masculino', color: '#3182CE', emoji: '♂' },
              { k: 'Femenino', color: '#D53F8C', emoji: '♀' },
              { k: 'Otro', color: '#805AD5', emoji: '⚧' },
              { k: 'No especificado', color: '#718096', emoji: '?' },
            ].filter(s => datos.porSexo[s.k] > 0).map(s => (
              <div key={s.k} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{s.emoji} {s.k}</span>
                  <span style={{ fontSize: 18, fontWeight: 800, fontFamily: 'var(--font-display)', color: s.color }}>{datos.porSexo[s.k]}</span>
                </div>
                <div style={{ height: 10, background: 'var(--border-light)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${(datos.porSexo[s.k] / datos.totalAtenciones) * 100}%`, background: s.color, borderRadius: 5, transition: 'width 0.6s' }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                  {((datos.porSexo[s.k] / datos.totalAtenciones) * 100).toFixed(1)}% del total
                </div>
              </div>
            ))}
            {datos.totalAtenciones === 0 && <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 13 }}>Sin datos</div>}
          </div>
        </div>
      </div>

      {/* Fila 2: Atenciones por mes + Día de la semana */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>

        {/* Por mes */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon" style={{ background: '#2F855A' }}><TrendingUp size={16} /></div>
            <div>
              <div className="card-header-title">Atenciones por Mes</div>
              <div className="card-header-sub">Últimos 6 meses</div>
            </div>
          </div>
          <div className="card-body">
            <BarrasV datos={datos.porMes} color="var(--primary)" height={130} />
          </div>
        </div>

        {/* Por día de semana */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon" style={{ background: '#D69E2E' }}><Calendar size={16} /></div>
            <div>
              <div className="card-header-title">Atenciones por Día</div>
              <div className="card-header-sub">Distribución semanal</div>
            </div>
          </div>
          <div className="card-body">
            <BarrasV datos={datos.porDia} color="var(--accent)" height={130} />
          </div>
        </div>
      </div>

      {/* Fila 3: Grupos de edad + Medicamentos */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Grupos de edad */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon" style={{ background: '#553C9A' }}><Users size={16} /></div>
            <div>
              <div className="card-header-title">Grupos Etáreos</div>
              <div className="card-header-sub">Distribución por edad de los pacientes</div>
            </div>
          </div>
          <div className="card-body">
            {Object.entries(datos.gruposEdad)
              .filter(([, v]) => v > 0)
              .sort((a, b) => b[1] - a[1])
              .map(([label, value], i) => (
                <BarraH key={i} label={label} value={value}
                  max={maxEdad} total={datos.totalAtenciones}
                  color={['#553C9A', '#805AD5', '#B794F4', '#6B46C1', '#44337A', '#322659'][i] || '#553C9A'} />
              ))}
            {Object.values(datos.gruposEdad).every(v => v === 0) &&
              <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 13 }}>Sin datos de edad registrados</div>}
          </div>
        </div>

        {/* Medicamentos más recetados */}
        <div className="card">
          <div className="card-header">
            <div className="card-header-icon" style={{ background: '#C53030' }}><Heart size={16} /></div>
            <div>
              <div className="card-header-title">Medicamentos más Recetados</div>
              <div className="card-header-sub">Fármacos prescritos con mayor frecuencia</div>
            </div>
          </div>
          <div className="card-body">
            {datos.topMeds.length === 0
              ? <div style={{ textAlign: 'center', padding: 30, color: 'var(--text-muted)', fontSize: 13 }}>Sin tratamientos registrados en este período</div>
              : datos.topMeds.map((m, i) => (
                <BarraH key={i} label={m.name} value={m.v}
                  max={maxMed} total={datos.totalAtenciones}
                  color={i === 0 ? '#C53030' : i < 3 ? '#E53E3E' : '#FC8181'} />
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

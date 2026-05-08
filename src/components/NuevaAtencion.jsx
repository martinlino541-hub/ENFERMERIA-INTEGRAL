import { useState, useRef, useEffect } from 'react'
import { User, Calendar, Heart, AlertTriangle, Users, Baby, FileText, Activity, Clipboard, Plus, Trash2, Save, CheckCircle, Search, Clock, Eye } from 'lucide-react'
import { supabase } from '../supabaseClient'

function Section({ icon: Icon, title, subtitle, color = 'var(--primary)', children }) {
  return (
    <div className="card">
      <div className="card-header">
        <div className="card-header-icon" style={{ background: color }}><Icon size={16} /></div>
        <div>
          <div className="card-header-title">{title}</div>
          {subtitle && <div className="card-header-sub">{subtitle}</div>}
        </div>
      </div>
      <div className="card-body">{children}</div>
    </div>
  )
}

const CIE10_LIST = [
  {code:'Z00.0',name:'Examen médico general'},{code:'Z10.0',name:'Examen médico ocupacional'},
  {code:'J00',name:'Rinofaringitis aguda (resfriado común)'},{code:'J06.9',name:'Infección aguda vías respiratorias superiores'},
  {code:'J45.9',name:'Asma, no especificada'},{code:'J20.9',name:'Bronquitis aguda, no especificada'},
  {code:'J18.9',name:'Neumonía, no especificada'},{code:'J30.4',name:'Rinitis alérgica, no especificada'},
  {code:'K21.0',name:'Reflujo gastroesofágico con esofagitis'},{code:'K29.7',name:'Gastritis, no especificada'},
  {code:'L23.9',name:'Dermatitis alérgica de contacto'},{code:'L50.0',name:'Urticaria alérgica'},
  {code:'M54.5',name:'Lumbalgia (dolor lumbar)'},{code:'M54.2',name:'Cervicalgia'},
  {code:'M54.4',name:'Lumbago con ciática'},{code:'M79.1',name:'Mialgia'},
  {code:'M75.1',name:'Síndrome del manguito rotador'},{code:'M77.1',name:'Epicondilitis lateral (codo de tenista)'},
  {code:'G43.9',name:'Migraña, no especificada'},{code:'G44.2',name:'Cefalea tensional'},
  {code:'I10',name:'Hipertensión esencial (primaria)'},{code:'I25.1',name:'Enfermedad aterosclerótica del corazón'},
  {code:'I20.9',name:'Angina de pecho, no especificada'},{code:'I50.9',name:'Insuficiencia cardíaca, no especificada'},
  {code:'E11.9',name:'Diabetes mellitus tipo 2 sin complicaciones'},{code:'E03.9',name:'Hipotiroidismo, no especificado'},
  {code:'E05.9',name:'Hipertiroidismo, no especificado'},{code:'E78.5',name:'Hiperlipidemia, no especificada'},
  {code:'E66.9',name:'Obesidad, no especificada'},{code:'F32.9',name:'Episodio depresivo, no especificado'},
  {code:'F41.1',name:'Trastorno de ansiedad generalizada'},{code:'F43.1',name:'Trastorno de estrés postraumático'},
  {code:'F51.0',name:'Insomnio no orgánico'},{code:'N39.0',name:'Infección de vías urinarias'},
  {code:'N92.0',name:'Menstruación excesiva y frecuente'},{code:'N18.9',name:'Enfermedad renal crónica, no especificada'},
  {code:'S60.9',name:'Traumatismo superficial muñeca y mano'},{code:'S80.9',name:'Traumatismo superficial pierna'},
  {code:'T14.0',name:'Herida de región no especificada'},{code:'W19',name:'Caída no especificada'},
  {code:'X50',name:'Exceso de esfuerzo y movimientos extenuantes'},{code:'Z57.0',name:'Exposición ocupacional al ruido'},
  {code:'Z57.2',name:'Exposición ocupacional al polvo'},{code:'Z57.5',name:'Exposición ocupacional a agentes tóxicos'},
  {code:'Z57.7',name:'Exposición ocupacional a vibraciones'},{code:'T67.0',name:'Golpe de calor e insolación'},
  {code:'H83.3',name:'Pérdida de audición por ruido'},{code:'H10.9',name:'Conjuntivitis, no especificada'},
  {code:'J60',name:'Neumoconiosis de los trabajadores del carbón'},{code:'A09',name:'Diarrea y gastroenteritis de presunto origen infeccioso'},
  {code:'R51',name:'Cefalea'},{code:'R05',name:'Tos'},{code:'R07.9',name:'Dolor torácico, no especificado'},
  {code:'R10.4',name:'Otros dolores abdominales'},{code:'R50.9',name:'Fiebre, no especificada'},
  {code:'R11',name:'Náusea y vómitos'},{code:'R42',name:'Mareo y desvanecimiento'},{code:'R53',name:'Malestar y fatiga'},
]

const FARMACOS = [
  {name:'Paracetamol',p:['500 mg tabletas','1000 mg tabletas','160 mg/5ml jarabe','250 mg/5ml jarabe','150 mg/ml gotas','125 mg supositorio']},
  {name:'Ibuprofeno',p:['200 mg tabletas','400 mg tabletas','600 mg tabletas','800 mg tabletas','100 mg/5ml suspensión','40 mg/ml gotas']},
  {name:'Naproxeno',p:['250 mg tabletas','500 mg tabletas','550 mg tabletas']},
  {name:'Diclofenaco',p:['50 mg tabletas','75 mg tabletas','100 mg cápsulas retard','75 mg/3ml inyectable','1% gel tópico']},
  {name:'Ketorolaco',p:['10 mg tabletas','30 mg/ml inyectable']},
  {name:'Metamizol (Dipirona)',p:['500 mg tabletas','1 g tabletas','500 mg/ml inyectable','500 mg/5ml jarabe']},
  {name:'Tramadol',p:['50 mg cápsulas','100 mg tabletas retard','100 mg/2ml inyectable','100 mg/ml gotas']},
  {name:'Prednisona',p:['5 mg tabletas','20 mg tabletas','50 mg tabletas']},
  {name:'Dexametasona',p:['0.5 mg tabletas','4 mg/ml inyectable','0.1% crema']},
  {name:'Metilprednisolona',p:['4 mg tabletas','16 mg tabletas','40 mg inyectable','125 mg inyectable']},
  {name:'Amoxicilina',p:['500 mg cápsulas','875 mg tabletas','125 mg/5ml suspensión','250 mg/5ml suspensión']},
  {name:'Amoxicilina + Ác. Clavulánico',p:['500/125 mg tabletas','875/125 mg tabletas','250/62.5 mg/5ml suspensión']},
  {name:'Azitromicina',p:['250 mg tabletas','500 mg tabletas','200 mg/5ml suspensión']},
  {name:'Claritromicina',p:['250 mg tabletas','500 mg tabletas','125 mg/5ml suspensión']},
  {name:'Ciprofloxacino',p:['250 mg tabletas','500 mg tabletas','750 mg tabletas','200 mg/100ml infusión IV']},
  {name:'Levofloxacino',p:['250 mg tabletas','500 mg tabletas','750 mg tabletas']},
  {name:'Metronidazol',p:['250 mg tabletas','500 mg tabletas','125 mg/5ml suspensión','500 mg/100ml infusión']},
  {name:'Omeprazol',p:['10 mg cápsulas','20 mg cápsulas','40 mg cápsulas','20 mg polvo inyectable']},
  {name:'Pantoprazol',p:['20 mg tabletas','40 mg tabletas','40 mg inyectable']},
  {name:'Metoclopramida',p:['10 mg tabletas','5 mg/5ml jarabe','10 mg/2ml inyectable']},
  {name:'Ondansetrón',p:['4 mg tabletas','8 mg tabletas','4 mg/2ml inyectable','4 mg/5ml solución']},
  {name:'Loperamida',p:['2 mg tabletas','2 mg/5ml solución']},
  {name:'Losartán',p:['25 mg tabletas','50 mg tabletas','100 mg tabletas']},
  {name:'Enalapril',p:['5 mg tabletas','10 mg tabletas','20 mg tabletas']},
  {name:'Amlodipino',p:['5 mg tabletas','10 mg tabletas']},
  {name:'Atenolol',p:['25 mg tabletas','50 mg tabletas','100 mg tabletas']},
  {name:'Furosemida',p:['20 mg tabletas','40 mg tabletas','10 mg/ml inyectable']},
  {name:'Hidroclorotiazida',p:['12.5 mg tabletas','25 mg tabletas','50 mg tabletas']},
  {name:'Aspirina',p:['81 mg tabletas (cardio)','100 mg tabletas','325 mg tabletas','500 mg tabletas']},
  {name:'Metformina',p:['500 mg tabletas','850 mg tabletas','1000 mg tabletas']},
  {name:'Glibenclamida',p:['2.5 mg tabletas','5 mg tabletas']},
  {name:'Glimepirida',p:['1 mg tabletas','2 mg tabletas','4 mg tabletas']},
  {name:'Insulina NPH',p:['100 UI/ml vial 10ml','100 UI/ml cartucho 3ml']},
  {name:'Insulina Regular',p:['100 UI/ml vial 10ml','100 UI/ml cartucho 3ml']},
  {name:'Salbutamol',p:['100 mcg/dosis inhalador','2 mg tabletas','5 mg/5ml jarabe','0.083% solución nebulización']},
  {name:'Budesonida',p:['100 mcg/dosis inhalador','200 mcg/dosis inhalador','0.25 mg/2ml nebulización']},
  {name:'Montelukast',p:['4 mg tabletas masticables','5 mg tabletas masticables','10 mg tabletas']},
  {name:'Loratadina',p:['10 mg tabletas','5 mg/5ml jarabe','1 mg/ml solución']},
  {name:'Cetirizina',p:['10 mg tabletas','5 mg/5ml jarabe']},
  {name:'Fexofenadina',p:['60 mg tabletas','120 mg tabletas','180 mg tabletas']},
  {name:'Ambroxol',p:['30 mg tabletas','15 mg/5ml jarabe','7.5 mg/ml gotas']},
  {name:'Acetilcisteína',p:['200 mg sobres','600 mg sobres','100 mg/5ml jarabe']},
  {name:'Diazepam',p:['2 mg tabletas','5 mg tabletas','10 mg tabletas','10 mg/2ml inyectable']},
  {name:'Clonazepam',p:['0.25 mg tabletas','0.5 mg tabletas','1 mg tabletas','2 mg tabletas']},
  {name:'Alprazolam',p:['0.25 mg tabletas','0.5 mg tabletas','1 mg tabletas']},
  {name:'Fluoxetina',p:['10 mg cápsulas','20 mg cápsulas']},
  {name:'Sertralina',p:['25 mg tabletas','50 mg tabletas','100 mg tabletas']},
  {name:'Escitalopram',p:['5 mg tabletas','10 mg tabletas','20 mg tabletas']},
  {name:'Gabapentina',p:['100 mg cápsulas','300 mg cápsulas','400 mg cápsulas','600 mg tabletas']},
  {name:'Pregabalina',p:['75 mg cápsulas','150 mg cápsulas','300 mg cápsulas']},
  {name:'Vitamina C',p:['500 mg tabletas','1000 mg tabletas','500 mg/5ml jarabe']},
  {name:'Vitamina B complejo',p:['Tabletas','Cápsulas','100 mg/2ml inyectable']},
  {name:'Vitamina D3',p:['400 UI tabletas','1000 UI tabletas','5000 UI tabletas','800 UI/ml gotas']},
  {name:'Hierro ferroso',p:['200 mg tabletas','25 mg/ml gotas','125 mg/5ml jarabe']},
  {name:'Calcio carbonato',p:['500 mg tabletas','1000 mg tabletas','600 mg + Vit D tabletas']},
  {name:'Ácido fólico',p:['1 mg tabletas','5 mg tabletas']},
  {name:'Levotiroxina',p:['25 mcg tabletas','50 mcg tabletas','75 mcg tabletas','100 mcg tabletas','125 mcg tabletas','150 mcg tabletas']},
  {name:'Clotrimazol',p:['1% crema tópica','1% solución','100 mg óvulos vaginales','500 mg óvulo vaginal']},
  {name:'Aciclovir',p:['200 mg tabletas','400 mg tabletas','800 mg tabletas','5% crema tópica']},
]

const EF_SECTIONS = [
  {key:'piel',label:'1 Piel',items:[{key:'cicatrices',label:'a. Cicatrices'},{key:'faneras',label:'b. Piel y Faneras'}]},
  {key:'ojos',label:'2 Ojos',items:[{key:'parpados',label:'a. Párpados'},{key:'conjuntivas',label:'b. Conjuntivas'},{key:'pupilas',label:'c. Pupilas'},{key:'cornea',label:'d. Córnea'},{key:'motilidad',label:'e. Motilidad'}]},
  {key:'oido',label:'3 Oído',items:[{key:'cae',label:'a. C. auditivo externo'},{key:'pabellon',label:'b. Pabellón'},{key:'timpanos',label:'c. Tímpanos'}]},
  {key:'oro',label:'4 Orofaringe',items:[{key:'labios',label:'a. Labios'},{key:'lengua',label:'b. Lengua'},{key:'faringe',label:'c. Faringe'},{key:'amigdalas',label:'d. Amígdalas'},{key:'dentadura',label:'e. Dentadura'}]},
  {key:'nariz',label:'5 Nariz',items:[{key:'tabique',label:'a. Tabique'},{key:'cornetes',label:'b. Cornetes'},{key:'mucosas',label:'c. Mucosas'},{key:'senos',label:'d. Senos paranasales'}]},
  {key:'cuello',label:'6 Cuello',items:[{key:'tiroides',label:'a. Tiroides / masas'},{key:'movilidad',label:'b. Movilidad'}]},
  {key:'torax',label:'7 Tórax',items:[{key:'mamas',label:'a. Mamas'},{key:'corazon',label:'b. Corazón'}]},
  {key:'pulm',label:'8 Tórax/Pulm.',items:[{key:'pulmones',label:'a. Pulmones'},{key:'corazon',label:'b. Corazón'},{key:'parrilla',label:'c. Parrilla costal'}]},
  {key:'abd',label:'9 Abdomen',items:[{key:'visceras',label:'a. Vísceras'},{key:'pared',label:'b. Pared abdominal'}]},
  {key:'col',label:'10 Columna',items:[{key:'flexibilidad',label:'a. Flexibilidad'},{key:'desviacion',label:'b. Desviación'},{key:'dolor',label:'c. Dolor'}]},
  {key:'pelvis',label:'11 Pelvis',items:[{key:'pelvis',label:'a. Pelvis'},{key:'genitales',label:'b. Genitales'}]},
  {key:'ext',label:'12 Extremidades',items:[{key:'vascular',label:'a. Vascular'},{key:'superiores',label:'b. Miembros superiores'},{key:'inferiores',label:'c. Miembros inferiores'}]},
  {key:'neuro',label:'13 Neurológico',items:[{key:'fuerza',label:'a. Fuerza'},{key:'sensibilidad',label:'b. Sensibilidad'},{key:'marcha',label:'c. Marcha'},{key:'reflejos',label:'d. Reflejos osteotendinosos'}]},
]

function searchFarmaco(q){if(!q||q.length<2)return[];const ql=q.toLowerCase();const r=[];FARMACOS.forEach(f=>{if(f.name.toLowerCase().includes(ql)){f.p.forEach(p=>{r.push({name:f.name,presentation:p,full:`${f.name} ${p}`})})}});return r.slice(0,12)}

function Dropdown({items,onSelect,renderItem,loading}){
  return(
    <div className="cie10-dropdown">
      {loading&&<div style={{padding:'10px 14px',fontSize:12,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:8}}><span className="loading-spinner" style={{borderTopColor:'var(--primary)',borderColor:'var(--border)',width:12,height:12}}/>Buscando...</div>}
      {!loading&&items.map((r,i)=>(<div key={i} className="cie10-option" onMouseDown={()=>onSelect(r)}>{renderItem(r)}</div>))}
    </div>
  )
}

function CIE10Search({value,onChange,onSelect}){
  const[open,setOpen]=useState(false)
  const[results,setResults]=useState([])
  const[loading,setLoading]=useState(false)
  const ref=useRef()
  const timerRef=useRef()

  useEffect(()=>{
    if(value.length<2){setResults([]);setOpen(false);return}
    setOpen(true)
    clearTimeout(timerRef.current)
    timerRef.current=setTimeout(async()=>{
      setLoading(true)
      try{
        // API oficial NIH/NLM — base completa CIE-10-CM (70,000+ códigos)
        const url=`https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search?sf=code,name&terms=${encodeURIComponent(value)}&maxList=12`
        const res=await fetch(url)
        const data=await res.json()
        // data[3] = array de [code, description]
        if(data&&data[3]){
          setResults(data[3].map(([code,name])=>({code,name})))
        }
      }catch(e){
        // Fallback a lista local si falla la API
        const ql=value.toLowerCase()
        setResults(CIE10_LIST.filter(c=>c.code.toLowerCase().includes(ql)||c.name.toLowerCase().includes(ql)).slice(0,10))
      }finally{setLoading(false)}
    },350)
    return()=>clearTimeout(timerRef.current)
  },[value])

  useEffect(()=>{
    const h=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)}
    document.addEventListener('mousedown',h)
    return()=>document.removeEventListener('mousedown',h)
  },[])

  return(
    <div className="pos-relative" ref={ref}>
      <input className="form-input" value={value} onChange={e=>onChange(e.target.value)}
        placeholder="Buscar código o diagnóstico CIE-10..." autoComplete="off"/>
      {open&&(loading||results.length>0)&&(
        <Dropdown items={results} loading={loading}
          onSelect={r=>{onSelect(r);setOpen(false)}}
          renderItem={r=><><span className="cie10-code">{r.code}</span><span className="cie10-name">{r.name}</span></>}/>
      )}
    </div>
  )
}

function FarmacoSearch({value,onChange,onSelect}){
  const[open,setOpen]=useState(false);const[results,setResults]=useState([]);const ref=useRef()
  useEffect(()=>{setResults(searchFarmaco(value));setOpen(value.length>=2)},[value])
  useEffect(()=>{const h=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h)},[])
  return(<div className="pos-relative" ref={ref}><input className="form-input" value={value} onChange={e=>onChange(e.target.value)} placeholder="Buscar medicamento..." autoComplete="off"/>{open&&results.length>0&&<Dropdown items={results} onSelect={r=>{onSelect(r);setOpen(false)}} renderItem={r=><><span className="cie10-code" style={{minWidth:160}}>{r.name}</span><span className="cie10-name">{r.presentation}</span></>}/>}</div>)
}

function ExamenFisicoRegional({value,onChange}){
  const toggle=(sk,ik)=>onChange({...value,[`${sk}_${ik}`]:!value[`${sk}_${ik}`]})
  const setObs=(sk,ik,v)=>onChange({...value,[`${sk}_${ik}_obs`]:v})
  return(
    <div>
      <div style={{padding:'8px 14px',background:'var(--surface-2)',borderRadius:8,marginBottom:14,fontSize:13,color:'var(--text-secondary)',border:'1px solid var(--border-light)'}}>
        Marque <strong>X</strong> en los ítems con hallazgo y describa. Sin marcado = <strong>NORMAL</strong>.
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10}}>
        {EF_SECTIONS.map(sec=>(
          <div key={sec.key} style={{border:'1px solid var(--border-light)',borderRadius:8,overflow:'hidden'}}>
            <div style={{background:'var(--primary)',color:'white',padding:'6px 10px',fontSize:12,fontWeight:700}}>{sec.label}</div>
            <div style={{padding:'8px 10px',display:'flex',flexDirection:'column',gap:6}}>
              {sec.items.map(item=>{
                const k=`${sec.key}_${item.key}`;const checked=!!value[k]
                return(
                  <div key={item.key}>
                    <div style={{display:'flex',alignItems:'center',gap:6,cursor:'pointer'}} onClick={()=>toggle(sec.key,item.key)}>
                      <div style={{width:16,height:16,border:`2px solid ${checked?'var(--primary)':'var(--border)'}`,borderRadius:3,background:checked?'var(--primary)':'white',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,transition:'all 0.15s'}}>
                        {checked&&<span style={{color:'white',fontSize:11,fontWeight:900}}>✓</span>}
                      </div>
                      <span style={{fontSize:12,color:checked?'var(--primary)':'var(--text-secondary)',fontWeight:checked?600:400}}>{item.label}</span>
                    </div>
                    {checked&&<input className="form-input" value={value[`${k}_obs`]||''} onChange={e=>setObs(sec.key,item.key,e.target.value)} placeholder="Describir hallazgo..." style={{marginTop:4,fontSize:11,padding:'4px 8px'}}/>}
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="form-group" style={{marginTop:12}}>
        <label className="form-label">Observaciones Generales Adicionales</label>
        <textarea className="form-textarea" value={value.observaciones_generales||''} onChange={e=>onChange({...value,observaciones_generales:e.target.value})} placeholder="Observaciones generales del examen físico..." style={{minHeight:70}}/>
      </div>
    </div>
  )
}

const emptyDiag=()=>({id:Date.now()+Math.random(),codigo:'',nombre:'',tipo:'presuntivo'})
const emptyTrat=()=>({id:Date.now()+Math.random(),medicamento:'',cantidad:'',posologia:''})

export default function NuevaAtencion({onSaved}){
  const today=new Date().toISOString().split('T')[0]
  const[saving,setSaving]=useState(false)
  const[alert,setAlert]=useState(null)
  const[fecha,setFecha]=useState(today)
  const[generales,setGenerales]=useState({nombres:'',apellidos:'',cedula:'',telefono:'',edad:'',sexo:'',ocupacion:'',fecha_nacimiento:'',estado_civil:'',direccion:'',correo:'',grupo_sanguineo:''})
  const[antecedentes,setAntecedentes]=useState({patologicos:'',alergicos:'',quirurgicos:'',familiares:'',gestas:'',partos:'',cesareas:'',abortos:'',planificacion:''})
  const[motivo,setMotivo]=useState('')
  const[vitales,setVitales]=useState({pa:'',temperatura:'',saturacion:'',fr:'',consciencia:'Alerta',peso:'',talla:'',perimetro:''})
  const[evolucion,setEvolucion]=useState('')
  const[examenFisico,setExamenFisico]=useState({})
  const[diagnosticos,setDiagnosticos]=useState([emptyDiag()])
  const[tratamientos,setTratamientos]=useState([emptyTrat()])
  const[seguimiento,setSeguimiento]=useState(false)
  const[proximaConsulta,setProximaConsulta]=useState('')
  const[horaConsulta,setHoraConsulta]=useState('')

  const imc=(()=>{const p=parseFloat(vitales.peso);const t=parseFloat(vitales.talla);if(p>0&&t>0)return(p/((t/100)**2)).toFixed(1);return''})()
  const imcClass=(()=>{const v=parseFloat(imc);if(!v)return'';if(v<18.5)return'Bajo peso';if(v<25)return'Normal';if(v<30)return'Sobrepeso';return'Obesidad'})()

  useEffect(()=>{
    if(generales.fecha_nacimiento){
      const n=new Date(generales.fecha_nacimiento);const h=new Date();let e=h.getFullYear()-n.getFullYear();const m=h.getMonth()-n.getMonth();if(m<0||(m===0&&h.getDate()<n.getDate()))e--;
      setGenerales(p=>({...p,edad:String(e)}))
    }
  },[generales.fecha_nacimiento])

  const setGen=(k,v)=>setGenerales(p=>({...p,[k]:v}))
  const setAnt=(k,v)=>setAntecedentes(p=>({...p,[k]:v}))
  const setVit=(k,v)=>setVitales(p=>({...p,[k]:v}))
  const addDiag=()=>setDiagnosticos(d=>[...d,emptyDiag()])
  const removeDiag=(id)=>setDiagnosticos(d=>d.filter(x=>x.id!==id))
  const setDiagField=(id,k,v)=>setDiagnosticos(d=>d.map(x=>x.id===id?{...x,[k]:v}:x))
  const addTrat=()=>setTratamientos(t=>[...t,emptyTrat()])
  const removeTrat=(id)=>setTratamientos(t=>t.filter(x=>x.id!==id))
  const setTratField=(id,k,v)=>setTratamientos(t=>t.map(x=>x.id===id?{...x,[k]:v}:x))

  const handleSave=async()=>{
    if(!generales.nombres||!generales.apellidos){setAlert({type:'error',msg:'Por favor ingrese nombres y apellidos del paciente.'});window.scrollTo({top:0,behavior:'smooth'});return}
    setSaving(true);setAlert(null)
    try{
      let pacienteId=null
      if(generales.cedula){const{data:ex}=await supabase.from('pacientes').select('id').eq('cedula',generales.cedula).single();if(ex){pacienteId=ex.id;await supabase.from('pacientes').update({nombres:generales.nombres,apellidos:generales.apellidos,telefono:generales.telefono,edad:parseInt(generales.edad)||null,sexo:generales.sexo,ocupacion:generales.ocupacion,fecha_nacimiento:generales.fecha_nacimiento||null,estado_civil:generales.estado_civil||null,direccion:generales.direccion||null,correo:generales.correo||null,grupo_sanguineo:generales.grupo_sanguineo||null}).eq('id',pacienteId)}}
      if(!pacienteId){const{data:np,error:pe}=await supabase.from('pacientes').insert({nombres:generales.nombres,apellidos:generales.apellidos,cedula:generales.cedula||null,telefono:generales.telefono,edad:parseInt(generales.edad)||null,sexo:generales.sexo,ocupacion:generales.ocupacion,fecha_nacimiento:generales.fecha_nacimiento||null,estado_civil:generales.estado_civil||null,direccion:generales.direccion||null,correo:generales.correo||null,grupo_sanguineo:generales.grupo_sanguineo||null}).select('id').single();if(pe)throw pe;pacienteId=np.id}
      const{data:ae}=await supabase.from('antecedentes').select('id').eq('paciente_id',pacienteId).single()
      const ad={paciente_id:pacienteId,patologicos_personales:antecedentes.patologicos,alergicos:antecedentes.alergicos,quirurgicos:antecedentes.quirurgicos,patologicos_familiares:antecedentes.familiares,gestas:parseInt(antecedentes.gestas)||null,partos_vaginales:parseInt(antecedentes.partos)||null,cesareas:parseInt(antecedentes.cesareas)||null,abortos:parseInt(antecedentes.abortos)||null,metodo_planificacion:antecedentes.planificacion}
      if(ae){await supabase.from('antecedentes').update(ad).eq('id',ae.id)}else{await supabase.from('antecedentes').insert(ad)}
      const{data:at,error:ate}=await supabase.from('atenciones').insert({paciente_id:pacienteId,fecha_atencion:fecha,motivo_consulta:motivo,presion_arterial:vitales.pa,temperatura:parseFloat(vitales.temperatura)||null,saturacion:parseFloat(vitales.saturacion)||null,frecuencia_respiratoria:parseInt(vitales.fr)||null,estado_consciencia:vitales.consciencia,peso:parseFloat(vitales.peso)||null,talla:parseFloat(vitales.talla)||null,imc:parseFloat(imc)||null,perimetro_abdominal:parseFloat(vitales.perimetro)||null,evolucion,requiere_seguimiento:seguimiento,proxima_consulta:seguimiento&&proximaConsulta?proximaConsulta:null,hora_proxima_consulta:seguimiento&&horaConsulta?horaConsulta:null}).select('id').single()
      if(ate)throw ate
      const efd={atencion_id:at.id}
      EF_SECTIONS.forEach(s=>s.items.forEach(i=>{const k=`${s.key}_${i.key}`;efd[k]=!!examenFisico[k];efd[`${k}_obs`]=examenFisico[`${k}_obs`]||null}))
      efd.observaciones_generales=examenFisico.observaciones_generales||null
      await supabase.from('examen_fisico').insert(efd)
      const ds=diagnosticos.filter(d=>d.codigo||d.nombre);if(ds.length)await supabase.from('diagnosticos').insert(ds.map(d=>({atencion_id:at.id,codigo_cie10:d.codigo,nombre_cie10:d.nombre,tipo:d.tipo})))
      const ts=tratamientos.filter(t=>t.medicamento);if(ts.length)await supabase.from('tratamientos').insert(ts.map(t=>({atencion_id:at.id,medicamento:t.medicamento,cantidad:t.cantidad,posologia:t.posologia})))
      setAlert({type:'success',msg:`✓ Atención guardada para ${generales.nombres} ${generales.apellidos}.`})
      window.scrollTo({top:0,behavior:'smooth'});setTimeout(()=>onSaved(),1200)
    }catch(err){setAlert({type:'error',msg:`Error al guardar: ${err.message}`})}
    finally{setSaving(false)}
  }

  return(
    <div>
      <div className="page-header">
        <div className="page-title"><Activity size={22}/>Nueva Atención Médica<span className="page-title-badge">Ocupacional</span></div>
        <div className="page-subtitle">Complete los datos del paciente y la atención médica</div>
      </div>
      {alert&&(<div className={`alert ${alert.type==='success'?'alert-success':'alert-error'}`} style={{marginBottom:16}}>{alert.type==='success'?<CheckCircle size={16}/>:<AlertTriangle size={16}/>}{alert.msg}</div>)}
      <div className="section-stack">

        <Section icon={Calendar} title="Fecha de Atención">
          <div className="form-grid form-grid-4">
            <div className="form-group"><label className="form-label required">Fecha de la atención</label><input type="date" className="form-input" value={fecha} onChange={e=>setFecha(e.target.value)}/></div>
          </div>
        </Section>

        <Section icon={User} title="Datos Generales del Paciente" subtitle="Información personal y de contacto">
          <div className="form-grid form-grid-3">
            <div className="form-group"><label className="form-label required">Nombres</label><input className="form-input" value={generales.nombres} onChange={e=>setGen('nombres',e.target.value)} placeholder="Nombres del paciente"/></div>
            <div className="form-group"><label className="form-label required">Apellidos</label><input className="form-input" value={generales.apellidos} onChange={e=>setGen('apellidos',e.target.value)} placeholder="Apellidos del paciente"/></div>
            <div className="form-group"><label className="form-label">Número de Cédula</label><input className="form-input" value={generales.cedula} onChange={e=>setGen('cedula',e.target.value)} placeholder="0912345678" maxLength={13}/></div>
            <div className="form-group"><label className="form-label">Fecha de Nacimiento</label><input type="date" className="form-input" value={generales.fecha_nacimiento} onChange={e=>setGen('fecha_nacimiento',e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Edad (años)</label><input type="number" className="form-input" value={generales.edad} onChange={e=>setGen('edad',e.target.value)} placeholder="Se calcula automáticamente" style={generales.fecha_nacimiento?{background:'var(--surface-2)'}:{}} readOnly={!!generales.fecha_nacimiento}/></div>
            <div className="form-group"><label className="form-label">Sexo</label><select className="form-select" value={generales.sexo} onChange={e=>setGen('sexo',e.target.value)}><option value="">Seleccionar</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option></select></div>
            <div className="form-group"><label className="form-label">Estado Civil</label><select className="form-select" value={generales.estado_civil} onChange={e=>setGen('estado_civil',e.target.value)}><option value="">Seleccionar</option><option>Soltero/a</option><option>Casado/a</option><option>Unión libre</option><option>Divorciado/a</option><option>Viudo/a</option><option>Separado/a</option></select></div>
            <div className="form-group"><label className="form-label">Grupo Sanguíneo</label><select className="form-select" value={generales.grupo_sanguineo} onChange={e=>setGen('grupo_sanguineo',e.target.value)}><option value="">Seleccionar</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g=><option key={g}>{g}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Teléfono</label><input className="form-input" value={generales.telefono} onChange={e=>setGen('telefono',e.target.value)} placeholder="0991234567"/></div>
            <div className="form-group"><label className="form-label">Correo Electrónico</label><input type="email" className="form-input" value={generales.correo} onChange={e=>setGen('correo',e.target.value)} placeholder="paciente@email.com"/></div>
            <div className="form-group"><label className="form-label">Ocupación</label><input className="form-input" value={generales.ocupacion} onChange={e=>setGen('ocupacion',e.target.value)} placeholder="Cargo o función del trabajador"/></div>
            <div className="form-group col-span-3"><label className="form-label">Dirección Domiciliaria</label><input className="form-input" value={generales.direccion} onChange={e=>setGen('direccion',e.target.value)} placeholder="Calle, número, sector, ciudad"/></div>
          </div>
        </Section>

        <Section icon={Heart} title="Antecedentes Personales" subtitle="Historial médico personal" color="#D69E2E">
          <div className="form-grid form-grid-3">
            <div className="form-group"><label className="form-label">Antecedentes Patológicos Personales</label><textarea className="form-textarea" value={antecedentes.patologicos} onChange={e=>setAnt('patologicos',e.target.value)} placeholder="HTA, DM2, asma..."/></div>
            <div className="form-group"><label className="form-label">Antecedentes Alérgicos</label><textarea className="form-textarea" value={antecedentes.alergicos} onChange={e=>setAnt('alergicos',e.target.value)} placeholder="Alergias a medicamentos..."/></div>
            <div className="form-group"><label className="form-label">Antecedentes Quirúrgicos</label><textarea className="form-textarea" value={antecedentes.quirurgicos} onChange={e=>setAnt('quirurgicos',e.target.value)} placeholder="Cirugías previas y año..."/></div>
          </div>
        </Section>

        <Section icon={Users} title="Antecedentes Patológicos Familiares" subtitle="Historial de enfermedades en familia directa" color="#744210">
          <div className="form-group"><textarea className="form-textarea" value={antecedentes.familiares} onChange={e=>setAnt('familiares',e.target.value)} placeholder="Padre: HTA, Madre: DM2..." style={{minHeight:70}}/></div>
        </Section>

        {(generales.sexo==='Femenino'||generales.sexo==='')&&(
          <Section icon={Baby} title="Antecedentes Ginecobstétricos" subtitle="Solo aplica para pacientes femeninas" color="#97266D">
            <div className="form-grid form-grid-5">
              {[['gestas','Gestas'],['partos','Partos Vaginales'],['cesareas','Cesáreas'],['abortos','Abortos']].map(([k,l])=>(
                <div key={k} className="form-group"><label className="form-label">{l}</label><input type="number" className="form-input" value={antecedentes[k]} onChange={e=>setAnt(k,e.target.value)} placeholder="0" min={0}/></div>
              ))}
              <div className="form-group"><label className="form-label">Método de Planificación</label><select className="form-select" value={antecedentes.planificacion} onChange={e=>setAnt('planificacion',e.target.value)}><option value="">Ninguno</option><option>ACO (Píldora)</option><option>DIU</option><option>Preservativo</option><option>Implante</option><option>Inyectable</option><option>Ligadura de trompas</option><option>Otro</option></select></div>
            </div>
          </Section>
        )}

        <Section icon={FileText} title="Motivo de Consulta" color="#2B6CB0">
          <div className="form-group"><label className="form-label required">Motivo de consulta</label><textarea className="form-textarea" value={motivo} onChange={e=>setMotivo(e.target.value)} placeholder="Describa el motivo principal de la consulta..." style={{minHeight:80}}/></div>
        </Section>

        <Section icon={Activity} title="Signos Vitales" subtitle="Parámetros fisiológicos del paciente" color="#2F855A">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(120px,1fr))',gap:12}}>
            {[{key:'pa',label:'Presión Arterial',unit:'mmHg',placeholder:'120/80'},{key:'temperatura',label:'Temperatura',unit:'°C',placeholder:'36.5'},{key:'saturacion',label:'Saturación O₂',unit:'%',placeholder:'98'},{key:'fr',label:'Frec. Respiratoria',unit:'rpm',placeholder:'18'},{key:'peso',label:'Peso',unit:'kg',placeholder:'70'},{key:'talla',label:'Talla',unit:'cm',placeholder:'170'},{key:'perimetro',label:'Perím. Abdominal',unit:'cm',placeholder:'85'}].map(({key,label,unit,placeholder})=>(
              <div key={key} className="vital-card"><div className="vital-card-label">{label}</div><input value={vitales[key]} onChange={e=>setVit(key,e.target.value)} placeholder={placeholder}/><div className="vital-card-unit">{unit}</div></div>
            ))}
            <div className="vital-card" style={{background:'var(--accent-soft)',borderColor:'rgba(0,201,167,0.3)'}}>
              <div className="vital-card-label">IMC</div>
              <input value={imc||'—'} readOnly style={{color:'var(--accent)',cursor:'default'}}/>
              <div className="vital-card-unit">{imcClass||'kg/m²'}</div>
            </div>
          </div>
          <div className="form-group mt-3">
            <label className="form-label">Estado de Consciencia</label>
            <div className="consciousness-grid mt-1">
              {['Alerta','Somnoliento','Obnubilación','Estupor','Coma'].map(c=>(
                <button key={c} className={`consciousness-btn ${vitales.consciencia===c?'selected':''}`} onClick={()=>setVit('consciencia',c)}>{c}</button>
              ))}
            </div>
          </div>
        </Section>

        <Section icon={Eye} title="Examen Físico Regional" subtitle="Marque X en hallazgos. Sin marcado = NORMAL" color="#2C7A7B">
          <ExamenFisicoRegional value={examenFisico} onChange={setExamenFisico}/>
        </Section>

        <Section icon={Clipboard} title="Evolución del Paciente" subtitle="Descripción clínica y seguimiento" color="#553C9A">
          <div className="form-group"><label className="form-label">Evolución</label><textarea className="form-textarea" value={evolucion} onChange={e=>setEvolucion(e.target.value)} placeholder="Descripción de la evolución clínica, hallazgos al examen físico..." style={{minHeight:120}}/></div>
        </Section>

        <Section icon={Search} title="Diagnóstico CIE-10" subtitle="Búsqueda automática — escriba código o nombre" color="#2B6CB0">
          <div className="section-stack">
            {diagnosticos.map(diag=>(
              <div key={diag.id} className="diagnostico-row">
                <div className="form-group"><input className="form-input" value={diag.codigo} onChange={e=>setDiagField(diag.id,'codigo',e.target.value.toUpperCase())} placeholder="J45.9" style={{fontWeight:700,fontFamily:'var(--font-display)'}}/></div>
                <div className="pos-relative"><CIE10Search value={diag.nombre} onChange={v=>setDiagField(diag.id,'nombre',v)} onSelect={r=>{setDiagField(diag.id,'nombre',r.name);setDiagField(diag.id,'codigo',r.code)}}/></div>
                <div style={{display:'flex',justifyContent:'center'}}><button className={`tipo-badge ${diag.tipo}`} onClick={()=>setDiagField(diag.id,'tipo',diag.tipo==='definitivo'?'presuntivo':'definitivo')}>{diag.tipo==='definitivo'?'● Definitivo':'◌ Presuntivo'}</button></div>
                {diagnosticos.length>1&&<button className="btn-danger-ghost" onClick={()=>removeDiag(diag.id)}><Trash2 size={15}/></button>}
              </div>
            ))}
            <button className="btn-add" onClick={addDiag}><Plus size={14}/> Agregar diagnóstico</button>
          </div>
        </Section>

        <Section icon={Heart} title="Tratamiento" subtitle="Búsqueda de fármacos con presentaciones" color="#E53E3E">
          <div style={{marginBottom:8,display:'grid',gridTemplateColumns:'1fr 100px 1fr 36px',gap:8}}>
            {['Medicamento / Presentación','Cantidad','Posología',''].map((h,i)=>(<div key={i} style={{fontSize:11,fontWeight:700,color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.5px',paddingLeft:12}}>{h}</div>))}
          </div>
          <div className="section-stack">
            {tratamientos.map(trat=>(
              <div key={trat.id} className="tratamiento-row">
                <FarmacoSearch value={trat.medicamento} onChange={v=>setTratField(trat.id,'medicamento',v)} onSelect={r=>setTratField(trat.id,'medicamento',r.full)}/>
                <input className="form-input" value={trat.cantidad} onChange={e=>setTratField(trat.id,'cantidad',e.target.value)} placeholder="10 tab."/>
                <input className="form-input" value={trat.posologia} onChange={e=>setTratField(trat.id,'posologia',e.target.value)} placeholder="1 tab. cada 8h por 3 días"/>
                {tratamientos.length>1&&<button className="btn-danger-ghost" onClick={()=>removeTrat(trat.id)}><Trash2 size={15}/></button>}
              </div>
            ))}
            <button className="btn-add" onClick={addTrat}><Plus size={14}/> Agregar medicamento</button>
          </div>
        </Section>

        <div className="seguimiento-panel">
          <div>
            <div style={{fontFamily:'var(--font-display)',fontWeight:600,color:'var(--primary)',marginBottom:4,display:'flex',alignItems:'center',gap:8}}><Clock size={16}/>Seguimiento del paciente</div>
            <div style={{fontSize:13,color:'var(--text-muted)'}}>¿Requiere próxima consulta de seguimiento?</div>
          </div>
          <label className="toggle-switch"><input type="checkbox" checked={seguimiento} onChange={e=>setSeguimiento(e.target.checked)}/><span className="toggle-slider"/></label>
          {seguimiento&&(
            <div style={{display:'flex',gap:10,flex:1,flexWrap:'wrap'}}>
              <div className="form-group" style={{minWidth:180}}>
                <label className="form-label">📅 Fecha próxima consulta</label>
                <input type="date" className="form-input" value={proximaConsulta} onChange={e=>setProximaConsulta(e.target.value)} min={today}/>
              </div>
              <div className="form-group" style={{minWidth:140}}>
                <label className="form-label">🕐 Hora de la cita</label>
                <input type="time" className="form-input" value={horaConsulta} onChange={e=>setHoraConsulta(e.target.value)}/>
              </div>
              {proximaConsulta&&(
                <div style={{alignSelf:'flex-end',padding:'8px 14px',background:'rgba(0,201,167,0.15)',borderRadius:10,fontSize:13,fontWeight:600,color:'var(--accent)',whiteSpace:'nowrap',marginBottom:2}}>
                  {new Date(proximaConsulta+'T00:00:00').toLocaleDateString('es-EC',{weekday:'short',day:'2-digit',month:'short'})}
                  {horaConsulta&&` · ${horaConsulta}`}
                </div>
              )}
            </div>
          )}
          <div style={{marginLeft:'auto'}}><button className="btn-save" onClick={handleSave} disabled={saving}>{saving?<span className="loading-spinner"/>:<Save size={18}/>}{saving?'Guardando...':'Guardar Atención'}</button></div>
        </div>

      </div>
    </div>
  )
}

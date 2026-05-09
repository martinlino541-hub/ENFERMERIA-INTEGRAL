import { useState, useRef, useEffect } from 'react'
import { User, Calendar, Heart, AlertTriangle, Users, Baby, FileText, Activity,
  Clipboard, Plus, Trash2, Save, CheckCircle, Search, Clock, Eye, FlaskConical } from 'lucide-react'
import { supabase } from '../supabaseClient'

/* ══ SECTION COMPONENT ══ */
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

/* ══ CIE-10 LISTA LOCAL EN ESPAÑOL ══ */
const CIE10_ES_LOCAL = [
  {code:'A09',name:'Diarrea y gastroenteritis de presunto origen infeccioso'},{code:'A15.0',name:'Tuberculosis del pulmón'},
  {code:'A36.0',name:'Difteria faríngea'},{code:'A41.9',name:'Septicemia, no especificada'},
  {code:'A46',name:'Erisipela'},{code:'B00.1',name:'Herpes viral de piel y mucosas'},
  {code:'B01.9',name:'Varicela sin complicaciones'},{code:'B02.9',name:'Herpes zoster sin complicaciones'},
  {code:'B34.9',name:'Infección viral, no especificada'},{code:'B37.0',name:'Estomatitis candidiásica'},
  {code:'B37.3',name:'Candidiasis de la vulva y de la vagina'},{code:'C50.9',name:'Tumor maligno de la mama, parte no especificada'},
  {code:'C53.9',name:'Tumor maligno del cuello del útero'},{code:'C61',name:'Tumor maligno de la próstata'},
  {code:'D50.9',name:'Anemia por deficiencia de hierro, no especificada'},{code:'D64.9',name:'Anemia, no especificada'},
  {code:'E03.9',name:'Hipotiroidismo, no especificado'},{code:'E05.0',name:'Tirotoxicosis con bocio difuso'},
  {code:'E05.9',name:'Tirotoxicosis, no especificada'},{code:'E06.3',name:'Tiroiditis autoinmune'},
  {code:'E10.9',name:'Diabetes mellitus tipo 1 sin complicaciones'},{code:'E11.9',name:'Diabetes mellitus tipo 2 sin complicaciones'},
  {code:'E11.65',name:'Diabetes mellitus tipo 2 con hiperglucemia'},{code:'E14.9',name:'Diabetes mellitus no especificada sin complicaciones'},
  {code:'E46',name:'Desnutrición proteicocalórica, no especificada'},{code:'E55.9',name:'Deficiencia de vitamina D, no especificada'},
  {code:'E66.9',name:'Obesidad, no especificada'},{code:'E78.0',name:'Hipercolesterolemia pura'},
  {code:'E78.1',name:'Hipertrigliceridemia pura'},{code:'E78.5',name:'Hiperlipidemia, no especificada'},
  {code:'F10.1',name:'Trastornos mentales debidos al uso del alcohol'},{code:'F32.0',name:'Episodio depresivo leve'},
  {code:'F32.1',name:'Episodio depresivo moderado'},{code:'F32.9',name:'Episodio depresivo, no especificado'},
  {code:'F41.0',name:'Trastorno de pánico'},{code:'F41.1',name:'Trastorno de ansiedad generalizada'},
  {code:'F41.2',name:'Trastorno mixto ansioso-depresivo'},{code:'F43.0',name:'Reacción a estrés agudo'},
  {code:'F43.1',name:'Trastorno de estrés postraumático'},{code:'F43.2',name:'Trastornos de adaptación'},
  {code:'F51.0',name:'Insomnio no orgánico'},{code:'G20',name:'Enfermedad de Parkinson'},
  {code:'G40.9',name:'Epilepsia, no especificada'},{code:'G43.0',name:'Migraña sin aura'},
  {code:'G43.9',name:'Migraña, no especificada'},{code:'G44.2',name:'Cefalea de tipo tensión'},
  {code:'G47.0',name:'Trastornos del inicio y del mantenimiento del sueño'},{code:'G51.0',name:'Parálisis de Bell'},
  {code:'G54.2',name:'Lesión de raíces nerviosas cervicales'},{code:'G54.4',name:'Lesión de raíces nerviosas lumbosacras'},
  {code:'G62.9',name:'Polineuropatía, no especificada'},{code:'H10.9',name:'Conjuntivitis, no especificada'},
  {code:'H52.1',name:'Miopía'},{code:'H52.2',name:'Astigmatismo'},{code:'H52.4',name:'Presbicia'},
  {code:'H61.2',name:'Cerumen impactado'},{code:'H65.9',name:'Otitis media no supurativa, no especificada'},
  {code:'H66.9',name:'Otitis media supurativa, no especificada'},{code:'H83.3',name:'Trastornos cocleares por ruido'},
  {code:'H91.9',name:'Pérdida de audición, no especificada'},{code:'I10',name:'Hipertensión esencial (primaria)'},
  {code:'I20.9',name:'Angina de pecho, no especificada'},{code:'I21.9',name:'Infarto agudo del miocardio, no especificado'},
  {code:'I25.1',name:'Enfermedad aterosclerótica del corazón'},{code:'I48',name:'Fibrilación y aleteo auricular'},
  {code:'I50.0',name:'Insuficiencia cardíaca congestiva'},{code:'I50.9',name:'Insuficiencia cardíaca, no especificada'},
  {code:'I63.9',name:'Infarto cerebral, no especificado'},{code:'I64',name:'Accidente vascular encefálico'},
  {code:'I83.9',name:'Várices de los miembros inferiores'},{code:'J00',name:'Rinofaringitis aguda (resfriado común)'},
  {code:'J01.0',name:'Sinusitis maxilar aguda'},{code:'J02.9',name:'Faringitis aguda, no especificada'},
  {code:'J03.9',name:'Amigdalitis aguda, no especificada'},{code:'J04.0',name:'Laringitis aguda'},
  {code:'J06.9',name:'Infección aguda de las vías respiratorias superiores, no especificada'},
  {code:'J18.9',name:'Neumonía, no especificada'},{code:'J20.9',name:'Bronquitis aguda, no especificada'},
  {code:'J30.1',name:'Rinitis alérgica debida al polen'},{code:'J30.4',name:'Rinitis alérgica, no especificada'},
  {code:'J32.0',name:'Sinusitis maxilar crónica'},{code:'J35.0',name:'Amigdalitis crónica'},
  {code:'J40',name:'Bronquitis, no especificada'},{code:'J44.1',name:'EPOC con exacerbación aguda'},
  {code:'J45.0',name:'Asma predominantemente alérgica'},{code:'J45.9',name:'Asma, no especificada'},
  {code:'K21.0',name:'Enfermedad por reflujo gastroesofágico con esofagitis'},
  {code:'K21.9',name:'Enfermedad por reflujo gastroesofágico sin esofagitis'},
  {code:'K25.9',name:'Úlcera gástrica, no especificada'},{code:'K29.5',name:'Gastritis crónica, no especificada'},
  {code:'K29.7',name:'Gastritis, no especificada'},{code:'K30',name:'Dispepsia'},
  {code:'K35.9',name:'Apendicitis aguda, no especificada'},{code:'K58.9',name:'Síndrome del intestino irritable'},
  {code:'K59.0',name:'Estreñimiento'},{code:'K72.9',name:'Insuficiencia hepática, no especificada'},
  {code:'K80.2',name:'Colelitiasis sin colecistitis'},{code:'K85.9',name:'Pancreatitis aguda, no especificada'},
  {code:'K92.0',name:'Hematemesis'},{code:'K92.1',name:'Melena'},
  {code:'L01.0',name:'Impétigo'},{code:'L02.9',name:'Absceso cutáneo, furúnculo'},
  {code:'L03.9',name:'Celulitis, no especificada'},{code:'L20.9',name:'Dermatitis atópica, no especificada'},
  {code:'L23.9',name:'Dermatitis alérgica de contacto'},{code:'L40.9',name:'Psoriasis, no especificada'},
  {code:'L50.0',name:'Urticaria alérgica'},{code:'L50.9',name:'Urticaria, no especificada'},
  {code:'L70.0',name:'Acné vulgar'},{code:'M05.9',name:'Artritis reumatoide seropositiva'},
  {code:'M10.9',name:'Gota, no especificada'},{code:'M13.9',name:'Artritis, no especificada'},
  {code:'M16.9',name:'Coxartrosis, no especificada'},{code:'M17.9',name:'Gonartrosis, no especificada'},
  {code:'M25.5',name:'Dolor en articulación'},{code:'M47.9',name:'Espondiloartrosis, no especificada'},
  {code:'M50.1',name:'Degeneración del disco cervical'},{code:'M51.1',name:'Degeneración del disco lumbar con radiculopatía'},
  {code:'M51.9',name:'Degeneración del disco intervertebral, no especificada'},
  {code:'M54.2',name:'Cervicalgia'},{code:'M54.3',name:'Ciática'},
  {code:'M54.4',name:'Lumbago con ciática'},{code:'M54.5',name:'Lumbago, no especificado'},
  {code:'M65.3',name:'Dedo en gatillo'},{code:'M75.1',name:'Síndrome del manguito de los rotadores'},
  {code:'M77.1',name:'Epicondilitis lateral'},{code:'M79.1',name:'Mialgia'},
  {code:'M81.9',name:'Osteoporosis, no especificada'},
  {code:'N18.9',name:'Insuficiencia renal crónica, no especificada'},{code:'N20.0',name:'Cálculo del riñón'},
  {code:'N23',name:'Cólico renal, no especificado'},{code:'N30.0',name:'Cistitis aguda'},
  {code:'N39.0',name:'Infección de vías urinarias'},{code:'N40',name:'Hiperplasia de la próstata'},
  {code:'N76.0',name:'Vaginitis aguda'},{code:'N80.9',name:'Endometriosis, no especificada'},
  {code:'N83.2',name:'Otros quistes ováricos'},{code:'N92.0',name:'Menstruación excesiva y frecuente'},
  {code:'N94.6',name:'Dismenorrea, no especificada'},{code:'O20.0',name:'Amenaza de aborto'},
  {code:'R00.0',name:'Taquicardia, no especificada'},{code:'R05',name:'Tos'},
  {code:'R06.0',name:'Disnea'},{code:'R07.4',name:'Dolor torácico, no especificado'},
  {code:'R10.0',name:'Dolor abdominal agudo'},{code:'R10.4',name:'Otros dolores abdominales'},
  {code:'R11',name:'Náuseas y vómitos'},{code:'R12',name:'Pirosis'},
  {code:'R19.7',name:'Diarrea, no especificada'},{code:'R42',name:'Mareo y desvanecimiento'},
  {code:'R50.9',name:'Fiebre, no especificada'},{code:'R51',name:'Cefalea'},
  {code:'R52.9',name:'Dolor, no especificado'},{code:'R53',name:'Malestar y fatiga'},
  {code:'R55',name:'Síncope y colapso'},{code:'R60.0',name:'Edema localizado'},
  {code:'R73.09',name:'Hiperglucemia, no especificada'},
  {code:'S60.9',name:'Traumatismo superficial de la muñeca y de la mano'},
  {code:'S70.9',name:'Traumatismo superficial de la cadera y del muslo'},
  {code:'S80.9',name:'Traumatismo superficial de la pierna'},
  {code:'T14.0',name:'Herida de región no especificada'},{code:'W19',name:'Caída no especificada'},
  {code:'Z00.0',name:'Examen médico general'},{code:'Z10.0',name:'Examen médico ocupacional'},
  {code:'Z57.0',name:'Exposición ocupacional al ruido'},{code:'Z57.2',name:'Exposición ocupacional al polvo'},
  {code:'Z57.5',name:'Exposición ocupacional a agentes tóxicos'},{code:'Z73.0',name:'Agotamiento vital (burnout)'},
]

/* ══ FARMACOS ══ */
const FARMACOS = [
  {name:'Paracetamol',p:['500 mg tabletas','1000 mg tabletas','160 mg/5ml jarabe','250 mg/5ml jarabe','150 mg/ml gotas','125 mg supositorio']},
  {name:'Ibuprofeno',p:['200 mg tabletas','400 mg tabletas','600 mg tabletas','800 mg tabletas','100 mg/5ml suspensión','40 mg/ml gotas']},
  {name:'Naproxeno',p:['250 mg tabletas','500 mg tabletas']},
  {name:'Diclofenaco',p:['50 mg tabletas','75 mg tabletas','100 mg cápsulas retard','75 mg/3ml inyectable','1% gel tópico']},
  {name:'Ketorolaco',p:['10 mg tabletas','30 mg/ml inyectable']},
  {name:'Metamizol (Dipirona)',p:['500 mg tabletas','1 g tabletas','500 mg/ml inyectable','500 mg/5ml jarabe']},
  {name:'Tramadol',p:['50 mg cápsulas','100 mg tabletas retard','100 mg/2ml inyectable']},
  {name:'Prednisona',p:['5 mg tabletas','20 mg tabletas','50 mg tabletas']},
  {name:'Dexametasona',p:['0.5 mg tabletas','4 mg/ml inyectable','0.1% crema']},
  {name:'Metilprednisolona',p:['4 mg tabletas','16 mg tabletas','40 mg inyectable','125 mg inyectable']},
  {name:'Amoxicilina',p:['500 mg cápsulas','875 mg tabletas','125 mg/5ml suspensión','250 mg/5ml suspensión']},
  {name:'Amoxicilina + Ác. Clavulánico',p:['500/125 mg tabletas','875/125 mg tabletas','250/62.5 mg/5ml suspensión']},
  {name:'Azitromicina',p:['250 mg tabletas','500 mg tabletas','200 mg/5ml suspensión']},
  {name:'Claritromicina',p:['250 mg tabletas','500 mg tabletas','125 mg/5ml suspensión']},
  {name:'Ciprofloxacino',p:['250 mg tabletas','500 mg tabletas','750 mg tabletas']},
  {name:'Levofloxacino',p:['250 mg tabletas','500 mg tabletas','750 mg tabletas']},
  {name:'Metronidazol',p:['250 mg tabletas','500 mg tabletas','125 mg/5ml suspensión']},
  {name:'Omeprazol',p:['10 mg cápsulas','20 mg cápsulas','40 mg cápsulas']},
  {name:'Pantoprazol',p:['20 mg tabletas','40 mg tabletas','40 mg inyectable']},
  {name:'Metoclopramida',p:['10 mg tabletas','5 mg/5ml jarabe','10 mg/2ml inyectable']},
  {name:'Ondansetrón',p:['4 mg tabletas','8 mg tabletas','4 mg/2ml inyectable']},
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
  {name:'Salbutamol',p:['100 mcg/dosis inhalador','2 mg tabletas','5 mg/5ml jarabe','0.083% solución nebulización']},
  {name:'Budesonida',p:['100 mcg/dosis inhalador','200 mcg/dosis inhalador','0.25 mg/2ml nebulización']},
  {name:'Montelukast',p:['4 mg tabletas masticables','5 mg tabletas masticables','10 mg tabletas']},
  {name:'Loratadina',p:['10 mg tabletas','5 mg/5ml jarabe']},
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

/* ══ EXAMEN FÍSICO REGIONAL — nuevas secciones ══ */
const EF_REGIONES = [
  { key:'cabeza_cara',        label:'Cabeza y Cara',       emoji:'🧠' },
  { key:'cuello',             label:'Cuello',               emoji:'🦴' },
  { key:'torax',              label:'Tórax',                emoji:'🫁' },
  { key:'abdomen',            label:'Abdomen',              emoji:'🫃' },
  { key:'extremidades_superiores', label:'Extremidades Superiores (A)', emoji:'💪' },
  { key:'extremidades_inferiores', label:'Extremidades Inferiores (B)', emoji:'🦵' },
  { key:'columna_vertebral',  label:'Columna Vertebral',   emoji:'🦴' },
  { key:'sistema_neurologico',label:'Sistema Neurológico', emoji:'🧬' },
  { key:'piel_anexos',        label:'Piel y Anexos',       emoji:'🩹' },
  { key:'genitourinario',     label:'Genitourinario',      emoji:'🔵' },
  { key:'region_rectal',      label:'Región Rectal',       emoji:'🔴' },
]

/* ══ EXAMS SUGGESTIONS ══ */
const EXAMS_LAB = [
  'Biometría hemática (BH)','Química sanguínea','Glucosa en ayunas','Glucosa postprandial',
  'HbA1c (Hemoglobina glicosilada)','Creatinina','BUN (Nitrógeno ureico)','Ácido úrico',
  'Colesterol total','HDL colesterol','LDL colesterol','Triglicéridos','Perfil lipídico completo',
  'TGO (AST)','TGP (ALT)','GGT','Fosfatasa alcalina','Bilirrubinas total/directa/indirecta',
  'Proteínas totales','Albúmina','Perfil hepático completo',
  'TSH','T3 libre','T4 libre','Perfil tiroideo completo',
  'Hemoglobina','Hematocrito','VCM','HCM','Plaquetas','Leucocitos','Neutrófilos','Linfocitos',
  'Tiempo de protrombina (TP)','Tiempo de tromboplastina (TTP)','INR',
  'Sodio','Potasio','Cloro','Calcio','Fósforo','Magnesio','Electrolitos completos',
  'PCR (Proteína C reactiva)','VSG (Velocidad de sedimentación)','Factor reumatoide',
  'ANA (anticuerpos antinucleares)','Anti-DNA',
  'Examen elemental de orina (EMO)','Sedimento urinario','Microalbuminuria','Urocultivo',
  'Coproparasitario','Sangre oculta en heces','Coprocultivo',
  'Test de embarazo (beta-HCG)','FSH','LH','Estradiol','Progesterona','Testosterona',
  'Vitamina D (25-OH)','Vitamina B12','Ácido fólico','Hierro sérico','Ferritina','TIBC',
  'PSA (Antígeno prostático específico)','CA 125','CEA','AFP',
  'VDRL/RPR','VIH (ELISA)','Hepatitis B (HBsAg)','Hepatitis C (Anti-HVC)',
  'Prueba COVID-19','Antígeno de influenza','Cultivo faríngeo',
  'Amilasa','Lipasa','Troponina','CK-MB','Dímero D','Lactato','Procalcitonina',
]
const EXAMS_IMG = [
  'Radiografía de tórax (PA)','Radiografía de tórax (lateral)','Radiografía de columna cervical',
  'Radiografía de columna lumbar','Radiografía de abdomen','Radiografía de pelvis',
  'Radiografía de mano derecha','Radiografía de mano izquierda','Radiografía de rodilla derecha',
  'Radiografía de rodilla izquierda','Radiografía de tobillo','Radiografía de pie',
  'Radiografía de cadera','Radiografía de muñeca','Radiografía de hombro','Radiografía de codo',
  'Ecografía abdominal','Ecografía pélvica','Ecografía renal','Ecografía tiroidea',
  'Ecografía obstétrica','Ecografía de partes blandas','Ecografía doppler venoso',
  'Ecografía doppler carotídeo','Ecocardiograma (ecografía cardíaca)',
  'TC de cráneo','TC de tórax','TC de abdomen y pelvis',
  'TC de columna cervical','TC de columna lumbar','TC de senos paranasales',
  'RMN de cerebro','RMN de columna cervical','RMN de columna lumbar',
  'RMN de rodilla','RMN de hombro','RMN de cadera',
  'Mamografía bilateral','Mamografía unilateral','Densitometría ósea (DEXA)',
  'Electrocardiograma (ECG)','Holter de ritmo 24h','Monitoreo ambulatorio de PA (MAPA)',
  'Prueba de esfuerzo (ergometría)','Espirometría',
  'Endoscopia digestiva alta (EDA)','Colonoscopia','Colposcopia',
  'Electroencefalograma (EEG)','Electromiografía (EMG)','Velocidad de conducción nerviosa',
  'Fondo de ojo','Campimetría','Audiometría','Impedanciometría',
]
const EXAMS_OTRO = [
  'Biopsia de piel','Biopsia de tejido blando','PAAF (punción aspiración con aguja fina)',
  'Citología cervical (Papanicolaou)','Colposcopia con biopsia',
  'Test de alergia (prick test)','Prueba de tuberculina (PPD)',
  'Glucometría capilar','Oximetría de pulso','Peak flow (flujo espiratorio máximo)',
  'Presión intraocular (tonometría)','Agudeza visual','Test de Ishihara (visión de colores)',
  'Prueba de esfuerzo cardiovascular','Test de marcha 6 minutos',
  'Panel reumatológico completo','Panel hormonal femenino','Panel hormonal masculino',
]

/* ══ SEARCH HELPERS ══ */
function searchCIE10(q){
  if(!q||q.length<1)return[]
  const ql=q.toLowerCase()
  return CIE10_ES_LOCAL.filter(c=>c.code.toLowerCase().startsWith(ql)||c.code.toLowerCase().includes(ql)||c.name.toLowerCase().includes(ql)).slice(0,12)
}
function searchFarmaco(q){
  if(!q||q.length<2)return[]
  const ql=q.toLowerCase()
  const r=[]
  FARMACOS.forEach(f=>{if(f.name.toLowerCase().includes(ql)){f.p.forEach(p=>{r.push({name:f.name,presentation:p,full:`${f.name} ${p}`})})}})
  return r.slice(0,12)
}

/* ══ CIE10 SEARCH WITH CUSTOM CODES ══ */
function CIE10Search({value,onChange,onSelect}){
  const[open,setOpen]=useState(false)
  const[customCodes,setCustomCodes]=useState([])
  const[saving,setSaving]=useState(false)
  const[savedMsg,setSavedMsg]=useState('')
  const[showSaveForm,setShowSaveForm]=useState(false)
  const[newCodigo,setNewCodigo]=useState('')
  const[newNombre,setNewNombre]=useState('')
  const ref=useRef()

  useEffect(()=>{
    supabase.from('cie10_custom').select('*').order('created_at',{ascending:false}).then(({data})=>{
      if(data)setCustomCodes(data.map(d=>({code:d.codigo,name:d.nombre,custom:true})))
    })
  },[])

  const allCodes=[...CIE10_ES_LOCAL,...customCodes]
  const results=value.length>=1?allCodes.filter(c=>{const q=value.toLowerCase();return c.code.toLowerCase().startsWith(q)||c.code.toLowerCase().includes(q)||c.name.toLowerCase().includes(q)}).slice(0,12):[]

  useEffect(()=>{setOpen(value.length>=1);if(value.length>=1){setNewCodigo(value.toUpperCase());setNewNombre('')}},[value])
  useEffect(()=>{const h=(e)=>{if(ref.current&&!ref.current.contains(e.target)){setOpen(false);setShowSaveForm(false)}};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h)},[])

  const handleGuardar=async()=>{
    if(!newCodigo||!newNombre)return
    setSaving(true)
    try{
      const{error}=await supabase.from('cie10_custom').upsert({codigo:newCodigo.toUpperCase(),nombre:newNombre},{onConflict:'codigo'})
      if(!error){
        const nuevo={code:newCodigo.toUpperCase(),name:newNombre,custom:true}
        setCustomCodes(p=>[nuevo,...p.filter(c=>c.code!==nuevo.code)])
        setSavedMsg(`✓ Guardado: ${newCodigo.toUpperCase()}`)
        onSelect(nuevo);setShowSaveForm(false);setOpen(false)
        setTimeout(()=>setSavedMsg(''),3000)
      }
    }catch(e){}
    finally{setSaving(false)}
  }

  return(
    <div className="pos-relative" ref={ref}>
      <input className="form-input" value={value} onChange={e=>{onChange(e.target.value);setShowSaveForm(false)}} placeholder="Buscar código o diagnóstico CIE-10 en español..." autoComplete="off" onFocus={()=>value.length>=1&&setOpen(true)}/>
      {savedMsg&&<div style={{fontSize:11,color:'var(--accent)',marginTop:2,fontWeight:600}}>{savedMsg}</div>}
      {open&&(
        <div className="cie10-dropdown" style={{maxHeight:300,overflowY:'auto'}}>
          {results.map((r,i)=>(
            <div key={i} className="cie10-option" onMouseDown={()=>{onSelect(r);setOpen(false);setShowSaveForm(false)}}>
              <span className="cie10-code">{r.code}</span>
              <span className="cie10-name">{r.name}</span>
              {r.custom&&<span style={{marginLeft:'auto',fontSize:10,background:'#F0FFF4',color:'#2F855A',padding:'1px 6px',borderRadius:8,fontWeight:700,flexShrink:0}}>Personalizado</span>}
            </div>
          ))}
          <div style={{borderTop:'1px solid var(--border-light)',background:'var(--surface-2)'}}>
            {!showSaveForm?(
              <button onMouseDown={e=>{e.preventDefault();setShowSaveForm(true);setNewCodigo(value.toUpperCase());setNewNombre('')}} style={{width:'100%',padding:'9px 14px',background:'none',border:'none',cursor:'pointer',fontSize:12,color:'var(--primary)',fontWeight:600,display:'flex',alignItems:'center',gap:8,fontFamily:'var(--font-body)',textAlign:'left'}}>
                ➕ Guardar diagnóstico CIE-10 personalizado
              </button>
            ):(
              <div style={{padding:'10px 12px',display:'flex',flexDirection:'column',gap:8}}>
                <div style={{fontSize:12,fontWeight:700,color:'var(--primary)',marginBottom:2}}>💾 Guardar nuevo diagnóstico CIE-10</div>
                <div style={{display:'flex',gap:8}}>
                  <input value={newCodigo} onChange={e=>setNewCodigo(e.target.value.toUpperCase())} placeholder="Código (ej: Z99.0)" style={{width:110,padding:'6px 8px',border:'1.5px solid var(--border)',borderRadius:6,fontSize:12,fontFamily:'var(--font-display)',fontWeight:700,outline:'none'}} onMouseDown={e=>e.stopPropagation()}/>
                  <input value={newNombre} onChange={e=>setNewNombre(e.target.value)} placeholder="Nombre del diagnóstico..." style={{flex:1,padding:'6px 8px',border:'1.5px solid var(--border)',borderRadius:6,fontSize:12,fontFamily:'var(--font-body)',outline:'none'}} onMouseDown={e=>e.stopPropagation()} onKeyDown={e=>e.key==='Enter'&&handleGuardar()}/>
                </div>
                <div style={{display:'flex',gap:6,justifyContent:'flex-end'}}>
                  <button onMouseDown={e=>{e.preventDefault();setShowSaveForm(false)}} style={{padding:'5px 12px',background:'none',border:'1px solid var(--border)',borderRadius:6,cursor:'pointer',fontSize:12,fontFamily:'var(--font-body)'}}>Cancelar</button>
                  <button onMouseDown={e=>{e.preventDefault();handleGuardar()}} disabled={!newCodigo||!newNombre||saving} style={{padding:'5px 12px',background:'var(--primary)',color:'white',border:'none',borderRadius:6,cursor:'pointer',fontSize:12,fontWeight:600,fontFamily:'var(--font-body)',opacity:(!newCodigo||!newNombre)?0.5:1}}>
                    {saving?'Guardando...':'✓ Guardar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ══ FARMACO SEARCH ══ */
function FarmacoSearch({value,onChange,onSelect}){
  const[open,setOpen]=useState(false)
  const ref=useRef()
  const results=searchFarmaco(value)
  useEffect(()=>{setOpen(value.length>=2&&results.length>0)},[value])
  useEffect(()=>{const h=(e)=>{if(ref.current&&!ref.current.contains(e.target))setOpen(false)};document.addEventListener('mousedown',h);return()=>document.removeEventListener('mousedown',h)},[])
  return(
    <div className="pos-relative" ref={ref}>
      <input className="form-input" value={value} onChange={e=>{onChange(e.target.value);setOpen(true)}} placeholder="Buscar medicamento..." autoComplete="off"/>
      {open&&results.length>0&&(
        <div className="cie10-dropdown">
          {results.map((r,i)=>(<div key={i} className="cie10-option" onMouseDown={()=>{onSelect(r);setOpen(false)}}><span className="cie10-code" style={{minWidth:160}}>{r.name}</span><span className="cie10-name">{r.presentation}</span></div>))}
        </div>
      )}
    </div>
  )
}

/* ══ EXAMEN FÍSICO REGIONAL — nuevo formato ══ */
function ExamenFisicoRegional({value,onChange}){
  const setField=(k,v)=>onChange({...value,[k]:v})
  return(
    <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
      {EF_REGIONES.map(r=>(
        <div key={r.key} style={{border:'1.5px solid var(--border-light)',borderRadius:10,overflow:'hidden'}}>
          <div style={{background:'var(--primary)',color:'white',padding:'7px 12px',fontSize:12,fontWeight:700,display:'flex',alignItems:'center',gap:6}}>
            <span>{r.emoji}</span>{r.label}
            {!value[r.key]&&<span style={{marginLeft:'auto',fontSize:10,background:'rgba(255,255,255,0.2)',padding:'1px 8px',borderRadius:10}}>NORMAL</span>}
            {value[r.key]&&<span style={{marginLeft:'auto',fontSize:10,background:'#FEB2B2',color:'#C53030',padding:'1px 8px',borderRadius:10,fontWeight:800}}>CON HALLAZGO</span>}
          </div>
          <div style={{padding:'10px 12px'}}>
            <textarea
              className="form-textarea"
              value={value[r.key]||''}
              onChange={e=>setField(r.key,e.target.value)}
              placeholder="Normal — escribe aquí si hay hallazgos..."
              style={{minHeight:72,fontSize:12,resize:'vertical'}}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ══ RESULTADOS DE EXÁMENES — formato simplificado ══ */
const emptyExamen=(tipo='Laboratorio')=>({id:Date.now()+Math.random(),tipo,nombre_examen:'',fecha_examen:'',observacion:''})

function ExamenesSection({examenes,setExamenes}){
  const[tab,setTab]=useState('Laboratorio')
  const[showSuggest,setShowSuggest]=useState(null)

  const addExamen=()=>setExamenes(e=>[...e,emptyExamen(tab)])
  const removeExamen=(id)=>setExamenes(e=>e.filter(x=>x.id!==id))
  const setField=(id,k,v)=>setExamenes(e=>e.map(x=>x.id===id?{...x,[k]:v}:x))

  const examsByTab=examenes.filter(e=>e.tipo===tab)
  const suggestList=tab==='Laboratorio'?EXAMS_LAB:tab==='Imagenología'?EXAMS_IMG:EXAMS_OTRO

  return(
    <div className="card">
      <div className="card-header">
        <div className="card-header-icon" style={{background:'#2C7A7B'}}><FlaskConical size={16}/></div>
        <div>
          <div className="card-header-title">Resultados de Exámenes</div>
          <div className="card-header-sub">Laboratorio, imagenología y otros estudios</div>
        </div>
      </div>
      <div className="card-body">
        {/* Tabs */}
        <div style={{display:'flex',gap:4,marginBottom:16,borderBottom:'2px solid var(--border-light)'}}>
          {['Laboratorio','Imagenología','Otro'].map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={{
              padding:'7px 16px',border:'none',background:'none',cursor:'pointer',
              fontFamily:'var(--font-body)',fontSize:13,fontWeight:tab===t?700:400,
              color:tab===t?'var(--primary)':'var(--text-muted)',
              borderBottom:tab===t?'2px solid var(--primary)':'2px solid transparent',
              marginBottom:-2,display:'flex',alignItems:'center',gap:6
            }}>
              {t==='Laboratorio'?'🧪':t==='Imagenología'?'🩻':'📋'} {t}
              {examenes.filter(e=>e.tipo===t&&e.nombre_examen).length>0&&(
                <span style={{background:'var(--primary)',color:'white',fontSize:10,fontWeight:700,padding:'1px 6px',borderRadius:10}}>
                  {examenes.filter(e=>e.tipo===t&&e.nombre_examen).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Exámenes del tab */}
        <div className="section-stack">
          {examsByTab.length===0&&(
            <div style={{textAlign:'center',padding:'16px 0',color:'var(--text-muted)',fontSize:13}}>
              No hay exámenes de {tab.toLowerCase()} agregados
            </div>
          )}

          {examsByTab.map(ex=>(
            <div key={ex.id} style={{border:'1.5px solid var(--border-light)',borderRadius:10,overflow:'hidden'}}>
              {/* Header: nombre + fecha + eliminar */}
              <div style={{display:'grid',gridTemplateColumns:'1fr 160px 36px',gap:10,padding:'10px 12px',background:'var(--surface-2)',borderBottom:'1px solid var(--border-light)',alignItems:'center'}}>
                {/* Nombre con sugerencias */}
                <div className="pos-relative">
                  <input className="form-input" value={ex.nombre_examen}
                    onChange={e=>{setField(ex.id,'nombre_examen',e.target.value);setShowSuggest(ex.id)}}
                    onFocus={()=>setShowSuggest(ex.id)}
                    placeholder={`Nombre del examen (${tab.toLowerCase()})...`}
                    style={{fontWeight:600}}/>
                  {showSuggest===ex.id&&ex.nombre_examen.length>=1&&(
                    <div className="cie10-dropdown" style={{maxHeight:200,zIndex:60}}>
                      {suggestList.filter(s=>s.toLowerCase().includes(ex.nombre_examen.toLowerCase())).slice(0,10).map((s,i)=>(
                        <div key={i} className="cie10-option" onMouseDown={()=>{setField(ex.id,'nombre_examen',s);setShowSuggest(null)}}>{s}</div>
                      ))}
                      {suggestList.filter(s=>s.toLowerCase().includes(ex.nombre_examen.toLowerCase())).length===0&&(
                        <div style={{padding:'8px 12px',fontSize:12,color:'var(--text-muted)'}}>Escribe el nombre completo del examen</div>
                      )}
                    </div>
                  )}
                </div>
                {/* Fecha */}
                <div>
                  <input type="date" className="form-input" value={ex.fecha_examen}
                    onChange={e=>setField(ex.id,'fecha_examen',e.target.value)}
                    title="Fecha en que se realizó el examen"/>
                </div>
                <button className="btn-danger-ghost" onClick={()=>removeExamen(ex.id)}><Trash2 size={14}/></button>
              </div>
              {/* Observaciones libres */}
              <div style={{padding:'10px 12px'}}>
                <label className="form-label" style={{marginBottom:6}}>Observaciones / Resultados</label>
                <textarea className="form-textarea"
                  value={ex.observacion||''}
                  onChange={e=>setField(ex.id,'observacion',e.target.value)}
                  placeholder="Escriba aquí los resultados, valores, hallazgos o cualquier observación del examen..."
                  style={{minHeight:90,fontSize:13}}/>
              </div>
            </div>
          ))}

          <button className="btn-add" onClick={addExamen}>
            <Plus size={14}/> Agregar examen de {tab.toLowerCase()}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══ HELPERS ══ */
const emptyDiag=()=>({id:Date.now()+Math.random(),codigo:'',nombre:'',tipo:'presuntivo'})
const emptyTrat=()=>({id:Date.now()+Math.random(),medicamento:'',cantidad:'',posologia:''})

/* ══ MAIN COMPONENT ══ */
export default function NuevaAtencion({onSaved}){
  const today=new Date().toISOString().split('T')[0]
  const[saving,setSaving]=useState(false)
  const[alert,setAlert]=useState(null)
  const[cedulaBuscando,setCedulaBuscando]=useState(false)
  const[cedulaEncontrado,setCedulaEncontrado]=useState(false)
  const[fecha,setFecha]=useState(today)
  const[generales,setGenerales]=useState({nombres:'',apellidos:'',cedula:'',telefono:'',edad:'',sexo:'',ocupacion:'',fecha_nacimiento:'',estado_civil:'',direccion:'',correo:'',grupo_sanguineo:''})
  const[antecedentes,setAntecedentes]=useState({patologicos:'',alergicos:'',quirurgicos:'',familiares:'',gestas:'',partos:'',cesareas:'',abortos:'',planificacion:''})
  const[motivo,setMotivo]=useState('')
  const[vitales,setVitales]=useState({pa:'',temperatura:'',saturacion:'',fr:'',peso:'',talla:'',perimetro:''})
  const[evolucion,setEvolucion]=useState('')
  const[examenFisico,setExamenFisico]=useState({})
  const[diagnosticos,setDiagnosticos]=useState([emptyDiag()])
  const[examenes,setExamenes]=useState([])
  const[tratamientos,setTratamientos]=useState([emptyTrat()])
  const[observaciones,setObservaciones]=useState('')
  const[recomendaciones,setRecomendaciones]=useState('')
  const[seguimiento,setSeguimiento]=useState(false)
  const[proximaConsulta,setProximaConsulta]=useState('')
  const[horaConsulta,setHoraConsulta]=useState('')

  const imc=(()=>{const p=parseFloat(vitales.peso);const t=parseFloat(vitales.talla);if(p>0&&t>0)return(p/((t/100)**2)).toFixed(1);return''})()
  const imcClass=(()=>{const v=parseFloat(imc);if(!v)return'';if(v<18.5)return'Bajo peso';if(v<25)return'Normal';if(v<30)return'Sobrepeso';return'Obesidad'})()

  // Búsqueda por cédula
  useEffect(()=>{
    const cedula=generales.cedula.replace(/\D/g,'')
    if(cedula.length!==10){setCedulaEncontrado(false);return}
    const buscar=async()=>{
      setCedulaBuscando(true)
      try{
        const{data:pac}=await supabase.from('pacientes').select('*').eq('cedula',cedula).single()
        if(pac){
          setCedulaEncontrado(true)
          setGenerales(p=>({...p,nombres:pac.nombres||'',apellidos:pac.apellidos||'',telefono:pac.telefono||'',edad:pac.edad?.toString()||'',sexo:pac.sexo||'',ocupacion:pac.ocupacion||'',fecha_nacimiento:pac.fecha_nacimiento||'',estado_civil:pac.estado_civil||'',direccion:pac.direccion||'',correo:pac.correo||'',grupo_sanguineo:pac.grupo_sanguineo||''}))
          const{data:ant}=await supabase.from('antecedentes').select('*').eq('paciente_id',pac.id).single()
          if(ant){setAntecedentes({patologicos:ant.patologicos_personales||'',alergicos:ant.alergicos||'',quirurgicos:ant.quirurgicos||'',familiares:ant.patologicos_familiares||'',gestas:ant.gestas?.toString()||'',partos:ant.partos_vaginales?.toString()||'',cesareas:ant.cesareas?.toString()||'',abortos:ant.abortos?.toString()||'',planificacion:ant.metodo_planificacion||''})}
        }else{setCedulaEncontrado(false)}
      }catch(e){setCedulaEncontrado(false)}
      finally{setCedulaBuscando(false)}
    }
    const t=setTimeout(buscar,500);return()=>clearTimeout(t)
  },[generales.cedula])

  // Auto-calcular edad
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
      const{data:at,error:ate}=await supabase.from('atenciones').insert({paciente_id:pacienteId,fecha_atencion:fecha,motivo_consulta:motivo,presion_arterial:vitales.pa,temperatura:parseFloat(vitales.temperatura)||null,saturacion:parseFloat(vitales.saturacion)||null,frecuencia_respiratoria:parseInt(vitales.fr)||null,peso:parseFloat(vitales.peso)||null,talla:parseFloat(vitales.talla)||null,imc:parseFloat(imc)||null,perimetro_abdominal:parseFloat(vitales.perimetro)||null,evolucion,observaciones:observaciones||null,recomendaciones:recomendaciones||null,requiere_seguimiento:seguimiento,proxima_consulta:seguimiento&&proximaConsulta?proximaConsulta:null,hora_proxima_consulta:seguimiento&&horaConsulta?horaConsulta:null}).select('id').single()
      if(ate)throw ate
      // Examen físico regional
      const efData={atencion_id:at.id}
      EF_REGIONES.forEach(r=>{efData[r.key]=examenFisico[r.key]||null})
      await supabase.from('examen_fisico').insert(efData)
      // Diagnósticos
      const ds=diagnosticos.filter(d=>d.codigo||d.nombre);if(ds.length)await supabase.from('diagnosticos').insert(ds.map(d=>({atencion_id:at.id,codigo_cie10:d.codigo,nombre_cie10:d.nombre,tipo:d.tipo})))
      // Exámenes
      const exs=examenes.filter(e=>e.nombre_examen);if(exs.length)await supabase.from('examenes_resultados').insert(exs.map(e=>({atencion_id:at.id,tipo:e.tipo,nombre_examen:e.nombre_examen,fecha_examen:e.fecha_examen||null,observacion:e.observacion||null})))
      // Tratamientos
      const ts=tratamientos.filter(t=>t.medicamento);if(ts.length)await supabase.from('tratamientos').insert(ts.map(t=>({atencion_id:at.id,medicamento:t.medicamento,cantidad:t.cantidad,posologia:t.posologia})))
      setAlert({type:'success',msg:`✓ Atención guardada para ${generales.nombres} ${generales.apellidos}.`})
      window.scrollTo({top:0,behavior:'smooth'});setTimeout(()=>onSaved(),1200)
    }catch(err){setAlert({type:'error',msg:`Error al guardar: ${err.message}`})}
    finally{setSaving(false)}
  }

  return(
    <div>
      <div className="page-header">
        <div className="page-title"><Activity size={22}/>Nueva Atención Médica<span className="page-title-badge">Clínica</span></div>
        <div className="page-subtitle">Complete los datos del paciente y la atención médica</div>
      </div>
      {alert&&(<div className={`alert ${alert.type==='success'?'alert-success':'alert-error'}`} style={{marginBottom:16}}>{alert.type==='success'?<CheckCircle size={16}/>:<AlertTriangle size={16}/>}{alert.msg}</div>)}
      <div className="section-stack">

        {/* Fecha */}
        <Section icon={Calendar} title="Fecha de Atención">
          <div className="form-grid form-grid-4">
            <div className="form-group"><label className="form-label required">Fecha de la atención</label><input type="date" className="form-input" value={fecha} onChange={e=>setFecha(e.target.value)}/></div>
          </div>
        </Section>

        {/* Datos Generales */}
        <Section icon={User} title="Datos Generales del Paciente" subtitle="Información personal y de contacto">
          <div className="form-grid form-grid-3">
            <div className="form-group"><label className="form-label required">Nombres</label><input className="form-input" value={generales.nombres} onChange={e=>setGen('nombres',e.target.value)} placeholder="Nombres del paciente"/></div>
            <div className="form-group"><label className="form-label required">Apellidos</label><input className="form-input" value={generales.apellidos} onChange={e=>setGen('apellidos',e.target.value)} placeholder="Apellidos del paciente"/></div>
            <div className="form-group">
              <label className="form-label">Número de Cédula</label>
              <div className="pos-relative">
                <input className="form-input" value={generales.cedula} onChange={e=>setGen('cedula',e.target.value.replace(/\D/g,''))} placeholder="0912345678" maxLength={10} style={{paddingRight:36,borderColor:cedulaEncontrado?'var(--accent)':undefined}}/>
                <div style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)'}}>
                  {cedulaBuscando&&<span className="loading-spinner" style={{borderTopColor:'var(--primary)',borderColor:'var(--border)',width:14,height:14}}/>}
                  {!cedulaBuscando&&cedulaEncontrado&&<span style={{color:'var(--accent)',fontSize:16}}>✓</span>}
                </div>
              </div>
              {cedulaEncontrado&&<div style={{fontSize:11,color:'var(--accent)',marginTop:3,fontWeight:600}}>✓ Paciente encontrado — datos precargados</div>}
            </div>
            <div className="form-group"><label className="form-label">Fecha de Nacimiento</label><input type="date" className="form-input" value={generales.fecha_nacimiento} onChange={e=>setGen('fecha_nacimiento',e.target.value)}/></div>
            <div className="form-group"><label className="form-label">Edad (años)</label><input type="number" className="form-input" value={generales.edad} onChange={e=>setGen('edad',e.target.value)} placeholder="Se calcula automáticamente" style={generales.fecha_nacimiento?{background:'var(--surface-2)'}:{}} readOnly={!!generales.fecha_nacimiento}/></div>
            <div className="form-group"><label className="form-label">Sexo</label><select className="form-select" value={generales.sexo} onChange={e=>setGen('sexo',e.target.value)}><option value="">Seleccionar</option><option value="Masculino">Masculino</option><option value="Femenino">Femenino</option><option value="Otro">Otro</option></select></div>
            <div className="form-group"><label className="form-label">Estado Civil</label><select className="form-select" value={generales.estado_civil} onChange={e=>setGen('estado_civil',e.target.value)}><option value="">Seleccionar</option><option>Soltero/a</option><option>Casado/a</option><option>Unión libre</option><option>Divorciado/a</option><option>Viudo/a</option><option>Separado/a</option></select></div>
            <div className="form-group"><label className="form-label">Grupo Sanguíneo</label><select className="form-select" value={generales.grupo_sanguineo} onChange={e=>setGen('grupo_sanguineo',e.target.value)}><option value="">Seleccionar</option>{['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(g=><option key={g}>{g}</option>)}</select></div>
            <div className="form-group"><label className="form-label">Teléfono</label><input className="form-input" value={generales.telefono} onChange={e=>setGen('telefono',e.target.value)} placeholder="0991234567"/></div>
            <div className="form-group"><label className="form-label">Correo Electrónico</label><input type="email" className="form-input" value={generales.correo} onChange={e=>setGen('correo',e.target.value)} placeholder="paciente@email.com"/></div>
            <div className="form-group"><label className="form-label">Ocupación</label><input className="form-input" value={generales.ocupacion} onChange={e=>setGen('ocupacion',e.target.value)} placeholder="Cargo o función"/></div>
            <div className="form-group col-span-3"><label className="form-label">Dirección Domiciliaria</label><input className="form-input" value={generales.direccion} onChange={e=>setGen('direccion',e.target.value)} placeholder="Calle, número, sector, ciudad"/></div>
          </div>
        </Section>

        {/* Antecedentes */}
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

        {/* Motivo */}
        <Section icon={FileText} title="Motivo de Consulta" color="#2B6CB0">
          <div className="form-group"><label className="form-label required">Motivo de consulta</label><textarea className="form-textarea" value={motivo} onChange={e=>setMotivo(e.target.value)} placeholder="Describa el motivo principal de la consulta..." style={{minHeight:80}}/></div>
        </Section>

        {/* Signos Vitales — SIN estado de consciencia */}
        <Section icon={Activity} title="Signos Vitales" subtitle="Parámetros fisiológicos del paciente" color="#2F855A">
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(120px,1fr))',gap:12}}>
            {[{key:'pa',label:'Presión Arterial',unit:'mmHg',placeholder:'120/80'},{key:'temperatura',label:'Temperatura',unit:'°C',placeholder:'36.5'},{key:'saturacion',label:'Saturación O₂',unit:'%',placeholder:'98'},{key:'fr',label:'Frec. Respiratoria',unit:'rpm',placeholder:'18'},{key:'peso',label:'Peso',unit:'kg',placeholder:'70'},{key:'talla',label:'Talla',unit:'cm',placeholder:'170'},{key:'perimetro',label:'Perím. Abdominal',unit:'cm',placeholder:'85'}].map(({key,label,unit,placeholder})=>(
              <div key={key} className="vital-card">
                <div className="vital-card-label">{label}</div>
                <input value={vitales[key]} onChange={e=>setVit(key,e.target.value)} placeholder={placeholder}/>
                <div className="vital-card-unit">{unit}</div>
              </div>
            ))}
            <div className="vital-card" style={{background:'var(--accent-soft)',borderColor:'rgba(0,201,167,0.3)'}}>
              <div className="vital-card-label">IMC</div>
              <input value={imc||'—'} readOnly style={{color:'var(--accent)',cursor:'default'}}/>
              <div className="vital-card-unit">{imcClass||'kg/m²'}</div>
            </div>
          </div>
        </Section>

        {/* Examen Físico Regional — nuevo */}
        <Section icon={Eye} title="Examen Físico Regional" subtitle="Deje en blanco = Normal. Escriba si hay hallazgos." color="#2C7A7B">
          <ExamenFisicoRegional value={examenFisico} onChange={setExamenFisico}/>
        </Section>

        {/* Evolución */}
        <Section icon={Clipboard} title="Evolución del Paciente" subtitle="Descripción clínica y seguimiento" color="#553C9A">
          <div className="form-group"><label className="form-label">Evolución</label><textarea className="form-textarea" value={evolucion} onChange={e=>setEvolucion(e.target.value)} placeholder="Descripción de la evolución clínica, hallazgos al examen físico..." style={{minHeight:120}}/></div>
        </Section>

        {/* Diagnóstico CIE-10 */}
        <Section icon={Search} title="Diagnóstico CIE-10" subtitle="Búsqueda automática — escriba código o nombre en español" color="#2B6CB0">
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

        {/* Resultados de Exámenes */}
        <ExamenesSection examenes={examenes} setExamenes={setExamenes}/>

        {/* Tratamiento */}
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
          {/* Observaciones y Recomendaciones */}
          <div style={{marginTop:20,borderTop:'1.5px dashed var(--border-light)',paddingTop:16,display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div className="form-group">
              <label className="form-label" style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:15}}>📝</span> Observaciones</label>
              <textarea className="form-textarea" value={observaciones} onChange={e=>setObservaciones(e.target.value)} placeholder="Observaciones clínicas adicionales, notas del médico..." style={{minHeight:90}}/>
            </div>
            <div className="form-group">
              <label className="form-label" style={{display:'flex',alignItems:'center',gap:6}}><span style={{fontSize:15}}>💡</span> Recomendaciones</label>
              <textarea className="form-textarea" value={recomendaciones} onChange={e=>setRecomendaciones(e.target.value)} placeholder="Reposo, dieta, actividad física, evitar exposición a ruido, usar EPP..." style={{minHeight:90}}/>
            </div>
          </div>
        </Section>

        {/* Seguimiento */}
        <div className="seguimiento-panel">
          <div>
            <div style={{fontFamily:'var(--font-display)',fontWeight:600,color:'var(--primary)',marginBottom:4,display:'flex',alignItems:'center',gap:8}}><Clock size={16}/> Seguimiento del paciente</div>
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

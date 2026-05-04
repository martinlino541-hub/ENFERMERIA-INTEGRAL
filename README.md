# 🏥 CASISO — Sistema Médico Ocupacional

Sistema de gestión de atenciones médicas ocupacionales desarrollado con **React + Vite + Supabase**.

---

## ✅ Funcionalidades

- **Nueva Atención**: Formulario completo con todos los campos médicos
  - Datos generales del paciente
  - Antecedentes personales, alérgicos, quirúrgicos, familiares
  - Antecedentes ginecobstétricos (G P C A + planificación)
  - Motivo de consulta
  - Signos vitales con **IMC automático**
  - Estado de consciencia (Alerta / Somnoliento / Obnubilación / Estupor / Coma)
  - Evolución clínica
  - Diagnósticos CIE-10 con buscador integrado
  - Tratamiento (medicamento + cantidad + posología)
  - Seguimiento con fecha próxima consulta

- **Registro de Pacientes**: Matriz completa con todos los campos, búsqueda y filtros
- **Vista detallada** modal por paciente

---

## 🚀 Despliegue en 3 pasos

### PASO 1 — Supabase (Base de Datos)

1. Crear cuenta en [supabase.com](https://supabase.com)
2. Crear nuevo proyecto
3. Ir a **SQL Editor** → pegar y ejecutar el archivo `supabase-schema.sql`
4. Ir a **Project Settings → API** y copiar:
   - `Project URL` → será tu `VITE_SUPABASE_URL`
   - `anon public key` → será tu `VITE_SUPABASE_ANON_KEY`

### PASO 2 — GitHub

```bash
git init
git add .
git commit -m "Initial commit: CASISO Medical System"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/casiso-medico.git
git push -u origin main
```

### PASO 3 — Render (Deploy automático)

1. Crear cuenta en [render.com](https://render.com)
2. **New → Static Site** → conectar tu repositorio GitHub
3. Configurar:
   - **Name**: casiso-medico (o el nombre que prefieras)
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`
4. En **Environment Variables** agregar:
   - `VITE_SUPABASE_URL` = tu URL de Supabase
   - `VITE_SUPABASE_ANON_KEY` = tu clave anon de Supabase
5. Click **Create Static Site**

¡Listo! Render dará una URL pública tipo `https://casiso-medico.onrender.com`

---

## 💻 Desarrollo local

```bash
# 1. Instalar dependencias
npm install

# 2. Crear archivo de variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Supabase

# 3. Ejecutar en modo desarrollo
npm run dev
```

---

## 🗄️ Estructura del proyecto

```
medico-app/
├── src/
│   ├── main.jsx              # Punto de entrada
│   ├── App.jsx               # Navegación principal
│   ├── supabaseClient.js     # Configuración Supabase
│   ├── components/
│   │   ├── NuevaAtencion.jsx # Formulario de atención
│   │   └── RegistroPacientes.jsx # Matriz de registros
│   └── styles/
│       └── index.css         # Estilos globales
├── supabase-schema.sql       # Schema de base de datos
├── .env.example              # Variables de entorno de ejemplo
└── vite.config.js
```

---

## 🏥 Desarrollado por CASISO S.A.S.
**Consultoría Ambiental, Seguridad Industrial y Salud Ocupacional**

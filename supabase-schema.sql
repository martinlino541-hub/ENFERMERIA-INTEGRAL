-- =====================================================
-- CASISO Medical System - Supabase Schema
-- Run this SQL in your Supabase SQL Editor
-- =====================================================

-- 1. PACIENTES
CREATE TABLE IF NOT EXISTS pacientes (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombres     TEXT NOT NULL,
  apellidos   TEXT NOT NULL,
  cedula      TEXT UNIQUE,
  telefono    TEXT,
  edad        INTEGER,
  sexo        TEXT CHECK (sexo IN ('Masculino', 'Femenino', 'Otro')),
  ocupacion   TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ANTECEDENTES
CREATE TABLE IF NOT EXISTS antecedentes (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id             UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  patologicos_personales  TEXT,
  alergicos               TEXT,
  quirurgicos             TEXT,
  patologicos_familiares  TEXT,
  gestas                  INTEGER,
  partos_vaginales        INTEGER,
  cesareas                INTEGER,
  abortos                 INTEGER,
  metodo_planificacion    TEXT,
  updated_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ATENCIONES
CREATE TABLE IF NOT EXISTS atenciones (
  id                      UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  paciente_id             UUID REFERENCES pacientes(id) ON DELETE CASCADE,
  fecha_atencion          DATE NOT NULL DEFAULT CURRENT_DATE,
  motivo_consulta         TEXT,
  -- Signos Vitales
  presion_arterial        TEXT,
  temperatura             NUMERIC(4,1),
  saturacion              NUMERIC(5,2),
  frecuencia_respiratoria INTEGER,
  estado_consciencia      TEXT DEFAULT 'Alerta',
  peso                    NUMERIC(5,2),
  talla                   NUMERIC(5,1),
  imc                     NUMERIC(5,2),
  perimetro_abdominal     NUMERIC(5,1),
  -- Clínica
  evolucion               TEXT,
  -- Seguimiento
  requiere_seguimiento    BOOLEAN DEFAULT FALSE,
  proxima_consulta        DATE,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

-- 4. DIAGNÓSTICOS
CREATE TABLE IF NOT EXISTS diagnosticos (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  atencion_id  UUID REFERENCES atenciones(id) ON DELETE CASCADE,
  codigo_cie10 TEXT,
  nombre_cie10 TEXT,
  tipo         TEXT DEFAULT 'presuntivo' CHECK (tipo IN ('definitivo', 'presuntivo'))
);

-- 5. TRATAMIENTOS
CREATE TABLE IF NOT EXISTS tratamientos (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  atencion_id  UUID REFERENCES atenciones(id) ON DELETE CASCADE,
  medicamento  TEXT,
  cantidad     TEXT,
  posologia    TEXT
);

-- ── ROW LEVEL SECURITY (opcional pero recomendado) ──
-- Descomenta si deseas usar autenticación de Supabase

-- ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE antecedentes ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE atenciones ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE tratamientos ENABLE ROW LEVEL SECURITY;

-- Para desarrollo sin auth, habilita acceso público:
CREATE POLICY "Public access" ON pacientes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON antecedentes FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON atenciones FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON diagnosticos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public access" ON tratamientos FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE pacientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE antecedentes ENABLE ROW LEVEL SECURITY;
ALTER TABLE atenciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE diagnosticos ENABLE ROW LEVEL SECURITY;
ALTER TABLE tratamientos ENABLE ROW LEVEL SECURITY;

-- ── INDEXES para performance ──
CREATE INDEX IF NOT EXISTS idx_atenciones_paciente ON atenciones(paciente_id);
CREATE INDEX IF NOT EXISTS idx_atenciones_fecha ON atenciones(fecha_atencion DESC);
CREATE INDEX IF NOT EXISTS idx_diagnosticos_atencion ON diagnosticos(atencion_id);
CREATE INDEX IF NOT EXISTS idx_tratamientos_atencion ON tratamientos(atencion_id);
CREATE INDEX IF NOT EXISTS idx_pacientes_cedula ON pacientes(cedula);

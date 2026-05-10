import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { UserPlus, X, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

// Email del administrador — CAMBIAR por tu email real
const ADMIN_EMAIL = 'martinlino541@gmail.com'

export default function CrearUsuario({ onClose }) {
  const { user } = useAuth()
  const [nombre, setNombre] = useState('')
  const [apellido, setApellido] = useState('')
  const [especialidad, setEspecialidad] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Solo el admin puede crear usuarios
  if (user?.email !== ADMIN_EMAIL) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title" style={{ color: 'var(--danger)' }}>Acceso denegado</div>
            <button onClick={onClose} className="btn btn-ghost" style={{ padding: 8 }}><X size={18}/></button>
          </div>
          <div className="modal-body">
            <p style={{ fontSize: 14, color: 'var(--text-secondary)' }}>
              Solo el administrador puede crear nuevos usuarios.
            </p>
            <button className="btn btn-primary" onClick={onClose} style={{ marginTop: 16 }}>Cerrar</button>
          </div>
        </div>
      </div>
    )
  }

  const handleCrear = async (e) => {
    e.preventDefault()
    if (!nombre || !email || !password) { setError('Complete los campos obligatorios.'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres.'); return }
    setLoading(true); setError(''); setSuccess('')
    try {
      // Crear usuario en Supabase Auth
      const { data, error: authErr } = await supabase.auth.admin.createUser({
        email, password,
        email_confirm: true,
        user_metadata: { nombre, apellido, especialidad }
      })
      if (authErr) throw authErr

      // Crear perfil
      await supabase.from('perfiles').insert({
        id: data.user.id,
        nombre, apellido, especialidad
      })

      setSuccess(`✓ Usuario creado: ${nombre} ${apellido} (${email})`)
      setNombre(''); setApellido(''); setEspecialidad(''); setEmail(''); setPassword('')
    } catch (err) {
      if (err.message?.includes('already registered')) {
        setError('Este email ya está registrado en el sistema.')
      } else {
        setError(`Error: ${err.message}`)
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" style={{ maxWidth: 500 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <UserPlus size={20}/> Crear Nuevo Usuario
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
              El nuevo médico podrá iniciar sesión inmediatamente
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost" style={{ padding: 8 }}><X size={18}/></button>
        </div>
        <div className="modal-body">
          <form onSubmit={handleCrear}>
            <div className="form-grid form-grid-2" style={{ marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label required">Nombres</label>
                <input className="form-input" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Dr. Juan"/>
              </div>
              <div className="form-group">
                <label className="form-label">Apellidos</label>
                <input className="form-input" value={apellido} onChange={e => setApellido(e.target.value)} placeholder="Pérez"/>
              </div>
              <div className="form-group col-span-2">
                <label className="form-label">Especialidad</label>
                <input className="form-input" value={especialidad} onChange={e => setEspecialidad(e.target.value)} placeholder="Medicina General, Pediatría..."/>
              </div>
              <div className="form-group col-span-2">
                <label className="form-label required">Correo electrónico</label>
                <input type="email" className="form-input" value={email} onChange={e => setEmail(e.target.value)} placeholder="medico@ejemplo.com"/>
              </div>
              <div className="form-group col-span-2">
                <label className="form-label required">Contraseña inicial</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-input" value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    style={{ paddingRight: 40 }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3 }}>
                  El médico puede cambiarla después desde su perfil
                </div>
              </div>
            </div>

            {error && (
              <div className="alert alert-error" style={{ marginBottom: 12 }}>
                <AlertCircle size={15}/> {error}
              </div>
            )}
            {success && (
              <div className="alert alert-success" style={{ marginBottom: 12 }}>
                <CheckCircle size={15}/> {success}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button type="button" className="btn btn-ghost" onClick={onClose}>Cerrar</button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? <span className="loading-spinner"/> : <UserPlus size={15}/>}
                {loading ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

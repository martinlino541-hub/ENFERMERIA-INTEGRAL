import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { Eye, EyeOff, LogIn, AlertCircle, CheckCircle } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!email || !password) { setError('Ingrese email y contraseña.'); return }
    setLoading(true); setError(''); setMsg('')
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) {
        if (err.message.includes('Invalid login')) setError('Email o contraseña incorrectos.')
        else setError(err.message)
      }
    } catch (e) { setError('Error al conectar. Intente de nuevo.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0B4F71 0%, #1A8FBD 50%, #00C9A7 100%)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 20, fontFamily: 'var(--font-body)'
    }}>
      <div style={{
        background: 'white', borderRadius: 20,
        padding: '40px 36px', maxWidth: 420, width: '100%',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)'
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, background: 'linear-gradient(135deg, #0B4F71, #1A8FBD)',
            borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 30, margin: '0 auto 16px'
          }}>🏥</div>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 26, color: '#0B4F71' }}>
            CASISO
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            Sistema Médico · Iniciar Sesión
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email" className="form-input"
              value={email} onChange={e => setEmail(e.target.value)}
              placeholder="medico@ejemplo.com"
              autoComplete="email"
              style={{ fontSize: 15 }}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'} className="form-input"
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                style={{ fontSize: 15, paddingRight: 40 }}
              />
              <button type="button" onClick={() => setShowPass(!showPass)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: 'var(--danger-soft)', border: '1px solid #FEB2B2', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <AlertCircle size={15} /> {error}
            </div>
          )}

          {msg && (
            <div style={{ background: 'var(--success-soft)', border: '1px solid #9AE6B4', borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <CheckCircle size={15} /> {msg}
            </div>
          )}

          <button type="submit" className="btn-save" disabled={loading}
            style={{ marginTop: 8, justifyContent: 'center', width: '100%' }}>
            {loading ? <span className="loading-spinner"/> : <LogIn size={18}/>}
            {loading ? 'Ingresando...' : 'Ingresar al Sistema'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
          ¿No tiene acceso? Contacte al administrador del sistema para obtener sus credenciales.
        </div>
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import {
  getAdminSession,
  logoutAdmin,
  type AdminIdentity,
} from '../services/adminApi'
import './adminPage.css'

type SessionState =
  | { status: 'checking' }
  | { status: 'ready'; administrator: AdminIdentity }
  | { status: 'error' }

function AdminPage() {
  const navigate = useNavigate()
  const [session, setSession] = useState<SessionState>({
    status: 'checking',
  })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [retry, setRetry] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getAdminSession(controller.signal)
      .then((administrator) => {
        if (controller.signal.aborted) return

        if (!administrator) {
          navigate('/admin/login', { replace: true })
          return
        }

        setSession({ status: 'ready', administrator })
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setSession({ status: 'error' })
        }
      })

    return () => controller.abort()
  }, [navigate, retry])

  async function handleLogout() {
    if (busy) return

    setBusy(true)
    setError('')

    try {
      await logoutAdmin()
      navigate('/admin/login', { replace: true })
    } catch {
      setError('Não foi possível confirmar a saída. Tente novamente.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="admin-page container">
      <div className="admin-card admin-card-wide">
        <p className="admin-label">Área administrativa</p>
        <h1 className="admin-title">Ateliê Anayvillin</h1>

        {session.status === 'checking' && (
          <p role="status">Verificando acesso…</p>
        )}

        {session.status === 'error' && (
          <>
            <p className="admin-error" role="alert">
              Não foi possível verificar seu acesso.
            </p>

            <button
              type="button"
              className="admin-button"
              onClick={() => {
                setSession({ status: 'checking' })
                setRetry((current) => current + 1)
              }}
            >
              Tentar novamente
            </button>
          </>
        )}

        {session.status === 'ready' && (
          <>
            <p className="admin-welcome">
              Olá, {session.administrator.name}.
            </p>

            <div className="admin-actions">
              <Link to="/catalogo" className="admin-link">
                Ver catálogo
              </Link>

              <button
                type="button"
                className="admin-button"
                disabled={busy}
                onClick={handleLogout}
              >
                {busy ? 'Saindo…' : 'Sair'}
              </button>
            </div>

            {error && (
              <p className="admin-error" role="alert">
                {error}
              </p>
            )}
          </>
        )}
      </div>
    </section>
  )
}

export default AdminPage
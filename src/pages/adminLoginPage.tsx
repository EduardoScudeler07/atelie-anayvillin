import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { getAdminSession, loginAdmin } from '../services/adminApi'
import './adminPage.css'

function AdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [checking, setChecking] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    getAdminSession(controller.signal)
      .then((administrator) => {
        if (controller.signal.aborted) return

        if (administrator) {
          navigate('/admin', { replace: true })
        } else {
          setChecking(false)
        }
      })
      .catch(() => {
        if (controller.signal.aborted) return

        setChecking(false)
        setError('Não foi possível verificar a sessão. Tente entrar novamente.')
      })

    return () => controller.abort()
  }, [navigate])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || checking) return

    setBusy(true)
    setError('')

    try {
      await loginAdmin(username, password)
      setPassword('')
      navigate('/admin', { replace: true })
    } catch (cause) {
      setPassword('')
      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível entrar. Tente novamente.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section className="admin-page container">
      <div className="admin-card">
        <p className="admin-label">Área administrativa</p>
        <h1 className="admin-title">Entrar no ateliê</h1>

        {checking ? (
          <p role="status">Verificando sessão…</p>
        ) : (
          <form method="post" onSubmit={handleSubmit}>
            <div className="admin-field">
              <label htmlFor="admin-username">Usuário</label>
              <input
                id="admin-username"
                name="username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                minLength={3}
                maxLength={40}
                required
                disabled={busy}
                value={username}
                onChange={(event) => setUsername(event.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="admin-password">Senha</label>
              <input
                id="admin-password"
                name="password"
                type="password"
                autoComplete="current-password"
                maxLength={128}
                required
                disabled={busy}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

            {error && (
              <p className="admin-error" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="admin-button admin-submit"
              disabled={busy}
            >
              {busy ? 'Entrando…' : 'Entrar'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}

export default AdminLoginPage
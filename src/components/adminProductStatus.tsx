import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { AdminSessionExpiredError } from '../services/adminProductsApi'
import {
  changeAdminProductStatus,
  getProductReview,
  type ProductReview,
  type ProductStatus,
  type ProductStatusAction,
} from '../services/adminProductStatusApi'

type Props = {
  productId: string
  action: ProductStatusAction
  onCancel: () => void
  onChanged: (name: string, status: ProductStatus) => void
}

type ReviewState =
  | { status: 'loading' }
  | { status: 'ready'; product: ProductReview }
  | { status: 'error' }

const actionLabels: Record<ProductStatusAction, string> = {
  publicar: 'Publicar peça',
  arquivar: 'Arquivar peça',
  'voltar-rascunho': 'Voltar a rascunho',
}

function canPerform(
  status: ProductStatus,
  action: ProductStatusAction,
): boolean {
  if (action === 'publicar') return status === 'rascunho'
  if (action === 'arquivar') return status !== 'arquivado'
  return status !== 'rascunho'
}

function AdminProductStatus({
  productId,
  action,
  onCancel,
  onChanged,
}: Props) {
  const navigate = useNavigate()
  const [state, setState] = useState<ReviewState>({
    status: 'loading',
  })
  const [retry, setRetry] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [mustReload, setMustReload] = useState(false)

  useEffect(() => {
    const controller = new AbortController()

    getProductReview(productId, controller.signal)
      .then((product) => {
        if (!controller.signal.aborted) {
          setState({ status: 'ready', product })
        }
      })
      .catch((cause: unknown) => {
        if (controller.signal.aborted) return

        if (cause instanceof AdminSessionExpiredError) {
          navigate('/admin/login', { replace: true })
          return
        }

        setState({ status: 'error' })
      })

    return () => controller.abort()
  }, [productId, retry, navigate])

  function reloadReview() {
    setError('')
    setMustReload(false)
    setState({ status: 'loading' })
    setRetry((current) => current + 1)
  }

  async function confirmChange() {
    if (busy || mustReload || state.status !== 'ready') return

    const product = state.product
    setBusy(true)
    setError('')

    try {
      const status = await changeAdminProductStatus(
        product,
        action,
      )

      onChanged(product.name, status)
    } catch (cause: unknown) {
      if (cause instanceof AdminSessionExpiredError) {
        navigate('/admin/login', { replace: true })
        return
      }

      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível confirmar a alteração.',
      )

      setMustReload(true)
    } finally {
      setBusy(false)
    }
  }

  const product =
    state.status === 'ready' ? state.product : null

  const missing: string[] = []

  if (product && action === 'publicar') {
    if (product.name.trim().length < 3) {
      missing.push('Preencha o nome da peça.')
    }

    if (!product.description.trim()) {
      missing.push('Preencha a descrição.')
    }

    if (!product.image || !product.imageAlt?.trim()) {
      missing.push('Cadastre uma foto com texto alternativo.')
    }
  }

  const allowed =
    product !== null &&
    canPerform(product.status, action)

  return (
    <section
      className="admin-product-form"
      aria-labelledby="admin-status-title"
      aria-busy={busy}
    >
      <h3 id="admin-status-title">
        {actionLabels[action]}
      </h3>

      {state.status === 'loading' && (
        <p role="status">Carregando revisão…</p>
      )}

      {state.status === 'error' && (
        <>
          <p className="admin-error" role="alert">
            Não foi possível carregar a revisão.
          </p>

          <button
            type="button"
            className="admin-button"
            onClick={reloadReview}
          >
            Tentar novamente
          </button>
        </>
      )}

      {product && (
        <>
          {product.image && (
            <img
              src={product.image}
              alt={product.imageAlt ?? product.name}
              width="180"
              height="180"
              style={{
                display: 'block',
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: '12px',
              }}
            />
          )}

          <h4>{product.name}</h4>

          <p>
            {product.collection} · {product.material}
          </p>

          <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
            {product.description || 'Descrição ainda não preenchida.'}
          </p>

          {action === 'publicar' && (
            <p>
              Ao confirmar, esta peça ficará visível no catálogo
              público deste ambiente.
            </p>
          )}

          {action === 'arquivar' && (
            <p>
              Ao confirmar, esta peça ficará fora do catálogo.
              Seus dados e sua foto serão preservados.
            </p>
          )}

          {action === 'voltar-rascunho' && (
            <p>
              A peça ficará fora do catálogo e poderá ser editada.
              Para aparecer novamente, será necessário publicá-la.
            </p>
          )}

          {!allowed && (
            <p className="admin-error" role="alert">
              A situação da peça mudou. Volte à lista para conferir.
            </p>
          )}

          {missing.length > 0 && (
            <div className="admin-error">
              <p>Antes de publicar:</p>

              <ul>
                {missing.map((message) => (
                  <li key={message}>{message}</li>
                ))}
              </ul>
            </div>
          )}

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          {mustReload && (
            <button
              type="button"
              className="admin-button"
              disabled={busy}
              onClick={reloadReview}
            >
              Recarregar revisão
            </button>
          )}

          <button
            type="button"
            className="admin-button"
            disabled={
              busy ||
              mustReload ||
              !allowed ||
              missing.length > 0
            }
            onClick={confirmChange}
          >
            {busy ? 'Confirmando…' : actionLabels[action]}
          </button>
        </>
      )}

      <button
        type="button"
        className="admin-link-button"
        disabled={busy}
        onClick={onCancel}
      >
        Voltar à lista
      </button>
    </section>
  )
}

export default AdminProductStatus
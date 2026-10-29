import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  AdminSessionExpiredError,
  getAdminDraft,
  type CreatedDraftProduct,
  type EditableDraftProduct,
} from '../services/adminProductsApi'
import AdminProductForm from './adminProductForm'

type Props = {
  id: string
  onSaved: (product: CreatedDraftProduct) => void
  onCancel: () => void
}

type EditorState =
  | { status: 'loading' }
  | { status: 'ready'; product: EditableDraftProduct }
  | { status: 'error'; message: string }

function AdminDraftEditor({ id, onSaved, onCancel }: Props) {
  const navigate = useNavigate()
  const [retry, setRetry] = useState(0)
  const [state, setState] = useState<EditorState>({
    status: 'loading',
  })

  useEffect(() => {
    const controller = new AbortController()

    getAdminDraft(id, controller.signal)
      .then((product) => {
        if (!controller.signal.aborted) {
          setState({ status: 'ready', product })
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        if (error instanceof AdminSessionExpiredError) {
          navigate('/admin/login', { replace: true })
          return
        }

        setState({
          status: 'error',
          message: error instanceof Error
            ? error.message
            : 'Não foi possível carregar o rascunho.',
        })
      })

    return () => controller.abort()
  }, [id, retry, navigate])

  if (state.status === 'ready') {
    return (
      <AdminProductForm
        key={`${state.product.id}:${state.product.updatedAt}`}
        initialProduct={state.product}
        onCreated={onSaved}
        onCancel={onCancel}
      />
    )
  }

  return (
    <div className="admin-product-form">
      {state.status === 'loading' ? (
        <p role="status">Carregando rascunho…</p>
      ) : (
        <p className="admin-error" role="alert">
          {state.message}
        </p>
      )}

      <div className="admin-form-actions">
        {state.status === 'error' && (
          <button
            type="button"
            className="admin-button"
            onClick={() => {
              setState({ status: 'loading' })
              setRetry((current) => current + 1)
            }}
          >
            Tentar novamente
          </button>
        )}

        <button
          type="button"
          className="admin-link-button"
          onClick={onCancel}
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}

export default AdminDraftEditor
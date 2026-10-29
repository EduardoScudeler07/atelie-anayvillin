import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import {
  AdminSessionExpiredError,
  getAdminProducts,
  type AdminProductPage,
  type CreatedDraftProduct,
} from '../services/adminProductsApi'
import type {
  ProductStatus,
  ProductStatusAction,
} from '../services/adminProductStatusApi'
import AdminProductForm from './adminProductForm'
import AdminDraftEditor from './adminDraftEditor'
import AdminProductImages from './adminProductImages'
import AdminProductStatus from './adminProductStatus'
import './adminProducts.css'

type ListState =
  | { status: 'loading' }
  | { status: 'ready'; data: AdminProductPage }
  | { status: 'error' }

type EditorState =
  | { mode: 'create' }
  | { mode: 'edit'; id: string }
  | {
      mode: 'photos'
      id: string
      name: string
      canUpload: boolean
    }
  | {
      mode: 'status'
      id: string
      action: ProductStatusAction
    }
  | null

const statusLabels = {
  rascunho: 'Rascunho',
  publicado: 'Publicado',
  arquivado: 'Arquivado',
}

function AdminProducts() {
  const navigate = useNavigate()
  const [page, setPage] = useState(1)
  const [retry, setRetry] = useState(0)
  const [editor, setEditor] = useState<EditorState>(null)
  const [notice, setNotice] = useState('')
  const [state, setState] = useState<ListState>({
    status: 'loading',
  })

  useEffect(() => {
    const controller = new AbortController()

    getAdminProducts(page, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setState({ status: 'ready', data })
        }
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return

        if (error instanceof AdminSessionExpiredError) {
          navigate('/admin/login', { replace: true })
          return
        }

        setState({ status: 'error' })
      })

    return () => controller.abort()
  }, [page, retry, navigate])

  function changePage(nextPage: number) {
    setState({ status: 'loading' })
    setPage(nextPage)
  }

  function closeEditor() {
    setEditor(null)
    setState({ status: 'loading' })
    setRetry((current) => current + 1)
  }

  function handleSaved(product: CreatedDraftProduct) {
    const editing = editor?.mode === 'edit'

    setNotice(
      editing
        ? `Alterações de “${product.name}” salvas.`
        : `Rascunho “${product.name}” salvo.`,
    )

    if (!editing) setPage(1)

    closeEditor()
  }

  function handleStatusChanged(
    name: string,
    status: ProductStatus,
  ) {
    setNotice(
      `Situação de “${name}” atualizada: ${statusLabels[status]}.`,
    )

    closeEditor()
  }

  function openStatusReview(
    id: string,
    action: ProductStatusAction,
  ) {
    setNotice('')
    setEditor({ mode: 'status', id, action })
  }

  return (
    <section
      className="admin-products"
      aria-labelledby="admin-products-title"
    >
      <div className="admin-products-heading">
        <h2 id="admin-products-title">Peças cadastradas</h2>

        <button
          type="button"
          className="admin-button"
          disabled={editor !== null}
          aria-expanded={editor !== null}
          aria-controls="admin-product-editor"
          onClick={() => {
            setNotice('')
            setEditor({ mode: 'create' })
          }}
        >
          Nova peça
        </button>
      </div>

      {notice && (
        <p className="admin-success" role="status">
          {notice}
        </p>
      )}

      <div id="admin-product-editor" hidden={editor === null}>
        {editor?.mode === 'create' && (
          <AdminProductForm
            key="create"
            onCancel={closeEditor}
            onCreated={handleSaved}
          />
        )}

        {editor?.mode === 'edit' && (
          <AdminDraftEditor
            key={editor.id}
            id={editor.id}
            onCancel={closeEditor}
            onSaved={handleSaved}
          />
        )}

        {editor?.mode === 'photos' && (
          <AdminProductImages
            key={`photos:${editor.id}`}
            productId={editor.id}
            productName={editor.name}
            canUpload={editor.canUpload}
            onClose={closeEditor}
          />
        )}

        {editor?.mode === 'status' && (
          <AdminProductStatus
            key={`status:${editor.id}:${editor.action}`}
            productId={editor.id}
            action={editor.action}
            onCancel={closeEditor}
            onChanged={handleStatusChanged}
          />
        )}
      </div>

      {editor === null && (
        <>
          {state.status === 'loading' && (
            <p role="status">Carregando peças…</p>
          )}

          {state.status === 'error' && (
            <>
              <p className="admin-error" role="alert">
                Não foi possível carregar as peças.
              </p>

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
            </>
          )}

          {state.status === 'ready' && (
            <>
              <p className="admin-products-count">
                {state.data.total === 1
                  ? '1 peça cadastrada'
                  : `${state.data.total} peças cadastradas`}
              </p>

              {state.data.products.length === 0 ? (
                <p>Nenhuma peça encontrada nesta página.</p>
              ) : (
                <ul className="admin-product-list">
                  {state.data.products.map((product) => (
                    <li
                      className="admin-product-row"
                      key={product.id}
                    >
                      {product.image ? (
                        <img
                          className="admin-product-image"
                          src={product.image}
                          alt={product.imageAlt ?? product.name}
                          width="64"
                          height="64"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <span className="admin-product-placeholder">
                          Sem foto
                        </span>
                      )}

                      <div className="admin-product-information">
                        <h3>{product.name}</h3>
                        <p>
                          {product.collection} · {product.material}
                        </p>
                      </div>

                      <div className="admin-product-controls">
                        <span
                          className={`admin-product-status admin-product-status-${product.status}`}
                        >
                          {statusLabels[product.status]}
                        </span>

                        {product.status === 'rascunho' && (
                          <button
                            type="button"
                            className="admin-link-button"
                            aria-label={`Editar ${product.name}`}
                            onClick={() => {
                              setNotice('')
                              setEditor({
                                mode: 'edit',
                                id: product.id,
                              })
                            }}
                          >
                            Editar
                          </button>
                        )}

                        <button
                          type="button"
                          className="admin-link-button"
                          aria-label={`Fotos de ${product.name}`}
                          onClick={() => {
                            setNotice('')
                            setEditor({
                              mode: 'photos',
                              id: product.id,
                              name: product.name,
                              canUpload:
                                product.status === 'rascunho',
                            })
                          }}
                        >
                          Fotos
                        </button>

                        {product.status === 'rascunho' && (
                          <button
                            type="button"
                            className="admin-link-button"
                            aria-label={`Revisar publicação de ${product.name}`}
                            onClick={() =>
                              openStatusReview(
                                product.id,
                                'publicar',
                              )
                            }
                          >
                            Publicar
                          </button>
                        )}

                        {product.status !== 'arquivado' && (
                          <button
                            type="button"
                            className="admin-link-button"
                            aria-label={`Revisar arquivamento de ${product.name}`}
                            onClick={() =>
                              openStatusReview(
                                product.id,
                                'arquivar',
                              )
                            }
                          >
                            Arquivar
                          </button>
                        )}

                        {product.status !== 'rascunho' && (
                          <button
                            type="button"
                            className="admin-link-button"
                            aria-label={`Voltar ${product.name} a rascunho`}
                            onClick={() =>
                              openStatusReview(
                                product.id,
                                'voltar-rascunho',
                              )
                            }
                          >
                            Voltar a rascunho
                          </button>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <nav
                className="admin-products-pagination"
                aria-label="Páginas das peças cadastradas"
              >
                <button
                  type="button"
                  className="admin-button"
                  disabled={page <= 1}
                  onClick={() => changePage(page - 1)}
                >
                  Anterior
                </button>

                <span aria-live="polite">
                  Página {page} de{' '}
                  {Math.max(
                    1,
                    Math.ceil(
                      state.data.total / state.data.pageSize,
                    ),
                  )}
                </span>

                <button
                  type="button"
                  className="admin-button"
                  disabled={
                    page >= 10000 ||
                    page * state.data.pageSize >= state.data.total
                  }
                  onClick={() => changePage(page + 1)}
                >
                  Próxima
                </button>
              </nav>
            </>
          )}
        </>
      )}
    </section>
  )
}

export default AdminProducts
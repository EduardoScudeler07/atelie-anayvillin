import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import {
  AdminSessionExpiredError,
  getDraftProductOptions,
  saveDraftProduct,
  updateAdminDraft,
  type CreatedDraftProduct,
  type EditableDraftProduct,
  type ProductOption,
} from '../services/adminProductsApi'

type Props = {
  initialProduct?: EditableDraftProduct
  onCreated: (product: CreatedDraftProduct) => void
  onCancel: () => void
}

type OptionsState =
  | { status: 'loading' }
  | { status: 'error' }
  | {
      status: 'ready'
      collections: ProductOption[]
      materials: ProductOption[]
    }

const collectionMaterials: Record<string, readonly string[]> = {
  essencia: ['perolas'],
  promessa: ['perolas'],
  luz: ['cristais'],
  graca: ['cristais'],
  raizes: ['madeira'],
  infantil: ['perolas', 'cristais'],
}

function AdminProductForm({
  initialProduct,
  onCreated,
  onCancel,
}: Props) {
  const navigate = useNavigate()
  const editing = initialProduct !== undefined

  const [name, setName] = useState(initialProduct?.name ?? '')
  const [collection, setCollection] = useState(
    initialProduct?.collectionSlug ?? '',
  )
  const [material, setMaterial] = useState(
    initialProduct?.materialSlug ?? '',
  )
  const [description, setDescription] = useState(
    initialProduct?.description ?? '',
  )

  const [options, setOptions] = useState<OptionsState>({
    status: 'loading',
  })
  const [retry, setRetry] = useState(0)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    getDraftProductOptions(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) {
          setOptions({ status: 'ready', ...data })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setOptions({ status: 'error' })
        }
      })

    return () => controller.abort()
  }, [retry])

  function availableMaterials(collectionSlug: string) {
    if (options.status !== 'ready') return []

    const allowed = Object.hasOwn(collectionMaterials, collectionSlug)
      ? collectionMaterials[collectionSlug]
      : []

    return options.materials.filter(
      (option) => allowed.includes(option.slug),
    )
  }

  function changeCollection(value: string) {
    setCollection(value)

    const matches = availableMaterials(value)
    setMaterial(matches.length === 1 ? matches[0].slug : '')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy || options.status !== 'ready') return

    setBusy(true)
    setError('')

    try {
      const fields = {
        name,
        collectionSlug: collection,
        materialSlug: material,
        description,
      }

      const product = initialProduct
        ? await updateAdminDraft(initialProduct, fields)
        : await saveDraftProduct(fields)

      onCreated(product)
    } catch (cause) {
      if (cause instanceof AdminSessionExpiredError) {
        navigate('/admin/login', { replace: true })
        return
      }

      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível confirmar o salvamento.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-product-form">
      <h3>{editing ? 'Editar rascunho' : 'Nova peça'}</h3>

      <p className="admin-form-note">
        {editing
          ? 'Salve suas alterações para manter a peça em rascunho.'
          : 'Salve como rascunho para revisar antes de publicar.'}
      </p>

      {options.status === 'loading' && (
        <p role="status">Carregando coleções e materiais…</p>
      )}

      {options.status === 'error' && (
        <>
          <p className="admin-error" role="alert">
            Não foi possível carregar as opções.
          </p>

          <div className="admin-form-actions">
            <button
              type="button"
              className="admin-button"
              onClick={() => {
                setOptions({ status: 'loading' })
                setRetry((current) => current + 1)
              }}
            >
              Tentar novamente
            </button>

            <button
              type="button"
              className="admin-link-button"
              onClick={onCancel}
            >
              Cancelar
            </button>
          </div>
        </>
      )}

      {options.status === 'ready' && (
        <form method="post" onSubmit={handleSubmit}>
          <fieldset disabled={busy}>
            <div className="admin-field">
              <label htmlFor="product-name">Nome da peça</label>
              <input
                id="product-name"
                name="nome"
                type="text"
                minLength={3}
                maxLength={120}
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
              />
            </div>

            <div className="admin-field">
              <label htmlFor="product-collection">Coleção</label>
              <select
                id="product-collection"
                name="colecao_slug"
                required
                value={collection}
                onChange={(event) => changeCollection(event.target.value)}
              >
                <option value="">Selecione a coleção</option>

                {options.collections.map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="product-material">Material</label>
              <select
                id="product-material"
                name="material_slug"
                required
                disabled={!collection || busy}
                value={material}
                onChange={(event) => setMaterial(event.target.value)}
              >
                <option value="">Selecione o material</option>

                {availableMaterials(collection).map((option) => (
                  <option key={option.slug} value={option.slug}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="admin-field">
              <label htmlFor="product-description">Descrição</label>
              <textarea
                id="product-description"
                name="descricao"
                rows={5}
                maxLength={3000}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                aria-describedby="product-description-count"
              />
              <p
                id="product-description-count"
                className="admin-form-count"
              >
                {description.length}/3.000 caracteres
              </p>
            </div>
          </fieldset>

          {error && (
            <p className="admin-error" role="alert">
              {error}
            </p>
          )}

          <div className="admin-form-actions">
            <button
              type="submit"
              className="admin-button"
              disabled={busy || !collection || !material}
            >
              {busy
                ? 'Salvando…'
                : editing
                  ? 'Salvar alterações'
                  : 'Salvar rascunho'}
            </button>

            <button
              type="button"
              className="admin-link-button"
              disabled={busy}
              onClick={onCancel}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default AdminProductForm
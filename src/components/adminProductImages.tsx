import { useEffect, useRef, useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import {
  getAdminImages,
  uploadAdminImage,
  MAX_UPLOAD_BYTES,
  type AdminProductImage,
} from '../services/adminImagesApi'
import { AdminSessionExpiredError } from '../services/adminProductsApi'
import './adminProductImages.css'

type Props = {
  productId: string
  productName: string
  canUpload: boolean
  onClose: () => void
}

type GalleryState =
  | { status: 'loading' }
  | { status: 'ready'; images: AdminProductImage[] }
  | { status: 'error' }

function AdminProductImages({
  productId,
  productName,
  canUpload,
  onClose,
}: Props) {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<GalleryState>({
    status: 'loading',
  })
  const [retry, setRetry] = useState(0)
  const [file, setFile] = useState<File | null>(null)
  const [alt, setAlt] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')

  useEffect(() => {
    const controller = new AbortController()

    getAdminImages(productId, controller.signal)
      .then((images) => {
        if (!controller.signal.aborted) {
          setState({ status: 'ready', images })
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

  function selectFile(selected: File | null) {
    setError('')
    setNotice('')

    if (
      selected &&
      (
        selected.size === 0 ||
        selected.size > MAX_UPLOAD_BYTES ||
        !['image/jpeg', 'image/png', 'image/webp'].includes(selected.type)
      )
    ) {
      setFile(null)
      setError('Selecione uma foto JPG, PNG ou WebP com até 5 MiB.')

      if (inputRef.current) {
        inputRef.current.value = ''
      }

      return
    }

    setFile(selected)
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (
      busy ||
      !file ||
      !canUpload ||
      state.status !== 'ready'
    ) {
      return
    }

    setBusy(true)
    setError('')
    setNotice('')

    try {
      const image = await uploadAdminImage(productId, file, alt)

      setState((current) => {
        if (current.status !== 'ready') return current

        const images = [
          ...current.images.filter((item) => item.id !== image.id),
          image,
        ].sort((first, second) => first.order - second.order)

        return { status: 'ready', images }
      })

      setFile(null)
      setAlt('')

      if (inputRef.current) {
        inputRef.current.value = ''
      }

      setNotice('Foto adicionada ao rascunho.')
    } catch (cause) {
      if (cause instanceof AdminSessionExpiredError) {
        navigate('/admin/login', { replace: true })
        return
      }

      setError(
        cause instanceof Error
          ? cause.message
          : 'Não foi possível confirmar o envio. Confira as fotos.',
      )
    } finally {
      setBusy(false)
    }
  }

  return (
    <section
      className="admin-images"
      aria-labelledby="admin-images-title"
    >
      <h3 id="admin-images-title">Fotos de {productName}</h3>

      <p className="admin-form-note">
        A primeira foto é usada como capa da peça.
      </p>

      {state.status === 'loading' && (
        <p role="status">Carregando fotos…</p>
      )}

      {state.status === 'error' && (
        <>
          <p className="admin-error" role="alert">
            Não foi possível carregar as fotos.
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
          {state.images.length === 0 ? (
            <p>Esta peça ainda não tem fotos.</p>
          ) : (
            <ul className="admin-image-grid">
              {state.images.map((image, index) => (
                <li className="admin-image-card" key={image.id}>
                  <img
                    src={image.url}
                    alt={image.alt}
                    width="180"
                    height="180"
                    loading="lazy"
                    decoding="async"
                  />

                  {index === 0 && (
                    <span className="admin-image-cover">Capa</span>
                  )}

                  <p>{image.alt}</p>
                </li>
              ))}
            </ul>
          )}

          {canUpload && (
            <form
              method="post"
              encType="multipart/form-data"
              className="admin-image-upload"
              onSubmit={handleUpload}
            >
              <h4>Adicionar foto</h4>

              <fieldset disabled={busy}>
                <div className="admin-field">
                  <label htmlFor="product-photo">
                    Foto JPG, PNG ou WebP — até 5 MiB
                  </label>

                  <input
                    ref={inputRef}
                    id="product-photo"
                    name="foto"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    required
                    onChange={(event) => {
                      selectFile(event.target.files?.[0] ?? null)
                    }}
                  />

                  {file && (
                    <p className="admin-form-count">
                      {file.name} ·{' '}
                      {(file.size / (1024 * 1024)).toFixed(2)} MiB
                    </p>
                  )}
                </div>

                <div className="admin-field">
                  <label htmlFor="product-photo-alt">
                    Descrição da imagem
                  </label>

                  <textarea
                    id="product-photo-alt"
                    name="texto_alternativo"
                    rows={3}
                    maxLength={240}
                    required
                    value={alt}
                    onChange={(event) => setAlt(event.target.value)}
                    aria-describedby="product-photo-alt-help"
                  />

                  <p
                    id="product-photo-alt-help"
                    className="admin-form-count"
                  >
                    Descreva a cor, o material e os detalhes visíveis.
                  </p>
                </div>

                <button
                  type="submit"
                  className="admin-button"
                  disabled={busy || !file || !alt.trim()}
                >
                  {busy ? 'Enviando foto…' : 'Enviar foto'}
                </button>
              </fieldset>
            </form>
          )}
        </>
      )}

      {error && (
        <p className="admin-error" role="alert">
          {error}
        </p>
      )}

      {notice && (
        <p className="admin-success" role="status">
          {notice}
        </p>
      )}

      <div className="admin-images-footer">
        <button
          type="button"
          className="admin-link-button"
          disabled={busy}
          onClick={onClose}
        >
          Voltar às peças
        </button>
      </div>
    </section>
  )
}

export default AdminProductImages
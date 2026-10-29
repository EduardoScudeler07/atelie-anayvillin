import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useProductApi } from '../config/dataSource'
import { createProductWhatsAppLink } from '../config/whatsapp'
import { products } from '../data/products'
import { getProductBySlug } from '../services/productsApi'
import type { Product, ProductDetails } from '../types/product'
import './productPage.css'

const collectionLabels = {
  essencia: 'Essência',
  promessa: 'Promessa',
  luz: 'Luz',
  graca: 'Graça',
  raizes: 'Raízes',
  infantil: 'Infantil',
}

const materialLabels = {
  perolas: 'Pérolas',
  cristais: 'Cristais',
  madeira: 'Madeira',
}

type LoadState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'loaded'; product: ProductDetails | null }

function ProductMessage({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <div className="product-page container">
      <h1 className="product-page-title">{title}</h1>

      <p className="product-not-found" role="status">
        {message}
      </p>

      <Link to="/catalogo" className="product-back-link">
        Voltar ao catálogo
      </Link>
    </div>
  )
}

function ProductContent({
  product,
  description,
}: {
  product: Product
  description?: string
}) {
  const collectionName = collectionLabels[product.collection]

  const whatsappLink = createProductWhatsAppLink({
    name: product.name,
    collection: collectionName,
    slug: product.slug,
  })

  return (
    <div className="product-page container">
      <Link to="/catalogo" className="product-back-link">
        <span aria-hidden="true">‹</span> Voltar ao catálogo
      </Link>

      <div className="row g-4 align-items-start">
        <div className="col-12 col-md-6">
          <img
            className="product-page-image"
            src={product.image}
            alt={product.imageAlt}
            decoding="async"
          />
        </div>

        <div className="col-12 col-md-6">
          <p className="product-page-category">
            Coleção {collectionName}
            {' · '}
            {product.materials
              .map((material) => materialLabels[material])
              .join(', ')}
          </p>

          <h1 className="product-page-title">
            {product.name}
          </h1>

          {description && (
            <p className="product-page-description">
              {description}
            </p>
          )}

          <div className="product-order-note">
            <p>Feito sob encomenda</p>
          </div>

          {whatsappLink && (
            <div className="product-contact">
              <a
                className="product-whatsapp-link"
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                  focusable="false"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93a7.9 7.9 0 0 0-2.327-5.607M7.994 14.521a6.6 6.6 0 0 1-3.355-.918l-.24-.144-2.494.654.666-2.433-.156-.25a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.956-6.582 6.59-6.582a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.637-2.96 6.587-6.592 6.587m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.087-.403.088-.088.198-.232.297-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.339-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.692.677-.692 1.654s.711 1.916.81 2.049c.099.133 1.395 2.132 3.387 2.992.471.205.84.327 1.129.418.475.152.908.13 1.25.08.38-.057 1.171-.479 1.338-.942.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
                </svg>

                <span>Encomendar pelo WhatsApp</span>

             
              </a>
              <p className="product-contact-note">
                Converse sobre esta peça e as possibilidades
                de personalização.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function RemoteProductPage({ slug }: { slug: string }) {
  const [state, setState] = useState<LoadState>({
    status: 'loading',
  })

  useEffect(() => {
    const controller = new AbortController()

    getProductBySlug(slug, controller.signal)
      .then((product) => {
        if (!controller.signal.aborted) {
          setState({ status: 'loaded', product })
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setState({ status: 'error' })
        }
      })

    return () => controller.abort()
  }, [slug])

  if (state.status === 'loading') {
    return (
      <ProductMessage
        title="Carregando peça"
        message="Estamos buscando os detalhes do terço."
      />
    )
  }

  if (state.status === 'error') {
    return (
      <ProductMessage
        title="Não foi possível carregar a peça"
        message="Tente atualizar a página em alguns instantes."
      />
    )
  }

  if (!state.product) {
    return (
      <ProductMessage
        title="Produto não encontrado"
        message="Não encontramos uma peça neste endereço."
      />
    )
  }

  return (
    <ProductContent
      product={state.product}
      description={state.product.description}
    />
  )
}

function ProductPage() {
  const { slug = '' } = useParams()

  if (useProductApi) {
    return <RemoteProductPage key={slug} slug={slug} />
  }

  const product = products.find((item) => item.slug === slug)

  if (!product) {
    return (
      <ProductMessage
        title="Produto não encontrado"
        message="Não encontramos uma peça neste endereço."
      />
    )
  }

  return <ProductContent product={product} />
}

export default ProductPage
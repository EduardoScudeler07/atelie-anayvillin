import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { useProductApi } from '../config/dataSource'
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
            Coleção {collectionLabels[product.collection]}
            {' · '}
            {product.materials
              .map((material) => materialLabels[material])
              .join(', ')}
          </p>

          <h1 className="product-page-title">{product.name}</h1>

          {description && (
            <p className="product-page-description">{description}</p>
          )}

          <div className="product-order-note">
            <p>Feito sob encomenda</p>
          </div>
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
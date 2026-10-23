import { Link, useParams } from 'react-router'
import { products } from '../data/products'
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

function ProductPage() {
  const { slug } = useParams()
  const product = products.find((item) => item.slug === slug)

  if (!product) {
    return (
      <div className="product-page container">
        <h1 className="product-page-title">Produto não encontrado</h1>

        <p className="product-not-found">
          Não encontramos uma peça neste endereço.
        </p>

        <Link to="/catalogo" className="product-back-link">
          Voltar ao catálogo
        </Link>
      </div>
    )
  }

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

          <div className="product-order-note">
            <p>Feito sob encomenda</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage
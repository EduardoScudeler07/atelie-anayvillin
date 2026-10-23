import type { Product } from '../types/product'
import { Link } from 'react-router'
import './productCard.css'

type ProductCardProps = {
  product: Product
}

const collectionLabels = {
  essencia: 'Essência',
  promessa: 'Promessa',
  luz: 'Luz',
  graca: 'Graça',
  raizes: 'Raízes',
  infantil: 'Infantil',
}

function ProductCard({ product }: ProductCardProps) {
  return (
    <article className="product-card">
      <Link
        to={`/produto/${product.slug}`}
        className="product-card-image-link"
        aria-label={`Ver ${product.name}`}
      >
        <img
          className="product-card-image"
          src={product.image}
          alt={product.imageAlt}
          loading="lazy"
          decoding="async"
        />
      </Link>

      <div className="product-card-content">
        <p className="product-card-collection">
          {collectionLabels[product.collection]}
        </p>

        <h2 className="product-card-title">
          <Link
            to={`/produto/${product.slug}`}
            className="product-card-name-link"
          >
            {product.name}
          </Link>
        </h2>
      </div>
    </article>
  )
}

export default ProductCard
import type { Product } from '../types/product'
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
      <img
        className="product-card-image"
        src={product.image}
        alt={product.imageAlt}
        loading="lazy"
        decoding="async"
      />

      <div className="product-card-content">
        <p className="product-card-collection">
          {collectionLabels[product.collection]}
        </p>

        <h2 className="product-card-title">{product.name}</h2>
      </div>
    </article>
  )
}

export default ProductCard
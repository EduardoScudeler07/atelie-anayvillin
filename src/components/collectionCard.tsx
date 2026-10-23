import { Link } from 'react-router'
import './collectionCard.css'

type CollectionCardProps = {
  name: string
  description: string
  image: string
  imageAlt: string
  slug: string
}

function CollectionCard({
  name,
  description,
  image,
  imageAlt,
  slug,
}: CollectionCardProps) {
  return (
    <article className="collection-card">
      <img
        className="collection-card-image"
        src={image}
        alt={imageAlt}
        loading="lazy"
        decoding="async"
      />

      <div className="collection-card-content">
        <h3 className="collection-card-title">{name}</h3>

        <p className="collection-card-description">
          {description}
        </p>

        <Link
          className="collection-card-link"
          to={`/catalogo?colecao=${slug}`}
          aria-label={`Ver coleção ${name}`}
        >
          Ver coleção
          <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  )
}

export default CollectionCard
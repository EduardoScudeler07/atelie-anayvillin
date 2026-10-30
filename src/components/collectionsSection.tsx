import { useRef, useState } from 'react'
import { collections } from '../data/collections'
import CollectionCard from './collectionCard'
import './collectionsSection.css'

function CollectionsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  const touchStart = useRef<{
    x: number
    y: number
  } | null>(null)

  const activeCollection = collections[activeIndex]

  function previousCollection() {
    setActiveIndex(
      (current) =>
        (current - 1 + collections.length) %
        collections.length,
    )
  }

  function nextCollection() {
    setActiveIndex(
      (current) => (current + 1) % collections.length,
    )
  }

  function slidePosition(index: number) {
    const distance =
      (index - activeIndex + collections.length) %
      collections.length

    if (distance === 0) return 'active'

    return distance <= Math.floor(collections.length / 2)
      ? 'after'
      : 'before'
  }

  return (
    <section
      className="collections-section"
      aria-labelledby="collections-title"
    >
      <div className="container">
        <div className="collections-inner">
          <header className="collections-heading">
            <h2 id="collections-title">
              Nossas coleções
            </h2>
          </header>

          <div
            className="collections-touch-area"
            onTouchStart={(event) => {
              if (event.touches.length !== 1) {
                touchStart.current = null
                return
              }

              const touch = event.touches[0]
              if (!touch) return

              touchStart.current = {
                x: touch.clientX,
                y: touch.clientY,
              }
            }}
            onTouchEnd={(event) => {
              const start = touchStart.current
              touchStart.current = null

              if (!start || event.touches.length > 0) return

              const touch = event.changedTouches[0]
              if (!touch) return

              const distanceX = touch.clientX - start.x
              const distanceY = touch.clientY - start.y

              const isHorizontalSwipe =
                Math.abs(distanceX) >= 50 &&
                Math.abs(distanceX) >
                  Math.abs(distanceY) * 1.5

              if (!isHorizontalSwipe) return

              if (distanceX < 0) {
                nextCollection()
              } else {
                previousCollection()
              }
            }}
            onTouchCancel={() => {
              touchStart.current = null
            }}
          >
            <div className="collections-slides">
              {collections.map((collection, index) => {
                const isActive = index === activeIndex

                return (
                  <div
                    key={collection.slug}
                    className="collections-slide"
                    data-position={slidePosition(index)}
                    aria-hidden={!isActive}
                    inert={!isActive}
                  >
                    <CollectionCard {...collection} />
                  </div>
                )
              })}
            </div>
          </div>

          <div className="collections-controls">
            <button
              type="button"
              className="collections-arrow"
              aria-label="Coleção anterior"
              onClick={previousCollection}
            >
              <span aria-hidden="true">←</span>
            </button>

            <div
              className="collections-indicators"
              role="group"
              aria-label="Escolher coleção"
            >
              {collections.map((collection, index) => (
                <button
                  key={collection.slug}
                  type="button"
                  className="collections-indicator"
                  aria-label={`Mostrar coleção ${collection.name}`}
                  aria-pressed={index === activeIndex}
                  onClick={() => setActiveIndex(index)}
                >
                  <span />
                </button>
              ))}
            </div>

            <button
              type="button"
              className="collections-arrow"
              aria-label="Próxima coleção"
              onClick={nextCollection}
            >
              <span aria-hidden="true">→</span>
            </button>
          </div>

          <p
            className="collections-status"
            role="status"
            aria-atomic="true"
          >
            {activeCollection.name} — {activeIndex + 1} de{' '}
            {collections.length}
          </p>
        </div>
      </div>
    </section>
  )
}

export default CollectionsSection
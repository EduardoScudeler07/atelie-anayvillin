import './catalogFilters.css'

type CatalogFiltersProps = {
  search: string
  collection: string
  onSearchChange: (value: string) => void
  onCollectionChange: (value: string) => void
}

const collections = [
  { value: '', label: 'Todas' },
  { value: 'essencia', label: 'Essência' },
  { value: 'promessa', label: 'Promessa' },
  { value: 'luz', label: 'Luz' },
  { value: 'graca', label: 'Graça' },
  { value: 'raizes', label: 'Raízes' },
  { value: 'infantil', label: 'Infantil' },
]

const quickCollections = collections.filter((item) =>
  ['', 'essencia', 'graca', 'luz'].includes(item.value),
)

function CatalogFilters({
  search,
  collection,
  onSearchChange,
  onCollectionChange,
}: CatalogFiltersProps) {
  function toggleCollection(value: string) {
    onCollectionChange(collection === value ? '' : value)
  }

  return (
    <section className="catalog-filters" aria-label="Busca e coleções">
      <label className="visually-hidden" htmlFor="catalog-search">
        Buscar terços pelo nome
      </label>

      <div className="catalog-search">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="10.5" cy="10.5" r="6.5" />
          <path d="m16 16 5 5" />
        </svg>

        <input
          id="catalog-search"
          type="search"
          placeholder="Buscar terços…"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="catalog-collections" role="group" aria-label="Coleção">
        {quickCollections.map((item) => (
          <button
            key={item.value}
            type="button"
            className="catalog-collection-button"
            aria-pressed={collection === item.value}
            onClick={() => toggleCollection(item.value)}
          >
            {item.label}
          </button>
        ))}
      </div>
    </section>
  )
}

export default CatalogFilters
import { useState } from 'react'
import CatalogFilters from '../components/catalogFilters'
import FilterPanel from '../components/filterPanel'
import FilterOptions from '../components/filterOptions'
import ProductCard from '../components/productCard'
import { products } from '../data/products'
import './catalogPage.css'

const collectionLabels: Record<string, string> = {
  essencia: 'Essência',
  promessa: 'Promessa',
  luz: 'Luz',
  graca: 'Graça',
  raizes: 'Raízes',
  infantil: 'Infantil',
}

const materialLabels: Record<string, string> = {
  perolas: 'Pérolas',
  cristais: 'Cristais',
  raizes: 'Raízes',
}

function CatalogPage() {
  const [search, setSearch] = useState('')
  const [collection, setCollection] = useState('')
  const [material, setMaterial] = useState('')

  const [filtersOpen, setFiltersOpen] = useState(false)
  const [draftCollection, setDraftCollection] = useState('')
  const [draftMaterial, setDraftMaterial] = useState('')
  const [clearSearchOnApply, setClearSearchOnApply] = useState(false)

  function openFilters() {
    setDraftCollection(collection)
    setDraftMaterial(material)
    setClearSearchOnApply(false)
    setFiltersOpen(true)
  }

  function closeFilters() {
    setFiltersOpen(false)
  }

  function clearDraftFilters() {
    setDraftCollection('')
    setDraftMaterial('')
    setClearSearchOnApply(true)
  }

  function applyFilters() {
    setCollection(draftCollection)
    setMaterial(draftMaterial)

    if (clearSearchOnApply) {
      setSearch('')
    }

    setFiltersOpen(false)
  }

  return (
    <div className="catalog-page container">
      <div className="catalog-toolbar">
        <button
          type="button"
          className="catalog-filter-trigger"
          aria-haspopup="dialog"
          aria-label="Abrir filtros"
          onClick={openFilters}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path d="M3 7h4m4 0h10M3 17h10m4 0h4" />
            <circle cx="9" cy="7" r="2" />
            <circle cx="15" cy="17" r="2" />
          </svg>
        </button>
      </div>

      <section
        className="catalog-intro"
        aria-labelledby="catalog-title"
      >
        <p className="catalog-label">Catálogo</p>

        <h1 id="catalog-title">Terços Artesanais</h1>

        <p className="catalog-description">
          Peças feitas à mão com fé, carinho e atenção a cada detalhe.
        </p>

        <div className="catalog-divider" aria-hidden="true" />
      </section>

      <CatalogFilters
        search={search}
        collection={collection}
        onSearchChange={setSearch}
        onCollectionChange={setCollection}
      />

      {(collection || material) && (
        <div
          className="catalog-active-filters"
          role="group"
          aria-label="Filtros aplicados"
        >
          {collection && (
            <button
              type="button"
              className="catalog-filter-tag"
              aria-label={`Remover filtro de coleção: ${collectionLabels[collection]}`}
              onClick={() => setCollection('')}
            >
              <span>Coleção: {collectionLabels[collection]}</span>
              <span aria-hidden="true">×</span>
            </button>
          )}

          {material && (
            <button
              type="button"
              className="catalog-filter-tag"
              aria-label={`Remover filtro de material: ${materialLabels[material]}`}
              onClick={() => setMaterial('')}
            >
              <span>Material: {materialLabels[material]}</span>
              <span aria-hidden="true">×</span>
            </button>
          )}
        </div>
      )}

      <section className="catalog-products" aria-label="Terços do catálogo">
        <div className="row g-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="col-6 col-md-4 col-lg-3"
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      <FilterPanel open={filtersOpen} onClose={closeFilters}>
        <FilterOptions
          collection={draftCollection}
          material={draftMaterial}
          onCollectionChange={setDraftCollection}
          onMaterialChange={setDraftMaterial}
          onClear={clearDraftFilters}
          onApply={applyFilters}
        />
      </FilterPanel>
    </div>
  )
}

export default CatalogPage
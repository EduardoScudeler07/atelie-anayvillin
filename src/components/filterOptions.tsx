import './filterOptions.css'

type FilterOptionsProps = {
  collection: string
  material: string
  onCollectionChange: (value: string) => void
  onMaterialChange: (value: string) => void
  onClear: () => void
  onApply: () => void
}

const collections = [
  { value: 'essencia', label: 'Essência' },
  { value: 'promessa', label: 'Promessa' },
  { value: 'luz', label: 'Luz' },
  { value: 'graca', label: 'Graça' },
  { value: 'raizes', label: 'Raízes' },
  { value: 'infantil', label: 'Infantil' },
]

const materials = [
  { value: 'perolas', label: 'Pérolas' },
  { value: 'cristais', label: 'Cristais' },
  { value: 'raizes', label: 'Raízes' },
]

function FilterOptions({
  collection,
  material,
  onCollectionChange,
  onMaterialChange,
  onClear,
  onApply,
}: FilterOptionsProps) {
  return (
    <div className="filter-options">
      <fieldset className="filter-options-group">
        <legend>Coleção</legend>

        <div className="filter-options-list">
          {collections.map((item) => (
            <button
              key={item.value}
              type="button"
              className="filter-option"
              aria-pressed={collection === item.value}
              onClick={() =>
                onCollectionChange(
                  collection === item.value ? '' : item.value,
                )
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="filter-options-group">
        <legend>Material</legend>

        <div className="filter-options-list">
          {materials.map((item) => (
            <button
              key={item.value}
              type="button"
              className="filter-option"
              aria-pressed={material === item.value}
              onClick={() =>
                onMaterialChange(
                  material === item.value ? '' : item.value,
                )
              }
            >
              {item.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="filter-options-actions">
        <button
          type="button"
          className="filter-options-clear"
          onClick={onClear}
        >
          Limpar tudo
        </button>

        <button
          type="button"
          className="filter-options-apply"
          onClick={onApply}
        >
          Ver peças
        </button>
      </div>
    </div>
  )
}

export default FilterOptions
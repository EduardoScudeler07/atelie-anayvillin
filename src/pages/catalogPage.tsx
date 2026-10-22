import './catalogPage.css'

function CatalogPage() {
  return (
    <div className="catalog-page container">
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
    </div>
  )
}

export default CatalogPage
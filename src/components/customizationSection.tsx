import './customizationSection.css'

function CustomizationSection() {
  return (
    <section
      className="customization-section"
      aria-labelledby="customization-title"
    >
      <div className="container">
        <div className="row g-4 g-lg-5 align-items-center">
          <div className="col-12 col-md-6">
            <div className="customization-content">
              <p className="customization-label">
                Personalize seu terço
              </p>

              <h2 id="customization-title">
                Sua fé, sua história, seu terço.
              </h2>

              <p>
                Um nome especial, uma cor que encanta, uma medalha
                com significado. Combine cores, nomes, medalhas e
                materiais em um terço feito para você ou para presentear.
              </p>

              <p>
                Converse com o ateliê e dê forma à sua ideia.
              </p>
            </div>
          </div>

          <div className="col-12 col-md-6">
            <img
              className="customization-image"
              src="/images/produtos/terco-graca/terco-transparente-azul.png"
              alt="Terço personalizado da coleção Graça"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

export default CustomizationSection
import './storySection.css'

function StorySection() {
  return (
    <section
      className="story-section"
      aria-labelledby="story-title"
    >
      <div className="container">
        <div className="story-content">
          <h2 id="story-title">Nossa história</h2>

          <p>
            O Ateliê Anayvillin nasceu de um pedido da avó e de um
            desejo de ir além da criação de terços: aproximar as
            pessoas da oração.
          </p>

          <p>
            Esse pedido familiar se tornou inspiração para criar
            peças que carregam fé, carinho e significado. Um trabalho
            feito à mão, com o desejo de incentivar também os jovens
            a encontrar na oração um momento de encontro com Deus.
          </p>
        </div>
      </div>
    </section>
  )
}

export default StorySection
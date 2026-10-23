import { Link } from 'react-router'
import './howToOrderSection.css'

const steps = [
  {
    number: '01',
    title: 'Encontre sua inspiração',
    description:
      'Explore as coleções e descubra uma peça que combine com você ou com alguém especial.',
  },
  {
    number: '02',
    title: 'Conte sua ideia',
    description:
      'Converse com o ateliê pelo WhatsApp sobre a peça escolhida e os detalhes que deseja personalizar.',
  },
  {
    number: '03',
    title: 'Combine cada detalhe',
    description:
      'Confirme as possibilidades de personalização, o prazo e as condições da sua encomenda com o ateliê.',
  },
]

function HowToOrderSection() {
  return (
    <section
      className="how-to-order-section"
      aria-labelledby="how-to-order-title"
    >
      <div className="container">
        <header className="how-to-order-heading">
          <h2 id="how-to-order-title">Como encomendar</h2>

          <p>Seu próximo terço começa com uma inspiração.</p>
        </header>

        <ol className="row g-4 how-to-order-list">
          {steps.map((step) => (
            <li key={step.number} className="col-12 col-md-4">
              <div className="how-to-order-step">
                <span className="how-to-order-number" aria-hidden="true">
                  {step.number}
                </span>

                <h3>{step.title}</h3>
                <p>{step.description}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className="how-to-order-action">
          <Link to="/catalogo" className="how-to-order-link">
            Encontre seu terço
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HowToOrderSection
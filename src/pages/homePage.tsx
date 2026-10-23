import { Link } from 'react-router'
import './homePage.css'

function HomePage() {
  return (
    <section className="home-hero" aria-labelledby="home-title">
      <div className="container">
        <div className="home-hero-content">
          <p className="home-hero-label">Terços artesanais</p>

          <h1 id="home-title" className="home-hero-title">
            Cada laço, uma oração.
            <br />
            Cada terço, uma história.
          </h1>

          <Link to="/catalogo" className="home-hero-link">
            Conheça o catálogo
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default HomePage
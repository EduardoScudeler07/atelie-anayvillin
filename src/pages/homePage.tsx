import CollectionsSection from '../components/collectionsSection'
import StorySection from '../components/storySection'
import CustomizationSection from '../components/customizationSection'
import HowToOrderSection from '../components/howToOrderSection'
import { useHomeReveal } from '../hooks/useHomeReveal'
import { Link } from 'react-router'
import './homePage.css'

function HomePage() {
  const homeRef = useHomeReveal()

  return (
    <div ref={homeRef}>
      <section
        className="home-hero"
        aria-labelledby="home-title"
      >
        <div className="container">
          <div className="home-hero-content">
            <p className="home-hero-label">
              Terços artesanais
            </p>

            <h1 id="home-title" className="home-hero-title">
              Cada laço, uma oração.
              <br />
              Cada terço, uma história.
            </h1>

            <p className="home-hero-description">
              Terços artesanais feitos sob encomenda, com
              cores, nomes e detalhes que tornam cada peça
              parte da sua história.
            </p>

            <Link
              to="/catalogo"
              className="home-hero-link"
            >
              Conheça as coleções
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </section>

      <div id="colecoes" className="home-collections-anchor">
        <CollectionsSection />
      </div>

      <StorySection />

      <div
        className="home-section-divider"
        aria-hidden="true"
      >
        <div className="home-section-ornament">
          <span className="home-ornament-line" />

          <svg
            width="36"
            height="40"
            viewBox="0 0 40 44"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            focusable="false"
          >
            <path d="M20 33V41" />
            <path d="M20 33C9 27 6 18 9 10C17 13 20 22 20 33Z" />
            <path d="M20 33C31 27 34 18 31 10C23 13 20 22 20 33Z" />
            <path d="M20 29C13 21 14 12 20 4C26 12 27 21 20 29Z" />
            <path d="M19 35C10 36 5 32 3 26C10 25 16 28 19 35Z" />
            <path d="M21 35C30 36 35 32 37 26C30 25 24 28 21 35Z" />
          </svg>

          <span className="home-ornament-line" />
        </div>
      </div>

      <CustomizationSection />
      <HowToOrderSection />
    </div>
  )
}

export default HomePage
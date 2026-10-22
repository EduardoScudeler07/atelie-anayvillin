import SiteLayout from './layouts/siteLayout'
import './App.css'

function App() {
  return (
    <SiteLayout>
      <div className="initial-page">
        <section className="welcome" aria-labelledby="welcome-title">
          <p className="welcome-label">Terços artesanais</p>

          <h1 id="welcome-title">Ateliê Anayvillin</h1>

          <p className="welcome-description">
            Nosso catálogo está em preparação.
          </p>
        </section>
      </div>
    </SiteLayout>
  )
}

export default App
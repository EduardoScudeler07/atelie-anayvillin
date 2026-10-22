import { Route, Routes } from 'react-router'
import SiteLayout from './layouts/siteLayout'
import CatalogPage from './pages/catalogPage'
import './App.css'

function App() {
  return (
    <SiteLayout>
      <Routes>
        <Route
          path="/"
          element={
            <div className="initial-page">
              <section
                className="welcome"
                aria-labelledby="welcome-title"
              >
                <p className="welcome-label">Terços artesanais</p>

                <h1 id="welcome-title">Ateliê Anayvillin</h1>

                <p className="welcome-description">
                  Nosso catálogo está em preparação.
                </p>
              </section>
            </div>
          }
        />

        <Route path="/catalogo" element={<CatalogPage />} />
      </Routes>
    </SiteLayout>
  )
}

export default App
import { Route, Routes } from 'react-router'
import SiteLayout from './layouts/siteLayout'
import CatalogPage from './pages/catalogPage'
import ProductPage from './pages/productPage'
import HomePage from './pages/homePage'


function App() {
  return (
    <SiteLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/produto/:slug" element={<ProductPage />} />
      </Routes>
    </SiteLayout>
  )
}

export default App
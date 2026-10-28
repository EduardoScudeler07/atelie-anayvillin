import { Route, Routes } from 'react-router'
import SiteLayout from './layouts/siteLayout'
import CatalogPage from './pages/catalogPage'
import ProductPage from './pages/productPage'
import HomePage from './pages/homePage'
import AdminLoginPage from './pages/adminLoginPage'
import AdminPage from './pages/adminPage'

function App() {
  return (
    <SiteLayout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/catalogo" element={<CatalogPage />} />
        <Route path="/produto/:slug" element={<ProductPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </SiteLayout>
  )
}

export default App
import { NavLink } from 'react-router'

function Header() {
  return (
    <header className="site-header">
      <div className="container site-header-content">
        <NavLink to="/" className="site-brand">
          Ateliê Anayvillin
        </NavLink>

        <nav aria-label="Navegação principal">
          <NavLink to="/catalogo" className="site-nav-link">
            Catálogo
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Header
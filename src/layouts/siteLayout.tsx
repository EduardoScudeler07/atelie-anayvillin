import type { ReactNode } from 'react'
import Header from '../components/header'
import Footer from '../components/footer'
import './siteLayout.css'

type SiteLayoutProps = {
  children: ReactNode
}

function SiteLayout({ children }: SiteLayoutProps) {
  return (
    <div className="site-layout">
      <Header />

      <main className="site-main">
        {children}
      </main>

      <Footer />
    </div>
  )
}

export default SiteLayout
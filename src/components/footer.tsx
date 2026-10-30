import { createWhatsAppLink } from '../config/whatsapp'
import './footer.css'

function Footer() {
  const whatsappLink = createWhatsAppLink(
    'Olá! Conheci o Ateliê Anayvillin pelo site e gostaria de saber mais sobre as encomendas.',
  )

  return (
    <footer className="site-footer site-footer-contact">
      <div className="container footer-content">
        <div className="footer-brand">
          <p className="footer-name">Ateliê Anayvillin</p>
          <p className="footer-description">
            Terços artesanais
          </p>
        </div>

        <nav
          className="footer-links"
          aria-label="Redes sociais e contato"
        >
          <a
            className="footer-contact-link"
            href="https://www.instagram.com/atelie_anayvillin/"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg
              className="footer-icon"
              width="21"
              height="21"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
              focusable="false"
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="5"
              />
              <circle cx="12" cy="12" r="4" />
              <circle
                cx="17.5"
                cy="6.5"
                r="1"
                fill="currentColor"
                stroke="none"
              />
            </svg>

            <span className="footer-link-text">
              <span className="footer-link-label">
                Instagram
              </span>
              <span className="footer-link-detail">
                @atelie_anayvillin
              </span>
            </span>
          </a>

          {whatsappLink && (
            <a
              className="footer-contact-link"
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg
                className="footer-icon"
                width="21"
                height="21"
                viewBox="0 0 16 16"
                fill="currentColor"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M13.601 2.326A7.85 7.85 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.9 7.9 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93a7.9 7.9 0 0 0-2.327-5.607M7.994 14.521a6.6 6.6 0 0 1-3.355-.918l-.24-.144-2.494.654.666-2.433-.156-.25a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.956-6.582 6.59-6.582a6.56 6.56 0 0 1 4.66 1.931 6.56 6.56 0 0 1 1.928 4.66c-.004 3.637-2.96 6.587-6.592 6.587m3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.087-.403.088-.088.198-.232.297-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.339-.114-.007-.247-.007-.38-.007a.73.73 0 0 0-.529.247c-.182.198-.692.677-.692 1.654s.711 1.916.81 2.049c.099.133 1.395 2.132 3.387 2.992.471.205.84.327 1.129.418.475.152.908.13 1.25.08.38-.057 1.171-.479 1.338-.942.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232" />
              </svg>

              <span className="footer-link-text">
                <span className="footer-link-label">
                  WhatsApp
                </span>
                <span className="footer-link-detail">
                  Conversar sobre encomendas
                </span>
              </span>
            </a>
          )}
        </nav>
      </div>
    </footer>
  )
}

export default Footer
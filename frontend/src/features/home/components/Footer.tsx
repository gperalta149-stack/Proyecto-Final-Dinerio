// frontend/src/features/home/components/Footer.tsx
import React from "react";
import { Link } from "react-router-dom";
import { WalletCards, Send } from "lucide-react";
import { FaGithub, FaInstagram, FaLinkedin, FaXTwitter } from "react-icons/fa6";
import { FOOTER_COLUMNS } from "../data/homeData";
import '../../../styles/home/footer.css';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="header-logo">
              <div className="header-logo-icon">
                <WalletCards size={22} />
              </div>
              <span className="header-logo-text">
                Dinerio
              </span>
            </Link>
            <p className="footer-brand-desc">
              La plataforma más completa para gestionar, analizar y optimizar
              todas tus suscripciones recurrentes. Completamente gratis.
            </p>
            <div className="footer-social">
              <a href="https://x.com/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="X (Twitter)">
                <FaXTwitter size={18} />
              </a>
              <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="LinkedIn">
                <FaLinkedin size={18} />
              </a>
              <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="GitHub">
                <FaGithub size={18} />
              </a>
              <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" className="footer-social-link" aria-label="Instagram">
                <FaInstagram size={18} />
              </a>
            </div>
          </div>

          {/* Footer Columns */}
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.heading} className="footer-column">
              <h4>{column.heading}</h4>
              <ul>
                {column.links.map((link) => (
                  <li key={link.label}>
                    {link.href.startsWith("#") ? (
                      <a href={link.href}>{link.label}</a>
                    ) : (
                      <Link to={link.href}>{link.label}</Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Newsletter */}
          <div className="footer-column">
            <h4>Newsletter</h4>
            <p style={{ color: "var(--color-text-secondary)", fontSize: "0.95rem", marginBottom: "0.5rem" }}>
              Recibe tips para ahorrar
            </p>
            <div className="footer-newsletter">
              <input 
                type="email" 
                placeholder="tu@email.com" 
                className="footer-newsletter-input"
              />
              <button className="footer-newsletter-button">
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="footer-bottom">
          <p>© {currentYear} Dinerio. Todos los derechos reservados.</p>
          <div className="footer-bottom-links">
            <a href="#">Privacidad</a>
            <a href="#">Términos</a>
            <a href="#">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
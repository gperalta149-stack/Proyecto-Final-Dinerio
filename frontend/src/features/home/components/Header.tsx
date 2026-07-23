import React, { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import '../../../styles/home/header.css'

const NAV_LINKS = [
  { href: "#features", label: "Características" },
  { href: "#how-it-works", label: "Cómo funciona" },
  { href: "#pricing", label: "Precios" },
]

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [mobileOpen])

  return (
    <header className={`home-header${scrolled ? " scrolled" : ""}`}>
      <div className="home-header-container">
        {/* Logo */}
        <Link to="/" className="home-header-logo" onClick={() => setMobileOpen(false)}>
          <span className="home-header-logo-icon">D</span>
          <span className="home-header-logo-text">Dinerio</span>
        </Link>

        {/* Nav desktop */}
        <nav className="home-header-nav">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* Actions desktop */}
        <div className="home-header-actions">
          <Link to="/login" className="home-header-login">
            Iniciar sesión
          </Link>
          <Link to="/register" className="home-header-cta">
            Comenzar gratis
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="home-header-mobile-toggle"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
        >
          {mobileOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      <div className={`home-header-mobile-menu${mobileOpen ? " active" : ""}`}>
        <nav className="home-header-mobile-nav">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="home-header-mobile-actions">
          <Link
            to="/login"
            className="home-header-mobile-login"
            onClick={() => setMobileOpen(false)}
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="home-header-mobile-cta"
            onClick={() => setMobileOpen(false)}
          >
            Comenzar gratis
          </Link>
        </div>
      </div>
    </header>
  )
}
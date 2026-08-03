// frontend/src/widgets/Layout/Layout.tsx
import type React from "react"
import { useState } from "react"
import { Header } from "../Header"
import { Sidebar } from "../Sidebar"
import '../../styles/widgets/Layout.css'

interface LayoutProps {
  children: React.ReactNode
}

// Layout: plantilla común de las páginas autenticadas.
//   Compone Sidebar + Header alrededor del contenido (children) y maneja
//   el estado de colapso y del menú móvil.
export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Alterna el sidebar colapsado (solo íconos) en desktop.
  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  // Alterna el menú deslizante en pantallas pequeñas.
  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <Header 
        onMenuToggle={handleMenuToggle}
        sidebarCollapsed={sidebarCollapsed}
      />
      {/* Overlay que se muestra solo en móvil para cerrar el menú al tocar fuera. */}
      {mobileMenuOpen && (
        <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)} />
      )}
      {/* Área principal: renderiza la página actual y adapta el margen
          según si el sidebar está colapsado o el menú móvil abierto. */}
      <main className={`layout-main ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="layout-content">{children}</div>
      </main>
    </div>
  )
}
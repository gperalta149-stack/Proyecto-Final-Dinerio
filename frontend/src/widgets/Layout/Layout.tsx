// frontend/src/widgets/Layout/Layout.tsx
import type React from "react"
import { useState } from "react"
import { Header } from "../Header"
import { Sidebar } from "../Sidebar"
import "./Layout.css"

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSidebarToggle = () => {
    setSidebarCollapsed(!sidebarCollapsed)
  }

  const handleMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <div className="layout">
      <Sidebar collapsed={sidebarCollapsed} onToggle={handleSidebarToggle} />
      <Header 
        onMenuToggle={handleMenuToggle}
        sidebarCollapsed={sidebarCollapsed}
      />
      <main className={`layout-main ${sidebarCollapsed ? 'collapsed' : ''} ${mobileMenuOpen ? 'mobile-menu-open' : ''}`}>
        <div className="layout-content">{children}</div>
      </main>
    </div>
  )
}
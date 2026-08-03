import React from "react"
import ReactDOM from "react-dom/client"
import App from "./app/App"

/* Design System Unificado */
import './styles/shared/index.css'

// Fuerza el tema oscuro a nivel global colgando un atributo sobre el elemento <html>.
document.documentElement.setAttribute('data-theme', 'dark');

// Punto de entrada de la app: monta React sobre el div #root.
// React.StrictMode detecta efectos secundarios y problemas en desarrollo.
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

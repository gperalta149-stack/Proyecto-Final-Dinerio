"use client"

import { AppProviders } from "./providers"
import { AppRoutes } from "./routes"

// Componente raíz: envuelve toda la app con los providers
// (autenticación, toasts, router) y define el árbol de rutas.
function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  )
}

export default App

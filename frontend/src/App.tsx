"use client"

import type React from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { AuthProvider, useAuth } from "./contexts/AuthContext"
import { Layout } from "./components/layout/Layout"
import { HomePage } from "./pages/HomePage"
import { BudgetPage } from "./pages/BudgetPage"
import { DashboardPage } from "./pages/DashboardPage"
import { CategoriesPage } from './pages/CategoriesPage';
import { LoginPage } from "./pages/LoginPage"
import { NotificationsPage } from "./pages/NotificationsPage"
import { RegisterPage } from "./pages/RegisterPage"
import { SubscriptionsPage } from "./pages/SubscriptionsPage"
import { ProfilePage } from "./pages/ProfilePage"
import { ReportsPage } from "./pages/ReportsPage"
import { CalendarPage } from "./pages/CalendarPage"

// Componente de carga profesional unificado
const LoadingScreen: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="loading-spinner mx-auto mb-4"></div>
        <div className="text-white text-xl font-semibold">Cargando Dinerio...</div>
        <p className="text-gray-400 mt-2">Preparando tu experiencia financiera</p>
      </div>
    </div>
  )
}

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return user ? <>{children}</> : <Navigate to="/login" />
}

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingScreen />
  }

  return user ? <Navigate to="/dashboard" /> : <>{children}</>
}

// Componente de página profesional con animación
const ProfessionalPage: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="professional-page">
      {children}
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={
              <PublicRoute>
                <HomePage />
              </PublicRoute>
            }
          />

          <Route
            path="/homepage"
            element={
              <PrivateRoute>
                <Layout>
                  <ProfessionalPage>
                    <DashboardPage />
                  </ProfessionalPage>
                </Layout>
              </PrivateRoute>
            }
          />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <ProfessionalPage>
                  <LoginPage />
                </ProfessionalPage>
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <ProfessionalPage>
                  <RegisterPage />
                </ProfessionalPage>
              </PublicRoute>
            }
          />
          
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Layout>
                  <ProfessionalPage>
                    <DashboardPage />
                  </ProfessionalPage>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/subscriptions"
            element={
              <PrivateRoute>
                <Layout>
                  <ProfessionalPage>
                    <SubscriptionsPage />
                  </ProfessionalPage>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <PrivateRoute>
                <Layout>
                  <ProfessionalPage>
                    <CategoriesPage />
                  </ProfessionalPage>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/budget"
            element={
              <PrivateRoute>
                <Layout>
                  <ProfessionalPage>
                    <BudgetPage />
                  </ProfessionalPage>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Layout>
                  <ProfessionalPage>
                    <NotificationsPage />
                  </ProfessionalPage>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Layout>
                  <ProfessionalPage>
                    <ProfilePage />
                  </ProfessionalPage>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <PrivateRoute>
                <Layout>
                  <ProfessionalPage>
                    <ReportsPage />
                  </ProfessionalPage>
                </Layout>
              </PrivateRoute>
            }
          />
          <Route
            path="/calendar"
            element={
              <PrivateRoute>
                <Layout>
                  <ProfessionalPage>
                    <CalendarPage />
                  </ProfessionalPage>
                </Layout>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/home"
            element={<Navigate to="/dashboard" />}
          />
          <Route
            path="*"
            element={
              <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-4xl font-bold text-white mb-4">404 - Página No Encontrada</h1>
                  <p className="text-xl text-gray-300 mb-8 max-w-md mx-auto">
                    La página que buscas no existe o ha sido movida.
                  </p>
                  <div className="flex gap-4 justify-center">
                    <a
                      href="/"
                      className="px-6 py-3 bg-gray-700 text-white rounded-xl border border-gray-600 hover:border-gray-500 transition-colors"
                    >
                      Ir al Inicio
                    </a>
                    <a
                      href="/dashboard"
                      className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                    >
                      Ir al Dashboard
                    </a>
                  </div>
                </div>
              </div>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
// frontend/src/app/routes.tsx
"use client"

import type React from "react"
import { Navigate, Route, Routes } from "react-router-dom"
import { LoginPage, RegisterPage } from "../features/auth"
import { BudgetPage } from "../features/budget"
import { CalendarPage } from "../features/calendar"
import { CategoriesPage } from "../features/categories"
import { DashboardPage } from "../features/dashboard"
import { DebtsPage } from "../features/debts"
import { HomePage } from "../features/home"
import { NotificationsPage } from "../features/notifications"
import { ProfilePage } from "../features/profile"
import { ReportsPage } from "../features/reports"
import { SubscriptionsPage } from "../features/subscriptions"
import { Layout } from "../widgets/Layout"
import { PrivateRoute, PublicRoute } from "./protectedRoute"




export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<PublicRoute><HomePage /></PublicRoute>} />

      <Route
        path="/login"
        element={
          <PublicRoute>
              <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
              <RegisterPage />
          </PublicRoute>
        }
      />

      <Route
        path="/dashboard"
        element={
          <PrivateRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/subscriptions"
        element={
          <PrivateRoute>
            <Layout>
                <SubscriptionsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/categories"
        element={
          <PrivateRoute>
            <Layout>
                <CategoriesPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/budget"
        element={
          <PrivateRoute>
            <Layout>
                <BudgetPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <PrivateRoute>
            <Layout>
                <NotificationsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute>
            <Layout>
                <ProfilePage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute>
            <Layout>
                <ReportsPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <PrivateRoute>
            <Layout>
                <CalendarPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route
        path="/debts"
        element={
          <PrivateRoute>
            <Layout>
                <DebtsPage />
            </Layout>
          </PrivateRoute>
        }
      />

      <Route path="/home" element={<Navigate to="/dashboard" />} />
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
                <a href="/" className="px-6 py-3 bg-gray-700 text-white rounded-xl border border-gray-600 hover:border-gray-500 transition-colors">
                  Ir al Inicio
                </a>
                <a href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all">
                  Ir al Dashboard
                </a>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  )
}
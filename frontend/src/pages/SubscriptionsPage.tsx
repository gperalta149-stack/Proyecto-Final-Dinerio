"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { SubscriptionList } from "../components/subscriptions/SubscriptionList"
import { SubscriptionModal } from "../components/subscriptions/SubscriptionModal"
import { subscriptionService } from "../services/subscriptionService"
import { categoryService } from "../services/categoryService"
import type { Subscription, Category } from "../types"
import { Button } from "../components/ui/Button"
import { useExchangeRate } from "../hooks/useExchangeRate"

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>()
  const { currentRate, loading: rateLoading } = useExchangeRate('blue')

  useEffect(() => {
    loadSubscriptions()
    loadCategories()
  }, [])

  const loadSubscriptions = async () => {
    try {
      setLoading(true)
      const data = await subscriptionService.getAll()
      console.log("📊 Suscripciones cargadas:", data)
      setSubscriptions(data)
    } catch (error) {
      console.error("Error loading subscriptions:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCategories = async () => {
    try {
      console.log("🔄 Cargando categorías para suscripciones...")
      const cats = await categoryService.getAll()
      console.log("📋 Categorías disponibles:", cats)
      setCategories(cats)
    } catch (error) {
      console.error("❌ Error loading categories:", error)
      const defaultCats: Category[] = [
        {
          id: '1',
          name: 'Streaming',
          color: '#8B5CF6',
          icon: '🎬',
          subscription_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Música',
          color: '#EC4899',
          icon: '🎵',
          subscription_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Software',
          color: '#3B82F6',
          icon: '💻',
          subscription_count: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]
      setCategories(defaultCats)
    }
  }

  const handleCreate = () => {
    setEditingSubscription(undefined)
    setShowModal(true)
  }

  const handleEdit = (subscription: Subscription) => {
    setEditingSubscription(subscription)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de que querés cancelar esta suscripción?")) {
      try {
        await subscriptionService.delete(id)
        await loadSubscriptions()
      } catch (error) {
        console.error("Error deleting subscription:", error)
        alert("Error al cancelar la suscripción")
      }
    }
  }

  const handleSubmit = async (data: Partial<Subscription>) => {
    try {
      if (editingSubscription) {
        await subscriptionService.update(editingSubscription.id, data)
      } else {
        await subscriptionService.create(data)
      }
      
      setShowModal(false)
      await loadSubscriptions()
    } catch (error) {
      console.error("Error saving subscription:", error)
      alert("Error al guardar la suscripción")
    }
  }

  const totalARS = subscriptions.reduce((sum, sub) => {
    if (sub.status !== 'active') return sum;
    return sum + (sub.arsAmount || parseFloat(sub.amount.toString()));
  }, 0);

  /*const totalUSD = subscriptions
    .filter(sub => sub.status === 'active' && sub.currency === 'USD')
    .reduce((sum, sub) => sum + parseFloat(sub.amount.toString()), 0);*/

  const totalSubscriptions = subscriptions.filter(sub => sub.status === 'active').length;

  return (
    <div className="subtrack-page">
      <div className="subtrack-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Mis Suscripciones</h1>
            <p className="page-subtitle">
              Gestioná todas tus suscripciones en un solo lugar
              {categories.length > 0 && ` • ${categories.length} categorías disponibles`}
            </p>
          </div>
          
          {/* Información del tipo de cambio */}
          <div className="flex items-center gap-6">
            {!rateLoading && currentRate > 0 && (
              <div className="text-right">
                <div className="text-sm text-gray-400">Dólar Actual</div>
                <div className="text-lg font-bold text-green-400">
                  ${currentRate.toLocaleString()}
                </div>
              </div>
            )}
            
            <Button onClick={handleCreate}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva Suscripción
            </Button>
          </div>
        </div>

        {/* Resumen de gastos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="subtrack-card text-center">
            <div className="text-2xl font-bold text-white">${totalARS.toLocaleString('es-AR')}</div>
            <div className="text-sm text-gray-400">Total Mensual (ARS)</div>
          </div>
          
          {/*<div className="subtrack-card text-center">
            <div className="text-2xl font-bold text-yellow-400">US$ {totalUSD.toFixed(2)}</div>
            <div className="text-sm text-gray-400">Suscripciones en USD</div>
          </div>*/}
          
          <div className="subtrack-card text-center">
            <div className="text-2xl font-bold text-blue-400">{totalSubscriptions}</div>
            <div className="text-sm text-gray-400">Suscripciones Activas</div>
          </div>
        </div>

        {/* Lista de suscripciones */}
        {loading ? (
          <div className="subtrack-loading">
            <div className="loading-spinner"></div>
          </div>
        ) : (
          <SubscriptionList
            subscriptions={subscriptions}
            onEdit={handleEdit}
            onCancel={handleDelete}
          />
        )}

        {/* Modal */}
        {showModal && (
          <SubscriptionModal
            subscription={editingSubscription}
            categories={categories}
            onSave={handleSubmit}
            onClose={() => setShowModal(false)}
          />
        )}
      </div>
    </div>
  )
}
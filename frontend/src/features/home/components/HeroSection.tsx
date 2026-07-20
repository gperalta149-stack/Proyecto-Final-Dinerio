import React from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, Play, Sparkles } from "lucide-react"
import { STATS } from "../data/homeData"
import "../styles/components/hero.css"

const CHART_DATA = [40, 55, 35, 65, 45, 75, 50, 80, 60, 70]

const TOP_SUBS = [
  { name: "Netflix", price: "$15.99", color: "#E50914" },
  { name: "Spotify", price: "$9.99", color: "#1DB954" },
  { name: "Adobe CC", price: "$52.99", color: "#FF0000" },
  { name: "GitHub", price: "$4.00", color: "#6e40c9" },
]

export const HeroSection: React.FC = () => {
  return (
    <section className="hero">
      <div className="hero-glow" />

      <div className="hero-container">
        <motion.div
          className="hero-badge"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <span className="hero-badge-dot" />
          Nueva versión 2.0
          <Sparkles size={13} />
        </motion.div>

        <motion.h1
          className="hero-title"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          Toma el control de tus{" "}
          <span className="hero-title-accent">finanzas</span>
        </motion.h1>

        <motion.p
          className="hero-subtitle"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Gestioná, analizá y optimizá todas tus suscripciones en un solo lugar.
          Nunca más pagues por servicios que no usás.
        </motion.p>

        <motion.div
          className="hero-actions"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <Link to="/register" className="hero-btn-primary">
            Comenzar gratis
            <ArrowRight size={16} />
          </Link>
          <Link to="/demo" className="hero-btn-secondary">
            <Play size={14} />
            Ver demo
          </Link>
        </motion.div>

        <motion.div
          className="hero-dashboard"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <div className="hero-kpis">
            <div className="hero-kpi">
              <span className="hero-kpi-label">Total gastado</span>
              <span className="hero-kpi-value">$1,247.50</span>
              <span className="hero-kpi-change positive">▲ 12%</span>
            </div>
            <div className="hero-kpi">
              <span className="hero-kpi-label">Suscripciones</span>
              <span className="hero-kpi-value">12 activas</span>
              <span className="hero-kpi-change muted">Este mes</span>
            </div>
            <div className="hero-kpi">
              <span className="hero-kpi-label">Ahorro mensual</span>
              <span className="hero-kpi-value">+$86.00</span>
              <span className="hero-kpi-change positive">▲ 8%</span>
            </div>
          </div>

          <div className="hero-chart">
            {CHART_DATA.map((h, i) => (
              <motion.div
                key={i}
                className="hero-chart-bar"
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.7 + i * 0.04, duration: 0.5 }}
                style={{ height: `${h}%` }}
              />
            ))}
          </div>

          <div className="hero-dashboard-bottom">
            <div className="hero-top-subs">
              {TOP_SUBS.map((sub) => (
                <div key={sub.name} className="hero-sub-row">
                  <span className="hero-sub-dot" style={{ background: sub.color }} />
                  <span className="hero-sub-name">{sub.name}</span>
                  <span className="hero-sub-price">{sub.price}</span>
                </div>
              ))}
            </div>
            <div className="hero-next-payment">
              <span className="hero-next-label">Próximo pago</span>
              <span className="hero-next-name">Spotify</span>
              <span className="hero-next-date">15 de julio</span>
              <span className="hero-next-amount">$24.99</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="hero-stats"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          {STATS.map((stat) => (
            <div key={stat.label} className="hero-stat">
              <span className="hero-stat-value">{stat.value}</span>
              <span className="hero-stat-label">{stat.label}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
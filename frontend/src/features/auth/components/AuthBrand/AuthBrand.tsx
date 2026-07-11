// frontend/src/features/auth/components/AuthBrand/AuthBrand.tsx
import React from "react";
import { motion } from "framer-motion";
import { Wallet, CheckCircle, TrendingUp, Calendar, FileSpreadsheet } from "lucide-react";

export const AuthBrand: React.FC = () => {
  return (
    <>
      {/* Luces decorativas con animación */}
      <motion.div 
        className="light-dot light-dot-1"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div 
        className="light-dot light-dot-2"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />

      {/* Logo con animación y brillo */}
      <motion.div 
        className="auth-brand-logo"
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <motion.div 
          className="auth-brand-logo-icon"
          animate={{
            boxShadow: [
              "0 0 20px rgba(99, 102, 241, 0.3)",
              "0 0 40px rgba(99, 102, 241, 0.6)",
              "0 0 60px rgba(139, 92, 246, 0.4)",
              "0 0 20px rgba(99, 102, 241, 0.3)",
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <Wallet size={20} />
        </motion.div>
        <motion.span 
          className="auth-brand-logo-text"
          animate={{
            textShadow: [
              "0 0 20px rgba(99, 102, 241, 0)",
              "0 0 40px rgba(99, 102, 241, 0.2)",
              "0 0 20px rgba(99, 102, 241, 0)",
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          Dinerio
        </motion.span>
      </motion.div>

      {/* Título con efecto de brillo de izquierda a derecha */}
      <motion.h1 
        className="auth-brand-title"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
      >
        <span className="shimmer-text">
          Gestiona todas tus
          <br />
          <span className="highlight">suscripciones</span>
          <br />
          sin complicaciones.
        </span>
      </motion.h1>

      {/* Descripción */}
      <motion.p 
        className="auth-brand-description"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        Controla tus pagos, recibe recordatorios y visualiza estadísticas
        en tiempo real desde un único lugar.
      </motion.p>

      {/* Features con animación escalonada */}
      <motion.div 
        className="auth-brand-features"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {[
          { icon: CheckCircle, text: "Dashboard inteligente" },
          { icon: TrendingUp, text: "Estadísticas" },
          { icon: Calendar, text: "Calendario de pagos" },
          { icon: FileSpreadsheet, text: "Reportes" },
        ].map((feature, index) => (
          <motion.div
            key={index}
            className="auth-brand-feature"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
            whileHover={{ 
              x: 5,
              color: "#ffffff",
              transition: { type: "spring", stiffness: 300 }
            }}
          >
            <motion.div
              whileHover={{
                scale: 1.2,
                rotate: [0, -10, 10, 0],
                transition: { duration: 0.3 }
              }}
            >
              <feature.icon size={14} className="feature-icon-glow" />
            </motion.div>
            {feature.text}
          </motion.div>
        ))}
      </motion.div>

      {/* Dashboard Preview con animación */}
      <motion.div 
        className="auth-brand-dashboard"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        whileHover={{
          scale: 1.02,
          borderColor: "rgba(99, 102, 241, 0.3)",
          transition: { type: "spring", stiffness: 300 }
        }}
      >
        <div className="auth-brand-dashboard-header">
          <span>Vista previa</span>
          <motion.span
            animate={{
              opacity: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            · 12 suscripciones
          </motion.span>
        </div>
        <div className="auth-brand-dashboard-stats">
          {[
            { value: "$1,247", label: "Gastado" },
            { value: "12", label: "Activas" },
            { value: "+$86", label: "Ahorro", isPositive: true },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="auth-brand-dashboard-stat"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <motion.div 
                className="auth-brand-dashboard-stat-value"
                style={{ color: stat.isPositive ? "#22c55e" : undefined }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: index * 0.5,
                  ease: "easeInOut"
                }}
              >
                {stat.value}
              </motion.div>
              <div className="auth-brand-dashboard-stat-label">{stat.label}</div>
            </motion.div>
          ))}
        </div>
        <div className="auth-brand-dashboard-chart">
          {[30, 45, 35, 60, 50, 70, 55, 80, 65, 45, 55, 75, 60, 85, 70, 50, 65, 90, 55, 60].map((h, i) => (
            <motion.div
              key={i}
              className="auth-brand-dashboard-chart-bar"
              initial={{ height: 0 }}
              animate={{ height: `${h * 0.4 + 8}%` }}
              transition={{
                delay: 0.8 + i * 0.03,
                duration: 0.8,
                ease: "easeOut"
              }}
              whileHover={{
                opacity: 1,
                scaleY: 1.2,
                transformOrigin: "bottom"
              }}
            />
          ))}
        </div>
      </motion.div>
    </>
  );
};
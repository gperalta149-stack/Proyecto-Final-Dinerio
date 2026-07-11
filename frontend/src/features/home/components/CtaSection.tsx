// frontend/src/features/home/components/CtaSection.tsx
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Clock, ChevronRight } from "lucide-react";
import "../styles/components/cta.css";

export const CtaSection: React.FC = () => {
  return (
    <section id="cta" className="cta">
      <div className="cta-glow" />
      <div className="container">
        <motion.div
          className="cta-card"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="cta-title">
            ¿Listo para tomar el{" "}
            <span className="gradient-text">control</span>?
          </h2>
          <p className="cta-description">
            Únete a miles de usuarios que ya optimizaron sus gastos con Dinerio.
            Completamente gratis, sin límites ocultos.
          </p>

          <div className="cta-features">
            <span className="cta-feature">
              <ShieldCheck size={16} />
              Sin tarjeta de crédito
            </span>
            <span className="cta-feature">
              <Sparkles size={16} />
              Gratis para siempre
            </span>
            <span className="cta-feature">
              <Clock size={16} />
              Configuración en 2 minutos
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};
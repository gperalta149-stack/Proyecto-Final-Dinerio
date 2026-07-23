import React from "react";
import { motion } from "framer-motion";
import { SectionHeader } from "./SectionHeader";
import { STEPS } from "../data/homeData";
import { CheckCircle } from "lucide-react";
import '../../../styles/home/steps.css';

export const HowItWorksSection: React.FC = () => {
  return (
    <section id="how-it-works" className="steps">
      <div className="container">
        <SectionHeader
          title={
            <>
              Así de fácil es{" "}
              <span className="gradient-text">comenzar</span>
            </>
          }
          subtitle="En solo 3 pasos tendrás el control total de tus suscripciones"
        />

        <div className="steps-timeline">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.step}
              className="step-item"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2, duration: 0.5 }}
              viewport={{ once: true }}
            >
              <div className="step-marker">{step.step}</div>
              <div className="step-content">
                <h3>{step.title}</h3>
                <p>{step.description}</p>
                <div className="step-icon">
                  <CheckCircle size={16} />
                  <span>Paso {step.step} completado</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
import React from "react";
import { motion } from "framer-motion";
import { FeatureCard } from "./FeatureCard";
import { SectionHeader } from "./SectionHeader";
import { FEATURES } from "../data/homeData";
import "../styles/components/features.css";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 }
};

export const FeaturesSection: React.FC = () => {
  return (
    <section id="features" className="features">
      <div className="container">
        <SectionHeader
          title={
            <>
              Todo lo que necesitas para{" "}
              <span className="gradient-text">controlar tus gastos</span>
            </>
          }
          subtitle="Herramientas poderosas diseñadas para darte visibilidad total sobre tus suscripciones recurrentes."
        />

        <motion.div
          className="features-grid"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
        >
          {FEATURES.map((feature, index) => (
            <motion.div key={feature.title} variants={itemVariants}>
              <FeatureCard feature={feature} index={index} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
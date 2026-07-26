// frontend/src/features/home/components/FeatureCard.tsx
import React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { FeatureCardProps } from "../types";

export const FeatureCard: React.FC<FeatureCardProps> = ({ feature, index = 0 }) => {
  return (
    <motion.div
      className="feature-card"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.3 }}
    >
      <div className="feature-card-glow" />
      <div className="feature-icon-wrapper">
        {feature.icon}
      </div>
      <h3 className="feature-title">{feature.title}</h3>
      <p className="feature-description">{feature.description}</p>
      <button type="button" className="feature-link" aria-label={`Saber más sobre ${feature.title}`}>
        Saber más
        <ArrowRight size={16} />
      </button>
    </motion.div>
  );
};
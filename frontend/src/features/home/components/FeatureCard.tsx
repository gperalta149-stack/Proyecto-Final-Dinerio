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
      <a href="#" className="feature-link">
        Saber más
        <ArrowRight size={16} />
      </a>
    </motion.div>
  );
};
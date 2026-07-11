import React from "react";
import { motion } from "framer-motion";
import { SectionHeaderProps } from "../types";

export const SectionHeader: React.FC<SectionHeaderProps> = ({ 
  title, 
  subtitle, 
  className = "" 
}) => {
  return (
    <motion.div 
      className={`section-header ${className}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      style={{ textAlign: "center", marginBottom: "4rem" }}
    >
      <h2 className="section-title">{title}</h2>
      {subtitle && <p className="section-subtitle">{subtitle}</p>}
    </motion.div>
  );
};
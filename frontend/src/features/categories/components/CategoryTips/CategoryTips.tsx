// frontend/src/features/categories/components/CategoryTips/CategoryTips.tsx
import React from 'react';
import { Lightbulb, Sparkles } from 'lucide-react';
import './CategoryTips.css';

export const CategoryTips: React.FC = () => {
  const tips = [
    { text: 'Crea categorías antes de agregar suscripciones', icon: Sparkles },
    { text: 'Usa colores distintos para identificar rápidamente', icon: Sparkles },
    { text: 'Las categorías vacías pueden ser eliminadas', icon: Sparkles },
    { text: 'Organiza por tipo de gasto (entretenimiento, trabajo, etc.)', icon: Sparkles },
  ];

  return (
    <div className="tips-card">
      <h3 className="section-title">
        <Lightbulb size={18} />
        Consejos
      </h3>
      <div className="tips-list">
        {tips.map((tip, index) => {
          const Icon = tip.icon;
          return (
            <div key={index} className="tip-item">
              <Icon size={14} className="tip-icon" />
              <span className="tip-text">{tip.text}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryTips;

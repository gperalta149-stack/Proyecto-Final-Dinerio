import React from "react";
import { Plus, CreditCard } from "lucide-react";
import "./SubscriptionHeader.css";

interface SubscriptionHeaderProps {
  onAdd: () => void;
}

export const SubscriptionHeader: React.FC<SubscriptionHeaderProps> = ({ onAdd }) => (
  <div className="subs-header">
    <button onClick={onAdd} className="subs-add-button">
      <Plus size={18} /> Nueva suscripción
    </button>
  </div>
);

export default SubscriptionHeader;

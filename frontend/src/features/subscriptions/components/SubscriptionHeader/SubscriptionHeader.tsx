import React from "react";
import { Plus } from "lucide-react";
import '../../../../styles/subscriptions/SubscriptionHeader.css';

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

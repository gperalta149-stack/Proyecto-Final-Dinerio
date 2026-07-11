// frontend/src/shared/components/ui/Toast/Toast.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import type { Toast as ToastType } from '../../../hooks/useToast';
import './Toast.css';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

export const Toast: React.FC<ToastProps> = ({ toast, onRemove }) => {
  const Icon = ICONS[toast.type];
  const typeClass = `toast-${toast.type}`;

  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id);
      }, toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <motion.div
      className={`toast ${typeClass}`}
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className={`toast-icon toast-icon-${toast.type}`}>
        <Icon size={18} />
      </div>

      <div className="toast-content">
        <p className="toast-message">{toast.message}</p>
      </div>

      <button className="toast-close" onClick={() => onRemove(toast.id)}>
        <X size={16} />
      </button>
    </motion.div>
  );
};

export default Toast;
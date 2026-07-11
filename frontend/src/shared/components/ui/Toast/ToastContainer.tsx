// frontend/src/shared/components/ui/Toast/ToastContainer.tsx
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast } from './Toast';
import type { Toast as ToastType } from '../../../hooks/useToast';
import './Toast.css';

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={onRemove} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
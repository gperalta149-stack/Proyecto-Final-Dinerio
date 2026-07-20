// frontend/src/shared/components/ui/Toast/ToastContainer.tsx
import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast } from './Toast';
import { useToast } from '../../../hooks/useToast';
import './Toast.css';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <Toast key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastContainer;
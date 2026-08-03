import React, { createContext, useContext, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

let toastId = 0;

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Estado global de toasts: un array que se comparte con toda la app
  // mediante Context, evitando "prop drilling" (pasar props en cascada).
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Elimina un toast por id: filtra el array con prev => prev.filter(...),
  // usando la forma funcional de setState para no depender del estado anterior.
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Agrega un toast y programa su auto-cierre con setTimeout.
  // useCallback memoiza la función para evitar re-renders innecesarios.
  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    const id = String(++toastId);
    const newToast: Toast = { id, message, type, duration };
    setToasts(prev => [...prev, newToast]);
    if (duration > 0) {
      setTimeout(() => removeToast(id), duration);
    }
  }, [removeToast]);

  // El provider expone el estado y las acciones a todos los consumidores.
  return (
    <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
};

// Hook de acceso: lee el contexto y valida que exista un provider
// (si falta, lanza error en desarrollo en vez de fallar en silencio).
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast debe usarse dentro de un ToastProvider');
  }
  return context;
};

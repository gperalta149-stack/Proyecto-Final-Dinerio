// frontend/src/features/home/hooks/useHomeHeader.ts
import { useState, useCallback } from "react";

export const useHomeHeader = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggle = useCallback(() => {
    setMobileOpen((prev) => !prev);
  }, []);

  const close = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const open = useCallback(() => {
    setMobileOpen(true);
  }, []);

  return {
    mobileOpen,
    toggle,
    close,
    open,
  };
};
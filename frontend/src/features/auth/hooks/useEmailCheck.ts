import { useState } from "react";
import { authService } from "../service/authService";

export const useEmailCheck = () => {
  const [checking, setChecking] = useState(false);
  const [available, setAvailable] = useState<boolean | null>(null);

  const checkEmail = async (email: string): Promise<boolean> => {
    setChecking(true);
    try {
      // Simulamos una verificación - en producción llamarías a un endpoint
      await new Promise(resolve => setTimeout(resolve, 500));
      const isAvailable = true; // Esto vendría de una API
      setAvailable(isAvailable);
      return isAvailable;
    } catch (error) {
      setAvailable(false);
      return false;
    } finally {
      setChecking(false);
    }
  };

  return { checking, available, checkEmail };
};
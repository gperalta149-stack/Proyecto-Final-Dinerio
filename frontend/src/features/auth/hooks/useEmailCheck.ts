import { useState } from "react";
import { authService } from "../service/authService";

export const useEmailCheck = () => {
  const [checking, setChecking] = useState(false);

  const checkEmail = async (email: string): Promise<boolean> => {
    setChecking(true);
    try {
      const result = await authService.checkAvailability(email);
      return result.available;
    } catch {
      return false;
    } finally {
      setChecking(false);
    }
  };

  return { checking, checkEmail };
};
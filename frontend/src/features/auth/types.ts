// frontend/src/features/auth/types.ts
import type { User } from '../../shared/types';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

export interface AuthError {
  error: string;
  message?: string;
}
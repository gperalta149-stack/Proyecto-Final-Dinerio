// frontend/src/features/profile/types.ts

// Tipos específicos de la feature
export interface ProfileFormData {
  first_name: string;
  last_name: string;
}

export interface AvatarUploadProps {
  user: User;
  onUpdate: (userData: Partial<User>) => void;
}

export interface PrivacySettingsProps {
  user: User;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface BudgetSettingsProps {
  user: User;
  onUpdate: (budget: number) => void;
}

export interface ProfileStats {
  subscriptions: number;
  paymentsMade: number;
  monthsUsing: number;
  categories: number;
  pendingDebts: number;
}

// frontend/src/shared/types/user.ts
export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  avatar_url?: string;
  role?: 'admin' | 'user';
  monthly_budget?: number;
  monthly_income?: number;
  currency?: string;
  language?: string;
  notifications_enabled?: boolean;
  alert_threshold?: number;
  created_at?: string;
  updated_at?: string;
}
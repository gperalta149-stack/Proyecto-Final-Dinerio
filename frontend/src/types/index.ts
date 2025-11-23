export type Currency = 'ARS' | 'USD';

export interface ExchangeRates {
  blue: number;
  oficial: number;
  lastUpdate: Date;
}

// Luego continúan tus interfaces existentes...
export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  monthly_budget?: number;
  currency?: string;
  language?: string;
  notifications_enabled?: boolean;
  created_at: string;
  updated_at: string;
  name?: string;
  monthlyBudget?: number;
}

export interface UserSettings {
  currency: string;
  language: string;
  notifications_enabled: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  category_id?: string | null;
  category_name?: string;
  category_color?: string;
  category_icon?: string;
  name: string;
  description?: string | null;
  amount: number | string;
  currency: string;
  billing_cycle: string;
  start_date?: string;
  next_billing_date: string;
  status: 'active' | 'cancelled' | 'paused';
  payment_method?: string | null;
  website_url?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
  category?: string;
  billingCycle?: string;
  nextBillingDate?: string;
  
  // NUEVOS CAMPOS PARA CONVERSIÓN - USANDO EL TIPO Currency
  originalAmount?: number;
  originalCurrency?: Currency; // ← AHORA ESTÁ DEFINIDO
  arsAmount?: number;
  currentExchangeRate?: number;
  lastUpdated?: string;
  hasTax?: boolean;
  taxAmountUSD?: number;
  totalWithTaxUSD?: number;
  totalWithTaxARS?: number;
}

// ... el resto de tus interfaces permanecen igual
export interface SubscriptionResponse {
  message?: string;
  subscription: Subscription;
}

export type SubscriptionOrResponse = Subscription | SubscriptionResponse;

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  subscription_count?: number;
}

export interface Notification {
  id: string;
  user_id: string;
  subscription_id?: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  subscription_name?: string;
  isRead?: boolean;
  createdAt?: string;
}

export interface NotificationsResponse {
  notifications: Notification[];
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  created_at: string;
  user_email?: string;
  first_name?: string;
  last_name?: string;
  userName?: string;
  createdAt?: string;
}

export interface DashboardStats {
  monthlyTotal: number;
  yearlyTotal: number;
  totalSubscriptions: number;
  monthlyBudget: number;
}

export interface MonthlyEvolution {
  month: number;
  year: number;
  subscription_count: number;
  monthly_total: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateBudget?: (monthlyBudget: number) => Promise<{ success: boolean; error?: string }>;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface FinancialReport {
  month: number;
  year: number;
  summary: {
    total_subscriptions: number;
    monthly_total: number;
    yearly_total: number;
    monthly_budget: number;
    budget_usage: number;
    currency: string;
  };
  by_category: {
    name: string;
    color: string;
    subscription_count: number;
    monthly_total: number;
  }[];
}

export interface CalendarEvent {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  billingCycle: string;
  status: 'pending' | 'paid' | 'cancelled';
  categoryName?: string;
  categoryColor?: string;
}

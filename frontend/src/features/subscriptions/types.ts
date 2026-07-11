// frontend/src/features/subscriptions/types.ts
import type { Subscription, Category, DashboardStats } from '../../shared/types';

// Re-exportar desde shared
export type { Subscription, Category, DashboardStats };

export interface SubscriptionFormData {
  name: string;
  amount: number;
  currency: string;
  billing_cycle: 'monthly' | 'yearly' | 'weekly';
  category_id: string | null;
  next_billing_date: string;
  status: 'active' | 'paused' | 'cancelled';
  description: string;
  notes?: string;
}

export type SubscriptionFilterKey = 'all' | 'active' | 'inactive' | 'paid' | 'unpaid';

export interface SubscriptionFilters {
  status?: SubscriptionFilterKey;
  category?: string;
  search?: string;
}

export interface SubscriptionStats {
  total: number;
  active: number;
  inactive: number;
  paid: number;
  unpaid: number;
  monthlyTotal: number;
}

export interface SubscriptionTableRow {
  id: string;
  name: string;
  category: string;
  nextBillingDate: string;
  amount: number;
  currency: string;
  status: string;
  isPaid: boolean;
}

export interface SubscriptionModalProps {
  subscription?: Subscription;
  categories: Category[];
  onSave: (data: Partial<Subscription>) => Promise<void>;
  onClose: () => void;
}

export interface UseSubscriptionsReturn {
  subscriptions: Subscription[];
  loading: boolean;
  error: string | null;
  fetchSubscriptions: () => Promise<void>;
  addSubscription: (subscription: Partial<Subscription>) => Promise<Subscription>;
  updateSubscription: (id: string, subscription: Partial<Subscription>) => Promise<Subscription>;
  deleteSubscription: (id: string) => Promise<void>;
}
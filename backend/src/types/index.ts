import type { Request } from "express"

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  avatar_url?: string
  monthly_budget?: number
  monthly_income?: number
  currency?: string
  language?: string
  notifications_enabled?: boolean
  created_at: string
  updated_at: string
}

export interface UserSettings {
  currency: string
  language: string
  notifications_enabled: boolean
}

export interface Category {
  id: string
  name: string
  color: string
  icon?: string
  monthly_limit?: number
  user_id?: string
  created_at: Date
  updated_at: Date
}

export interface Subscription {
  id: string
  user_id: string
  category_id?: string
  name: string
  amount: number
  currency: string
  billing_cycle: "monthly" | "yearly" | "weekly" | "quarterly"
  start_date: Date
  next_billing_date: Date
  status: "active" | "cancelled" | "paused"
  payment_method?: string
  website_url?: string
  notes?: string
  created_at: Date
  updated_at: Date
  category_name?: string
  category_color?: string
  category_icon?: string
}

export interface Debt {
  id: string
  user_id: string
  subscription_id?: string | null
  category_id?: string | null
  name: string
  amount: number
  currency: string
  due_date: Date
  status: "pending" | "paid"
  paid_at?: Date | null
  created_at: Date
  updated_at: Date
  category_name?: string
  category_color?: string
}

export interface JWTPayload {
  userId: string
  email: string
  name?: string
  iat?: number
  exp?: number
}

export interface AuthRequest extends Request {
  user?: JWTPayload
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
}

import type { Request } from 'express'

export interface User {
  id: string
  email: string
  password_hash: string
  name: string
  monthly_budget?: number
  currency?: string
  created_at: Date
  updated_at: Date
}

export interface Category {
  id: string
  name: string
  color: string
  icon?: string
  user_id?: string
  created_at: Date
  updated_at: Date
}

export interface Subscription {
  id: string
  user_id: string
  category_id?: string
  name: string
  cost: number
  currency: string
  billing_cycle: 'monthly' | 'yearly' | 'weekly' | 'quarterly'
  next_payment_date: Date
  status: 'active' | 'cancelled' | 'paused'
  notes?: string
  created_at: Date
  updated_at: Date
  category_name?: string
  category_color?: string
  category_icon?: string
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
  name: string
}
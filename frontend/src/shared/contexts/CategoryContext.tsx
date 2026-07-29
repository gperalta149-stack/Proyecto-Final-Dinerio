"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { categoryService } from "../../features/categories/service/categoryService"
import type { Category } from "../types"

interface CategoryContextType {
  categories: Category[]
  loading: boolean
  refresh: () => Promise<void>
}

const CategoryContext = createContext<CategoryContextType | undefined>(undefined)

export const CategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const data = await categoryService.getAll()
      setCategories(data)
    } catch {
      console.error("Error loading categories")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <CategoryContext.Provider value={{ categories, loading, refresh: load }}>
      {children}
    </CategoryContext.Provider>
  )
}

export const useCategories = (): CategoryContextType => {
  const context = useContext(CategoryContext)
  if (!context) throw new Error("useCategories must be used within a CategoryProvider")
  return context
}

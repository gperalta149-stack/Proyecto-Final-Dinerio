// frontend/src/features/debts/hooks/useDebts.ts
"use client"

import { useState, useEffect, useCallback } from "react";
import type { Debt, DebtsSummary } from "../types";
import { debtService } from "../service/debtService";

export const useDebts = () => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [summary, setSummary] = useState<DebtsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Hook de deudas: carga lista + resumen en paralelo y expone operaciones CRUD.
  // useCallback con deps vacías hace que la función sea estable entre renders.
  const fetchDebts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Promise.all obtiene las deudas y su resumen en una sola tanda.
      const [debtsData, summaryData] = await Promise.all([
        debtService.getAll(),
        debtService.getSummary(),
      ]);
      setDebts(debtsData);
      setSummary(summaryData);
    } catch (err) {
      console.error("[useDebts] Error cargando deudas:", err);
      setError("Error al cargar las deudas");
    } finally {
      setLoading(false);
    }
  }, []);

  // Carga inicial al montar; al depender de fetchDebts (estable) no se repite.
  useEffect(() => {
    fetchDebts();
  }, [fetchDebts]);

  // Las mutaciones llaman a la API y después recargan todo (fetchDebts) para que
  // el listado y el resumen queden siempre sincronizados con el backend.
  const createDebt = async (data: { 
    name: string; 
    amount: number; 
    currency?: string; 
    due_date: string; 
    category_id?: string;
    notes?: string;
  }) => {
    const created = await debtService.create(data);
    await fetchDebts();
    return created;
  };

  const markAsPaid = async (id: string, payment_method?: string, amount_ars?: number) => {
    await debtService.markAsPaid(id, payment_method, amount_ars);
    await fetchDebts();
  };

  const postpone = async (id: string, days: number = 7) => {
    await debtService.postpone(id, days);
    await fetchDebts();
  };

  const removeDebt = async (id: string) => {
    await debtService.delete(id);
    await fetchDebts();
  };

  // Vistas derivadas: separa las deudas según su estado (pendiente/pagada) para
  // alimentar distintas secciones de la UI sin recalcular en cada render.
  const pendingDebts = debts.filter(d => d.status === 'pending');
  const paidDebts = debts.filter(d => d.status === 'paid');

  return {
    debts,
    pendingDebts,
    paidDebts,
    summary,
    loading,
    error,
    fetchDebts,
    createDebt,
    markAsPaid,
    postpone,
    removeDebt,
  };
};
import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "../../../shared/hooks/useToast";
import { Search, CreditCard, Calendar, Wallet, Layers, PauseCircle, CheckCircle, AlertTriangle, Trash2, X, DollarSign, CheckCircle2 } from "lucide-react";
import { SubscriptionHeader } from "../components/SubscriptionHeader/SubscriptionHeader";
import { SubscriptionTabs, type FilterKey } from "../components/SubscriptionTabs/SubscriptionTabs";
import { SubscriptionTable } from "../components/SubscriptionTable/SubscriptionTable";
import { SubscriptionModal } from "../components/SubscriptionModal/SubscriptionModal";
import { ViewSubscriptionModal } from "../components/ViewSubscriptionModal/ViewSubscriptionModal";
import { PayDebtModal } from "../../debts/components/PayDebtModal/PayDebtModal";
import { KpiCard } from "../../../shared/components/ui/KpiCard";
import { subscriptionService } from "../service/subscriptionService";
import { categoryService } from "../../categories/service/categoryService";
import { debtService } from "../../debts/service/debtService";
import { budgetService } from "../../budget/service/budgetService";
import { parseAmount, formatCurrency } from "../../../shared/utils/formatters";
import ExchangeRateService from "../../../shared/services/exchangeRateService";
import type { Subscription, Category, Debt } from "../../../shared/types";
import '../../../styles/subscriptions/subscriptions.css';

type SortKey = "name" | "amount-desc" | "amount-asc" | "next-payment" | "newest";

export const SubscriptionsPage: React.FC = () => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("all");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>("name");
  const [showModal, setShowModal] = useState(false);
  const [editingSubscription, setEditingSubscription] = useState<Subscription | undefined>(undefined);
  const [viewingSubscription, setViewingSubscription] = useState<Subscription | undefined>(undefined);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [subscriptionPage, setSubscriptionPage] = useState(0);
  const [paidDebtsTotal, setPaidDebtsTotal] = useState(0);
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);
  const [payDebt, setPayDebt] = useState<Debt | null>(null);
  const [paySubscription, setPaySubscription] = useState<Subscription | null>(null);
  const [paying, setPaying] = useState(false);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const perPage = 5;

  // Carga inicial en paralelo de suscripciones, categorías y deudas. Además calcula el
  // total pagado en deudas durante el mes (con conversión USD→ARS) para el KPI de gasto mensual.
  const loadAll = async () => {
    try {
      setLoading(true);
      // Promise.all ejecuta los 3 fetch a la vez y espera a que terminen todos.
      const [subsData, catsData, debtsData] = await Promise.all([
        subscriptionService.getAll("all"),
        categoryService.getAll().catch(() => [] as Category[]),
        debtService.getAll(),
      ]);
      setSubscriptions(subsData);
      setCategories(catsData);
      setDebts(debtsData);

      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
      const paidThisMonth = debtsData.filter((d: Debt) => {
        if (d.status !== 'paid' || !d.paid_at) return false;
        const paidDate = new Date(d.paid_at);
        return paidDate >= startOfMonth && paidDate < endOfMonth;
      });
      // Suma de deudas pagadas en el mes, normalizando la moneda a ARS.
      const total = paidThisMonth.reduce((sum: number, d: Debt) => {
        const amount = parseAmount(d.amount);
        return sum + (d.currency === 'USD' ? ExchangeRateService.convertUSDToARS(amount) : amount);
      }, 0);
      setPaidDebtsTotal(total);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  // useEffect con dependencia vacía ejecuta loadAll una sola vez al montar la página.
  useEffect(() => { loadAll(); }, []);

  // Regla de negocio: antes de crear una suscripción se verifica que exista un
  // presupuesto mensual; si no, se muestra una advertencia (sin bloquear al usuario).
  const handleCreate = async () => {
    try {
      const now = new Date();
      const budgetData = await budgetService.getBudgetForMonth(now.getFullYear(), now.getMonth() + 1);
      if (!budgetData || !budgetData.budget_amount || budgetData.budget_amount <= 0) {
        setShowBudgetWarning(true);
        return;
      }
    } catch { /* if fetch fails, proceed anyway */ }
    setEditingSubscription(undefined);
    setShowModal(true);
  };
  const handleProceedToCreate = () => {
    setShowBudgetWarning(false);
    setEditingSubscription(undefined);
    setShowModal(true);
  };
  const handleEdit = (sub: Subscription) => { setEditingSubscription(sub); setShowModal(true); };
  const handleView = (sub: Subscription) => { setViewingSubscription(sub); };
  // Lógica de pago inteligente: si la suscripción tiene una deuda pendiente registrada
  // se abre el modal de pago de deuda; si no, se paga la suscripción directamente.
  const handlePay = (sub: Subscription) => {
    const debt = debts.find(d => d.subscription_id === sub.id && d.status === 'pending');
    if (debt) {
      setPaySubscription(null);
      setPayDebt(debt);
    } else {
      setPayDebt(null);
      setPaySubscription(sub);
    }
  };
  const handlePayConfirm = async (paymentMethod: string) => {
    if (paying) return;
    setPaying(true);
    try {
      if (paySubscription) {
        await subscriptionService.payNow(paySubscription.id, paymentMethod);
        setPaySubscription(null);
      } else if (payDebt) {
        const amount = parseFloat(String(payDebt.amount));
        // Si la deuda está en USD se convierte a ARS antes de marcarla como pagada.
        const amountArs = payDebt.currency === 'USD'
          ? Math.round(ExchangeRateService.convertUSDToARS(amount, 'tarjeta') * 100) / 100
          : undefined;
        await debtService.markAsPaid(payDebt.id, paymentMethod, amountArs);
        setPayDebt(null);
      } else {
        return;
      }
      setPaymentSuccess(true);
      await loadAll();
    } catch {
      showToast("Error al procesar el pago", "error");
    } finally {
      setPaying(false);
    }
  };
  const { showToast } = useToast();

  // Regla de negocio: no se permite eliminar suscripciones activas (pueden tener
  // pagos pendientes); solo se habilita el borrado para estados pausadas/pagadas.
  const handleDelete = (id: string) => {
    const sub = subscriptions.find(s => s.id === id);
    if (!sub) return;
    if (sub.status === 'active') {
      setDeleteError("No se puede eliminar una suscripción activa con pagos pendientes. Cambiá el estado a pagada o esperá a que el ciclo finalice.");
    } else {
      setConfirmDeleteId(id);
    }
  };

  const handleConfirmDelete = async () => {
    if (!confirmDeleteId) return;
    try {
      await subscriptionService.delete(confirmDeleteId);
      setConfirmDeleteId(null);
      await loadAll();
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { error?: string } } };
      const msg = axiosErr.response?.data?.error || "";
      if (msg.includes("deuda") || msg.includes("pagos pendientes")) {
        setDeleteError(msg);
      } else {
        showToast("Error al eliminar la suscripción", "error");
      }
      setConfirmDeleteId(null);
    }
  };

  const closeError = () => {
    setDeleteError(null);
  };
  const handleSubmit = async (data: Partial<Subscription>) => {
    try {
      if (editingSubscription) await subscriptionService.update(editingSubscription.id, data);
      else await subscriptionService.create(data);
      setShowModal(false);
      await loadAll();
    } catch { showToast("Error al guardar la suscripción", "error"); }
  };

  const counts = useMemo(() => ({
    all: subscriptions.length,
    active: subscriptions.filter(s => s.status === "active").length,
    paused: subscriptions.filter(s => s.status === "paused").length,
    cancelled: subscriptions.filter(s => s.status === "cancelled").length,
  }), [subscriptions]);

  useEffect(() => { setSubscriptionPage(0); }, [filter, search]);

  // Pipeline de filtrado/ordenamiento: combina el filtro por tab (estado), la búsqueda
  // por texto y el criterio de ordenamiento, aplicados en cadena sobre una copia del array.
  const filtered = useMemo(() => {
    let list = [...subscriptions];
    if (filter === "active") list = list.filter(s => s.status === "active");
    else if (filter === "paused") list = list.filter(s => s.status === "paused");
    else if (filter === "cancelled") list = list.filter(s => s.status === "cancelled");
    if (sortBy === "next-payment") list = list.filter(s => s.status === "active");
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(s => s.name?.toLowerCase().includes(q) || s.category_name?.toLowerCase().includes(q));
    }
    list.sort((a, b) => {
      switch (sortBy) {
        case "name": return (a.name || "").localeCompare(b.name || "");
        case "amount-desc": return (parseAmount(b.amount) - parseAmount(a.amount));
        case "amount-asc": return (parseAmount(a.amount) - parseAmount(b.amount));
        case "next-payment": return new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime();
        case "newest": return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        default: return 0;
      }
    });
    return list;
  }, [subscriptions, filter, search, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const displayList = filtered.slice(subscriptionPage * perPage, (subscriptionPage + 1) * perPage);

  // Total mensual: suscripciones activas que cobran este mes (o vencidas) más el total
  // de deudas pagadas en el mes; alimenta los KPIs de gasto.
  const totalMonthly = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return subscriptions
      .filter((sub) => {
        if (sub.status !== 'active') return false;
        const billingDate = new Date(sub.next_billing_date);
        const isThisMonth = billingDate.getMonth() === currentMonth && billingDate.getFullYear() === currentYear;
        const isOverdue = billingDate.getTime() < new Date(currentYear, currentMonth, 1).getTime();
        return isThisMonth || isOverdue;
      })
      .reduce((sum, sub) => sum + (sub.arsAmount || parseAmount(sub.amount)), 0) + paidDebtsTotal;
  }, [subscriptions, paidDebtsTotal]);

  const nextPayment = useMemo(() => {
    const active = subscriptions.filter(s => s.status === "active").sort((a, b) => new Date(a.next_billing_date).getTime() - new Date(b.next_billing_date).getTime());
    return active[0] || null;
  }, [subscriptions]);

  const categoryCount = useMemo(() => {
    const usedCatIds = new Set(subscriptions.map(s => s.category_id).filter(Boolean));
    return usedCatIds.size;
  }, [subscriptions]);

  const tabs = [
    { key: "all" as FilterKey, label: "Todas", count: counts.all },
    { key: "active" as FilterKey, label: "Activas", count: counts.active },
    { key: "paused" as FilterKey, label: "Pausadas", count: counts.paused },
    { key: "cancelled" as FilterKey, label: "Pagadas", count: counts.cancelled },
  ];

  const sortOptions: { key: SortKey; label: string }[] = [
    { key: "name", label: "Nombre" },
    { key: "amount-desc", label: "Más caro" },
    { key: "amount-asc", label: "Más barato" },
    { key: "next-payment", label: "Próximo pago" },
    { key: "newest", label: "Último agregado" },
  ];

  return (
    <div className="subs-page">
      <div className="subs-container">
        <SubscriptionHeader onAdd={handleCreate} />

        {/* KPIs */}
        <div className="subs-kpis-container"><div className="dashboard-kpis">
          <KpiCard
            title="Activas"
            value={counts.active}
            icon={<CreditCard size={16} />}
            color="budget"
          />
          <KpiCard
            title="Pausadas"
            value={counts.paused}
            icon={<PauseCircle size={16} />}
            color="warning"
          />
          <KpiCard
            title="Pagadas"
            value={counts.cancelled}
            icon={<CheckCircle size={16} />}
            color="success"
          />
          <KpiCard
            title="Gasto mensual"
            value={formatCurrency(totalMonthly, "ARS")}
            icon={<Wallet size={16} />}
            color="spent"
          />
          <KpiCard
            title="Próximo pago"
            value={nextPayment ? new Date(nextPayment.next_billing_date).toLocaleDateString("es-ES", { day: "numeric", month: "short" }) : "—"}
            icon={<Calendar size={16} />}
            color="next-payment"
          />
          <KpiCard
            title="Categorías"
            value={categoryCount}
            icon={<Layers size={16} />}
            color="subscriptions"
          />
        </div></div>

        <div className="subs-summary-bar">
          <span className="subs-summary-text">
            Gastás <strong>{formatCurrency(totalMonthly, "ARS")}</strong> este mes en suscripciones
          </span>
        </div>

        <div className="subs-filters-wrapper">
        <SubscriptionTabs tabs={tabs} activeFilter={filter} onFilterChange={setFilter} />

        <div className="subs-toolbar">
          <div className="subs-search">
            <Search size={15} className="subs-search-icon" />
            <input type="text" placeholder="Buscar servicio..." value={search} onChange={(e) => setSearch(e.target.value)} className="subs-search-input" />
          </div>
          <div className="subs-sort">
            <span className="subs-sort-label">Ordenar</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortKey)} className="subs-sort-select">
              {sortOptions.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </select>
          </div>
        </div>
        </div>

        <div className="subs-card">
          {loading ? (
            <div className="subs-loading"><div className="loading-spinner" /></div>
          ) : (
            <><SubscriptionTable
              subscriptions={displayList}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onView={handleView}
              onAdd={handleCreate}
              onPay={handlePay}
            />
            {filtered.length > perPage && (
              <div className="subs-pages">
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    className={`subs-page-btn${i === subscriptionPage ? ' active' : ''}`}
                    onClick={() => setSubscriptionPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}</>
          )}
        </div>

        {showModal && (
          <SubscriptionModal subscription={editingSubscription} categories={categories} existingSubscriptions={subscriptions} onSave={handleSubmit} onClose={() => setShowModal(false)} onCategoriesChanged={loadAll} />
        )}

        {viewingSubscription && (
          <ViewSubscriptionModal subscription={viewingSubscription} onClose={() => setViewingSubscription(undefined)} />
        )}

        {payDebt && (
          <PayDebtModal
            debt={payDebt}
            loading={paying}
            onConfirm={handlePayConfirm}
            onClose={() => setPayDebt(null)}
          />
        )}

        {paySubscription && (
          <PayDebtModal
            debt={{
              id: paySubscription.id,
              user_id: paySubscription.user_id,
              subscription_id: paySubscription.id,
              category_id: paySubscription.category_id,
              category_name: paySubscription.category_name,
              name: paySubscription.name,
              amount: paySubscription.arsAmount ?? parseAmount(paySubscription.amount),
              currency: paySubscription.arsAmount ? 'ARS' : paySubscription.currency,
              due_date: paySubscription.next_billing_date || new Date().toISOString().split('T')[0],
              status: 'pending',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }}
            loading={paying}
            onConfirm={handlePayConfirm}
            onClose={() => setPaySubscription(null)}
          />
        )}

        {paymentSuccess && (
          <div className="debt-modal-overlay" onClick={() => setPaymentSuccess(false)}>
            <div className="paydebt-success-modal" onClick={(e) => e.stopPropagation()}>
              <button className="debt-modal-close paydebt-success-close" onClick={() => setPaymentSuccess(false)}>
                <X size={18} />
              </button>
              <div className="paydebt-success-icon">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="paydebt-success-title">Su pago se realizó correctamente</h2>
            </div>
          </div>
        )}

        {deleteError && (
          <div className="view-modal-overlay" onClick={closeError}>
            <div className="view-modal delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="view-modal-header">
                <div className="view-modal-title">
                  <div className="view-modal-icon" style={{ background: "rgba(239, 68, 68, 0.14)", color: "#ef4444" }}><AlertTriangle size={20} /></div>
                  <div className="view-modal-title-text">
                    <h2>No se puede eliminar</h2>
                    <span>{deleteError.includes("deuda") ? "Deuda pendiente" : "Ciclo activo"}</span>
                  </div>
                </div>
                <button className="view-modal-close" onClick={closeError}><X size={18} /></button>
              </div>
              <div className="view-modal-body">
                <p style={{ color: "var(--subs-text-secondary)", fontSize: "0.95rem", margin: "0 0 20px", lineHeight: "1.5" }}>
                  {deleteError}
                </p>
                <div className="delete-modal-actions">
                  <button className="subs-add-button" onClick={closeError}>Cerrar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {confirmDeleteId && (
          <div className="view-modal-overlay" onClick={() => setConfirmDeleteId(null)}>
            <div className="view-modal delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="view-modal-header">
                <div className="view-modal-title">
                  <div className="view-modal-icon" style={{ background: "rgba(239, 68, 68, 0.14)", color: "#ef4444" }}><Trash2 size={20} /></div>
                  <div className="view-modal-title-text">
                    <h2>Eliminar suscripción</h2>
                    <span>Esta acción no se puede deshacer</span>
                  </div>
                </div>
                <button className="view-modal-close" onClick={() => setConfirmDeleteId(null)}><X size={18} /></button>
              </div>
              <div className="view-modal-body">
                <p style={{ color: "var(--subs-text-secondary)", fontSize: "0.95rem", margin: "0 0 20px", lineHeight: "1.5" }}>
                  ¿Estás seguro de eliminar la suscripción?
                </p>
                <div className="delete-modal-actions" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button className="subs-add-button secondary" onClick={() => setConfirmDeleteId(null)}>Cancelar</button>
                  <button className="subs-add-button danger" onClick={handleConfirmDelete}>Eliminar</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showBudgetWarning && (
          <div className="view-modal-overlay" onClick={() => setShowBudgetWarning(false)}>
            <div className="view-modal delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="view-modal-header">
                <div className="view-modal-title">
                  <div className="view-modal-icon" style={{ background: "rgba(234, 179, 8, 0.14)", color: "#eab308" }}><DollarSign size={20} /></div>
                  <div className="view-modal-title-text">
                    <h2>Sin presupuesto mensual</h2>
                    <span>Te recomendamos configurar uno</span>
                  </div>
                </div>
                <button className="view-modal-close" onClick={() => setShowBudgetWarning(false)}><X size={18} /></button>
              </div>
              <div className="view-modal-body">
                <p style={{ color: "var(--subs-text-secondary)", fontSize: "0.95rem", margin: "0 0 20px", lineHeight: "1.5" }}>
                  No tenés un presupuesto mensual configurado. Te recomendamos agregar uno para controlar mejor tus gastos antes de crear una nueva suscripción.
                </p>
                <div className="delete-modal-actions" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button className="subs-add-button secondary" onClick={() => setShowBudgetWarning(false)}>Cancelar</button>
                  <button className="subs-add-button" onClick={handleProceedToCreate}>Crear de todas formas</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionsPage;
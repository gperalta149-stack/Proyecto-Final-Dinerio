import React, { useState, useEffect, useMemo } from "react";
import { useToast } from "../../../shared/hooks/useToast";
import { Search, CreditCard, Calendar, Wallet, Layers, PauseCircle, CheckCircle, AlertTriangle, Trash2, X } from "lucide-react";
import { SubscriptionHeader } from "../components/SubscriptionHeader/SubscriptionHeader";
import { SubscriptionTabs, type FilterKey } from "../components/SubscriptionTabs/SubscriptionTabs";
import { SubscriptionTable } from "../components/SubscriptionTable/SubscriptionTable";
import { SubscriptionModal } from "../components/SubscriptionModal/SubscriptionModal";
import { ViewSubscriptionModal } from "../components/ViewSubscriptionModal/ViewSubscriptionModal";
import { KpiCard } from "../../../shared/components/ui/KpiCard";
import { subscriptionService } from "../service/subscriptionService";
import { categoryService } from "../../categories/service/categoryService";
import { parseAmount, formatCurrency } from "../../../shared/utils/formatters";
import type { Subscription, Category } from "../../../shared/types";
import "../styles/subscriptions.css";

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
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [subscriptionPage, setSubscriptionPage] = useState(0);
  const perPage = 5;

  const loadAll = async () => {
    try {
      setLoading(true);
      const [subsData, catsData] = await Promise.all([
        subscriptionService.getAll("all"),
        categoryService.getAll().catch(() => [] as Category[]),
      ]);
      setSubscriptions(subsData);
      setCategories(catsData);
    } catch (error) {
      console.error("Error loading subscriptions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleCreate = () => { setEditingSubscription(undefined); setShowModal(true); };
  const handleEdit = (sub: Subscription) => { setEditingSubscription(sub); setShowModal(true); };
  const handleView = (sub: Subscription) => { setViewingSubscription(sub); };
  const { showToast } = useToast();

  const handleDelete = async (id: string) => {
    try {
      await subscriptionService.delete(id);
      await loadAll();
    } catch (err: any) {
      const msg = err?.response?.data?.error || "";
      if (msg.includes("deuda") || msg.includes("pagos pendientes")) {
        setDeleteError(msg);
      } else {
        showToast("Error al eliminar la suscripción", "error");
      }
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
    } catch { alert("Error al guardar la suscripción"); }
  };

  const counts = useMemo(() => ({
    all: subscriptions.length,
    active: subscriptions.filter(s => s.status === "active").length,
    paused: subscriptions.filter(s => s.status === "paused").length,
    cancelled: subscriptions.filter(s => s.status === "cancelled").length,
  }), [subscriptions]);

  useEffect(() => { setSubscriptionPage(0); }, [filter, search]);

  const filtered = useMemo(() => {
    let list = [...subscriptions];
    if (filter === "active") list = list.filter(s => s.status === "active");
    else if (filter === "paused") list = list.filter(s => s.status === "paused");
    else if (filter === "cancelled") list = list.filter(s => s.status === "cancelled");
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

  const totalMonthly = useMemo(() => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    return subscriptions
      .filter((sub) => {
        if (sub.status !== "active") return false;

        const billingDate = new Date(sub.next_billing_date);

        return (
          billingDate.getMonth() === currentMonth &&
          billingDate.getFullYear() === currentYear
        );
      })
      .reduce((sum, sub) => sum + (sub.arsAmount || parseAmount(sub.amount)), 0);
  }, [subscriptions]);

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
          <SubscriptionModal subscription={editingSubscription} categories={categories} onSave={handleSubmit} onClose={() => setShowModal(false)} onCategoriesChanged={loadAll} />
        )}

        {viewingSubscription && (
          <ViewSubscriptionModal subscription={viewingSubscription} onClose={() => setViewingSubscription(undefined)} />
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
      </div>
    </div>
  );
};

export default SubscriptionsPage;

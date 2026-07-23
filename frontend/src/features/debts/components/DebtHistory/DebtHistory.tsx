import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency, formatShortDate, parseAmount } from '../../../../shared/utils/formatters';
import type { Debt } from '../../types';
import '../../../../styles/debts/DebtHistory.css';

interface DebtHistoryProps {
  debts: Debt[];
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const DebtHistory: React.FC<DebtHistoryProps> = ({ debts }) => {
  const today = new Date();
  const [search, setSearch] = useState('');
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [showAll, setShowAll] = useState(false);

  const years = useMemo(() => {
    const set = new Set<number>();
    const now = new Date();
    for (let y = now.getFullYear(); y >= 2020; y--) set.add(y);
    debts.forEach(d => {
      if (d.paid_at) set.add(new Date(d.paid_at).getFullYear());
    });
    return Array.from(set).sort((a, b) => b - a);
  }, [debts]);

  const filtered = useMemo(() => {
    let result = debts;

    if (search.trim()) {
      const term = search.toLowerCase().trim();
      result = result.filter(d =>
        d.name.toLowerCase().includes(term) ||
        (d.category_name && d.category_name.toLowerCase().includes(term))
      );
    }

    result = result.filter(d => {
      if (!d.paid_at) return false;
      const date = new Date(d.paid_at);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });

    return result.sort((a, b) => {
      const da = a.paid_at ? new Date(a.paid_at).getTime() : 0;
      const db = b.paid_at ? new Date(b.paid_at).getTime() : 0;
      return db - da;
    });
  }, [debts, search, selectedMonth, selectedYear]);

  const displayed = showAll ? filtered : filtered.slice(0, 10);

  if (debts.length === 0) {
    return (
      <div className="debt-history-empty">
        <CheckCircle2 size={32} />
        <p>No hay historial de pagos</p>
      </div>
    );
  }

  return (
    <div className="debt-history">
      <div className="debt-history-header">
        <h3 className="debt-history-title">Historial de pagos</h3>
        <span className="debt-history-count">{debts.length} pago{debts.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="debt-history-toolbar">
        <div className="debt-history-search">
          <Search size={15} className="debt-history-search-icon" />
          <input
            type="text"
            placeholder="Buscar en historial..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="debt-history-search-input"
          />
        </div>
        <div className="debt-history-filters">
          <div className="date-spinner">
            <button className="date-spinner-btn" onClick={() => {
              if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1); }
              else { setSelectedMonth(selectedMonth - 1); }
            }}><ChevronLeft size={14} /></button>
            <input
              type="text"
              className="date-spinner-input"
              value={MONTHS[selectedMonth]}
              onChange={(e) => {
                const idx = MONTHS.findIndex(m => m.toLowerCase().startsWith(e.target.value.toLowerCase()));
                if (idx >= 0) setSelectedMonth(idx);
                else {
                  const num = parseInt(e.target.value);
                  if (num >= 1 && num <= 12) setSelectedMonth(num - 1);
                }
              }}
            />
            <button className="date-spinner-btn" onClick={() => {
              if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1); }
              else { setSelectedMonth(selectedMonth + 1); }
            }}><ChevronRight size={14} /></button>
          </div>
          <div className="date-spinner">
            <button className="date-spinner-btn" onClick={() => setSelectedYear(selectedYear - 1)}><ChevronLeft size={14} /></button>
            <input
              type="number"
              className="date-spinner-input"
              value={selectedYear}
              onChange={(e) => { const v = parseInt(e.target.value); if (v >= 1900 && v <= 2100) setSelectedYear(v); }}
              min={1900} max={2100}
            />
            <button className="date-spinner-btn" onClick={() => setSelectedYear(selectedYear + 1)}><ChevronRight size={14} /></button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="debt-history-empty">
          <p>No se encontraron pagos con esos filtros</p>
        </div>
      ) : (
        <>
          <div className="debt-history-list">
            {displayed.map((debt, index) => (
              <motion.div
                key={debt.id}
                className="debt-history-item"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03, duration: 0.25 }}
              >
                <div className="debt-history-left">
                  <CheckCircle2 size={16} className="debt-history-icon" />
                  <div>
                    <span className="debt-history-name">{debt.name}</span>
                    {debt.category_name && (
                      <span className="debt-history-category">{debt.category_name}</span>
                    )}
                  </div>
                </div>
                <div className="debt-history-right">
                  <span className="debt-history-amount">
                    {formatCurrency(parseAmount(debt.amount), debt.currency)}
                  </span>
                  <span className="debt-history-date">
                    {debt.paid_at ? `Pagada el ${formatShortDate(debt.paid_at)}` : 'Pagada'}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
          {filtered.length > 10 && (
            <button className="debt-history-toggle" onClick={() => setShowAll(!showAll)}>
              {showAll
                ? `Mostrar menos`
                : `Mostrar las ${filtered.length} pagos`}
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default DebtHistory;

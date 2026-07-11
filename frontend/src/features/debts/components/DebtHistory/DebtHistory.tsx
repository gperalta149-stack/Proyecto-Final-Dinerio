import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, CheckCircle2, Calendar } from 'lucide-react';
import { formatCurrency, formatShortDate, parseAmount } from '../../../../shared/utils/formatters';
import type { Debt } from '../../types';
import './DebtHistory.css';

interface DebtHistoryProps {
  debts: Debt[];
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export const DebtHistory: React.FC<DebtHistoryProps> = ({ debts }) => {
  const [search, setSearch] = useState('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
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

    if (month) {
      const m = parseInt(month, 10);
      result = result.filter(d => {
        if (!d.paid_at) return false;
        return new Date(d.paid_at).getMonth() === m;
      });
    }

    if (year) {
      const y = parseInt(year, 10);
      result = result.filter(d => {
        if (!d.paid_at) return false;
        return new Date(d.paid_at).getFullYear() === y;
      });
    }

    return result.sort((a, b) => {
      const da = a.paid_at ? new Date(a.paid_at).getTime() : 0;
      const db = b.paid_at ? new Date(b.paid_at).getTime() : 0;
      return db - da;
    });
  }, [debts, search, month, year]);

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
          <div className="debt-history-filter-group">
            <Calendar size={14} />
            <select value={month} onChange={e => setMonth(e.target.value)} className="debt-history-select">
              <option value="">Mes</option>
              {MONTHS.map((name, i) => (
                <option key={i} value={i}>{name}</option>
              ))}
            </select>
          </div>
          <div className="debt-history-filter-group">
            <Calendar size={14} />
            <select value={year} onChange={e => setYear(e.target.value)} className="debt-history-select">
              <option value="">Año</option>
              {years.map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
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

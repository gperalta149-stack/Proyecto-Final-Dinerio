// frontend/src/features/profile/components/PrivacySettings/PrivacySettings.tsx
import React, { useState } from 'react';
import { Bell, Globe, Moon, Download, Trash2, Save } from 'lucide-react';
import type { User } from '../../types';
import { userService } from '../../../auth/service/userService';
import { useToast } from '../../../../shared/hooks/useToast';
import './PrivacySettings.css';

interface PrivacySettingsProps {
  user: User;
}

export const PrivacySettings: React.FC<PrivacySettingsProps> = ({ user }) => {
  const [settings, setSettings] = useState({
    currency: user.currency || 'USD',
    language: user.language || 'es',
    notifications_enabled: user.notifications_enabled ?? true,
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await userService.updateSettings(settings);
      showToast('Configuración actualizada exitosamente', 'success');
    } catch (error) {
      showToast('Error al actualizar la configuración', 'error');
    } finally {
      setLoading(false);
    }
  };

  const currencies = [
    { value: 'USD', label: 'Dólar Americano' },
    { value: 'EUR', label: 'Euro' },
    { value: 'ARS', label: 'Peso Argentino' },
    { value: 'MXN', label: 'Peso Mexicano' },
    { value: 'COP', label: 'Peso Colombiano' },
    { value: 'CLP', label: 'Peso Chileno' },
    { value: 'BRL', label: 'Real Brasileño' },
  ];

  const languages = [
    { value: 'es', label: 'Español' },
    { value: 'en', label: 'English' },
    { value: 'pt', label: 'Português' },
  ];

  return (
    <div className="app-card">
      <div className="app-card-header">
        <div>
          <h3 className="app-card-title">Preferencias</h3>
          <p className="app-card-subtitle">Personaliza tu experiencia</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="privacy-settings">
        <div className="form-group">
          <label className="form-label">Moneda</label>
          <select
            value={settings.currency}
            onChange={(e) => setSettings(prev => ({ ...prev, currency: e.target.value }))}
            className="form-select"
            disabled={loading}
          >
            {currencies.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Idioma</label>
          <select
            value={settings.language}
            onChange={(e) => setSettings(prev => ({ ...prev, language: e.target.value }))}
            className="form-select"
            disabled={loading}
          >
            {languages.map(l => (
              <option key={l.value} value={l.value}>{l.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <div className="toggle-wrapper">
            <div>
              <div className="form-label">Notificaciones</div>
              <span className="form-help">Recibe recordatorios de pagos</span>
            </div>
            <button
              type="button"
              className={`toggle ${settings.notifications_enabled ? 'active' : ''}`}
              onClick={() => setSettings(prev => ({ ...prev, notifications_enabled: !prev.notifications_enabled }))}
              disabled={loading}
            >
              <span className="toggle-knob" />
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Gestión de Datos</label>
          <div className="data-actions">
            <button type="button" className="data-action-btn" disabled={loading}>
              <Download size={16} />
              Exportar mis datos
            </button>
            <button type="button" className="data-action-btn danger" disabled={loading}>
              <Trash2 size={16} />
              Eliminar mi cuenta
            </button>
          </div>
        </div>

        <div className="app-card-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Guardando...' : 'Guardar Preferencias'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PrivacySettings;
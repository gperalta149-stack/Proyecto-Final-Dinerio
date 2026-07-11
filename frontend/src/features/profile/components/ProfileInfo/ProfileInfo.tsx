// frontend/src/features/profile/components/ProfileInfo/ProfileInfo.tsx
import React, { useState } from 'react';
import { Calendar, Clock, User as UserIcon, Mail, Award } from 'lucide-react';
import type { User } from '../../types';
import { formatDate } from '../../../../shared/utils/formatters';
import { useToast } from '../../../../shared/hooks/useToast';
import './ProfileInfo.css';

interface ProfileInfoProps {
  user: User;
  onUpdate: (data: Partial<User>) => void;
}

export const ProfileInfo: React.FC<ProfileInfoProps> = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
  });
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      showToast('Nombre y apellido son requeridos', 'error');
      return;
    }

    if (formData.first_name.trim().length < 2 || formData.last_name.trim().length < 2) {
      showToast('Nombre y apellido deben tener al menos 2 caracteres', 'error');
      return;
    }

    setLoading(true);
    try {
      await onUpdate(formData);
      showToast('Información actualizada exitosamente', 'success');
    } catch (error) {
      showToast('Error al actualizar la información', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = () => {
    const first = user.first_name?.[0] || '';
    const last = user.last_name?.[0] || '';
    return `${first}${last}`.toUpperCase();
  };

  return (
    <div className="app-card">
      <div className="app-card-header">
        <div>
          <h3 className="app-card-title">Información Personal</h3>
          <p className="app-card-subtitle">Tu información básica de perfil</p>
        </div>
        <div className="profile-avatar-mini">
          <div className="profile-avatar-mini-circle">
            <span>{getInitials()}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="app-card-content">
        <div className="form-row">
          <div className="form-group">
            <label className="form-label">Nombre</label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData(prev => ({ ...prev, first_name: e.target.value }))}
              className="form-input"
              placeholder="Tu nombre"
              disabled={loading}
              minLength={2}
              maxLength={40}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Apellido</label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData(prev => ({ ...prev, last_name: e.target.value }))}
              className="form-input"
              placeholder="Tu apellido"
              disabled={loading}
              minLength={2}
              maxLength={40}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <div className="profile-email-display">
            <Mail size={16} />
            <span>{user.email || '—'}</span>
            <span className="profile-email-badge">Verificado</span>
          </div>
          <span className="form-help">El email no se puede modificar</span>
        </div>

        <div className="profile-meta">
          <div className="profile-meta-item">
            <Calendar size={14} />
            <span>
              Miembro desde: {user.created_at ? formatDate(user.created_at) : '—'}
            </span>
          </div>
          <div className="profile-meta-item">
            <Clock size={14} />
            <span>
              Última actualización: {user.updated_at ? formatDate(user.updated_at) : 'Hoy'}
            </span>
          </div>
          <div className="profile-meta-item">
            <Award size={14} />
            <span>
              {user.role === 'admin' ? 'Administrador' : 'Usuario'}
            </span>
          </div>
        </div>

        <div className="app-card-actions">
          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading}
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileInfo;
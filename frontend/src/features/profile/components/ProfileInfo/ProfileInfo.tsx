import React, { useState, useRef } from 'react';
import { Calendar, Clock, Mail, Award, Camera } from 'lucide-react';
import type { User } from '../../types';
import { formatDate } from '../../../../shared/utils/formatters';
import '../../../../styles/profile/ProfileInfo.css';

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
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      setMessage({ text: 'Nombre y apellido son requeridos', type: 'error' });
      return;
    }

    if (formData.first_name.trim().length < 2 || formData.last_name.trim().length < 2) {
      setMessage({ text: 'Nombre y apellido deben tener al menos 2 caracteres', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await onUpdate(formData);
      setMessage({ text: 'Información actualizada exitosamente', type: 'success' });
    } catch (error) {
      setMessage({ text: 'Error al actualizar la información', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);

    if (!file.type.startsWith('image/')) {
      setMessage({ text: 'Por favor selecciona una imagen válida', type: 'error' });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ text: 'La imagen debe ser menor a 5MB', type: 'error' });
      return;
    }

    setAvatarLoading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (ev) => {
        const result = ev.target?.result as string;
        await onUpdate({ avatar_url: result });
        setMessage({ text: 'Foto de perfil actualizada', type: 'success' });
        setAvatarLoading(false);
      };
      reader.readAsDataURL(file);
    } catch {
      setMessage({ text: 'Error al actualizar la foto', type: 'error' });
      setAvatarLoading(false);
    }
  };

  return (
    <>
      <div className="profile-header">
        <div className="profile-header-left">
          <h3 className="app-card-title">Datos personales</h3>
          <p className="app-card-subtitle">Administrá tu información de la cuenta</p>
        </div>
        <div className="profile-header-right">
          <button
            className="profile-photo-btn"
            onClick={() => fileInputRef.current?.click()}
            disabled={avatarLoading}
          >
            <Camera size={16} />
            {avatarLoading ? 'Subiendo...' : 'Cambiar foto'}
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handlePhotoSelect}
            accept="image/*"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div className="app-card-content">
        <form onSubmit={handleSubmit}>
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

          {message && (
            <div className={`profile-message profile-message-${message.type}`}>
              {message.text}
            </div>
          )}
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
    </>
  );
};

export default ProfileInfo;
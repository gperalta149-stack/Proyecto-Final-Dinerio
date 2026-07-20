import React, { useState, useRef } from 'react';
import { Calendar, Clock, Mail, Award, Camera, X } from 'lucide-react';
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
  const [avatarPreview, setAvatarPreview] = useState(user.avatar_url || '');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  const validateFile = (file: File): boolean => {
    if (!file.type.startsWith('image/')) {
      showToast('Por favor selecciona una imagen válida', 'error');
      return false;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('La imagen debe ser menor a 5MB', 'error');
      return false;
    }
    return true;
  };

  const handleFile = async (file: File) => {
    if (!validateFile(file)) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setAvatarPreview(result);
      handleAvatarUpdate(result);
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleAvatarUpdate = async (avatarUrl: string) => {
    setAvatarLoading(true);
    try {
      await onUpdate({ avatar_url: avatarUrl });
      showToast('Foto de perfil actualizada', 'success');
    } catch (error) {
      showToast('Error al actualizar la foto', 'error');
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setAvatarLoading(true);
    try {
      await onUpdate({ avatar_url: '' });
      setAvatarPreview('');
      showToast('Foto de perfil eliminada', 'success');
    } catch (error) {
      showToast('Error al eliminar la foto', 'error');
    } finally {
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
          <div className="profile-avatar-main">
            <div className="avatar-container">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" className="avatar-image" />
              ) : (
                <div className="avatar-placeholder">
                  <span className="avatar-initials">{getInitials()}</span>
                </div>
              )}
              {avatarLoading && (
                <div className="avatar-loading">
                  <div className="loading-spinner-small" />
                </div>
              )}
            </div>
            <div className="avatar-actions">
              <button
                className="btn btn-primary"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarLoading}
              >
                <Camera size={16} />
                Subir foto
              </button>
              {avatarPreview && (
                <button
                  className="btn btn-danger"
                  onClick={handleRemoveAvatar}
                  disabled={avatarLoading}
                >
                  <X size={16} />
                  Eliminar
                </button>
              )}
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="avatar-input"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            />
          </div>
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
// frontend/src/features/profile/components/AvatarUpload/AvatarUpload.tsx
import React, { useState, useRef } from 'react';
import { Camera, X, Upload, Image as ImageIcon } from 'lucide-react';
import type { User } from '../../types';
import { useToast } from '../../../../shared/hooks/useToast';
import './AvatarUpload.css';

interface AvatarUploadProps {
  user: User;
  onUpdate: (userData: Partial<User>) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({ user, onUpdate }) => {
  const [previewUrl, setPreviewUrl] = useState(user.avatar_url || '');
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { showToast } = useToast();

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
      setPreviewUrl(result);
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
    setLoading(true);
    try {
      await onUpdate({ avatar_url: avatarUrl });
      showToast('Foto de perfil actualizada', 'success');
    } catch (error) {
      showToast('Error al actualizar la foto', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    setLoading(true);
    try {
      await onUpdate({ avatar_url: '' });
      setPreviewUrl('');
      showToast('Foto de perfil eliminada', 'success');
    } catch (error) {
      showToast('Error al eliminar la foto', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-card">
      <div className="app-card-header">
        <div>
          <h3 className="app-card-title">Foto de Perfil</h3>
          <p className="app-card-subtitle">Actualiza tu imagen de perfil</p>
        </div>
      </div>

      <div className="avatar-upload">
        <div className="avatar-container">
          {previewUrl ? (
            <img src={previewUrl} alt="Avatar" className="avatar-image" />
          ) : (
            <div className="avatar-placeholder">
              <span className="avatar-initials">{getInitials()}</span>
            </div>
          )}
          {loading && (
            <div className="avatar-loading">
              <div className="loading-spinner-small" />
            </div>
          )}
        </div>

        <div
          className={`avatar-dropzone ${isDragging ? 'dragging' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={24} />
          <span>Arrastrá una imagen aquí o seleccioná un archivo</span>
          <span className="avatar-dropzone-hint">JPG, PNG, WEBP · Máximo 5MB</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            accept="image/*"
            className="avatar-input"
          />
        </div>

        <div className="avatar-actions">
          <button
            className="btn btn-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
          >
            <Camera size={16} />
            Subir Foto
          </button>
          {previewUrl && (
            <button
              className="btn btn-danger"
              onClick={handleRemoveAvatar}
              disabled={loading}
            >
              <X size={16} />
              Eliminar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvatarUpload;
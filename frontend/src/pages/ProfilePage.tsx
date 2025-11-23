import React, { useState, useEffect } from 'react';
import { userService } from '../services/userService';
import type { User } from '../types';

const UserIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
)

const EditIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
)

const SaveIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const CancelIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
)

const SecurityIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
)

const KeyIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
)

const InfoIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ActivityIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
)

const SupportIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
)

const ErrorIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const SuccessIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const userData = await userService.getProfile();
      setUser(userData);
      setFormData({
        first_name: userData.first_name,
        last_name: userData.last_name,
        email: userData.email
      });
    } catch (error) {
      setError('Error al cargar el perfil');
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setError('');
    setMessage('');
  };

  const handleCancel = () => {
    setEditing(false);
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email
      });
    }
    setError('');
    setMessage('');
  };

  const handleSave = async () => {
    try {
      setError('');
      setMessage('');
      
      await userService.updateProfile(formData);
      await loadUserProfile();
      setEditing(false);
      setMessage('Perfil actualizado correctamente');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al actualizar el perfil');
    }
  };

  const handlePasswordChange = async () => {
    try {
      setError('');
      
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return;
      }
      
      if (passwordData.newPassword.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres');
        return;
      }
      
      await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setShowPasswordForm(false);
      setMessage('Contraseña actualizada correctamente');
    } catch (error: any) {
      setError(error.response?.data?.error || 'Error al cambiar la contraseña');
    }
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="subtrack-page">
        <div className="subtrack-container">
          <div className="subtrack-loading">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="subtrack-page">
        <div className="subtrack-container">
          <div className="subtrack-card text-center">
            <div className="empty-state">
              <ErrorIcon />
              <h3 className="empty-state-title">Error al cargar el perfil</h3>
              <button onClick={loadUserProfile} className="subtrack-btn subtrack-btn-primary mt-4">
                Reintentar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="subtrack-page">
      <div className="subtrack-container">
        <div className="page-header">
          <div>
            <h1 className="page-title">Configuración de Perfil</h1>
            <p className="page-subtitle">Administra tu información personal y preferencias de cuenta</p>
          </div>
          <div className="page-actions">
            {!editing && (
              <button
                onClick={handleEdit}
                className="subtrack-btn subtrack-btn-primary"
              >
                <EditIcon />
                Editar Perfil
              </button>
            )}
          </div>
        </div>

        {/* Mensajes de estado */}
        {message && (
          <div className="subtrack-card bg-green-500/10 border-green-500/20 text-green-400 mb-6">
            <div className="flex items-center gap-3">
              <SuccessIcon />
              <span className="font-medium">{message}</span>
            </div>
          </div>
        )}
        
        {error && (
          <div className="subtrack-card bg-red-500/10 border-red-500/20 text-red-400 mb-6">
            <div className="flex items-center gap-3">
              <ErrorIcon />
              <span className="font-medium">{error}</span>
            </div>
          </div>
        )}

        <div className="subtrack-grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Información Personal */}
          <div className="lg:col-span-2">
            <div className="subtrack-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                  <UserIcon />
                  Información Personal
                </h2>
                {!editing && (
                  <button
                    onClick={handleEdit}
                    className="subtrack-btn subtrack-btn-secondary"
                  >
                    <EditIcon />
                    Editar
                  </button>
                )}
              </div>

              {editing ? (
                <div className="space-y-6">
                  <div className="subtrack-grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="subtrack-form-group">
                      <label htmlFor="first_name" className="subtrack-form-label">
                        Nombre
                      </label>
                      <input
                        type="text"
                        id="first_name"
                        value={formData.first_name}
                        onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        className="subtrack-form-input"
                        placeholder="Ingresa tu nombre"
                      />
                    </div>
                    
                    <div className="subtrack-form-group">
                      <label htmlFor="last_name" className="subtrack-form-label">
                        Apellido
                      </label>
                      <input
                        type="text"
                        id="last_name"
                        value={formData.last_name}
                        onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                        className="subtrack-form-input"
                        placeholder="Ingresa tu apellido"
                      />
                    </div>
                  </div>
                  
                  <div className="subtrack-form-group">
                    <label htmlFor="email" className="subtrack-form-label">
                      Correo Electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="subtrack-form-input"
                      placeholder="tu@email.com"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handleSave}
                      className="subtrack-btn subtrack-btn-primary"
                    >
                      <SaveIcon />
                      Guardar Cambios
                    </button>
                    <button
                      onClick={handleCancel}
                      className="subtrack-btn subtrack-btn-secondary"
                    >
                      <CancelIcon />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="subtrack-grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <label className="text-gray-400 text-sm mb-2 block">Nombre Completo</label>
                    <p className="text-white font-medium text-lg">{user.first_name} {user.last_name}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <label className="text-gray-400 text-sm mb-2 block">Correo Electrónico</label>
                    <p className="text-white font-medium text-lg">{user.email}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-700/30 rounded-lg">
                    <label className="text-gray-400 text-sm mb-2 block">Miembro desde</label>
                    <p className="text-white font-medium">{formatJoinDate(user.created_at)}</p>
                  </div>
                  
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <label className="text-gray-400 text-sm mb-2 block">Estado de la Cuenta</label>
                    <p className="text-green-400 font-medium flex items-center gap-2">
                      <SuccessIcon />
                      Verificada
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Seguridad */}
            <div className="subtrack-card mt-6">
              <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <SecurityIcon />
                Seguridad
              </h2>
              
              {showPasswordForm ? (
                <div className="space-y-6">
                  <div className="subtrack-grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="subtrack-form-group">
                      <label htmlFor="currentPassword" className="subtrack-form-label">
                        Contraseña Actual
                      </label>
                      <input
                        type="password"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                        className="subtrack-form-input"
                        placeholder="Ingresa tu contraseña actual"
                      />
                    </div>
                    
                    <div className="subtrack-form-group">
                      <label htmlFor="newPassword" className="subtrack-form-label">
                        Nueva Contraseña
                      </label>
                      <input
                        type="password"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                        className="subtrack-form-input"
                        placeholder="Mínimo 6 caracteres"
                      />
                    </div>
                  </div>
                  
                  <div className="subtrack-form-group">
                    <label htmlFor="confirmPassword" className="subtrack-form-label">
                      Confirmar Contraseña
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="subtrack-form-input"
                      placeholder="Repite la nueva contraseña"
                    />
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handlePasswordChange}
                      className="subtrack-btn subtrack-btn-primary"
                    >
                      <KeyIcon />
                      Actualizar Contraseña
                    </button>
                    <button
                      onClick={() => setShowPasswordForm(false)}
                      className="subtrack-btn subtrack-btn-secondary"
                    >
                      <CancelIcon />
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                  <div className="flex items-center gap-4">
                    <SecurityIcon />
                    <div>
                      <h3 className="text-white font-medium">Protege tu cuenta</h3>
                      <p className="text-gray-400">Actualiza regularmente tu contraseña para mantener la seguridad.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPasswordForm(true)}
                    className="subtrack-btn subtrack-btn-primary"
                  >
                    <KeyIcon />
                    Cambiar Contraseña
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Información de la Cuenta */}
            <div className="subtrack-card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <InfoIcon />
                Información de la Cuenta
              </h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <label className="text-gray-400 text-sm mb-2 block">ID de Usuario</label>
                  <p className="text-white font-mono text-sm break-all">{user.id}</p>
                </div>
                
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <label className="text-gray-400 text-sm mb-2 block">Última actualización</label>
                  <p className="text-white font-medium">{formatJoinDate(user.updated_at)}</p>
                </div>
              </div>
            </div>

            {/* Estadísticas Rápidas */}
            <div className="subtrack-card">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <ActivityIcon />
                Tu Actividad
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Miembro desde</span>
                  <span className="text-white font-medium">
                    {new Date().getFullYear() - new Date(user.created_at).getFullYear()} años
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-700/30 rounded-lg">
                  <span className="text-gray-300">Última actualización</span>
                  <span className="text-white font-medium">
                    {Math.floor((new Date().getTime() - new Date(user.updated_at).getTime()) / (1000 * 60 * 60 * 24))} días
                  </span>
                </div>
              </div>
            </div>

            {/* Soporte */}
            <div className="subtrack-card bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <SupportIcon />
                Soporte
              </h3>
              <div className="space-y-3">
                <p className="text-gray-300 text-sm">
                  ¿Necesitas ayuda con tu cuenta? Contáctanos para soporte técnico.
                </p>
                <button className="w-full subtrack-btn subtrack-btn-secondary text-sm">
                  <SupportIcon />
                  Contactar Soporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
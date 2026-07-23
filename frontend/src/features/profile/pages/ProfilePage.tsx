// frontend/src/features/profile/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { User, Lock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../shared/contexts/AuthContext';
import { userService } from '../../auth/service/userService';
import { ProfileInfo } from '../components/ProfileInfo/ProfileInfo';
import { ChangePassword } from '../components/ChangePassword/ChangePassword';
import type { User as UserType } from '../types';
import '../../../styles/profile/ProfilePage.css';


export const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { updateUser } = useAuth();
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'info' | 'password'>('info');

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const data = await userService.getProfile();
      setUser(data);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: Partial<UserType>) => {
    await userService.updateProfile(data);
    updateUser?.(data);
    await loadUserData();
  };

  const handleClose = () => {
    navigate(-1);
  };

  if (loading || !user) {
    return (
      <div className="profile-modal-overlay" onClick={handleClose}>
        <div className="profile-modal" onClick={e => e.stopPropagation()}>
          <button className="profile-modal-close" onClick={handleClose} aria-label="Cerrar" type="button">
            <X size={18} />
          </button>
          <div className="profile-loading">
            <div className="loading-spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-modal-overlay" onClick={handleClose}>
      <div className="profile-modal" onClick={e => e.stopPropagation()}>
        <button className="profile-modal-close" onClick={handleClose} aria-label="Cerrar" type="button">
          <X size={18} />
        </button>
        <div className="profile-tabs">
          <button
            className={`profile-tab ${tab === 'info' ? 'active' : ''}`}
            onClick={() => setTab('info')}
          >
            <User size={16} />
            Datos personales
          </button>
          <button
            className={`profile-tab ${tab === 'password' ? 'active' : ''}`}
            onClick={() => setTab('password')}
          >
            <Lock size={16} />
            Contraseña
          </button>
        </div>

        {tab === 'info' ? (
          <ProfileInfo user={user} onUpdate={handleUpdate} />
        ) : (
          <ChangePassword />
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
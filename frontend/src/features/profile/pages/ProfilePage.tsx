// frontend/src/features/profile/pages/ProfilePage.tsx
import React, { useState, useEffect } from 'react';
import { CreditCard, Shield, Bell, Database } from 'lucide-react';
import { userService } from '../../auth/service/userService';
import { ProfileInfo } from '../components/ProfileInfo/ProfileInfo';
import { AvatarUpload } from '../components/AvatarUpload/AvatarUpload';
import { PrivacySettings } from '../components/PrivacySettings/PrivacySettings';
import { ChangePassword } from '../components/ChangePassword/ChangePassword';
import { BudgetSettings } from '../components/BudgetSettings/BudgetSettings';
import type { User } from '../types';
import '../styles/ProfilePage.css';


export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleUpdate = async (data: Partial<User>) => {
    await userService.updateProfile(data);
    await loadUserData();
  };

  const handleBudgetUpdate = async (monthlyBudget: number) => {
    await userService.updateBudget(monthlyBudget);
    await loadUserData();
  };

  if (loading || !user) {
    return (
      <div className="profile-page">
        <div className="profile-container">
          <div className="profile-loading">
            <div className="loading-spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <div>
            <h1 className="profile-title">Perfil</h1>
            <p className="profile-subtitle">Gestiona tu información personal y configuración</p>
          </div>
        </div>

        <div className="profile-grid">
          <div className="profile-grid-main">
            <ProfileInfo user={user} onUpdate={handleUpdate} />
            <AvatarUpload user={user} onUpdate={handleUpdate} />
            <BudgetSettings user={user} onUpdate={handleBudgetUpdate} />
            <ChangePassword />
          </div>

          <div className="profile-grid-sidebar">
            <PrivacySettings user={user} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
// frontend/src/features/notifications/components/NotificationEmptyState/NotificationEmptyState.tsx
import React from 'react';
import { Bell } from 'lucide-react';
import './NotificationEmptyState.css';

export const NotificationEmptyState: React.FC = () => {
  return (
    <div className="notif-empty-state">
      <div className="notif-empty-icon">
        <Bell size={48} />
      </div>
      <h3 className="notif-empty-title"><Bell size={48} /> Todo está al día</h3>
      <p className="notif-empty-description">
        No tenés notificaciones nuevas. Las alertas del sistema aparecerán aquí.
      </p>
    </div>
  );
};

export default NotificationEmptyState;
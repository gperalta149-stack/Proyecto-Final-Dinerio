// frontend/src/features/notifications/components/NotificationCard/NotificationCard.tsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MoreVertical, Check, Trash2, ExternalLink } from 'lucide-react';
import { getRelativeTime } from '../../utils/notificationUtils';
import { NOTIFICATION_ICONS, NOTIFICATION_COLORS, NOTIFICATION_PRIORITY_LABELS } from '../../constants/notificationConstants';
import type { Notification } from '../../types';
import type { NotificationType, NotificationPriority } from '../../types';
import './NotificationCard.css';

interface NotificationCardProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  onAction?: (url: string) => void;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  onAction,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const type = notification.type as NotificationType;
  const Icon = NOTIFICATION_ICONS[type] || NOTIFICATION_ICONS.system;
  const color = NOTIFICATION_COLORS[type] || '#6b7280';
  const priority = notification.priority ? NOTIFICATION_PRIORITY_LABELS[notification.priority as NotificationPriority] : undefined;

  const handleAction = () => {
    if (notification.action_url && onAction) {
      onAction(notification.action_url);
    }
  };

  return (
    <motion.div
      className={`notification-card ${!notification.is_read ? 'unread' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3 }}
      layout
    >
      <div className="notification-card-content">
        <div className="notification-card-icon" style={{ backgroundColor: color + '20' }}>
          <Icon size={20} style={{ color }} />
        </div>

        <div className="notification-card-info">
            <div className="notification-card-header">
              <div className="notification-card-title-wrapper">
                <h4 className="notification-card-title">{notification.title}</h4>
                {!notification.is_read && (
                  <span className="notification-card-unread-dot" />
                )}
                {priority && (
                  <span className={`notification-card-priority ${notification.priority}`}>
                    {priority.label}
                  </span>
                )}
              </div>
              <div className="notification-card-actions">
                <span className="notification-card-time">
                  {getRelativeTime(notification.created_at)}
                </span>
                {!notification.is_read && (
                  <button
                    className="notification-card-mark-read"
                    onClick={() => onMarkAsRead(notification.id)}
                    title="Marcar como leída"
                  >
                    <Check size={14} />
                  </button>
                )}
                <button
                  className="notification-card-menu-btn"
                  onClick={() => setShowMenu(!showMenu)}
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>

          <p className="notification-card-message">{notification.message}</p>

          <div className="notification-card-footer">
            <span className="notification-card-type">
              {notification.type.replace('_', ' ')}
            </span>
            {notification.action_url && (
              <button
                className="notification-card-action"
                onClick={handleAction}
              >
                <ExternalLink size={14} />
                Ver detalle
              </button>
            )}
          </div>
        </div>

        <AnimatePresence>
          {showMenu && (
            <motion.div
              className="notification-card-menu"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              {!notification.is_read && (
                <button onClick={() => onMarkAsRead(notification.id)}>
                  <Check size={14} />
                  Marcar leída
                </button>
              )}
              <button onClick={() => onDelete(notification.id)} className="danger">
                <Trash2 size={14} />
                Eliminar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default NotificationCard;
// frontend/src/features/notifications/components/NotificationBell/NotificationBell.tsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Check, ExternalLink, X } from 'lucide-react';
import { notificationService } from '../../service/notificationService';
import { getRelativeTime } from '../../utils/notificationUtils';
import { NOTIFICATION_ICONS, NOTIFICATION_COLORS } from '../../constants/notificationConstants';
import type { Notification } from '../../types';
import type { NotificationType } from '../../types';
import '../../../../styles/notifications/NotificationBell.css';

export const NotificationBell: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000); // Actualizar cada 30s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadData = async () => {
    try {
      const [notifs, count] = await Promise.all([
        notificationService.getRecentNotifications(5),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(notifs);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(prev - 1, 0));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleAction = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = url;
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      loadData(); // Recargar al abrir
    }
  };

  return (
    <div className="notif-bell-wrapper" ref={dropdownRef}>
      <button
        className="notif-bell-btn"
        onClick={handleToggle}
        aria-label="Notificaciones"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="notif-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="notif-bell-dropdown"
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <div className="notif-bell-header">
              <span className="notif-bell-title">Notificaciones</span>
              {unreadCount > 0 && (
                <span className="notif-bell-unread">{unreadCount} no leídas</span>
              )}
            </div>

            <div className="notif-bell-list">
              {loading ? (
                <div className="notif-bell-loading">
                  <div className="loading-spinner-small" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="notif-bell-empty">
                  <Bell size={32} />
                  <p>Todo está al día</p>
                </div>
              ) : (
                  notifications.map((notification) => {
                  const Icon = NOTIFICATION_ICONS[notification.type as NotificationType] || NOTIFICATION_ICONS.system;
                  const color = NOTIFICATION_COLORS[notification.type as NotificationType] || '#6b7280';
                  const isUnread = !notification.is_read;
                  
                  return (
                    <div
                      key={notification.id}
                      className={`notif-bell-item ${isUnread ? 'unread' : ''}`}
                    >
                      <div className="notif-bell-item-icon" style={{ background: `${color}18`, color }}>
                        <Icon size={16} />
                      </div>
                      <div className="notif-bell-item-content">
                        <div className="notif-bell-item-header">
                          <span className="notif-bell-item-title">{notification.title}</span>
                          <span className="notif-bell-item-time">
                            {getRelativeTime(notification.created_at)}
                          </span>
                        </div>
                        <p className="notif-bell-item-message">{notification.message}</p>
                        <div className="notif-bell-item-actions">
                          {notification.action_url && notification.action_label && (
                            <button
                              className="notif-bell-item-action"
                              onClick={(e) => handleAction(notification.action_url!, e)}
                            >
                              <ExternalLink size={12} />
                              {notification.action_label}
                            </button>
                          )}
                          {isUnread && (
                            <button
                              className="notif-bell-item-read"
                              onClick={(e) => handleMarkAsRead(notification.id, e)}
                            >
                              <Check size={12} />
                              Marcar leída
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="notif-bell-footer">
              {unreadCount > 0 && (
                <button onClick={handleMarkAllAsRead} className="notif-bell-view-all">
                  Marcar como leídas
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;
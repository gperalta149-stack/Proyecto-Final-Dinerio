// frontend/src/features/notifications/pages/NotificationsPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, RefreshCw, Bell } from 'lucide-react';
import { notificationService } from '../service/notificationService';
import { NotificationCard } from '../components/NotificationCard/NotificationCard';
import { NotificationFilters } from '../components/NotificationFilters/NotificationFilters';
import { NotificationEmptyState } from '../components/NotificationEmptyState/NotificationEmptyState';
import { groupNotificationsByDate } from '../utils/notificationUtils';
import type { Notification, NotificationType } from '../types';
import '../styles/notifications.css';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<NotificationType | undefined>();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await notificationService.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
  };

  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    if (activeFilter === 'unread') {
      filtered = filtered.filter(n => !n.is_read);
    } else if (activeFilter === 'read') {
      filtered = filtered.filter(n => n.is_read);
    }

    if (selectedType) {
      filtered = filtered.filter(n => n.type === selectedType);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(n =>
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [notifications, activeFilter, selectedType, searchTerm]);

  const groupedNotifications = useMemo(() => {
    return groupNotificationsByDate(filteredNotifications);
  }, [filteredNotifications]);

  const counts = useMemo(() => ({
    all: notifications.length,
    unread: notifications.filter(n => !n.is_read).length,
    read: notifications.filter(n => n.is_read).length,
  }), [notifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n =>
        n.id === id ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const handleAction = (url: string) => {
    window.location.href = url;
  };

  if (loading) {
    return (
      <div className="notif-page">
        <div className="notif-container">
          <div className="notif-loading">
            <div className="loading-spinner" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="notif-page">
      <div className="notif-container">
        <div className="notif-header">
          <div className="notif-header-left">
            <div>
              <h1 className="notif-title">Notificaciones</h1>
              <p className="notif-subtitle">
                Historial completo de todas tus notificaciones y alertas
              </p>
            </div>
            {counts.unread > 0 && (
              <button
                className="notif-mark-all-btn"
                onClick={handleMarkAllAsRead}
              >
                <CheckCircle2 size={16} />
                Marcar como leídos a todos
              </button>
            )}
          </div>
          <div className="notif-actions">
            <button
              className="notif-refresh-btn"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw size={16} className={isRefreshing ? 'spinning' : ''} />
            </button>
          </div>
        </div>

        <NotificationFilters
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          counts={counts}
        />

        {filteredNotifications.length === 0 ? (
          <NotificationEmptyState />
        ) : (
          <div className="notif-list">
            <AnimatePresence>
              {groupedNotifications.map((group, index) => (
                <div key={index} className="notif-group">
                  <div className="notif-group-date">{group.date}</div>
                  {group.notifications.map((notification) => (
                    <NotificationCard
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      onAction={handleAction}
                    />
                  ))}
                </div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
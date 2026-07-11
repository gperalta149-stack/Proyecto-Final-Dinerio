// frontend/src/features/notifications/service/notificationService.ts
import api from "../../../shared/services/api";
import type { Notification, NotificationStats } from "../types";

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get("/notifications");
    return response.data.notifications || [];
  },

  async getRecentNotifications(limit: number = 5): Promise<Notification[]> {
    const response = await api.get("/notifications/recent", { params: { limit } });
    return response.data.notifications || [];
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get("/notifications/unread/count");
    return response.data.count || 0;
  },

  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await api.put("/notifications/read-all");
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`);
  },

  async getStats(): Promise<NotificationStats> {
    const response = await api.get("/notifications/stats");
    return response.data;
  },
};
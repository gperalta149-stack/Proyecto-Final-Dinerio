import api from "./api"
import type { Notification } from "../types"

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get("/notifications")
    return response.data.notifications
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get("/notifications/unread/count")
    return response.data.count
  },

  async markAsRead(id: string): Promise<void> {
    await api.put(`/notifications/${id}/read`)
  },

  async markAllAsRead(): Promise<void> {
    await api.put("/notifications/read-all")
  },

  async deleteNotification(id: string): Promise<void> {
    await api.delete(`/notifications/${id}`)
  },
}
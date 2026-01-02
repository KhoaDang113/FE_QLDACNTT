import api from "../axiosConfig";

export interface NotificationData {
  _id: string;
  user_id: string;
  actor_id:
  | string
  | {
    _id: string;
    name: string;
    avatar?: string;
  };
  type: "comment_reply" | "order_update" | "product_review" | "system";
  title: string;
  message: string;
  link?: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  is_hidden: boolean;
  is_deleted: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  notifications: NotificationData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface QueryNotificationParams {
  page?: number;
  limit?: number;
  type?: "comment_reply" | "order_update" | "product_review" | "system";
  is_read?: boolean;
  unread_only?: boolean;
}

class NotificationService {
  private readonly basePath = "/notifications";

  /**
   * Lấy danh sách thông báo của user hiện tại
   */
  async getMyNotifications(
    params?: QueryNotificationParams
  ): Promise<NotificationsResponse> {
    try {
      const response = await api.get<NotificationsResponse>(this.basePath, {
        params,
      });
      return response.data;
    } catch (error) {
      console.error(
        "[NotificationService] Error fetching notifications:",
        error
      );
      throw error;
    }
  }

  /**
   * Lấy số lượng thông báo chưa đọc
   */
  async getUnreadCount(): Promise<number> {
    try {
      const response = await api.get<UnreadCountResponse>(
        `${this.basePath}/unread-count`
      );
      return response.data.unreadCount;
    } catch (error) {
      console.error(
        "[NotificationService] Error fetching unread count:",
        error
      );
      return 0;
    }
  }

  async getUnreadCountForStaff(): Promise<number> {
    try {
      const response = await api.get<UnreadCountResponse>(
        `${this.basePath}/staff/unread-count`
      );
      return response.data.unreadCount;
    } catch (error) {
      console.error(
        "[NotificationService] Error fetching unread count for staff:",
        error
      );
      return 0;
    }
  }

  /**
   * Lấy chi tiết một thông báo
   */
  async getNotificationById(id: string): Promise<NotificationData> {
    try {
      const response = await api.get<NotificationData>(
        `${this.basePath}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `[NotificationService] Error fetching notification ${id}:`,
        error
      );
      throw error;
    }
  }

  async getNotificationForStaff(): Promise<NotificationsResponse> {
    try {
      const response = await api.get<NotificationsResponse>(
        `${this.basePath}/staff`
      );
      return response.data;
    } catch (error) {
      console.error(
        `[NotificationService] Error fetching notification for staff:`,
        error
      );
      throw error;
    }
  }

  /**
   * Đánh dấu một thông báo là đã đọc
   */
  async markAsRead(id: string): Promise<NotificationData> {
    try {
      const response = await api.patch<NotificationData>(
        `${this.basePath}/${id}/read`
      );
      return response.data;
    } catch (error) {
      console.error(
        `[NotificationService] Error marking notification ${id} as read:`,
        error
      );
      throw error;
    }
  }

  async markAsReadForStaff(id: string): Promise<NotificationData> {
    try {
      const response = await api.patch<NotificationData>(
        `${this.basePath}/staff/${id}/read`
      );
      return response.data;
    } catch (error) {
      console.error(
        `[NotificationService] Error marking notification ${id} as read for staff:`,
        error
      );
      throw error;
    }
  }
  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  async markAllAsRead(): Promise<{ message: string; modifiedCount: number }> {
    try {
      const response = await api.patch<{
        message: string;
        modifiedCount: number;
      }>(`${this.basePath}/read-all`);
      return response.data;
    } catch (error) {
      console.error("[NotificationService] Error marking all as read:", error);
      throw error;
    }
  }

  /**
   * Ẩn thông báo
   */
  async hideNotification(id: string): Promise<NotificationData> {
    try {
      const response = await api.patch<NotificationData>(
        `${this.basePath}/${id}/hide`
      );
      return response.data;
    } catch (error) {
      console.error(
        `[NotificationService] Error hiding notification ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Xóa một thông báo
   */
  async deleteNotification(id: string): Promise<{ message: string }> {
    try {
      const response = await api.delete<{ message: string }>(
        `${this.basePath}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `[NotificationService] Error deleting notification ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Xóa tất cả thông báo
   */
  async deleteAllNotifications(): Promise<{
    message: string;
    deletedCount: number;
  }> {
    try {
      const response = await api.delete<{
        message: string;
        deletedCount: number;
      }>(this.basePath);
      return response.data;
    } catch (error) {
      console.error(
        "[NotificationService] Error deleting all notifications:",
        error
      );
      throw error;
    }
  }
}

export default new NotificationService();

// deleteNotification: async (id: string): Promise<{ message: string }> => {
//     const response = await api.delete<{ message: string }>(
//       `${this.basePath}/${id}`
//     );
//     return response.data;
//   },

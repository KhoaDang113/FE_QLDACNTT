"use client";

import { createContext, useState, useCallback, useEffect, type ReactNode } from "react";

export type NotificationType = "success" | "error" | "warning" | "info";
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  onClose?: () => void;
}

interface NotificationContextType {
  notifications: Notification[];
  notificationHistory: Notification[]; // Lịch sử thông báo (không tự động xóa)
  showNotification: (notification: Omit<Notification, "id">) => void;
  removeNotification: (id: string) => void;
  clearAllNotifications: () => void;
  clearHistory: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationHistory, setNotificationHistory] = useState<
    Notification[]
  >(() => {
    // Load từ localStorage khi khởi tạo
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("notificationHistory");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(
        "notificationHistory",
        JSON.stringify(notificationHistory)
      );
    }
  }, [notificationHistory]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => {
      const notification = prev.find((n) => n.id === id);
      if (notification?.onClose) {
        notification.onClose();
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  const showNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const id = `notification-${Date.now()}-${Math.random()}`;
      const newNotification: Notification = {
        ...notification,
        id,
        duration: notification.duration ?? 5000,
      };
      setNotifications((prev) => [...prev, newNotification]);
      setNotificationHistory((prev) => {
        const updated = [newNotification, ...prev].slice(0, 50);
        return updated;
      });

      if (newNotification.duration && newNotification.duration > 0) {
        setTimeout(() => {
          removeNotification(id);
        }, newNotification.duration);
      }
    },
    [removeNotification]
  );

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const clearHistory = useCallback(() => {
    setNotificationHistory([]);
    if (typeof window !== "undefined") {
      localStorage.removeItem("notificationHistory");
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        notificationHistory,
        showNotification,
        removeNotification,
        clearAllNotifications,
        clearHistory,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export { NotificationContext };

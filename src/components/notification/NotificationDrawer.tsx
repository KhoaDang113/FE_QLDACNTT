"use client";

import { Bell, Trash2, MessageCircle, Package, X, AlertCircle, Info } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useCallback } from "react";
import notificationService, { type NotificationData } from "@/api/services/notificationService";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";
import { getSocket } from "@/lib/socket";
import { useNotification } from "@/hooks/useNotification";

interface NotificationDrawerProps {
  // Optional filter to select a subset of notifications to display
  readonly filter?: (n: NotificationData) => boolean;
  // Mobile mode for bottom menu styling
  readonly mobile?: boolean;
}

export function NotificationDrawer({ filter, mobile }: NotificationDrawerProps) {
  const { isAuthenticated, user } = useAuthStore();
  const navigate = useNavigate();
  const { showNotification } = useNotification();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // Fetch notifications from backend
  const fetchNotifications = useCallback(
    async (pageNum: number = 1, append: boolean = false) => {
      if (!isAuthenticated) return;

      try {
        setLoading(true);
        const response =
          user?.role === "staff"
            ? await notificationService.getNotificationForStaff()
            : await notificationService.getMyNotifications({
              page: pageNum,
              limit: 20,
            });
        const newNotifications = response?.notifications || [];

        if (append) {
          setNotifications((prev) => [...prev, ...newNotifications]);
        } else {
          setNotifications(newNotifications);
        }

        setUnreadCount(response.unreadCount || 0);
        setHasMore(pageNum < response.totalPages);
        setPage(pageNum);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Fetch unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const count =
        user?.role === "staff"
          ? await notificationService.getUnreadCountForStaff()
          : await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  }, [isAuthenticated]);

  // Initial fetch
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications(1);
      fetchUnreadCount();
    }
  }, [isAuthenticated, fetchNotifications, fetchUnreadCount]);

  // Auto refresh every 30 seconds
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      fetchUnreadCount();
      if (isOpen) {
        fetchNotifications(1);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, isOpen, fetchNotifications, fetchUnreadCount]);

  // Helper function to map notification type to popup type
  const mapNotificationTypeToPopupType = (
    type: string
  ): "success" | "error" | "warning" | "info" => {
    switch (type) {
      case "order_update":
        return "success";
      case "comment_reply":
        return "info";
      case "product_review":
        return "info";
      case "system":
        return "info";
      default:
        return "info";
    }
  };

  // Listen for realtime notifications via socket
  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const socket = getSocket();

      // Listen for new notifications
      const handleNewNotification = (payload: {
        notificationId?: string;
        type?: string;
        title?: string;
        message?: string;
        link?: string;
        actor?: { id: string; name: string; avatar?: string };
      }) => {
        // Show popup notification
        if (payload.title) {
          showNotification({
            type: mapNotificationTypeToPopupType(payload.type || "info"),
            title: payload.title,
            message: payload.message || "",
            duration: 5000,
          });
        }

        // Refresh notifications list
        fetchNotifications(1);
        fetchUnreadCount();
      };

      // Listen for comment reply notifications
      const handleCommentReply = (payload: {
        notificationId?: string;
        type?: string;
        title?: string;
        message?: string;
        link?: string;
        actor?: { id: string; name: string; avatar?: string };
      }) => {
        // Show popup notification
        if (payload.title) {
          showNotification({
            type: "info",
            title: payload.title,
            message: payload.message || "",
            duration: 5000,
          });
        }

        fetchNotifications(1);
        fetchUnreadCount();
      };

      // Listen for unread count updates
      const handleUnreadCountUpdate = (data: { count: number }) => {
        setUnreadCount(data.count);
      };

      const handleNewOrder = (payload: {
        notificationId?: string;
        type?: string;
        title?: string;
        message?: string;
        link?: string;
        actor?: { id: string; name: string; avatar?: string };
        metadata?: { order_id?: string; customer_name?: string };
      }) => {
        // Show popup notification
        // if (payload.title) {
        //   showNotification({
        //     type: "info",
        //     title: payload.title,
        //     message:
        //       payload.message ||
        //       `Đơn hàng ${payload.metadata?.order_id} từ ${payload.actor?.name} - ${payload.actor?.id}`,
        //     duration: 5000,
        //   });
        // }

        fetchNotifications(1);
        fetchUnreadCount();
      };

      socket.on("notification:new", handleNewNotification);
      socket.on("notification:comment-reply", handleCommentReply);
      socket.on("notification:unread-count", handleUnreadCountUpdate);
      socket.on("staff:new-order", handleNewOrder);

      // Cleanup listeners
      return () => {
        socket.off("notification:new", handleNewNotification);
        socket.off("notification:comment-reply", handleCommentReply);
        socket.off("notification:unread-count", handleUnreadCountUpdate);
        socket.off("staff:new-order", handleNewOrder);
      };
    } catch (error) {
      console.error("Failed to setup socket listeners:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  // Apply filter if provided
  const filteredNotifications = filter
    ? notifications.filter(filter)
    : notifications;

  // Handle notification click
  const handleNotificationClick = async (notification: NotificationData) => {
    try {
      // Mark as read if not already
      if (!notification.is_read) {
        if (user?.role === "staff") {
          await notificationService.markAsReadForStaff(notification._id);
        } else {
          await notificationService.markAsRead(notification._id);
        }
        // Update local state
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, is_read: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Navigate to the linked page
      if (notification.link) {
        setIsOpen(false);
        navigate(notification.link);
      }
    } catch (error) {
      console.error("Error handling notification click:", error);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.stopPropagation();
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n._id !== notificationId));
      fetchUnreadCount();
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  // Handle clear all
  const handleClearAll = async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Error clearing all notifications:", error);
    }
  };

  // Get icon based on notification type
  const getIcon = (type: string) => {
    switch (type) {
      case "comment_reply":
        return <MessageCircle className="w-5 h-5 text-blue-600" />;
      case "order_update":
        return <Package className="w-5 h-5 text-green-600" />;
      case "product_review":
        return <AlertCircle className="w-5 h-5 text-purple-600" />;
      case "system":
        return <Info className="w-5 h-5 text-gray-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getStyles = (type: string, isRead: boolean) => {
    const baseStyles = isRead
      ? "bg-white border-gray-200"
      : "bg-gradient-to-r border-l-4";

    switch (type) {
      case "comment_reply":
        return {
          bg: isRead
            ? baseStyles
            : "bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-500",
          iconBg: "bg-blue-100",
          title: "text-blue-900",
          message: "text-blue-700",
        };
      case "order_update":
        return {
          bg: isRead
            ? baseStyles
            : "bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500",
          iconBg: "bg-green-100",
          title: "text-green-900",
          message: "text-green-700",
        };
      case "product_review":
        return {
          bg: isRead
            ? baseStyles
            : "bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500",
          iconBg: "bg-purple-100",
          title: "text-purple-900",
          message: "text-purple-700",
        };
      default:
        return {
          bg: isRead
            ? baseStyles
            : "bg-gradient-to-r from-gray-50 to-slate-50 border-l-4 border-gray-500",
          iconBg: "bg-gray-100",
          title: "text-gray-900",
          message: "text-gray-700",
        };
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    if (days > 0) return `${days} ngày trước`;
    if (hours > 0) return `${hours} giờ trước`;
    if (minutes > 0) return `${minutes} phút trước`;
    return "Vừa xong";
  };

  const getActorName = (actor: NotificationData["actor_id"]) => {
    if (typeof actor === "string") return "Hệ thống";
    return actor?.name || "Người dùng";
  };

  const getActorAvatar = (actor: NotificationData["actor_id"]) => {
    if (typeof actor === "string") return DEFAULT_AVATAR_URL;
    return actor?.avatar || DEFAULT_AVATAR_URL;
  };

  // Only show bell if authenticated
  if (!isAuthenticated) return null;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        {mobile ? (
          <button className="flex flex-col items-center justify-center w-full h-full text-gray-700 hover:text-[#007E42] hover:bg-gray-50 transition-colors relative">
            <Bell className="w-5 h-5 mb-1" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-2 flex items-center justify-center rounded-full bg-red-500 w-4 h-4 text-white text-xs font-bold">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
            <span className="text-xs">Thông báo</span>
          </button>
        ) : (
          <Button
            variant="ghost"
            size="icon"
            className="relative rounded-full bg-[#008236] hover:bg-green-700 text-white transition-all duration-200 hover:scale-105"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center shadow-lg animate-pulse px-1">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </Button>
        )}
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b bg-gradient-to-r from-gray-50 to-gray-100">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 rounded-lg p-2">
                <Bell className="w-5 h-5 text-blue-600" />
              </div>
              <SheetTitle className="text-xl font-bold text-gray-900">
                Thông báo
              </SheetTitle>
            </div>
            {filteredNotifications.length > 0 && (
              <div className="flex items-center justify-between mt-2">
                <p className="text-sm text-gray-500">
                  {filteredNotifications.length} thông báo
                  {unreadCount > 0 && ` (${unreadCount} chưa đọc)`}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  disabled={loading}
                  className="text-xs text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors flex items-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa tất cả</span>
                </Button>
              </div>
            )}
          </SheetHeader>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-4 py-4">
            {loading && filteredNotifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-500 mt-4">Đang tải...</p>
              </div>
            )}
            {!loading && filteredNotifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                <div className="bg-gray-100 rounded-full p-6 mb-4">
                  <Bell className="w-12 h-12 text-gray-400" />
                </div>
                <p className="text-base font-medium text-gray-600 mb-1">
                  Chưa có thông báo nào
                </p>
                <p className="text-sm text-gray-400">
                  Các thông báo mới sẽ xuất hiện ở đây
                </p>
              </div>
            )}
            {filteredNotifications.length > 0 && (
              <div className="space-y-3">
                {filteredNotifications.map((notification) => {
                  const styles = getStyles(
                    notification.type,
                    notification.is_read
                  );
                  return (
                    <button
                      key={notification._id}
                      type="button"
                      onClick={() => handleNotificationClick(notification)}
                      className={`
                        ${styles.bg}
                        rounded-xl p-4
                        cursor-pointer
                        hover:shadow-lg hover:scale-[1.01]
                        transition-all duration-200 ease-in-out
                        border border-gray-200
                        backdrop-blur-sm
                        relative
                        group
                        w-full text-left
                      `}
                    >
                      {/* Delete button */}
                      <div role="button"
                        onClick={(e) =>
                          handleDeleteNotification(e, notification._id)
                        }
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1.5 hover:bg-gray-200 rounded-full transition-all"
                        aria-label="Xóa thông báo"
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </div>

                      <div className="flex items-start gap-3">
                        {/* Actor avatar for comment/reply notifications */}
                        {(notification.type === "comment_reply" ||
                          notification.type === "product_review") && (
                            <img
                              src={getActorAvatar(notification.actor_id)}
                              alt={getActorName(notification.actor_id)}
                              className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                            />
                          )}

                        {/* Icon for order/system notifications */}
                        {(notification.type === "order_update" ||
                          notification.type === "system") && (
                            <div
                              className={`flex-shrink-0 ${styles.iconBg} rounded-full p-2.5`}
                            >
                              {getIcon(notification.type)}
                            </div>
                          )}

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-6">
                          <h4
                            className={`font-semibold text-sm ${styles.title} leading-tight mb-1`}
                          >
                            {notification.title}
                          </h4>
                          {notification.message && (
                            <p
                              className={`text-sm ${styles.message} leading-relaxed mb-2 line-clamp-2`}
                            >
                              {notification.message}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <p className="text-xs text-gray-500 font-medium">
                              {formatTime(notification.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}

                {/* Load more button */}
                {hasMore && (
                  <Button
                    onClick={() => fetchNotifications(page + 1, true)}
                    disabled={loading}
                    variant="outline"
                    className="w-full mt-4"
                  >
                    {loading ? "Đang tải..." : "Tải thêm"}
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

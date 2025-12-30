import { useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { getSocket } from "@/lib/socket";
import { useNotification } from "@/hooks/useNotification";

/**
 * Hook to handle order-related socket notifications
 * Should only be used ONCE in the app (e.g., in a top-level layout)
 * to avoid duplicate listeners
 */
export function useOrderNotifications() {
  const { isAuthenticated } = useAuthStore();
  const { showNotification } = useNotification();

  useEffect(() => {
    if (!isAuthenticated) return;

    try {
      const socket = getSocket();

      // Listen for order status updates
      const handleOrderStatusUpdate = (payload: {
        orderId?: string;
        status?: string;
        message?: string;
        title?: string;
      }) => {
        // Show popup notification
        if (payload.title || payload.message) {
          showNotification({
            type: "success",
            title: payload.title || "Cập nhật đơn hàng",
            message:
              payload.message ||
              `Đơn hàng của bạn đã được cập nhật: ${payload.status || ""}`,
            duration: 5000,
          });
        }
      };

      socket.on("order:status-updated", handleOrderStatusUpdate);

      // Cleanup listener
      return () => {
        socket.off("order:status-updated", handleOrderStatusUpdate);
      };
    } catch (error) {
      console.error("Failed to setup order notification listeners:", error);
    }
  }, [isAuthenticated, showNotification]);
}

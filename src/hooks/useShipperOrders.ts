import { useState, useEffect } from "react";
import type { Order } from "@/types/order.type";
import shipperService from "@/api/services/shipperService";
import { getSocket } from "@/lib/socket";
import { transformOrder, type BackendOrder } from "@/lib/order.mapper";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/authStore";

export function useShipperOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(false);
  const [pendingOrder, setPendingOrder] = useState<Order | null>(null);
  const { user } = useAuthStore();

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await shipperService.getOrders();
      const mappedOrders = data.map((order: BackendOrder) => transformOrder(order));
      setOrders(mappedOrders);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Fetch shipper status
  const fetchStatus = async () => {
    try {
      const status = await shipperService.getStatus();
      setIsOnline(status?.is_online || false);
    } catch (error) {
      console.error("Failed to fetch status:", error);
    }
  };

  // Toggle online status
  const toggleOnlineStatus = async () => {
    try {
      const newStatus = !isOnline;
      await shipperService.setOnlineStatus(newStatus);
      setIsOnline(newStatus);
      toast.success(newStatus ? "Bạn đã online" : "Bạn đã offline");
    } catch (error) {
      console.error("Failed to toggle status:", error);
      toast.error("Không thể thay đổi trạng thái");
    }
  };

  // Accept order
  // const acceptOrder = async (orderId: string) => {
  //   try {
  //     await shipperService.acceptOrder(orderId);
  //     toast.success("Đã nhận đơn hàng");
  //     fetchOrders();
  //   } catch (error: unknown) {
  //     console.error("Failed to accept order:", error);
  //     const message = error instanceof Error ? error.message : "Không thể nhận đơn hàng";
  //     toast.error(message);
  //   }
  // };

  // Start delivery
  const startDelivery = async (orderId: string) => {
    try {
      await shipperService.startDelivery(orderId);
      toast.success("Đã bắt đầu giao hàng");
      fetchOrders();
    } catch (error) {
      console.error("Failed to start delivery:", error);
      toast.error("Không thể bắt đầu giao hàng");
    }
  };

  // Complete delivery
  const completeDelivery = async (orderId: string) => {
    try {
      await shipperService.completeDelivery(orderId);
      toast.success("Đã hoàn thành giao hàng");
      fetchOrders();
    } catch (error) {
      console.error("Failed to complete delivery:", error);
      toast.error("Không thể hoàn thành giao hàng");
    }
  };

  // Assign order (accept or reject)
  const assignOrder = async (orderId: string, status: 'assigned' | 'cancel') => {
    const userId = user?._id || user?.id;
    if (!userId) {
      toast.error("Không tìm thấy thông tin shipper");
      return;
    }

    try {
      await shipperService.assignOrder(orderId, userId, status);
      
      if (status === 'assigned') {
        toast.success("Đã nhận đơn hàng");
        fetchOrders();
      } else {
        toast.info("Đã từ chối đơn hàng");
      }
      
      setPendingOrder(null);
    } catch (error) {
      console.error("Failed to assign order:", error);
      toast.error("Không thể xử lý đơn hàng");
    }
  };

  useEffect(() => {
    fetchOrders();
    fetchStatus();

    // Setup WebSocket listener for new orders
    const socket = getSocket();
    
    const setupListeners = () => {
      socket.on("order:new", (payload: { orderId: string; message: string; order: BackendOrder }) => {
        if (!payload.order) {
          console.error("Received order:new event with undefined order:", payload);
          return;
        }
        try {
          const mappedOrder = transformOrder(payload.order);
          setPendingOrder(mappedOrder);
          toast.success(payload.message || "Có đơn hàng mới!", {
            duration: 5000,
          });
        } catch (error) {
          console.error("Error transforming new order:", error, payload);
        }
      });

      socket.on("order-assigned", (payload: { orderId: string; message: string; order: BackendOrder }) => {
        if (!payload.order) {
          console.error("Received order-assigned event with undefined order:", payload);
          return;
        }
        try {
          const mappedOrder = transformOrder(payload.order);
          setOrders((prev) => [mappedOrder, ...prev.filter((o) => o.id !== payload.orderId)]);
          toast.success(payload.message || "Đơn hàng đã được gán cho bạn!");
        } catch (error) {
          console.error("Error transforming assigned order:", error, payload);
        }
      });
    };

    // If already connected, setup listeners immediately
    if (socket.connected) {
      setupListeners();
    } else {
      // Wait for connection
      socket.on('connect', setupListeners);
    }

    return () => {
      socket.off("order:new");
      socket.off("order-assigned");
      socket.off("connect", setupListeners);
    };
  }, []);

  return {
    orders,
    loading,
    isOnline,
    pendingOrder,
    toggleOnlineStatus,
    // acceptOrder,
    startDelivery,
    completeDelivery,
    assignOrder,
    dismissPendingOrder: () => setPendingOrder(null),
    refreshOrders: fetchOrders,
  };
}

import { useState, useEffect } from "react";
import type { Order } from "@/types/order.type";
import staffOrderService from "@/api/services/shipperService";
import { getSocket } from "@/lib/socket";
import { transformOrder, type BackendOrder } from "@/lib/order.mapper";
import { toast } from "sonner";

export function useStaffOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await staffOrderService.getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  // Staff xác nhận đơn hàng
  const confirmOrder = async (orderId: string) => {
    try {
      await staffOrderService.confirmOrder(orderId);
      toast.success("Đã xác nhận đơn hàng");
      fetchOrders();
    } catch (error) {
      console.error("Failed to confirm order:", error);
      toast.error("Không thể xác nhận đơn hàng");
    }
  };

  // Staff bắt đầu giao hàng
  const startDelivery = async (orderId: string) => {
    try {
      await staffOrderService.startDelivery(orderId);
      toast.success("Đã bắt đầu giao hàng");
      fetchOrders();
    } catch (error) {
      console.error("Failed to start delivery:", error);
      toast.error("Không thể bắt đầu giao hàng");
    }
  };

  // Staff hoàn thành giao hàng
  const completeDelivery = async (orderId: string) => {
    try {
      await staffOrderService.completeDelivery(orderId);
      toast.success("Đã hoàn thành giao hàng");
      fetchOrders();
    } catch (error) {
      console.error("Failed to complete delivery:", error);
      toast.error("Không thể hoàn thành giao hàng");
    }
  };

  // Staff hủy đơn hàng
  const cancelOrder = async (orderId: string, reason: string) => {
    try {
      await staffOrderService.cancelOrder(orderId, reason);
      toast.success("Đã hủy đơn hàng");
      fetchOrders();
    } catch (error) {
      console.error("Failed to cancel order:", error);
      toast.error("Không thể hủy đơn hàng");
    }
  };

  useEffect(() => {
    fetchOrders();

    // Setup WebSocket listener for order updates
    const socket = getSocket();

    const setupListeners = () => {
      socket.on("order:new", (payload: { orderId: string; message: string; order: BackendOrder }) => {
        if (!payload.order) {
          console.error("Received order:new event with undefined order:", payload);
          return;
        }
        try {
          const mappedOrder = transformOrder(payload.order);
          setOrders((prev) => [mappedOrder, ...prev.filter((o) => o.id !== payload.orderId)]);
          toast.success(payload.message || "Có đơn hàng mới!", {
            duration: 5000,
          });
        } catch (error) {
          console.error("Error transforming new order:", error, payload);
        }
      });

      socket.on("order:updated", (payload: { orderId: string; order: BackendOrder }) => {
        if (!payload.order) return;
        try {
          const mappedOrder = transformOrder(payload.order);
          setOrders((prev) => prev.map((o) => o.id === payload.orderId ? mappedOrder : o));
        } catch (error) {
          console.error("Error transforming updated order:", error, payload);
        }
      });
    };

    if (socket.connected) {
      setupListeners();
    } else {
      socket.on('connect', setupListeners);
    }

    return () => {
      socket.off("order:new");
      socket.off("order:updated");
      socket.off("connect", setupListeners);
    };
  }, []);

  return {
    orders,
    loading,
    confirmOrder,
    startDelivery,
    completeDelivery,
    cancelOrder,
    refreshOrders: fetchOrders,
  };
}

// Keep backward compatibility - export both names
export const useShipperOrders = useStaffOrders;

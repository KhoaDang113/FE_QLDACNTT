import api from "../axiosConfig";
import type { Order } from "@/types/order.type";
import { transformOrder, type BackendOrder } from "@/lib/order.mapper";

/**
 * Staff Order Service - Dùng cho staff quản lý đơn hàng
 * Thay thế shipperService cũ, sử dụng staff API endpoints
 */
const staffOrderService = {
  /**
   * Lấy tất cả đơn hàng (Staff)
   */
  async getOrders(status?: string): Promise<Order[]> {
    const response = await api.get<{
      orders?: BackendOrder[];
    }>("/orders/admin/all", {
      params: status ? { status } : {},
    });
    const backendOrders = response.data?.orders ?? [];
    return backendOrders.map((order) => transformOrder(order));
  },

  /**
   * Staff xác nhận đơn hàng
   */
  async confirmOrder(orderId: string): Promise<Order> {
    const response = await api.patch<BackendOrder>(
      `/orders/admin/${orderId}/confirm`
    );
    return transformOrder(response.data);
  },

  /**
   * Staff bắt đầu giao hàng (đang giao)
   */
  async startDelivery(orderId: string): Promise<Order> {
    const response = await api.patch<BackendOrder>(
      `/orders/admin/${orderId}/ship`
    );
    return transformOrder(response.data);
  },

  /**
   * Staff xác nhận giao hàng thành công
   */
  async completeDelivery(orderId: string): Promise<Order> {
    const response = await api.patch<BackendOrder>(
      `/orders/admin/${orderId}/deliver`
    );
    return transformOrder(response.data);
  },

  /**
   * Staff hủy đơn hàng
   */
  async cancelOrder(orderId: string, cancelReason: string): Promise<Order> {
    const response = await api.patch<BackendOrder>(
      `/orders/admin/${orderId}/cancel`,
      { cancel_reason: cancelReason }
    );
    return transformOrder(response.data);
  },
};

export default staffOrderService;

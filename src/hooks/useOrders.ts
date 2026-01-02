"use client";

import { useState, useCallback, useEffect } from "react";
import type { Order } from "@/types/order.type";
import type { CartItem } from "@/types/cart.type";
import { orderService } from "@/api";
import paymentService from "@/api/services/paymentService";
import { useAuthStore } from "@/stores/authStore";
import { getSocket } from "@/lib/socket";
import { transformOrder, type BackendOrder } from "@/lib/order.mapper";

export interface CreateOrderCustomerInfo {
  name: string;
  phone: string;
  address: string;
  addressId?: string;
  notes?: string;
  requestInvoice?: boolean;
  invoiceCompanyName?: string;
  invoiceCompanyAddress?: string;
  invoiceTaxCode?: string;
  invoiceEmail?: string;
  discount?: number;
}

export function useOrders() {
  const { user, isAuthenticated } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Lấy userId từ cả id và _id (tránh case backend trả về _id)
  const userId = user?.id || user?._id;
  const role = user?.role?.toLowerCase?.();
  const isStaff = role === "staff" || role === "admin";

  const socket = getSocket();

  const fetchOrders = async () => {
    if (!isAuthenticated || (!userId && !isStaff)) {
      setLoading(false);
      setOrders([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      if (isStaff) {
        const { orders: staffOrders } = await orderService.getStaffOrders();
        setOrders(staffOrders);
      } else {
        const fetchedOrders = await orderService.getMyOrders();
        setOrders(fetchedOrders);
      }
    } catch (err: any) {
      console.error("Error fetching orders:", err);
      setError(
        err?.response?.data?.message || "Không thể tải danh sách đơn hàng"
      );
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewOrder = (payload: {
    orderId: string;
    message: string;
    order: BackendOrder;
  }) => {
    if (!payload.order) {
      console.error("Received new order event with undefined order:", payload);
      return;
    }
    try {
      setOrders((prevOrders) => [transformOrder(payload.order), ...prevOrders]);
    } catch (error) {
      console.error("Error transforming new order:", error, payload);
    }
  };

  const handleOrderUpdated = (payload: {
    orderId: string;
    newStatus: string;
    message: string;
    order: BackendOrder;
  }) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === payload.orderId
          ? {
            ...order,
            status: payload.newStatus as Order["status"],
          }
          : order
      )
    );
  };

  useEffect(() => {
    if (socket) {
      socket.on("shipper:order-updated", handleOrderUpdated);
      socket.on("order:new", handleNewOrder);
      socket.on("order:updated", handleOrderUpdated);
    }

    return () => {
      if (socket) {
        socket.off("shipper:order-updated", handleOrderUpdated);
        socket.off("order:new", handleNewOrder);
        socket.off("order:updated", handleOrderUpdated);
      }
    };
  }, [socket]);

  const replaceOrderInState = useCallback((updatedOrder: Order) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        const orderId = order.id || order._id;
        const updatedId = updatedOrder.id || updatedOrder._id;
        return orderId === updatedId ? updatedOrder : order;
      })
    );
  }, []);

  // Fetch orders từ API khi user đăng nhập
  useEffect(() => {
    fetchOrders();
  }, [isAuthenticated, userId, isStaff]);

  const confirmOrder = useCallback(
    async (orderId: string) => {
      if (isStaff) {
        const updatedOrder = await orderService.confirmOrderByStaff(orderId);
        replaceOrderInState(updatedOrder);
      } else {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "confirmed" } : order
          )
        );
      }
    },
    [isStaff, replaceOrderInState]
  );

  const rejectOrder = useCallback((orderId: string) => {
    setOrders((prevOrders) =>
      prevOrders.map((order) =>
        order.id === orderId ? { ...order, status: "rejected" as const } : order
      )
    );
  }, []);

  const shipOrder = useCallback(
    async (orderId: string) => {
      if (isStaff) {
        const shippedOrder = await orderService.shipOrder(orderId);
        replaceOrderInState(shippedOrder);
      } else {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "shipped" } : order
          )
        );
      }
    },
    [isStaff, replaceOrderInState]
  );

  const deliverOrder = useCallback(
    async (orderId: string) => {
      if (isStaff) {
        const deliveredOrder = await orderService.deliverOrderByStaff(orderId);
        replaceOrderInState(deliveredOrder);
      } else {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: "delivered" } : order
          )
        );
      }
    },
    [isStaff, replaceOrderInState]
  );

  const cancelOrder = useCallback(
    async (orderId: string, reason?: string) => {
      try {
        const updatedOrder = isStaff
          ? await orderService.cancelOrderByStaff(orderId, reason)
          : await orderService.cancelOrder(orderId, reason);
        replaceOrderInState(updatedOrder);
      } catch (err) {
        console.error("Cancel order failed:", err);
        throw err;
      }
    },
    [isStaff, replaceOrderInState]
  );

  const payOrder = useCallback(
    async (orderId: string, method: "vnpay" | "momo" = "vnpay") => {
      try {
        // Create payment on backend and redirect user to payment gateway
        const resp = await paymentService.createPayment(orderId, method);
        const redirectUrl = resp?.data || (resp as unknown);
        if (typeof redirectUrl === "string" && redirectUrl) {
          // Redirect to payment provider
          globalThis.location.href = redirectUrl;
        } else {
          alert(
            "Đã tạo lệnh thanh toán. Vui lòng kiểm tra hướng dẫn để hoàn tất."
          );
        }
      } catch (err) {
        console.error("Create payment failed:", err);
        alert("Không thể khởi tạo thanh toán. Vui lòng thử lại sau.");
      }
    },
    []
  );

  // Tạo đơn hàng mới từ giỏ hàng
  const createOrder = useCallback(
    async (cartItems: CartItem[], customerInfo: CreateOrderCustomerInfo) => {
      if (!cartItems || cartItems.length === 0) {
        throw new Error("Giỏ hàng của bạn đang trống.");
      }

      if (!customerInfo.addressId) {
        throw new Error("Vui lòng chọn địa chỉ giao hàng hợp lệ.");
      }

      const payload = {
        addressId: customerInfo.addressId,
        items: cartItems.map((item) => ({
          productId: String(item.id),
          quantity: item.quantity,
        })),
        discount: customerInfo.discount,
        requestInvoice: customerInfo.requestInvoice,
        invoiceInfo: customerInfo.requestInvoice
          ? {
            companyName: customerInfo.invoiceCompanyName || "",
            companyAddress: customerInfo.invoiceCompanyAddress || "",
            taxCode: customerInfo.invoiceTaxCode || "",
            email: customerInfo.invoiceEmail || "",
          }
          : undefined,
      };

      try {
        const { order, orderId, jobId } = await orderService.createOrder(
          payload
        );

        let finalOrder = order;
        if (!finalOrder && orderId) {
          try {
            finalOrder = await orderService.getOrderById(orderId);
          } catch (fetchError) {
            console.warn(
              "Không thể lấy thông tin chi tiết đơn hàng ngay sau khi tạo:",
              fetchError
            );
          }
        }

        if (finalOrder) {
          setOrders((prevOrders) => [finalOrder, ...prevOrders]);
        }

        const fallbackId = finalOrder?._id || finalOrder?.id;
        const idForReturn =
          orderId ||
          fallbackId ||
          (jobId ? jobId.toString() : `JOB-${Date.now()}`);

        return idForReturn;
      } catch (err: any) {
        console.error("Error creating order:", err);
        // Don't show toast here - let CheckoutModal handle it to avoid double notifications
        throw err;
      }
    },
    []
  );

  return {
    orders,
    loading,
    error,
    fetchOrders,
    confirmOrder,
    rejectOrder,
    shipOrder,
    deliverOrder,
    cancelOrder,
    payOrder,
    createOrder,
  };
}

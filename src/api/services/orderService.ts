import api from "../axiosConfig";
import type { Order } from "@/types/order.type";
import { transformOrder, type BackendOrder } from "@/lib/order.mapper";

interface CreateOrderPayload {
  addressId: string;
  items: Array<{
    productId: string;
    quantity: number;
  }>;
  discount?: number;
  requestInvoice?: boolean;
  invoiceInfo?: {
    companyName: string;
    companyAddress: string;
    taxCode: string;
    email: string;
  };
}

interface OrderJobCreateResponse {
  success?: boolean;
  message?: string;
  jobId?: string | number;
  estimatedTime?: string;
}

interface OrderJobStatusResponse {
  jobId: string;
  state: string;
  result?: {
    success?: boolean;
    orderId?: string;
    message?: string;
    order?: BackendOrder;
  } | null;
  error?: string | null;
  attemptsMade?: number;
  timestamp?: number;
}

class OrderService {
  private readonly basePath = "/orders";

  private buildCreateOrderRequest(payload: CreateOrderPayload) {
    const body: {
      address_id: string;
      items: Array<{ product_id: string; quantity: number }>;
      discount?: number;
      is_company_invoice?: boolean;
      invoice_info?: {
        company_name: string;
        company_address: string;
        tax_code: string;
        email: string;
      };
    } = {
      address_id: payload.addressId,
      items: payload.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
    };

    if (typeof payload.discount === "number") {
      body.discount = payload.discount;
    }

    if (payload.requestInvoice) {
      body.is_company_invoice = true;
      if (payload.invoiceInfo) {
        body.invoice_info = {
          company_name: payload.invoiceInfo.companyName,
          company_address: payload.invoiceInfo.companyAddress,
          tax_code: payload.invoiceInfo.taxCode,
          email: payload.invoiceInfo.email,
        };
      }
    }

    return body;
  }

  private async getOrderJobStatus(
    jobId: string
  ): Promise<OrderJobStatusResponse> {
    const response = await api.get<OrderJobStatusResponse>(
      `${this.basePath}/job/${jobId}`
    );
    return response.data;
  }

  private async waitForJobCompletion(
    jobId: string,
    timeoutMs = 10000, // Reduced from 20s to 10s for faster response
    intervalMs = 500   // Reduced from 1s to 500ms for faster polling
  ): Promise<{
    jobId: string;
    orderId?: string;
    order?: Order;
  }> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const status = await this.getOrderJobStatus(jobId);

        if (status.state === "completed" && status.result?.order) {
          const transformedOrder = transformOrder(status.result.order);
          return {
            jobId: status.jobId,
            orderId: status.result.orderId || transformedOrder.id,
            order: transformedOrder,
          };
        }

        if (status.state === "failed") {
          const errorMessage =
            status.error ||
            status.result?.message ||
            "Không thể tạo đơn hàng. Vui lòng thử lại.";
          throw new Error(errorMessage);
        }
      } catch (error) {
        console.error(`[OrderService] Error polling job ${jobId}:`, error);
        // Re-throw the error to stop polling and let the caller handle it
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }

    console.warn(
      `[OrderService] Timeout while waiting for order job ${jobId} completion`
    );

    throw new Error("Timeout: Đơn hàng đang được xử lý. Vui lòng kiểm tra lại sau.");
  }

  /**
   * Lấy danh sách orders của user hiện tại
   * GET /orders
   */
  async getMyOrders(): Promise<Order[]> {
    try {
      const response = await api.get<BackendOrder[]>(this.basePath);
      // Transform data từ backend format sang frontend format
      const transformed = (response.data || []).map((order) =>
        transformOrder(order)
      );
      return transformed;
    } catch (error) {
      console.error(`[OrderService] Error fetching orders:`, error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết order theo ID
   * GET /orders/:id
   */
  async getOrderById(orderId: string, isAdmin = false): Promise<Order> {
    try {
      const url = isAdmin 
        ? `${this.basePath}/admin/${orderId}`
        : `${this.basePath}/${orderId}`;
        
      const response = await api.get<BackendOrder>(url);
      return transformOrder(response.data);
    } catch (error) {
      console.error(`[OrderService] Error fetching order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Hủy đơn hàng
   * Backend chưa có endpoint cancel, sẽ throw error để hook xử lý local update
   */
  async cancelOrder(orderId: string, cancelReason?: string): Promise<Order> {
    try {
      const response = await api.patch<BackendOrder>(
        `${this.basePath}/${orderId}/cancel`,
        cancelReason ? { cancel_reason: cancelReason } : {}
      );
      return transformOrder(response.data);
    } catch (error) {
      console.error(`[OrderService] Error cancelling order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Staff/Admin: Lấy danh sách tất cả đơn hàng
   * GET /orders/admin/all
   */
  async getStaffOrders(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    try {
      const response = await api.get<{
        orders?: BackendOrder[];
        total?: number;
        page?: number;
        totalPages?: number;
      }>(`${this.basePath}/admin/all`, {
        params: {
          status: params?.status,
          page: params?.page,
          limit: params?.limit,
        },
      });

      const backendOrders = response.data?.orders ?? [];
      return {
        orders: backendOrders.map((order) => transformOrder(order)),
        total: response.data?.total ?? backendOrders.length,
        page: response.data?.page ?? params?.page ?? 1,
        totalPages: response.data?.totalPages ?? 1,
      };
    } catch (error) {
      console.error(`[OrderService] Error fetching staff orders:`, error);
      throw error;
    }
  }

  /**
   * Staff/Admin: Lấy chi tiết đơn hàng theo ID
   * GET /orders/admin/:id
   */
  async getStaffOrderById(orderId: string): Promise<Order> {
    try {
      const response = await api.get<BackendOrder>(
        `${this.basePath}/admin/${orderId}`
      );
      return transformOrder(response.data);
    } catch (error) {
      console.error(
        `[OrderService] Error fetching staff order ${orderId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Staff/Admin: Xác nhận đơn hàng
   */
  async confirmOrderByStaff(orderId: string): Promise<Order> {
    try {
      const response = await api.patch<BackendOrder>(
        `${this.basePath}/admin/${orderId}/confirm`
      );
      return transformOrder(response.data);
    } catch (error) {
      console.error(`[OrderService] Error confirming order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Staff/Admin: Cập nhật trạng thái đang giao
   */
  async shipOrder(orderId: string): Promise<Order> {
    try {
      const response = await api.patch<BackendOrder>(
        `${this.basePath}/admin/${orderId}/ship`
      );
      return transformOrder(response.data);
    } catch (error) {
      console.error(`[OrderService] Error shipping order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Staff/Admin: Xác nhận giao hàng thành công
   */
  async deliverOrderByStaff(orderId: string): Promise<Order> {
    try {
      const response = await api.patch<BackendOrder>(
        `${this.basePath}/admin/${orderId}/deliver`
      );
      return transformOrder(response.data);
    } catch (error) {
      console.error(`[OrderService] Error delivering order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Staff/Admin: Hủy đơn hàng
   */
  async cancelOrderByStaff(
    orderId: string,
    cancelReason?: string
  ): Promise<Order> {
    try {
      const response = await api.patch<BackendOrder>(
        `${this.basePath}/admin/${orderId}/cancel`,
        { cancel_reason: cancelReason ?? "Cancelled by staff" }
      );
      return transformOrder(response.data);
    } catch (error) {
      console.error(
        `[OrderService] Error cancelling order ${orderId} by staff:`,
        error
      );
      throw error;
    }
  }
  async createOrder(
    payload: CreateOrderPayload
  ): Promise<{ jobId: string; orderId?: string; order?: Order }> {
    try {
      const requestBody = this.buildCreateOrderRequest(payload);
      const response = await api.post<OrderJobCreateResponse>(
        this.basePath,
        requestBody
      );

      const rawJobId = response.data.jobId;
      if (!rawJobId) {
        const message =
          response.data.message || "Không thể tạo đơn hàng. Thiếu jobId.";
        throw new Error(message);
      }

      const jobId =
        typeof rawJobId === "string" ? rawJobId : rawJobId.toString();
      return await this.waitForJobCompletion(jobId);
    } catch (error) {
      console.error("[OrderService] Error creating order:", error);
      throw error;
    }
  }
}

export default new OrderService();

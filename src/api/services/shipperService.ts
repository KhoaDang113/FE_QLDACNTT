import api from "../axiosConfig";

const shipperService = {
  async setOnlineStatus(isOnline: boolean, location?: { latitude: number; longitude: number; address?: string }) {
    const response = await api.post("/shipper/status", {
      is_online: isOnline,
      ...location,
    });
    return response.data;
  },

  async getStatus() {
    const response = await api.get("/shipper/status");
    return response.data;
  },

  async getOrders(status?: string) {
    const response = await api.get("/shipper/orders", {
      params: status ? { status } : {},
    });
    return response.data;
  },

  async startDelivery(orderId: string) {
    const response = await api.patch(`/shipper/orders/${orderId}/start-delivery`);
    return response.data;
  },

  async completeDelivery(orderId: string) {
    const response = await api.patch(`/shipper/orders/${orderId}/complete`);
    return response.data;
  },

  async assignOrder(orderId: string, shipperId: string, status: 'assigned' | 'cancel') {
    const response = await api.post(`/orders/shipper/${orderId}`, {
      orderId,
      shipperId,
      status,
    });
    return response.data;
  },
};

export default shipperService;

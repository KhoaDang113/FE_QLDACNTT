import api from "../axiosConfig";
import type {
  InventoryOperationDto,
  AdjustInventoryDto,
  InventoryOperationResponse,
  ProductInventoryResponse,
  InventoryHistoryResponse,
} from "@/types/inventory.type";

// API Service
const inventoryService = {
  /**
   * Nhập kho
   */
  importInventory: async (
    data: InventoryOperationDto
  ): Promise<InventoryOperationResponse> => {
    const response = await api.post("/inventory/import", data);
    return response.data;
  },

  /**
   * Xuất kho
   */
  exportInventory: async (
    data: InventoryOperationDto
  ): Promise<InventoryOperationResponse> => {
    const response = await api.post("/inventory/export", data);
    return response.data;
  },

  /**
   * Điều chỉnh tồn kho
   */
  adjustInventory: async (
    data: AdjustInventoryDto
  ): Promise<InventoryOperationResponse> => {
    const response = await api.post("/inventory/adjust", data);
    return response.data;
  },

  /**
   * Lấy thông tin tồn kho của sản phẩm
   */
  getProductInventory: async (
    productId: string
  ): Promise<ProductInventoryResponse> => {
    const response = await api.get(`/inventory/product/${productId}`);
    return response.data;
  },

  /**
   * Lấy lịch sử nhập xuất kho của sản phẩm
   */
  getInventoryHistory: async (
    productId: string
  ): Promise<InventoryHistoryResponse> => {
    const response = await api.get(`/inventory/history/${productId}`);
    return response.data;
  },
};

export default inventoryService;


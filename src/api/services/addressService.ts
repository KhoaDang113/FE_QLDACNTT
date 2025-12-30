import api from "../axiosConfig";
import type {
  Address,
  CreateAddressDto,
  UpdateAddressDto,
  AddressResponse,
  ApiResponse,
} from "../types";

/**
 * Address Service - Xử lý các API liên quan đến địa chỉ nhận hàng
 */
class AddressService {
  private readonly basePath = "/addresses";

  /**
   * Lấy tất cả địa chỉ của user hiện tại
   * GET /addresses
   * Yêu cầu: JWT token
   * Backend trả về Address[] trực tiếp, không phải { addresses: Address[] }
   */
  async getAddresses(): Promise<AddressResponse> {
    const response = await api.get<Address[]>(this.basePath);
    // Backend trả về Address[] trực tiếp, wrap vào AddressResponse
    return { addresses: response.data || [] };
  }

  /**
   * Lấy một địa chỉ theo ID
   * GET /addresses/:id
   * Yêu cầu: JWT token
   */
  async getAddressById(id: string): Promise<Address> {
    const response = await api.get<Address>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Tạo địa chỉ mới
   * POST /addresses
   * Yêu cầu: JWT token
   */
  async createAddress(data: CreateAddressDto): Promise<Address> {
    const response = await api.post<Address>(this.basePath, data);
    return response.data;
  }

  /**
   * Cập nhật địa chỉ
   * PUT /addresses/:id
   * Yêu cầu: JWT token
   */
  async updateAddress(id: string, data: UpdateAddressDto): Promise<Address> {
    const response = await api.put<Address>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  /**
   * Xóa địa chỉ
   * DELETE /addresses/:id
   * Yêu cầu: JWT token
   */
  async deleteAddress(id: string): Promise<ApiResponse> {
    const response = await api.delete<ApiResponse>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Set địa chỉ làm mặc định
   * Helper method để update is_default
   */
  async setDefaultAddress(id: string): Promise<Address> {
    return this.updateAddress(id, { is_default: true });
  }

  /**
   * Format địa chỉ đầy đủ để hiển thị
   */
  formatFullAddress(address: Address): string {
    const parts = [
      address.address,
      address.ward,
      address.district,
      address.city,
    ].filter(Boolean);

    return parts.join(", ");
  }

  /**
   * Validate phone number (simple validation)
   */
  validatePhone(phone: string): boolean {
    const phoneRegex = /^(0|\+84)[0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ""));
  }
}

export default new AddressService();


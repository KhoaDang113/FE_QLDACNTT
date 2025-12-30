import api from "../axiosConfig";

export interface CartItem {
  productId: string;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

/**
 * Cart Service - Xử lý các API liên quan đến giỏ hàng (khớp với NestJS backend)
 */
class CartService {
  private readonly basePath = "/cart";

  /**
   * Lấy giỏ hàng hiện tại
   * GET /cart
   */
  async getCart(): Promise<Cart> {
    const response = await api.get<Cart>(this.basePath);
    return response.data;
  }

  /**
   * Thêm sản phẩm vào giỏ hàng
   * POST /cart/:productId
   */
  async addToCart(productId: string): Promise<Cart> {
    const response = await api.post<Cart>(`${this.basePath}/${productId}`);
    return response.data;
  }

  /**
   * Xóa sản phẩm khỏi giỏ hàng
   * DELETE /cart/:productId
   */
  async removeFromCart(productId: string): Promise<Cart> {
    const response = await api.delete<Cart>(`${this.basePath}/${productId}`);
    return response.data;
  }
}

export default new CartService();

import { useState, useEffect } from "react";
import cartService, { type Cart } from "../services/cartService";

interface ErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

/**
 * Hook để quản lý giỏ hàng (khớp với NestJS backend)
 */
export const useCart = () => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch cart khi mount
  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await cartService.getCart();
      setCart(data);
    } catch (err) {
      const error = err as ErrorResponse;
      // Nếu user chưa đăng nhập, tạo cart rỗng
      if (error.response?.status === 401) {
        setCart({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      } else {
        setError(error.response?.data?.message || "Không thể tải giỏ hàng");
      }
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId: string) => {
    try {
      setError(null);
      const updatedCart = await cartService.addToCart(productId);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      const error = err as ErrorResponse;
      const errorMessage =
        error.response?.data?.message || "Thêm vào giỏ hàng thất bại";
      setError(errorMessage);
      throw err;
    }
  };

  const removeItem = async (productId: string) => {
    try {
      setError(null);
      const updatedCart = await cartService.removeFromCart(productId);
      setCart(updatedCart);
      return updatedCart;
    } catch (err) {
      const error = err as ErrorResponse;
      const errorMessage =
        error.response?.data?.message || "Xóa sản phẩm thất bại";
      setError(errorMessage);
      throw err;
    }
  };

  return {
    cart,
    loading,
    error,
    fetchCart,
    addToCart,
    removeItem,
  };
};

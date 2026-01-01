import { useState } from "react";
import authService from "../services/authService";
import type { ErrorResponse } from "../types";

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      const oldUserStr = localStorage.getItem("user");
      if (oldUserStr) {
        try {
          const oldUser = JSON.parse(oldUserStr) as { id?: string };
          if (oldUser?.id) {
            localStorage.removeItem(`cart_${oldUser.id}`);
          }
        } catch {
        }
      }
      localStorage.removeItem("cart_guest");

      const response = await authService.loginEmail(email, password);

      if (response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
      }
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return response;
    } catch (err) {
      const error = err as ErrorResponse;
      const errorMessage =
        error.response?.data?.message || "Đăng nhập thất bại";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const registerEmail = async (
    email: string,
    password: string,
    name?: string
  ) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.registerEmail(email, password, name);

      if (response.accessToken) {
        localStorage.setItem("accessToken", response.accessToken);
      }
      if (response.user) {
        localStorage.setItem("user", JSON.stringify(response.user));
      }

      return response;
    } catch (err) {
      const error = err as ErrorResponse;
      const errorMessage = error.response?.data?.message || "Đăng ký thất bại";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyEmail = async (email: string, code: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.verifyEmail(email, code);
      return response;
    } catch (err) {
      const error = err as ErrorResponse;
      const errorMessage = error.response?.data?.message || "Xác thực thất bại";
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr) as { id?: string };
          if (user?.id) {
            localStorage.removeItem(`cart_${user.id}`);
          }
        } catch {
        }
      }
      localStorage.removeItem("cart_guest");

      await authService.logout();

      window.location.href = "/";
    } catch (err) {
      console.error("Logout error:", err);
      // Vẫn xóa dữ liệu local nếu có lỗi
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      // Clear cart
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr) as { id?: string };
          if (user?.id) {
            localStorage.removeItem(`cart_${user.id}`);
          }
        } catch {
          // Ignore parse error
        }
      }
      localStorage.removeItem("cart_guest");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lấy user hiện tại từ localStorage
   */
  const getCurrentUser = () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  };

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  const isAuthenticated = () => {
    return !!localStorage.getItem("accessToken");
  };

  return {
    loginEmail,
    // loginPhone,
    // verifyLoginSms,
    registerEmail,
    verifyEmail,
    logout,
    getCurrentUser,
    isAuthenticated,
    loading,
    error,
  };
};

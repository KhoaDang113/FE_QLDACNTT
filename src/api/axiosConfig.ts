import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import { getAccessToken } from "@/lib/auth";

// Tạo axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Quan trọng: Để gửi và nhận cookies từ backend
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Lấy token từ localStorage hoặc cookies
    const token = getAccessToken();

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const status = error.response?.status;
    const url = originalRequest?.url || "";
    const errorData = error.response?.data as { message?: string } | undefined;

    // Log error
    console.error("❌ Response Error:", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message,
      data: errorData,
    });

    // Xử lý token hết hạn (401 Unauthorized hoặc ACCESS_TOKEN_EXPIRED)
    const isTokenExpired =
      status === 401 ||
      errorData?.message === "ACCESS_TOKEN_EXPIRED" ||
      errorData?.message === "Unauthorized";

    if (
      isTokenExpired &&
      !originalRequest._retry &&
      originalRequest &&
      !url.includes("/auth/login-email") &&
      !url.includes("/auth/refresh-token") &&
      !url.includes("/auth/logout")
    ) {
      originalRequest._retry = true;

      try {
        console.log("🔄 Attempting to refresh token...");

        // Gọi API refresh token (sử dụng cookies)
        const response = await axios.post(
          `${api.defaults.baseURL}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        const { accessToken } = response.data;

        // Lưu token mới
        localStorage.setItem("accessToken", accessToken);

        console.log("✅ Token refreshed successfully");

        // Retry request với token mới
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        console.error("❌ Refresh token failed:", refreshError);

        const userStr = localStorage.getItem("user");
        const userId = userStr
          ? (JSON.parse(userStr) as { id?: string })?.id
          : null;

        // Refresh token thất bại, chuyển về trang login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        localStorage.removeItem("conversation_id");

        // Xóa cart của user vừa logout
        if (userId) {
          localStorage.removeItem(`cart_${userId}`);
        }
        // Xóa cart guest nếu có
        localStorage.removeItem("cart_guest");

        // Chỉ redirect nếu không phải đang ở trang login
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }

        return Promise.reject(refreshError);
      }
    }

    // Xử lý các lỗi khác
    if (error.response?.status === 403) {
      console.error("🚫 Forbidden: Bạn không có quyền truy cập");
    }

    if (error.response?.status === 404) {
      console.error("🔍 Not Found: Không tìm thấy tài nguyên");
    }

    if (error.response?.status === 500) {
      console.error("💥 Server Error: Lỗi máy chủ");
    }

    return Promise.reject(error);
  }
);

export default api;

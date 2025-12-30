import api from "../axiosConfig";
import type { LoginResponse, ApiResponse, User } from "../types";

/**
 * Auth Service - Xử lý các API liên quan đến authentication
 * Chỉ hỗ trợ đăng nhập/đăng ký bằng Email và Google
 */
class AuthService {
  private readonly basePath = "/auth";

  // ==================== ĐĂNG KÝ ====================

  /**
   * Đăng ký bằng email và password
   * POST /auth/register-email
   */
  async registerEmail(
    email: string,
    password: string,
    name?: string
  ): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      `${this.basePath}/register-email`,
      { email, password, name },
      { withCredentials: true } // Để nhận cookies
    );

    // Xóa cart cũ trước khi register user mới (nếu có user cũ)
    const oldUserStr = localStorage.getItem("user");
    if (oldUserStr) {
      try {
        const oldUser = JSON.parse(oldUserStr) as { id?: string };
        if (oldUser?.id) {
          localStorage.removeItem(`cart_${oldUser.id}`);
        }
      } catch {
        // Ignore parse error
      }
    }
    localStorage.removeItem("cart_guest");

    // Lưu token vào localStorage
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data;
  }

  /**
   * Xác thực email OTP (sau khi đăng ký)
   * POST /auth/verify-email
   */
  async verifyEmail(email: string, code: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(
      `${this.basePath}/verify-email`,
      { email, code }
    );
    return response.data;
  }

  /**
   * Gửi lại email verification
   * POST /auth/resend-email-verification
   */
  async resendEmailVerification(email: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(
      `${this.basePath}/resend-email-verification`,
      { email }
    );
    return response.data;
  }

  // ==================== ĐĂNG NHẬP ====================

  /**
   * Đăng nhập bằng email và password
   * POST /auth/login-email
   */
  async loginEmail(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>(
      `${this.basePath}/login-email`,
      { email, password },
      { withCredentials: true } // Để nhận cookies
    );

    // Xử lý trường hợp cần verify email
    if (response.data.requiresEmailVerification) {
      return response.data;
    }

    // Xóa cart cũ trước khi login user mới (nếu có user cũ)
    const oldUserStr = localStorage.getItem("user");
    if (oldUserStr) {
      try {
        const oldUser = JSON.parse(oldUserStr) as { id?: string };
        if (oldUser?.id) {
          localStorage.removeItem(`cart_${oldUser.id}`);
        }
      } catch {
        // Ignore parse error
      }
    }
    localStorage.removeItem("cart_guest");

    // Lưu token vào localStorage
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));

      // Nếu là staff, set ONLINE sau khi login thành công
      if (response.data.user.role === "staff") {
        try {
          const staffService = (await import("./staffService")).default;
          await staffService.setOnline().catch(() => {
            // Silent fail nếu API error
          });
        } catch {
          // Ignore
        }
      }
    }

    return response.data;
  }

  /**
   * Đăng nhập bằng Google (redirect)
   * Chuyển hướng đến trang Google OAuth
   */
  loginWithGoogle(): void {
    const baseURL = api.defaults.baseURL || "http://localhost:3000/api";
    window.location.href = `${baseURL}${this.basePath}/google`;
  }

  // ==================== TOKEN & SESSION ====================

  /**
   * Refresh access token
   * POST /auth/refresh-token
   * Note: Backend sử dụng cookie refreshToken
   */
  async refreshToken(): Promise<{ success: boolean; accessToken: string }> {
    const response = await api.post<{ success: boolean; accessToken: string }>(
      `${this.basePath}/refresh-token`,
      {},
      { withCredentials: true } // Gửi cookies
    );

    // Lưu token mới
    if (response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);
    }

    return response.data;
  }

  /**
   * Đăng xuất khỏi thiết bị hiện tại
   * POST /auth/logout
   */
  async logout(): Promise<void> {
    try {
      // Nếu là staff, set OFFLINE trước khi logout
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const user = JSON.parse(userStr) as { role?: string };
          if (user?.role === "staff") {
            const staffService = (await import("./staffService")).default;
            await staffService.setOffline().catch(() => {
              // Silent fail nếu API error
            });
          }
        } catch {
          // Ignore
        }
      }

      await api
        .post(`${this.basePath}/logout`, {}, { withCredentials: true })
        .catch(() => {});
    } finally {
      // Lấy userId trước khi xóa user
      const userStr = localStorage.getItem("user");
      const userId = userStr
        ? (JSON.parse(userStr) as { id?: string })?.id
        : null;

      // Luôn xóa token khỏi localStorage dù API có lỗi
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
    }
  }

  /**
   * Đăng xuất khỏi tất cả thiết bị
   * POST /auth/logout-all
   * Yêu cầu: JWT token và email verified
   */
  async logoutAll(): Promise<ApiResponse> {
    try {
      const response = await api.post<ApiResponse>(
        `${this.basePath}/logout-all`,
        {},
        { withCredentials: true }
      );
      return response.data;
    } finally {
      // Lấy userId trước khi xóa user
      const userStr = localStorage.getItem("user");
      const userId = userStr
        ? (JSON.parse(userStr) as { id?: string })?.id
        : null;

      // Xóa token khỏi localStorage
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
    }
  }

  // ==================== USER INFO ====================

  /**
   * Lấy thông tin user hiện tại
   * GET /auth/me
   * Yêu cầu: JWT token và email verified
   */
  async getMe(): Promise<User> {
    const response = await api.get<{ success: boolean; user: User }>(
      `${this.basePath}/me`
    );

    // Cập nhật localStorage
    if (response.data.user) {
      localStorage.setItem("user", JSON.stringify(response.data.user));
    }

    return response.data.user;
  }

  // ==================== PASSWORD MANAGEMENT ====================

  /**
   * Gửi OTP để reset password
   * POST /auth/forgot-password
   */
  async forgotPassword(email: string): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(
      `${this.basePath}/forgot-password`,
      { email }
    );
    return response.data;
  }

  /**
   * Xác thực OTP reset password
   * POST /auth/verify-reset-password
   */
  async verifyResetPasswordOTP(
    email: string,
    code: string
  ): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(
      `${this.basePath}/verify-reset-password`,
      { email, code },
      { withCredentials: true } // Để nhận resetToken cookie
    );
    return response.data;
  }

  /**
   * Reset password với token
   * POST /auth/reset-password
   */
  async resetPassword(
    email: string,
    newPassword: string,
    resetToken?: string
  ): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(
      `${this.basePath}/reset-password`,
      { email, newPassword, resetToken },
      { withCredentials: true } // Gửi resetToken từ cookie
    );
    return response.data;
  }

  /**
   * Đổi password (khi đã đăng nhập)
   * PUT /auth/change-password
   * Yêu cầu: JWT token
   */
  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<ApiResponse> {
    const response = await api.put<ApiResponse>(
      `${this.basePath}/change-password`,
      { oldPassword, newPassword }
    );
    return response.data;
  }

  // ==================== HELPERS ====================

  /**
   * Lấy token từ localStorage hoặc cookies
   */
  private getAccessToken(): string | null {
    // Ưu tiên localStorage trước
    let token = localStorage.getItem("accessToken");

    if (!token) {
      // Nếu không có trong localStorage, thử lấy từ cookies
      const cookies = document.cookie.split(";");
      const accessTokenCookie = cookies.find((cookie) =>
        cookie.trim().startsWith("accessToken=")
      );

      if (accessTokenCookie) {
        token = accessTokenCookie.split("=")[1];
        // Lưu vào localStorage để sử dụng lần sau
        if (token) {
          localStorage.setItem("accessToken", token);
        }
      }
    }

    return token;
  }

  /**
   * Kiểm tra user đã đăng nhập chưa
   */
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Lấy user từ localStorage
   */
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;

    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  }

  /**
   * Clear tất cả auth data
   */
  clearAuthData(): void {
    // Lấy userId trước khi xóa user
    const userStr = localStorage.getItem("user");
    const userId = userStr
      ? (JSON.parse(userStr) as { id?: string })?.id
      : null;

    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");

    // Xóa cart của user
    if (userId) {
      localStorage.removeItem(`cart_${userId}`);
    }
    // Xóa cart guest nếu có
    localStorage.removeItem("cart_guest");
  }
}

export default new AuthService();

import api from "../axiosConfig";
import type { 
  User, 
  GetUsersParams,
  GetUsersResponse,
  UpdateUserData,
  UpdateUserByAdminData,
  LockUnlockUserResponse 
} from "@/types";

/**
 * User Service - Xử lý các API liên quan đến user profile
 */
class UserService {
  private readonly basePath = "/users";

  // ==================== PROFILE MANAGEMENT ====================

  /**
   * Lấy thông tin profile của user hiện tại
   * GET /users/profile
   * Yêu cầu: JWT token
   */
  async getProfile(): Promise<User> {
    const response = await api.get<User>(`${this.basePath}/profile`);
    
    // Cập nhật localStorage
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    
    return response.data;
  }

  /**
   * Cập nhật profile của user
   * PUT /users/profile
   * Yêu cầu: JWT token
   * 
   * @param data - Dữ liệu profile cần cập nhật
   * @param avatarFile - File ảnh đại diện (optional)
   */
  async updateProfile(
    data: UpdateUserData,
    avatarFile?: File
  ): Promise<User> {
    const formData = new FormData();
    
    // Append dữ liệu text
    if (data.name) formData.append("name", data.name);
    if (data.email) formData.append("email", data.email);
    if (data.phone) formData.append("phone", data.phone);
    if (data.gender) formData.append("gender", data.gender);
    
    // Append file avatar nếu có
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const response = await api.put<User>(`${this.basePath}/profile`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    
    // Cập nhật localStorage
    if (response.data) {
      localStorage.setItem("user", JSON.stringify(response.data));
    }
    
    return response.data;
  }

  // ==================== ADMIN - USER MANAGEMENT ====================

  /**
   * Lấy danh sách tất cả users (Admin only)
   * GET /users/admin/all
   * Yêu cầu: Admin role
   */
  async getAllUsers(params?: GetUsersParams): Promise<GetUsersResponse> {
    const response = await api.get<GetUsersResponse>(`${this.basePath}/admin/all`, { params });
    return response.data;
  }

  /**
   * Lấy thông tin user theo ID (Admin only)
   * GET /users/admin/:id
   * Yêu cầu: Admin role
   */
  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(`${this.basePath}/admin/${id}`);
    return response.data;
  }

  /**
   * Cập nhật thông tin user (Admin only)
   * PUT /users/admin/:id
   * Yêu cầu: Admin role
   */
  async updateUserByAdmin(
    id: string,
    data: UpdateUserByAdminData,
    avatarFile?: File
  ): Promise<User> {
    const formData = new FormData();
    
    if (data.name) formData.append("name", data.name);
    if (data.email) formData.append("email", data.email);
    if (data.phone) formData.append("phone", data.phone);
    if (data.gender) formData.append("gender", data.gender);
    if (data.role) formData.append("role", data.role);
    
    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const response = await api.put<User>(
      `${this.basePath}/admin/${id}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  /**
   * Khóa tài khoản user (Admin only)
   * PATCH /users/admin/:id/lock
   * Yêu cầu: Admin role
   */
  async lockUser(id: string): Promise<LockUnlockUserResponse> {
    const response = await api.patch<LockUnlockUserResponse>(
      `${this.basePath}/admin/${id}/lock`
    );
    return response.data;
  }

  /**
   * Mở khóa tài khoản user (Admin only)
   * PATCH /users/admin/:id/unlock
   * Yêu cầu: Admin role
   */
  async unlockUser(id: string): Promise<LockUnlockUserResponse> {
    const response = await api.patch<LockUnlockUserResponse>(
      `${this.basePath}/admin/${id}/unlock`
    );
    return response.data;
  }
}

export default new UserService();


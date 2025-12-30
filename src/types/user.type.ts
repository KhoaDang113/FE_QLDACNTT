/**
 * User Type Definitions
 * 
 * Định nghĩa các interface và type cho User management
 */

/**
 * User Role - Vai trò người dùng
 */
export type UserRole = "user" | "staff" | "admin" | "shipper";

/**
 * User Gender - Giới tính
 */
export type UserGender = "male" | "female" | "other";

/**
 * Auth Provider - Nhà cung cấp xác thực
 */
export type AuthProvider = "local" | "google" | "facebook";

/**
 * User Interface
 * Thông tin chi tiết của người dùng
 */
export interface User {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  avatar?: string;
  gender?: UserGender;
  role: UserRole;
  isLocked: boolean;
  emailVerifiedAt?: Date | null;
  isPhoneVerified: boolean;
  authProvider: AuthProvider;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Get Users Parameters
 * Tham số để lấy danh sách users (Admin)
 */
export interface GetUsersParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

/**
 * Pagination Response
 * Thông tin phân trang
 */
export interface PaginationInfo {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Get Users Response
 * Response khi lấy danh sách users
 */
export interface GetUsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

/**
 * Update User Data
 * Dữ liệu để cập nhật user
 */
export interface UpdateUserData {
  name?: string;
  email?: string;
  phone?: string;
  gender?: UserGender;
}

/**
 * Update User By Admin Data
 * Dữ liệu để admin cập nhật user
 */
export interface UpdateUserByAdminData extends UpdateUserData {
  role?: UserRole;
}

/**
 * Lock/Unlock User Response
 * Response khi khóa/mở khóa user
 */
export interface LockUnlockUserResponse {
  message: string;
  user: {
    _id: string;
    name: string;
    email?: string;
    isLocked: boolean;
  };
}

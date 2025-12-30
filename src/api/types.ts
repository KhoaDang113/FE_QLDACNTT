// API Response Types

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Auth Types
export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  accessToken?: string;
  token?: string; // Backend trả về "token" thay vì "accessToken" trong register
  user?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
    phoneNumber?: string; // Để backward compatible
    role?: string;
    isPhoneVerified?: boolean;
  };
  requiresEmailVerification?: boolean;
  message?: string;
}

export interface RegisterRequest {
  phoneNumber: string;
  password: string;
  name?: string;
  email?: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phoneNumber?: string;
  gender?: "male" | "female";
  avatarUrl?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken?: string;
}

export interface VerifyOtpRequest {
  phoneNumber: string;
  otp: string;
}

// User Types
export interface User {
  id: string;
  _id?: string; // Backend MongoDB ID
  name?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string; // Để backward compatible
  gender?: "male" | "female";
  role?: string;
  avatar?: string; // Backend field name
  avatarUrl?: string; // Alias for backward compatibility
  isVerified?: boolean;
  isPhoneVerified?: boolean;
  emailVerifiedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

// Product Types (mở rộng từ types hiện tại)
export interface ProductQuery {
  category?: string;
  subcategory?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  limit?: number;
  sortBy?: "price" | "name" | "createdAt";
  sortOrder?: "asc" | "desc";
}

// Category Types
export interface CategoryQuery {
  includeSubcategories?: boolean;
}

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface AddToCartRequest {
  productId: string;
  quantity: number;
}

export interface UpdateCartItemRequest {
  quantity: number;
}

// Order Types
export interface CreateOrderRequest {
  items: CartItem[];
  shippingAddress: {
    fullName: string;
    phoneNumber: string;
    address: string;
    ward: string;
    district: string;
    province: string;
  };
  paymentMethod: "cod" | "online";
  note?: string;
}

export interface ErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

// Comment Types
export interface CommentUser {
  _id: string;
  name: string;
  avatar?: string;
  email?: string;
  role?: string;
}

export interface Comment {
  _id: string;
  product_id: string;
  user_id: CommentUser | string;
  content: string;
  parent_id?: string | null;
  reply_count?: number;
  created_at: string;
  updated_at?: string;
}

export interface CommentResponse {
  comments: Comment[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateCommentRequest {
  product_id: string;
  content: string;
  parent_id?: string;
}

export interface UpdateCommentRequest {
  content: string;
}

// Admin Comment Types
export interface CommentWithProduct extends Omit<Comment, 'product_id'> {
  product_id: {
    _id: string;
    name: string;
    slug: string;
    image_primary?: string;
  };
}

export interface AdminCommentResponse {
  comments: CommentWithProduct[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductCommentsGroup {
  _id: string;
  commentCount: number;
  latestComment: string;
  product: {
    _id: string;
    name: string;
    slug: string;
    image_primary?: string;
  };
}

export interface ProductCommentsListResponse {
  products: ProductCommentsGroup[];
  total: number;
}


// Address Types
export interface Address {
  _id: string;
  user_id: string;
  full_name: string;
  phone: string;
  address: string; // Street address
  ward: string; // Phường/Xã
  district?: string; // Quận/Huyện (optional - mô hình 2 cấp: chỉ có Tỉnh và Xã)
  city: string; // Tỉnh/Thành phố
  latitude: number;
  longitude: number;
  zip_code?: string;

  is_default: boolean;
  is_active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAddressDto {
  full_name: string;
  phone: string;
  address: string;
  ward: string;
  district?: string; // Optional - mô hình 2 cấp: chỉ có Tỉnh và Xã
  city: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
  is_active?: boolean;
}

export interface UpdateAddressDto {
  full_name?: string;
  phone?: string;
  address?: string;
  ward?: string;
  district?: string;
  city?: string;
  zip_code?: string;
  latitude?: number;
  longitude?: number;
  is_default?: boolean;
  is_active?: boolean;
}

export interface AddressResponse {
  addresses: Address[];
}

// Notification Types
export type NotificationType =
  | "comment_reply"
  | "order_update"
  | "product_review"
  | "system";

export interface NotificationActor {
  _id: string;
  name: string;
  avatar?: string;
}

export interface NotificationData {
  _id: string;
  user_id: string;
  actor_id: string | NotificationActor;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  reference_id?: string;
  reference_type?: string;
  metadata?: Record<string, unknown>;
  is_read: boolean;
  is_hidden: boolean;
  is_deleted: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
}

export interface NotificationsResponse {
  notifications: NotificationData[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  unreadCount: number;
}

export interface UnreadCountResponse {
  unreadCount: number;
}

export interface QueryNotificationParams {
  page?: number;
  limit?: number;
  type?: NotificationType;
  is_read?: boolean;
  unread_only?: boolean;
}

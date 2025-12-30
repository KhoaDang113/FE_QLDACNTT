// Raw response from backend (with typo)
export interface OrderRatingRaw {
  _id: string;
  order_id: any; // Can be populated with Order object
  user_id: any; // Can be populated with User object
  rating_overall: number;
  rating_product_quality?: number;
  rating_packaging?: number;
  rating_delivery_time?: number;
  rating_shipper?: number;
  comment?: string;
  images?: string[];
  addmin_respone?: string; // Typo in backend
  addmin_respone_time?: string;
  createdAt: string;
  updatedAt: string;
}

// Mapped interface for frontend use
export interface OrderRating {
  _id: string;
  order_id: any; // Can be string or populated Order
  user_id: any; // Can be string or populated User
  rating_overall: number;
  rating_product_quality?: number;
  rating_packaging?: number;
  rating_delivery_time?: number;
  rating_shipper?: number;
  comment?: string;
  images?: string[];
  admin_response?: string; // Fixed typo
  admin_response_time?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRatingDto {
  order_id: string;
  rating_overall: number;
  rating_product_quality?: number;
  rating_packaging?: number;
  rating_delivery_time?: number;
  rating_shipper?: number;
  comment?: string;
  images?: string[];
}

export interface AdminResponseDto {
  admin_response: string;
}

export interface RatingListResponse {
  data: OrderRating[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface RatingQueryParams {
  page?: number;
  limit?: number;
}

// Helper function to map backend response to frontend type
export function mapOrderRating(raw: OrderRatingRaw): OrderRating {
  return {
    ...raw,
    admin_response: raw.addmin_respone,
    admin_response_time: raw.addmin_respone_time,
  };
}

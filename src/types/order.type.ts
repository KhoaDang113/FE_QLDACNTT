export interface OrderItem {
  id: string;
  product_id: number;
  product_id_string?: string; // Product ID dạng string để fetch lại product đầy đủ
  name: string;
  price: number;
  quantity: number;
  image: string;
  images?: string[]; // Mảng hình ảnh để dùng getProductImage giống ProductCard
  image_primary?: string; // Hình ảnh chính
  image_url?: string; // Alias cho image_primary
  unit: string;
}

export interface OrderInvoiceInfo {
  company_name: string;
  company_address: string;
  tax_code: string;
  email: string;
}

export interface Order {
  id: string;
  _id?: string; // Backend field
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  total_amount: number;
  subtotal?: number;
  shipping_fee?: number;
  discount?: number;
  status: "pending" | "confirmed" | "assigned" | "shipped" | "rejected" | "cancelled" | "delivered";
  
  // Shipper fields
  shipper_id?: string;
  assigned_at?: string;

  // Delivery info
  delivery_distance?: number; // in kilometers
  estimated_delivery_time?: string; // ISO date string

  // Payment fields (optional) - backend may supply these
  paid?: boolean; // true if order has been paid
  payment_status?: "paid" | "unpaid" | "pending" | "failed";
  payment_method?: string | null;

  created_at: string;
  notes?: string;
  is_company_invoice?: boolean;
  invoice_info?: OrderInvoiceInfo | null;
  is_rating?: boolean; // Whether order has been rated
}

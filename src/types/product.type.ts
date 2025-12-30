export interface Product {
  _id: string; // MongoDB ObjectId (required for admin)
  id?: string; // Alias cho _id để tương thích
  category_id?: string | {
    _id: string;
    name: string;
    slug: string;
  };
  brand_id?: string | {
    _id: string;
    name: string;
    slug: string;
  };
  name: string;
  slug: string;
  unit?: string; // Đơn vị: "pack", "bottle", "kg", etc.
  unit_price: number;
  discount_percent: number;
  final_price?: number;
  image_primary?: string | string[]; // Ảnh chính (có thể là string hoặc mảng [String] từ backend)
  images?: string[]; // Mảng ảnh phụ
  quantity: number; // Số lượng trong kho (số) - optional for backward compatibility
  stock_quantity?: number; // Alias for quantity (BE compatibility)
  stock_status: "in_stock" | "out_of_stock" | "preorder";
  is_active?: boolean;
  is_deleted?: boolean;
  is_hot?: boolean; // Sản phẩm nổi bật
  created_at?: string;
  updated_at?: string;

  // Populated fields (when retrieved with populate) - legacy support
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  brand?: {
    _id: string;
    name: string;
    slug: string;
  };

  // Các field tùy chỉnh cho FE
  selectedQuantity?: number; // Số lượng được chọn khi thêm vào giỏ
  image_url?: string; // Alias cho image_primary

  price?: number; // Alias cho unit_price

  description?: string; // Custom FE field
}

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
}

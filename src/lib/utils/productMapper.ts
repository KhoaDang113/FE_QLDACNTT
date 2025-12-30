import type { Product } from "@/types/product.type";

interface ApiProduct {
  _id?: string;
  id?: string;
  name?: string;
  slug?: string;
  category_id?: string;
  brand_id?: string;
  unit?: string;
  unit_price?: number | string;
  price?: number | string;
  discount_percent?: number | string;
  final_price?: number;
  image_primary?: string | string[]; // Backend có thể trả về mảng [String]
  image_url?: string | string[];
  image?: string;
  images?: string[];
  quantity?: number;
  stock_quantity?: number;
  stock_status?: string;
  is_active?: boolean;
  is_deleted?: boolean;
  is_hot?: boolean;
  created_at?: string;
  updated_at?: string;
  description?: string;
}

export const mapProductFromApi = (apiProduct: ApiProduct): Product => {
  if (!apiProduct) {
    throw new Error("Invalid product data received from API");
  }

  const rawQuantity =
    typeof apiProduct.quantity === "number"
      ? apiProduct.quantity
      : typeof apiProduct.stock_quantity === "number"
        ? apiProduct.stock_quantity
        : undefined;

  const quantity =
    typeof rawQuantity === "number" && !Number.isNaN(rawQuantity)
      ? rawQuantity
      : undefined;

  const stockStatus: "in_stock" | "out_of_stock" | "preorder" =
    typeof apiProduct.stock_status === "string" && 
    ["in_stock", "out_of_stock", "preorder"].includes(apiProduct.stock_status)
      ? (apiProduct.stock_status as "in_stock" | "out_of_stock" | "preorder")
      : typeof quantity === "number"
        ? quantity > 0
          ? "in_stock"
          : "out_of_stock"
        : "in_stock";

  // Nếu stock_status là 'in_stock' nhưng quantity không được cung cấp, 
  // không nên default quantity về 0 vì sẽ làm sản phẩm hiển thị hết hàng
  const finalQuantity = 
    typeof quantity === "number" 
      ? quantity 
      : stockStatus === "in_stock" 
        ? undefined 
        : 0;

  return {
    _id: apiProduct._id || apiProduct.id || "",
    id: apiProduct.id || apiProduct._id || "",
    name: apiProduct.name || "Sản phẩm không tên",
    slug: apiProduct.slug || apiProduct.id || apiProduct._id || "",
    category_id: apiProduct.category_id,
    brand_id: apiProduct.brand_id,
    unit: apiProduct.unit,
    unit_price: Number(apiProduct.unit_price) || 0,
    price: Number(apiProduct.unit_price) || undefined,
    discount_percent: Number(apiProduct.discount_percent) || 0,
    final_price:
      typeof apiProduct.final_price === "number"
        ? apiProduct.final_price
        : Number(apiProduct.unit_price) || 0,
    // Xử lý image_primary: có thể là string hoặc mảng [String] từ backend
    image_primary: Array.isArray(apiProduct.image_primary) 
      ? apiProduct.image_primary[0] || ""
      : apiProduct.image_primary || apiProduct.image_url || "",
    image_url: Array.isArray(apiProduct.image_primary) 
      ? apiProduct.image_primary[0] || ""
      : apiProduct.image_primary || apiProduct.image_url || "",
    images: Array.isArray(apiProduct.images)
      ? apiProduct.images
      : apiProduct.image
        ? [apiProduct.image]
        : [],
    quantity: finalQuantity ?? 0,
    stock_quantity: finalQuantity ?? 0,
    stock_status: stockStatus,
    is_active: apiProduct.is_active ?? true,
    is_deleted: apiProduct.is_deleted ?? false,
    is_hot: apiProduct.is_hot ?? false,
    created_at: apiProduct.created_at,
    updated_at: apiProduct.updated_at,
    description: apiProduct.description,
  };
};

export const mapProductsFromApi = (products: ApiProduct[] = []): Product[] => {
  return products.map(mapProductFromApi);
};


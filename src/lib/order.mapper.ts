import type { Order, OrderItem } from "@/types/order.type";
import { PRODUCT_PLACEHOLDER_IMAGE, getProductImage } from "@/lib/constants";

export interface BackendOrderItem {
  _id?: string;
  product_id:
  | string
  | {
    _id?: string;
    id?: string;
    name?: string;
    slug?: string;
    image_primary?: string;
    images?: string[];
    image_url?: string;
    unit_price?: number;
    final_price?: number;
    discount_percent?: number;
    stock_status?: string;
    unit?: string;
  };
  quantity: number;
  unit_price: number;
  discount_percent?: number;
  total_price: number;
}

export interface BackendOrder {
  _id?: string;
  id?: string;
  user_id?: string;
  address_id?:
  | string
  | {
    _id?: string;
    id?: string;
    full_name?: string;
    phone?: string;
    address?: string;
    ward?: string;
    district?: string;
    city?: string;
    zip_code?: string;
  };
  items: BackendOrderItem[];
  status: "pending" | "confirmed" | "assigned" | "shipped" | "delivered" | "cancelled";
  subtotal: number;
  discount?: number;
  shipping_fee?: number;
  total: number;
  payment_status?: "pending" | "paid" | "failed";
  created_at?: string;
  updated_at?: string;
  is_company_invoice?: boolean;
  is_rating?: boolean;
  shipper_id?: string;
  delivery_distance?: number;
  estimated_delivery_time?: string;
  invoice_info?: {
    company_name?: string;
    company_address?: string;
    tax_code?: string;
    email?: string;
  } | null;
  notes?: string;
}

export function transformOrderItem(
  item: BackendOrderItem,
  index: number
): OrderItem {
  const product = typeof item.product_id === "object" ? item.product_id : null;
  const productId =
    typeof item.product_id === "string"
      ? item.product_id
      : product?._id || product?.id || "";

  let productIdNum = 0;
  if (typeof productId === "string") {
    productIdNum = Number.parseInt(productId.slice(-8), 16) || index;
  } else if (typeof productId === "number") {
    productIdNum = productId;
  }

  // Sử dụng getProductImage để lấy hình ảnh đúng cách (kiểm tra image_primary, images[0], etc.)
  const productImage = product
    ? getProductImage(product)
    : PRODUCT_PLACEHOLDER_IMAGE;

  return {
    id: item._id || `item-${productIdNum}-${index}`,
    product_id: productIdNum,
    product_id_string: String(productId),
    name: product?.name || "Sản phẩm",
    price: item.unit_price || product?.final_price || product?.unit_price || 0,
    quantity: item.quantity,
    image: productImage, // Giữ lại để backward compatibility
    images:
      product?.images ||
      (product?.image_primary ? [product.image_primary] : undefined),
    image_primary: product?.image_primary,
    image_url: product?.image_primary || product?.image_url,
    unit: product?.unit || "1 sản phẩm",
  };
}

export function transformOrder(order: BackendOrder): Order {
  if (!order) {
    throw new Error("Order object is undefined or null");
  }

  const address =
    typeof order.address_id === "object" && order.address_id ? order.address_id : null;

  // Map status từ backend sang frontend
  let frontendStatus: Order["status"];
  switch (order.status) {
    case "delivered":
      frontendStatus = "delivered";
      break;
    case "cancelled":
      frontendStatus = "cancelled";
      break;
    case "confirmed":
      frontendStatus = "confirmed";
      break;
    case "assigned":
      frontendStatus = "assigned";
      break;
    case "shipped":
      frontendStatus = "shipped";
      break;
    default:
      frontendStatus = "pending";
      break;
  }

  return {
    id: order._id || order.id || "",
    customer_name: address?.full_name || "Khách hàng",
    customer_phone: address?.phone || "",
    customer_address:
      [address?.address, address?.ward, address?.district, address?.city]
        .filter(Boolean)
        .join(", ") || "",
    items: order.items.map((item, index) => transformOrderItem(item, index)),
    total_amount: order.total || order.subtotal || 0,
    subtotal: order.subtotal,
    shipping_fee: order.shipping_fee,
    discount: order.discount,
    status: frontendStatus,
    // Shipper fields
    shipper_id: order.shipper_id,
    // Delivery info
    delivery_distance: order.delivery_distance,
    estimated_delivery_time: order.estimated_delivery_time,
    // Map payment fields from backend
    payment_status: order.payment_status,
    paid: order.payment_status === "paid",
    payment_method: null,
    created_at: order.created_at || new Date().toISOString(),
    notes: order.notes,
    is_company_invoice: !!order.is_company_invoice,
    is_rating: !!order.is_rating,
    invoice_info:
      order.is_company_invoice && order.invoice_info
        ? {
          company_name: order.invoice_info.company_name || "",
          company_address: order.invoice_info.company_address || "",
          tax_code: order.invoice_info.tax_code || "",
          email: order.invoice_info.email || "",
        }
        : null,
  };
}

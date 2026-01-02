import { SiFacebook, SiYoutube, SiInstagram } from "react-icons/si";
import {
  type SocialLink,
  type Collaborates,
  type NavItem,
  type ContactItem,
} from "@/types/constants.type";
import { Phone, Mail, MapPin } from "lucide-react";

export const socials = [
  { label: "SiFacebook", to: "#", Icon: SiFacebook },
  { label: "SiYoutube", to: "#", Icon: SiYoutube },
  { label: "SiInstagram", to: "#", Icon: SiInstagram },
] as const satisfies ReadonlyArray<SocialLink>;

export const collaborates = [
  {
    label: "MWG",
    to: "https://mwg.vn/",
    image:
      "https://cdnv2.tgdd.vn/bhx/product-fe/cart/home/_next/public/static/images/logo_mwg.png",
  },
  {
    label: "thegioididong",
    to: "https://www.thegioididong.com/",
    image:
      "https://cdnv2.tgdd.vn/bhx/product-fe/cart/home/_next/public/static/images/logo_tgdd.png",
  },
  {
    label: "dienmayxanh",
    to: "https://www.dienmayxanh.com/",
    image:
      "https://cdnv2.tgdd.vn/bhx/product-fe/cart/home/_next/public/static/images/logo_dmx.png",
  },
  {
    label: "topzone",
    to: "https://www.topzone.vn/",
    image:
      "https://cdnv2.tgdd.vn/bhx/product-fe/cart/home/_next/public/static/images/logo_topzone.png",
  },
  {
    label: "nhathuocankhang",
    to: "https://www.nhathuocankhang.com/",
    image:
      "https://cdnv2.tgdd.vn/bhx/product-fe/cart/home/_next/public/static/images/logo_ak.png",
  },
  {
    label: "avakids",
    to: "https://www.avakids.com/",
    image:
      "https://cdnv2.tgdd.vn/bhx/product-fe/cart/home/_next/public/static/images/logo_ava.png",
  },
  {
    label: "erablue",
    to: "https://www.erablue.id/",
    image:
      "https://cdnv2.tgdd.vn/bhx/product-fe/cart/home/_next/public/static/images/logo_era.png",
  },
  {
    label: "thodienmayxanh",
    to: "https://www.thodienmayxanh.com/",
    image:
      "https://cdnv2.tgdd.vn/bhx/product-fe/cart/home/_next/public/static/images/logo_tdmx.png",
  },
] as const satisfies ReadonlyArray<Collaborates>;

export const suportLinks = [
  { label: "Câu hỏi thường gặp", to: "#" },
  { label: "Chính sách đổi trả", to: "#" },
  { label: "Chính sách bảo mật", to: "#" },
  { label: "Điều khoản sử dụng", to: "#" },
  { label: "Hướng dẫn mua hàng", to: "#" },
] as const satisfies ReadonlyArray<NavItem>;

export const aboutLinks = [
  { label: "Giới thiệu", to: "#" },
  { label: "Tuyển dụng", to: "#" },
  { label: "Tin tức", to: "#" },
  { label: "Hệ thống cửa hàng", to: "#" },
  { label: "Liên hệ", to: "#" },
] as const satisfies ReadonlyArray<NavItem>;

export const contacts = [
  { title: "Hotline", value: "1900 1234", Icon: Phone },
  { title: "Email", value: "hotro@vattunongnghiep.com", Icon: Mail },
  { title: "Địa chỉ", value: "123 Đường ABC, Quận 1, TP.HCM", Icon: MapPin },
] as const satisfies ReadonlyArray<ContactItem>;

// Filter options cho FilterBar - được quản lý tập trung
export const SORT_OPTIONS = [
  { value: "default", label: "Sắp xếp" },
  { value: "price-asc", label: "Giá tăng dần" },
  { value: "price-desc", label: "Giá giảm dần" },
  { value: "name-asc", label: "Tên A-Z" },
  { value: "name-desc", label: "Tên Z-A" },
  { value: "newest", label: "Mới nhất" },
  { value: "best-selling", label: "Bán chạy" },
] as const;

// Default avatar URL for users without avatar
export const DEFAULT_AVATAR_URL = 'https://scontent.fdli1-1.fna.fbcdn.net/v/t1.30497-1/453178253_471506465671661_2781666950760530985_n.png?stp=dst-png_s200x200&_nc_cat=1&ccb=1-7&_nc_sid=136b72&_nc_eui2=AeGjomZwrtpKFS_It5vgssVHWt9TLzuBU1Ba31MvO4FTUH8HsDUh8f0jRSVJ8DryajigzJAhMbjOaT_Bl3Z1OAiT&_nc_ohc=sf_Q6oMt5UwQ7kNvwFOer1g&_nc_oc=Adkk8j8wbRE7nmZ7THf-ztZ59dc8YnWaWcW_jO6TOlEh_vM5cBmcYf9DrI_jDRzBh39XWihMWhaCs38icJAIb9JN&_nc_zt=24&_nc_ht=scontent.fdli1-1.fna&oh=00_AfhEcECJmUa4XWltwLHNkveyQCEHqAo3dQomL3yqmyXPKA&oe=69322D3A';

export const BRAND_OPTIONS = [
  {
    value: "all",
    label: "Tất cả thương hiệu",
    logo: "https://cdn.tgdd.vn/Brand/11/vietcoco-05042021165111.jpg",
  },
  {
    value: "hao-hao",
    label: "Hảo Hảo",
    logo: "https://cdn.tgdd.vn/Brand/11/vietcoco-05042021165111.jpg",
  },
  {
    value: "3-mien",
    label: "3 Miền",
    logo: "https://cdn.tgdd.vn/Brand/11/simply-06052022122049.png",
  },
  {
    value: "gau-do",
    label: "Gấu Đỏ",
    logo: "https://cdn.tgdd.vn/Brand/11/simply-06052022122049.png",
  },
  {
    value: "omachi",
    label: "Omachi",
    logo: "https://cdn.tgdd.vn/Brand/11/vietcoco-05042021165111.jpg",
  },
  {
    value: "de-nhat",
    label: "ĐỆ NHẤT",
    logo: "https://cdn.tgdd.vn/Brand/11/kiddy-1010202211200.png",
  },
  {
    value: "acecook",
    label: "Acecook",
    logo: "https://cdn.tgdd.vn/Brand/11/vietcoco-05042021165111.jpg",
  },
  {
    value: "miliket",
    label: "Miliket",
    logo: "https://cdn.tgdd.vn/Brand/11/vietcoco-05042021165111.jpg",
  },
  {
    value: "vifon",
    label: "Vifon",
    logo: "https://cdn.tgdd.vn/Brand/11/vietcoco-05042021165111.jpg",
  },
] as const;

/**
 * Placeholder image cho sản phẩm chưa có ảnh
 */
export const PRODUCT_PLACEHOLDER_IMAGE =
  "https://media.istockphoto.com/id/1396814518/vector/image-coming-soon-no-photo-no-thumbnail-image-available-vector-illustration.jpg?s=612x612&w=0&k=20&c=hnh2OZgQGhf0b46-J2z7aHbIWwq8HNlSDaNp2wn_iko=";

/**
 * Helper function để lấy ảnh sản phẩm
 * Ưu tiên: image_primary > image_url > images[0] > placeholder
 * Kiểm tra cả null, undefined, string rỗng, mảng, và kiểu dữ liệu
 * 
 * LƯU Ý: Backend lưu image_primary là mảng [String] trong MongoDB schema,
 * nhưng có thể trả về dưới dạng string hoặc mảng tùy cách serialize
 */
export const getProductImage = (product: {
  image_primary?: string | string[] | null | unknown;
  image_url?: string | string[] | null | unknown;
  images?: string[] | null;
}): string => {
  // Kiểm tra image_primary: hỗ trợ cả string và mảng
  if (product.image_primary) {
    // Nếu là mảng, lấy phần tử đầu tiên
    if (Array.isArray(product.image_primary)) {
      const firstImage = product.image_primary[0];
      if (firstImage && typeof firstImage === 'string') {
        const trimmed = firstImage.trim();
        if (trimmed !== '') {
          return firstImage;
        }
      }
    }
    // Nếu là string
    else if (typeof product.image_primary === 'string') {
      const trimmed = product.image_primary.trim();
      if (trimmed !== '') {
        return product.image_primary;
      }
    }
  }

  // Kiểm tra image_url: hỗ trợ cả string và mảng
  if (product.image_url) {
    // Nếu là mảng, lấy phần tử đầu tiên
    if (Array.isArray(product.image_url)) {
      const firstImage = product.image_url[0];
      if (firstImage && typeof firstImage === 'string') {
        const trimmed = firstImage.trim();
        if (trimmed !== '') {
          return firstImage;
        }
      }
    }
    // Nếu là string
    else if (typeof product.image_url === 'string') {
      const trimmed = product.image_url.trim();
      if (trimmed !== '') {
        return product.image_url;
      }
    }
  }

  // Kiểm tra images array: chỉ chấp nhận string hợp lệ
  if (product.images && Array.isArray(product.images) && product.images.length > 0) {
    const firstImage = product.images[0];
    if (firstImage && typeof firstImage === 'string') {
      const trimmed = firstImage.trim();
      if (trimmed !== '') {
        return firstImage;
      }
    }
  }

  // Fallback về placeholder image (giống category)
  return PRODUCT_PLACEHOLDER_IMAGE;
};

/**
 * Helper function để lấy ID sản phẩm
 * Hỗ trợ cả _id (MongoDB) và id
 */
export const getProductId = (product: {
  _id?: string;
  id?: string | number;
}): string => {
  if (product._id) return product._id;
  if (product.id) return product.id.toString();
  return "";
};

/**
 * Helper function kiểm tra sản phẩm hết hàng
 */
export const isProductOutOfStock = (product: {
  stock_status?: string;
  quantity?: number;
}): boolean => {
  return product.stock_status === 'out_of_stock' || (product.quantity !== undefined && product.quantity === 0);
};

/**
 * Placeholder image cho category chưa có ảnh
 */
export const CATEGORY_PLACEHOLDER_IMAGE =
  "https://media.istockphoto.com/id/1396814518/vector/image-coming-soon-no-photo-no-thumbnail-image-available-vector-illustration.jpg?s=612x612&w=0&k=20&c=hnh2OZgQGhf0b46-J2z7aHbIWwq8HNlSDaNp2wn_iko=";

/**
 * Helper function để lấy ảnh category
 * Fallback sang placeholder nếu không có
 */
export const getCategoryImage = (category: {
  image?: string;
}): string => {
  return category.image || CATEGORY_PLACEHOLDER_IMAGE;
};

/**
 * Helper function để lấy ID category
 * Backend serialize _id thành id khi toJSON, nên ưu tiên id trước
 */
export const getCategoryId = (category: {
  _id?: string;
  id?: string;
}): string => {
  // Backend serialize _id thành id khi toJSON, nên ưu tiên id trước
  if (category.id) return category.id;
  if (category._id) return category._id;
  return "";
};

/**
 * Helper function chuyển đổi Category sang CategoryNav format
 * Dùng cho horizontal navigation bar
 */
export const toCategoryNav = (category: {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
  image?: string;
}) => {
  return {
    id: getCategoryId(category),
    name: category.name,
    slug: category.slug,
    image: getCategoryImage(category),
  };
};

/**
 * Helper function kiểm tra category là root (cấp 1)
 */
export const isRootCategory = (category: {
  parent_id?: string | null;
}): boolean => {
  return !category.parent_id || category.parent_id === null;
};

/**
 * Helper function build category hierarchy tree
 * Chuyển flat list thành tree structure (parent-children)
 * 
 * @param categories - Flat list of categories
 * @returns Categories with children nested
 */
export const buildCategoryTree = <T extends { _id?: string; id?: string; parent_id?: string | null }>(
  categories: T[]
): (T & { children: T[] })[] => {
  const categoryMap = new Map<string, T & { children: T[] }>();
  const rootCategories: (T & { children: T[] })[] = [];

  // Tạo map và thêm children array
  categories.forEach((cat) => {
    const id = getCategoryId(cat);
    categoryMap.set(id, { ...cat, children: [] });
  });

  // Build tree
  categories.forEach((cat) => {
    const id = getCategoryId(cat);
    const item = categoryMap.get(id);

    if (!item) return;

    if (isRootCategory(cat)) {
      // Category cấp 1 (root)
      rootCategories.push(item);
    } else if (cat.parent_id) {
      // Category cấp 2+ (children)
      const parent = categoryMap.get(cat.parent_id);
      if (parent) {
        parent.children.push(item);
      }
    }
  });

  return rootCategories;
};

/**
 * Helper function chuyển đổi subCategories từ BE sang children format
 * Backend trả về field "subCategories", Frontend dùng "children"
 */
export const normalizeCategories = (categories: any[]): any[] => {
  return categories.map(cat => ({
    ...cat,
    children: cat.subCategories || cat.children || [],
    // Xóa subCategories để tránh duplicate
    subCategories: undefined
  }));
};
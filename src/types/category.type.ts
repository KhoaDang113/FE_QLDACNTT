/**
 * Category Types - Khớp với Backend Schema
 * Backend: MongoDB Category schema
 */

// API Category type - Khớp với BE Response
export interface Category {
  _id: string; // MongoDB ObjectId (required for admin)
  id?: string; // Alias cho _id
  parent_id?: string | null; // Parent category ID (null = root category)
  name: string;
  slug: string;
  image?: string;
  description?: string;
  is_active: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;

  // Virtual fields (computed)
  children?: Category[]; // Subcategories (cấp 2, 3, ...)
  subCategories?: Category[]; // Alias for children (BE compatibility)

  level?: number; // Cấp độ: 1 (root), 2 (sub), 3 (sub-sub)
}

// CategoryNav type - Cho horizontal navigation bar
export interface CategoryNav {
  id: string;
  name: string;
  image: string;
  slug?: string;
  badge?: string;
  badgeColor?: string;
}

export interface CategoryNavProps {
  categories?: CategoryNav[];
  selectedCategoryId?: string;
  onCategorySelect?: (category: CategoryNav) => void;
  variant?: "home" | "product-page";
  showScrollButtons?: boolean;
}

// CategorySideBar type - Cho sidebar với subcategories
export interface SubCategory {
  name: string;
  slug: string; // Thay đổi từ href sang slug để khớp BE
  image?: string;
}

export interface CategorySideBar {
  name: string;
  slug: string; // Thay đổi từ href sang slug
  icon?: React.ReactNode;
  image?: string;
  subCategories?: SubCategory[];
}

/*
 * Helper type - Category with children (tree structure)
 */
export interface CategoryTree extends Category {
  children: CategoryTree[];
}

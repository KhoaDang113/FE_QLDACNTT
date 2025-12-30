// Brand Types
export interface Brand {
  _id: string;
  id?: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  is_active: boolean;
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CreateBrandDto {
  name: string;
  slug: string;
  description?: string;
  is_active?: boolean;
}

export interface UpdateBrandDto {
  name?: string;
  slug?: string;
  description?: string;
  is_active?: boolean;
}

export interface GetBrandsAdminResponse {
  total: number;
  page: number;
  limit: number;
  brands: Brand[];
}

// Frontend Brand interface (for UI state)
export interface BrandFormData {
  name: string;
  slug: string;
  description: string;
  image: string; // base64 or URL
  imageFile?: File; // actual file for upload
  isActive: boolean;
}

export interface BrandUI {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  isActive: boolean;
  isDeleted: boolean;
  createdAt: string;
}

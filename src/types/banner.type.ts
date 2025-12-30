// Banner type - Khớp với Backend Schema
export interface Banner {
  id?: string | number;
  _id?: string; // MongoDB _id
  name?: string;
  image_url: string;
  image?: string; // Backend field
  link_url: string;
  link?: string; // Backend field
  category_id?: string;
  is_active?: boolean;
  is_deleted?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// DTO for creating a new banner
export interface CreateBannerDto {
  image?: string;
  link: string;
  category_id?: string;
  is_active?: boolean;
}

// DTO for updating a banner
export interface UpdateBannerDto {
  image?: string;
  link?: string;
  category_id?: string;
  is_active?: boolean;
}

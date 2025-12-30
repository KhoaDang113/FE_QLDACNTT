import api from "../axiosConfig";
import type {
  Brand,
  CreateBrandDto,
  UpdateBrandDto,
  GetBrandsAdminResponse,
} from "@/types/brand.type";

/**
 * Convert base64 string to File object
 */
const base64ToFile = (base64: string, filename: string): File => {
  const arr = base64.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

// API Service
const brandService = {
  /**
   * Lấy danh sách thương hiệu cho admin (có phân trang và tìm kiếm)
   */
  getBrandsAdmin: async (
    page: number = 1,
    limit: number = 10,
    key?: string
  ): Promise<GetBrandsAdminResponse> => {
    const params: any = { page, limit };
    if (key) params.key = key;
    
    const response = await api.get("/brands/brands-admin", { params });
    return response.data;
  },

  /**
   * Lấy tất cả thương hiệu (public, không phân trang)
   */
  getAllBrands: async (): Promise<Brand[]> => {
    const response = await api.get("/brands");
    return response.data;
  },

  /**
   * Lấy thương hiệu theo ID
   */
  getBrandById: async (id: string): Promise<Brand> => {
    const response = await api.get(`/brands/${id}`);
    return response.data;
  },

  /**
   * Lấy thương hiệu theo slug
   */
  getBrandBySlug: async (slug: string): Promise<Brand> => {
    const response = await api.get(`/brands/slug/${slug}`);
    return response.data;
  },

  /**
   * Tạo thương hiệu mới
   */
  createBrand: async (
    data: CreateBrandDto,
    imageBase64?: string
  ): Promise<Brand> => {
    const formData = new FormData();

    formData.append("name", data.name);
    formData.append("slug", data.slug);

    if (data.description) {
      formData.append("description", data.description);
    }

    if (data.is_active !== undefined) {
      formData.append("is_active", data.is_active.toString());
    }

    // Convert base64 to File if provided
    if (imageBase64) {
      const imageFile = base64ToFile(
        imageBase64,
        `${data.slug}-${Date.now()}.png`
      );
      formData.append("image", imageFile);
    }

    const response = await api.post("/brands", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Cập nhật thương hiệu
   */
  updateBrand: async (
    id: string,
    data: UpdateBrandDto,
    imageBase64?: string
  ): Promise<Brand> => {
    const formData = new FormData();

    if (data.name) formData.append("name", data.name);
    if (data.slug) formData.append("slug", data.slug);
    if (data.description !== undefined) {
      formData.append("description", data.description);
    }
    if (data.is_active !== undefined) {
      formData.append("is_active", data.is_active.toString());
    }

    // Convert base64 to File if provided
    if (imageBase64 && imageBase64.startsWith("data:")) {
      const imageFile = base64ToFile(
        imageBase64,
        `${data.slug || "brand"}-${Date.now()}.png`
      );
      formData.append("image", imageFile);
    }

    const response = await api.put(`/brands/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  /**
   * Xóa thương hiệu (soft delete)
   */
  deleteBrand: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/brands/${id}`);
    return response.data;
  },
};

export default brandService;


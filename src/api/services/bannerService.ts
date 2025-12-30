import api from "../axiosConfig";
import type { Banner } from "../../types";

/**
 * Banner Service - Xử lý các API liên quan đến banners (khớp với NestJS backend)
 */
class BannerService {
  private readonly basePath = "/banners";

  /**
   * Transform banner từ backend format sang frontend format
   */
  private transformBanner(banner: any): Banner {
    // Đảm bảo banner có dữ liệu hợp lệ
    if (!banner) {
      return null as any;
    }

    const transformed: Banner = {
      id: banner._id || banner.id || "",
      _id: banner._id,
      name: banner.name || "",
      image_url: banner.image || banner.image_url || "",
      image: banner.image,
      link_url: banner.link || banner.link_url || "",
      link: banner.link,
      category_id: banner.category_id ? String(banner.category_id) : undefined,
    };

    // Validate: banner phải có ít nhất image_url hoặc image
    if (!transformed.image_url && !transformed.image) {
      console.warn("Banner missing image:", banner);
      return null as any;
    }

    return transformed;
  }

  /**
   * Lấy danh sách banners (có thể filter theo category)
   * GET /banners?category=slug
   */
  async getBanners(categorySlug?: string): Promise<Banner[]> {
    try {
      const url = categorySlug
        ? `${this.basePath}?category=${encodeURIComponent(categorySlug)}`
        : this.basePath;
      const response = await api.get<any[]>(url);
      // Transform data từ backend format sang frontend format
      const transformed = (response.data || [])
        .map((banner) => this.transformBanner(banner))
        .filter((banner) => banner !== null); // Lọc bỏ các banner không hợp lệ
      if (categorySlug && transformed.length === 0) {
        console.warn(
          `[BannerService] ⚠️ No banners found for category slug: "${categorySlug}"`
        );
        console.warn(`[BannerService] This might mean:`);
        console.warn(`  1. No banners exist in database for this category`);
        console.warn(
          `  2. Category slug "${categorySlug}" doesn't match any category in database`
        );
        console.warn(
          `  3. All banners for this category are inactive or deleted`
        );
      }

      return transformed;
    } catch (error: any) {
      console.error(
        `[BannerService] ❌ Error fetching banners for category "${categorySlug}":`,
        error
      );
      console.error(`[BannerService] Error details:`, {
        message: error?.message,
        response: error?.response?.data,
        status: error?.response?.status,
        url: error?.config?.url,
      });

      // Nếu là lỗi 404 (category not found), trả về mảng rỗng thay vì throw
      if (error?.response?.status === 404) {
        console.warn(
          `[BannerService] Category not found (404), returning empty array`
        );
        return [];
      }

      throw error;
    }
  }

  /**
   * Lấy tất cả banners
   * GET /banners
   */
  async getAllBanners(): Promise<Banner[]> {
    const response = await api.get<any[]>(this.basePath);
    // Transform data từ backend format sang frontend format
    return response.data.map((banner) => this.transformBanner(banner));
  }

  /**
   * Lấy banners cho một category cụ thể (dùng cho admin)
   * GET /banners?category=slug
   */
  async getBannersForCategory(categoryId: string): Promise<Banner[]> {
    try {
      const response = await api.get<any[]>(
        `${this.basePath}?category=${encodeURIComponent(categoryId)}`
      );
      return (response.data || [])
        .map((banner) => this.transformBanner(banner))
        .filter((banner) => banner !== null);
    } catch (error) {
      console.error("Error fetching banners for category:", error);
      return [];
    }
  }

  /**
   * Tạo banner mới (Admin)
   * POST /banners
   */
  async createBanner(formData: FormData): Promise<Banner> {
    const response = await api.post<any>(this.basePath, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return this.transformBanner(response.data);
  }

  /**
   * Cập nhật banner (Admin)
   * PUT /banners/:id
   */
  async updateBanner(id: string, formData: FormData): Promise<Banner> {
    const response = await api.put<any>(`${this.basePath}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return this.transformBanner(response.data);
  }

  /**
   * Xóa banner (Admin - soft delete)
   * DELETE /banners/:id
   */
  async deleteBanner(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }
}

export default new BannerService();

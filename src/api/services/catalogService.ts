import api from "../axiosConfig";
import type { Category } from "../../types/category.type";

/**
 * Category Service - Xử lý các API liên quan đến danh mục (khớp với NestJS backend)
 */
class CategoryService {
  private readonly basePath = "/categories";

  /**
   * Lấy danh sách danh mục cho admin (có pagination)
   * GET /categories/categories-admin?page=1&limit=10&key=search
   */
  async getCategoriesAdmin(
    page: number = 1,
    limit: number = 100,
    key?: string
  ): Promise<{
    total: number;
    page: number;
    limit: number;
    categories: Category[];
  }> {
    const response = await api.get<{
      total: number;
      page: number;
      limit: number;
      categories: Category[];
    }>(`${this.basePath}/categories-admin`, {
      params: { page, limit, key },
    });
    return response.data;
  }

  /**
   * Lấy tất cả danh mục
   * GET /categories
   */
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>(this.basePath);
    return response.data;
  }

  /**
   * Lấy danh mục gốc (root categories)
   * GET /categories/root
   */
  async getRootCategories(): Promise<Category[]> {
    const response = await api.get<Category[]>(`${this.basePath}/root`);
    return response.data;
  }

  /**
   * Lấy danh mục theo ID
   * GET /categories/:id
   */
  async getCategoryById(id: string): Promise<Category> {
    const response = await api.get<Category>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Lấy danh mục con (children)
   * GET /categories/:id/children
   */
  async getCategoryChildren(id: string): Promise<Category[]> {
    const response = await api.get<Category[]>(
      `${this.basePath}/${id}/children`
    );
    return response.data;
  }

  /**
   * Lấy danh mục theo slug
   * GET /categories/slug/:slug
   */
  async getCategoryBySlug(slug: string): Promise<Category> {
    const response = await api.get<Category>(`${this.basePath}/slug/${slug}`);
    return response.data;
  }

  /**
   * Kiểm tra slug đã tồn tại hay chưa
   * GET /categories/check-slug?slug=xxx&excludeId=xxx
   */
  async checkSlug(slug: string, excludeId?: string): Promise<boolean> {
    const response = await api.get<{ exists: boolean }>(
      `${this.basePath}/check-slug`,
      { params: { slug, excludeId } }
    );
    return response.data.exists;
  }

  /**
   * Xóa danh mục (soft delete)
   * DELETE /categories/:id
   */
  async deleteCategory(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  /**
   * Đếm số sản phẩm trong danh mục
   * GET /categories/:id/product-count
   */
  async getProductCount(id: string): Promise<{ count: number }> {
    const response = await api.get<{ count: number }>(
      `${this.basePath}/${id}/product-count`
    );
    return response.data;
  }

  /**
   * Xóa danh mục và tất cả sản phẩm trong đó
   * DELETE /categories/:id/with-products
   */
  async deleteCategoryWithProducts(id: string): Promise<{ message: string; deletedProductsCount: number }> {
    const response = await api.delete<{ message: string; deletedProductsCount: number }>(
      `${this.basePath}/${id}/with-products`
    );
    return response.data;
  }

  /**
   * Cập nhật danh mục với upload ảnh
   * PUT /categories/:id
   */
  async updateCategory(
    id: string,
    data: FormData | Partial<Category>
  ): Promise<Category> {
    const config = data instanceof FormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};

    const response = await api.put<Category>(`${this.basePath}/${id}`, data, config);
    return response.data;
  }

  /**
   * Tạo danh mục mới với upload ảnh
   * POST /categories
   */
  async createCategory(data: FormData | Partial<Category>): Promise<Category> {
    const config = data instanceof FormData
      ? { headers: { "Content-Type": "multipart/form-data" } }
      : {};

    const response = await api.post<Category>(this.basePath, data, config);
    return response.data;
  }
}

export default new CategoryService();

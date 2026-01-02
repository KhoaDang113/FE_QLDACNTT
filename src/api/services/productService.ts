import api from "../axiosConfig";
import type { Category, Product, Brand } from "../../types";

export interface SearchProductsParams {
  skip?: number;
  category?: string;
  brand?: string;
  sortOrder?: string;
}

export interface SearchProductsResponse {
  total: number;
  skip: number;
  actualLimit: number;
  products: Product[];
  categories: Category[];
  brands: Brand[];
}

/**
 * Product Service - Xử lý các API liên quan đến sản phẩm (khớp với NestJS backend)
 */
class ProductService {
  private readonly basePath = "/products";

  /**
   * Lấy danh sách sản phẩm (có thể filter theo category)
   * GET /products?category=slug&page=1&limit=10
   */
  async getProducts(
    categorySlug?: string,
    params?: Record<string, unknown>
  ): Promise<Product[]> {
    const response = await api.get<Product[]>(this.basePath, {
      params: {
        ...(categorySlug && { category: categorySlug }),
        ...params,
      },
    });
    return response.data;
  }

  async getProductsAdmin(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    total: number;
    page: number;
    limit: number;
    products: Product[];
  }> {
    const response = await api.get<{
      total: number;
      page: number;
      limit: number;
      products: Product[];
    }>(`${this.basePath}/products-admin`, {
      params: { page, limit },
    });
    return response.data;
  }

  /**
   * Lấy sản phẩm khuyến mãi (có thể filter theo category)
   * GET /products/promotions?category=slug
   */
  async getProductPromotions(
    categorySlug?: string,
    params?: { page?: number; limit?: number }
  ): Promise<Product[]> {
    const response = await api.get<Product[]>(`${this.basePath}/promotions`, {
      params: {
        ...(categorySlug && { category: categorySlug }),
        ...params,
      },
    });
    return response.data;
  }

  /**
   * Lấy chi tiết sản phẩm theo ID
   * GET /products/:id
   */
  async getProductById(id: string): Promise<Product> {
    const response = await api.get<Product>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Xóa sản phẩm (soft delete)
   * DELETE /products/:id
   */
  async deleteProduct(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  /**
   * Tạo sản phẩm mới với upload ảnh
   * POST /products
   */
  async createProduct(formData: FormData): Promise<Product> {
    const response = await api.post<Product>(`${this.basePath}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  /**
   * Cập nhật sản phẩm với upload ảnh
   * PUT /products/:id
   */
  async updateProduct(id: string, formData: FormData): Promise<Product> {
    const response = await api.put<Product>(`${this.basePath}/${id}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  /**
   * Cập nhật thông tin sản phẩm (không có ảnh)
   * PUT /products/:id
   */
  async updateProductData(id: string, data: Partial<Product>): Promise<Product> {
    const response = await api.put<Product>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  async getRelatedProducts(id: string, limit: number = 5): Promise<Product[]> {
    const response = await api.get<Product[]>(
      `${this.basePath}/${id}/related`,
      {
        params: { limit },
      }
    );
    return response.data;
  }

  async searchProducts(
    key: string,
    params?: SearchProductsParams
  ): Promise<SearchProductsResponse> {
    if (!key.trim()) {
      return {
        total: 0,
        skip: params?.skip ?? 0,
        actualLimit: 0,
        products: [],
        categories: [],
        brands: []
      };
    }

    const response = await api.get<{
      total: number;
      skip: number;
      actualLimit: number;
      products: Product[];
      categories: Category[];
      brands: Brand[]
    }>(`${this.basePath}/search`, {
      params: {
        key,
        ...params,
      },
    });

    return response.data;
  }

  /**
   * Lấy sản phẩm theo category với brands filter và sort
   * GET /products/category?category=slug&brand=slug1%20slug2&sortOrder=price-asc&skip=0
   */
  async getCategoryProducts(
    categorySlug: string,
    params?: {
      skip?: number;
      brand?: string;
      sortOrder?: string;
    }
  ): Promise<{
    total: number;
    skip: number;
    actualLimit: number;
    products: Product[];
    brands: Brand[];
  }> {
    const response = await api.get<{
      total: number;
      skip: number;
      actualLimit: number;
      products: Product[];
      brands: Brand[];
    }>(`${this.basePath}/category`, {
      params: {
        category: categorySlug,
        ...params,
      },
    });

    return response.data;
  }
}

export default new ProductService();

// updateProductImage: async (id: string, image: File) => {
//     const formData = new FormData();
//     formData.append("image", image);
//     const response = await api.put<{ message: string }>(
//       `${this.basePath}/${id}/image`,
//       formData
//     );
//     return response.data;
//   },

import api from "../axiosConfig";

/**
 * Rating Types - Khớp với Backend Schema
 */
export interface Rating {
  _id: string;
  product_id: string;
  user_id: {
    _id: string;
    name: string;
    avatar?: string;
    email?: string;
    role?: string;
  } | string;
  content: string;
  rating: number; // 1-5
  images: string[];
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;
}

export interface RatingResponse {
  ratings: Rating[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  summary?: {
    average_rating: number;
    total_ratings: number;
    rating_distribution: {
      1: number;
      2: number;
      3: number;
      4: number;
      5: number;
    };
  };
}

export interface CreateRatingRequest {
  product_id: string;
  rating: number; // 1-5
  content?: string;
}

export interface UpdateRatingRequest {
  rating?: number;
  content?: string;
}

/**
 * Rating Service - Xử lý các API liên quan đến đánh giá sản phẩm
 */
class RatingService {
  private readonly basePath = "/ratings";

  /**
   * Lấy danh sách ratings theo sản phẩm (Public)
   * GET /ratings/product?product_id=&page=&limit=
   */
  async getRatingsByProduct(
    productId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<RatingResponse> {
    const response = await api.get<RatingResponse>(`${this.basePath}/product`, {
      params: {
        product_id: productId,
        page,
        limit,
      },
    });
    return response.data;
  }

  /**
   * Lấy danh sách ratings của tôi (JWT required)
   * GET /ratings/my-ratings?page=&limit=
   */
  async getMyRatings(
    page: number = 1,
    limit: number = 10
  ): Promise<RatingResponse> {
    const response = await api.get<RatingResponse>(
      `${this.basePath}/my-ratings`,
      {
        params: {
          page,
          limit,
        },
      }
    );
    return response.data;
  }

  /**
   * Lấy chi tiết một rating (Public)
   * GET /ratings/:id
   */
  async getRatingById(ratingId: string): Promise<Rating> {
    const response = await api.get<Rating>(`${this.basePath}/${ratingId}`);
    return response.data;
  }

  /**
   * Tạo rating mới (JWT required)
   * POST /ratings
   * Multipart/form-data với images (max 5 files)
   */
  async createRating(
    data: CreateRatingRequest,
    imageFiles?: File[]
  ): Promise<Rating> {
    const formData = new FormData();
    
    formData.append("product_id", data.product_id);
    formData.append("rating", data.rating.toString());
    if (data.content) {
      formData.append("content", data.content);
    }

    // Append images (max 5)
    if (imageFiles && imageFiles.length > 0) {
      const maxImages = Math.min(imageFiles.length, 5);
      for (let i = 0; i < maxImages; i++) {
        formData.append("images", imageFiles[i]);
      }
    }

    const response = await api.post<Rating>(this.basePath, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  }

  /**
   * Cập nhật rating (JWT required)
   * PUT /ratings/:id
   * Multipart/form-data với images (max 5 files)
   */
  async updateRating(
    ratingId: string,
    data: UpdateRatingRequest,
    imageFiles?: File[]
  ): Promise<Rating> {
    const formData = new FormData();
    
    if (data.rating !== undefined) {
      formData.append("rating", data.rating.toString());
    }
    if (data.content !== undefined) {
      formData.append("content", data.content);
    }

    // Append images (max 5)
    if (imageFiles && imageFiles.length > 0) {
      const maxImages = Math.min(imageFiles.length, 5);
      for (let i = 0; i < maxImages; i++) {
        formData.append("images", imageFiles[i]);
      }
    }

    const response = await api.put<Rating>(
      `${this.basePath}/${ratingId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  /**
   * Xóa rating của tôi (JWT required)
   * DELETE /ratings/:id
   */
  async deleteRating(ratingId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `${this.basePath}/${ratingId}`
    );
    return response.data;
  }

  /**
   * Admin xóa rating bất kỳ (Admin only)
   * DELETE /ratings/admin/:id
   */
  async adminDeleteRating(ratingId: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `${this.basePath}/admin/${ratingId}`
    );
    return response.data;
  }

  /**
   * Tính toán rating distribution cho UI
   */
  calculateRatingDistribution(ratings: Rating[]): {
    average: number;
    total: number;
    distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
    percentages: { 1: number; 2: number; 3: number; 4: number; 5: number };
  } {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    ratings.forEach((rating) => {
      if (rating.rating >= 1 && rating.rating <= 5) {
        distribution[rating.rating as keyof typeof distribution]++;
        totalRating += rating.rating;
      }
    });

    const total = ratings.length;
    const average = total > 0 ? totalRating / total : 0;

    const percentages = {
      1: total > 0 ? (distribution[1] / total) * 100 : 0,
      2: total > 0 ? (distribution[2] / total) * 100 : 0,
      3: total > 0 ? (distribution[3] / total) * 100 : 0,
      4: total > 0 ? (distribution[4] / total) * 100 : 0,
      5: total > 0 ? (distribution[5] / total) * 100 : 0,
    };

    return {
      average,
      total,
      distribution,
      percentages,
    };
  }
}

export default new RatingService();


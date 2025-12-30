import api from "../axiosConfig";
import type { 
  OrderRating, 
  OrderRatingRaw,
  CreateOrderRatingDto,
  AdminResponseDto,
  RatingListResponse,
  RatingQueryParams
} from "@/types/order-rating.type";

class OrderRatingService {
  private readonly basePath = "/order-rating";

  // Map backend response to fix typo
  private mapRating(raw: OrderRatingRaw): OrderRating {
    return {
      ...raw,
      admin_response: raw.addmin_respone,
      admin_response_time: raw.addmin_respone_time,
    };
  }

  private mapRatings(raws: OrderRatingRaw[]): OrderRating[] {
    return raws.map(r => this.mapRating(r));
  }

  async createRating(data: FormData | CreateOrderRatingDto): Promise<OrderRating> {
    try {
      const response = await api.post<OrderRatingRaw>(this.basePath, data, {
        headers:
          data instanceof FormData
            ? { "Content-Type": "multipart/form-data" }
            : undefined,
      });
      return this.mapRating(response.data);
    } catch (error) {
      console.error("[OrderRatingService] Error creating rating:", error);
      throw error;
    }
  }

  /**
   * Admin: Get all ratings with pagination
   */
  async getAllRatings(params?: RatingQueryParams): Promise<RatingListResponse> {
    try {
      const response = await api.get<{
        data: OrderRatingRaw[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }>(this.basePath, { params });
      
      return {
        ...response.data,
        data: this.mapRatings(response.data.data),
      };
    } catch (error) {
      console.error("[OrderRatingService] Error fetching all ratings:", error);
      throw error;
    }
  }

  async getRatingById(ratingId: string): Promise<OrderRating> {
    try {
      const response = await api.get<OrderRatingRaw>(`${this.basePath}/${ratingId}`);
      return this.mapRating(response.data);
    } catch (error) {
      console.error(`[OrderRatingService] Error fetching rating ${ratingId}:`, error);
      throw error;
    }
  }

  async getRatingByOrderId(orderId: string): Promise<OrderRating | null> {
    try {
      const response = await api.get<OrderRatingRaw>(`${this.basePath}/order/${orderId}`);
      return this.mapRating(response.data);
    } catch (error: any) {
      if (error?.response?.status === 404) {
        return null;
      }
      console.error(`[OrderRatingService] Error fetching rating for order ${orderId}:`, error);
      throw error;
    }
  }

  async updateRating(
    ratingId: string,
    data: Partial<CreateOrderRatingDto>
  ): Promise<OrderRating> {
    try {
      const response = await api.patch<OrderRatingRaw>(
        `${this.basePath}/${ratingId}`,
        data
      );
      return this.mapRating(response.data);
    } catch (error) {
      console.error(`[OrderRatingService] Error updating rating ${ratingId}:`, error);
      throw error;
    }
  }

  /**
   * Admin: Respond to a rating
   */
  async adminResponse(ratingId: string, response: string): Promise<OrderRating> {
    try {
      const dto: AdminResponseDto = { admin_response: response };
      const res = await api.patch<OrderRatingRaw>(
        `${this.basePath}/${ratingId}/admin-response`,
        dto
      );
      return this.mapRating(res.data);
    } catch (error) {
      console.error(`[OrderRatingService] Error submitting admin response for ${ratingId}:`, error);
      throw error;
    }
  }
}

export default new OrderRatingService();

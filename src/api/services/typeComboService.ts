import api from "../axiosConfig";
import type {
  TypeCombo,
  CreateTypeComboRequest,
  UpdateTypeComboRequest,
  TypeComboListResponse,
} from "@/types/typeCombo.type";

/**
 * TypeCombo Service - Xử lý các API liên quan đến loại combo
 */
class TypeComboService {
  private readonly basePath = "/type-combos";

  /**
   * Lấy danh sách tất cả loại combo
   * GET /type-combos
   */
  async getTypeCombos(): Promise<TypeCombo[]> {
    const response = await api.get<TypeCombo[]>(this.basePath);
    return response.data;
  }

  /**
   * Lấy chi tiết loại combo theo ID
   * GET /type-combos/:id
   */
  async getTypeComboById(id: string): Promise<TypeCombo> {
    const response = await api.get<TypeCombo>(`${this.basePath}/${id}`);
    return response.data;
  }

  /**
   * Tạo loại combo mới (Admin)
   * POST /type-combos
   */
  async createTypeCombo(
    data: CreateTypeComboRequest
  ): Promise<{ message: string; data: TypeCombo }> {
    const response = await api.post<{ message: string; data: TypeCombo }>(
      this.basePath,
      data
    );
    return response.data;
  }

  /**
   * Cập nhật loại combo (Admin)
   * PUT /type-combos/:id
   */
  async updateTypeCombo(
    id: string,
    data: UpdateTypeComboRequest
  ): Promise<TypeCombo> {
    const response = await api.put<TypeCombo>(`${this.basePath}/${id}`, data);
    return response.data;
  }

  /**
   * Xóa loại combo (Admin)
   * DELETE /type-combos/:id
   */
  async deleteTypeCombo(id: string): Promise<{ message: string }> {
    const response = await api.delete<{ message: string }>(
      `${this.basePath}/${id}`
    );
    return response.data;
  }

  /**
   * Lấy danh sách loại combo cho admin (có phân trang)
   * GET /type-combos/type-combos-admin
   */
  async getTypeCombosAdmin(
    page: number = 1,
    limit: number = 10,
    key?: string
  ): Promise<TypeComboListResponse> {
    const response = await api.get<TypeComboListResponse>(
      `${this.basePath}/type-combos-admin`,
      {
        params: { page, limit, key },
      }
    );
    return response.data;
  }
}

export default new TypeComboService();

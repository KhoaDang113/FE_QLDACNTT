export interface TypeCombo {
  _id: string;
  name: string;
  slug: string;
  order_index: number;
  description: string;
  is_active: boolean;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTypeComboRequest {
  name: string;
  slug?: string;
  order_index?: number;
  description?: string;
  is_active?: boolean;
}

export interface UpdateTypeComboRequest {
  name?: string;
  slug?: string;
  order_index?: number;
  description?: string;
  is_active?: boolean;
}

export interface TypeComboListResponse {
  total: number;
  page: number;
  limit: number;
  typeCombos: TypeCombo[];
}

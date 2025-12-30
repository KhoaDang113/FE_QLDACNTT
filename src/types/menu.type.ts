export interface MenuCombo {
  _id: string; // MongoDB ObjectId
  id?: string; // Alias cho _id
  name: string;
  description: string;
  type?: string;
  image: string; // Tên field từ backend
  image_url?: string; // Alias cho image
  is_active: boolean; // true = đang bán, false = ngừng bán
  is_deleted?: boolean;
  created_at?: string;
  updated_at?: string;
  type_combo_id?: string; // ID của loại combo
  type_combo?: {
    _id: string;
    name: string;
    slug: string;
  };
}


export interface Ingredient {
  id: number;
  name: string;
  quantity: string;
  unit: string;
  price: number;
  image_url: string;
  available: boolean;
  product_id?: string; // ID sản phẩm từ database
  discount_percent?: number;
  unit_price?: number;
  stock_quantity?: number;
}

export interface MenuComboWithIngredients extends MenuCombo {
  ingredients?: Ingredient[];
  isLoadingIngredients?: boolean;
}

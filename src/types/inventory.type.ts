// Inventory Types
export interface InventoryTransaction {
  _id: string;
  product_id: string;
  type: "import" | "export" | "adjustment";
  quantity: number;
  quantity_before: number;
  quantity_after: number;
  order_id?: string | {
    _id: string;
    status: string;
    total: number;
  };
  created_by?: string | {
    _id: string;
    name: string;
    email: string;
  };
  note?: string;
  created_at: string;
  updated_at?: string;
}

export interface InventoryOperationDto {
  product_id: string;
  quantity: number;
  note?: string;
}

export interface AdjustInventoryDto {
  product_id: string;
  new_quantity: number;
  note?: string;
}

export interface ProductInventory {
  _id: string;
  name: string;
  quantity: number;
  stock_status: "in_stock" | "out_of_stock" | "preorder";
}

export interface InventoryOperationResponse {
  success: boolean;
  message: string;
  transaction: InventoryTransaction;
}

export interface ProductInventoryResponse {
  success: boolean;
  product: ProductInventory;
}

export interface InventoryHistoryResponse {
  success: boolean;
  history: InventoryTransaction[];
}


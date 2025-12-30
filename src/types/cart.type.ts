export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image: string
  unit: string
  stock: number // Số lượng tồn kho
  isOutOfStock?: boolean // Đánh dấu sản phẩm đã hết hàng
  original_price?: number // Giá gốc trước khi giảm
}


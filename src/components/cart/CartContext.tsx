import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { CartItem } from "@/types/cart.type"
import { useAuthStore } from "@/stores/authStore"
import { toast } from "sonner"
import productService from "@/api/services/productService"

interface CartContextType {
  cartItems: CartItem[]
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void
  updateQuantity: (id: string, quantity: number) => void
  removeItem: (id: string) => void
  clearCart: () => void
  markItemsAsOutOfStock: (productNames: string[]) => void // Đánh dấu sản phẩm hết hàng
  totalItems: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function CartProviderInner({ children }: { children: ReactNode }) {
  const { user } = useAuthStore()
  
  // Lấy cart key dựa trên userId
  const getCartKey = useCallback(() => {
    if (user?.id) {
      return `cart_${user.id}`
    }
    return "cart_guest" // Cart cho guest user
  }, [user?.id])

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    // Load từ localStorage khi khởi tạo
    if (typeof window !== "undefined") {
      const cartKey = user?.id ? `cart_${user.id}` : "cart_guest"
      const saved = localStorage.getItem(cartKey)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch {
          return []
        }
      }
    }
    return []
  })

  // Khi user thay đổi, clear cart cũ và load cart của user mới
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Clear cart ngay lập tức khi user thay đổi
      setCartItems([])
      
      // Sau đó load cart của user mới (nếu có)
      // Sử dụng user?.id trực tiếp để tránh race condition
      const currentUserId = user?.id
      const cartKey = currentUserId ? `cart_${currentUserId}` : "cart_guest"
      const saved = localStorage.getItem(cartKey)
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          // Chỉ load nếu có items và là array hợp lệ
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Double check user vẫn còn (tránh load cart của user khác)
            const checkUserId = user?.id
            const checkCartKey = checkUserId ? `cart_${checkUserId}` : "cart_guest"
            if (cartKey === checkCartKey) {
              setCartItems(parsed)
            }
          }
        } catch {
          setCartItems([])
        }
      }
    }
  }, [user?.id, getCartKey, user])

  // Sync stock từ server sau khi load cart từ localStorage
  useEffect(() => {
    const syncCartStock = async () => {
      if (cartItems.length === 0) return
      
      try {
        // Fetch stock cho tất cả items trong giỏ
        const updatedItems = await Promise.all(
          cartItems.map(async (item) => {
            try {
              const product = await productService.getProductById(item.id)
              const latestStock = product.quantity || product.stock_quantity || 0
              
              // Chỉ update nếu stock khác với cart hiện tại
              if (latestStock !== item.stock) {
                return { ...item, stock: latestStock }
              }
              return item
            } catch (err) {
              console.error(`Failed to sync stock for ${item.name}:`, err)
              return item // Giữ nguyên nếu fetch fail
            }
          })
        )
        
        // Update cart với stock mới
        const hasStockChange = updatedItems.some((item, idx) => item.stock !== cartItems[idx].stock)
        if (hasStockChange) {
          setCartItems(updatedItems)
        }
      } catch (err) {
        console.error('Failed to sync cart stock:', err)
      }
    }

    // Chỉ sync 1 lần khi cart load từ localStorage
    if (cartItems.length > 0) {
      syncCartStock()
    }
  }, []) // Empty dependency = chỉ chạy 1 lần khi mount

  // Lưu vào localStorage mỗi khi cart thay đổi
  useEffect(() => {
    if (typeof window !== "undefined") {
      const cartKey = getCartKey()
      // Không lưu isOutOfStock vào localStorage - sẽ tính động dựa trên stock
      const itemsToSave = cartItems.map(({ isOutOfStock, ...item }) => item)
      localStorage.setItem(cartKey, JSON.stringify(itemsToSave))
    }
  }, [cartItems, getCartKey])

  const addToCart = useCallback((item: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const addedQuantity = item.quantity || 1
    const itemId = item.id
    
    // Check current state before updating
    const existingItem = cartItems.find((i) => i.id === itemId)
    
    if (existingItem) {
      // Nếu đã có trong giỏ, tăng số lượng nhưng không vượt quá tồn kho
      const requestedQuantity = existingItem.quantity + addedQuantity
      const newQuantity = Math.min(requestedQuantity, existingItem.stock)
      
      if (requestedQuantity > existingItem.stock) {
        toast.warning(`${item.name} chỉ còn ${existingItem.stock} sản phẩm trong kho`, {
          duration: 4000,
        })
      } else {
        toast.success(`Đã thêm ${item.name} vào giỏ hàng`, {
          duration: 3000,
        })
      }
      
      setCartItems((prev) =>
        prev.map((i) =>
          i.id === itemId ? { ...i, quantity: newQuantity } : i
        )
      )
    } else {
      // Thêm mới vào giỏ, đảm bảo không vượt quá tồn kho
      const limitedQuantity = Math.min(addedQuantity, item.stock)
      
      if (addedQuantity > item.stock) {
        toast.warning(`${item.name} chỉ còn ${item.stock} sản phẩm trong kho`, {
          duration: 4000,
        })
      } else {
        toast.success(`Đã thêm ${item.name} vào giỏ hàng`, {
          duration: 3000,
        })
      }
      
      setCartItems((prev) => [...prev, { ...item, quantity: limitedQuantity }])
    }
  }, [cartItems])
  

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity < 1) return
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          // Kiểm tra không vượt quá số lượng tồn kho
          const newQuantity = Math.min(quantity, item.stock)
          
          if (quantity > item.stock) {
            toast.warning(`${item.name} chỉ còn ${item.stock} sản phẩm trong kho`, {
              duration: 4000,
            })
          }
          
          return { ...item, quantity: newQuantity }
        }
        return item
      })
    )
  }, [])

  const removeItem = useCallback((id: string) => {
    setCartItems((prev) => prev.filter((item) => item.id !== id))
  }, [])

  const clearCart = useCallback(() => {
    setCartItems([])
  }, [])

  // Đánh dấu sản phẩm hết hàng dựa trên tên
  const markItemsAsOutOfStock = useCallback((productNames: string[]) => {
    setCartItems((prev) =>
      prev.map((item) => {
        const isOutOfStock = productNames.some(
          (name) => item.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(item.name.toLowerCase())
        )
        if (isOutOfStock) {
          return { ...item, isOutOfStock: true, stock: 0 }
        }
        return item
      })
    )
  }, [])

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        markItemsAsOutOfStock,
        totalItems,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function CartProvider({ children }: { children: ReactNode }) {
  return <CartProviderInner>{children}</CartProviderInner>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}

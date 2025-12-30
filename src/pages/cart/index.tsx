"use client";

import EmptyCart from "@/components/cart/EmptyCart";
import CartWithItems from "@/components/cart/CartWithItems";
import { useCart } from "@/components/cart/CartContext";
import { useNavigate } from "react-router-dom";

export default function ShoppingCart() {
  const { cartItems, updateQuantity, removeItem, clearCart, markItemsAsOutOfStock } = useCart();
  const navigate = useNavigate();

  // Render theo trạng thái giỏ hàng
  return (
    <div className="min-h-screen bg-blue-50">
      {cartItems.length === 0 ? (
        <EmptyCart onContinueShopping={() => navigate("/")} />
      ) : (
        <CartWithItems
          items={cartItems}
          onUpdateQuantity={updateQuantity}
          onRemoveItem={removeItem}
          onClearCart={clearCart}
          onMarkItemsAsOutOfStock={markItemsAsOutOfStock}
        />
      )}
    </div>
  );
}

"use client"

import { useState } from "react"
import { ChevronLeft, X, Minus, Plus, Truck, Gift } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import type { CartItem } from "@/types/cart.type"
import CheckoutModal from "./CheckoutModal"
import { useOrders } from "@/hooks/useOrders"
import { PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants"

interface CartWithItemsProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number) => void
  onRemoveItem: (id: string) => void
  onClearCart: () => void
  onMarkItemsAsOutOfStock: (productNames: string[]) => void
}

export default function CartWithItems({ items, onUpdateQuantity, onRemoveItem, onClearCart, onMarkItemsAsOutOfStock }: CartWithItemsProps) {
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false)
  const { createOrder } = useOrders()

  // Tính toán động isOutOfStock dựa trên stock hiện tại (không dùng flag)
  const itemsWithStockStatus = items.map(item => ({
    ...item,
    isOutOfStock: item.stock === 0
  }))

  // Kiểm tra có sản phẩm hết hàng không
  const hasOutOfStockItems = itemsWithStockStatus.some(item => item.isOutOfStock)

  const subtotal = items.reduce((sum, item) => sum + (item.original_price || item.price) * item.quantity, 0)
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = total >= 300000 ? 0 : 15000
  const discount = subtotal - total
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " ₫"
  }
  const handleCheckout = () => {
    setIsCheckoutModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-1 py-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="mr-2 hover:bg-gray-100 p-2 rounded-full transition-all duration-200 hover:scale-105">
              <ChevronLeft className="w-3 h-3 text-gray-700" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Giỏ Hàng Của Bạn
              </h1>
              <p className="text-xs text-gray-500">{items.length} sản phẩm</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-1 py-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
              {/* Clear Cart Button - Top Section */}
              <div className="bg-gradient-to-r from-gray-50 to-white p-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  Danh Sách Sản Phẩm
                  <span className="bg-[#007E42] text-white text-xs px-2.5 py-1 rounded-full">{items.length}</span>
                </h2>
                <button
                  onClick={onClearCart}
                  className="group flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-all duration-200"
                >
                  <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
                  Xóa giỏ hàng
                </button>
              </div>

              {/* Cart Items List */}
              <div className="divide-y divide-gray-100">
                {itemsWithStockStatus.map((item, index) => {
                  const normalizedImage = typeof item.image === "string" ? item.image.trim() : ""
                  const imageSrc = normalizedImage !== "" ? normalizedImage : PRODUCT_PLACEHOLDER_IMAGE
                  return (
                    <div
                      key={item.id}
                      className={`p-4 flex gap-4 hover:bg-gradient-to-r hover:from-green-50/30 hover:to-transparent transition-all duration-300 group ${item.isOutOfStock ? 'opacity-60 bg-gray-100/50' : ''
                        }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      {/* Product Image */}
                      <div className="w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 shadow-md group-hover:shadow-xl transition-shadow duration-300 ring-2 ring-gray-100 group-hover:ring-[#007E42]/20">
                        <img
                          src={imageSrc}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-[#007E42] transition-colors">{item.name}</h3>
                            {item.isOutOfStock && (
                              <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-semibold">
                                Hết hàng
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{item.unit}</span>
                            <span className="text-xs text-gray-600">
                              Kho: <span className={`font-semibold ${item.stock <= 10 ? 'text-red-600' : 'text-green-600'}`}>{item.stock}</span>
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-start justify-between">
                          <div className="flex flex-col">
                            <p className="text-lg font-bold text-[#007E42]">
                              {formatPrice(item.price)}
                            </p>
                            {item.original_price && item.original_price > item.price && (
                              <p className="text-sm text-gray-400 line-through">
                                {formatPrice(item.original_price)}
                              </p>
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Tổng: <span className="font-semibold text-gray-700">{formatPrice(item.price * item.quantity)}</span>
                          </p>
                        </div>
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex flex-col items-end justify-between gap-2">
                        <button
                          onClick={() => onRemoveItem(item.id)}
                          className="text-gray-400 hover:text-white hover:bg-red-500 p-1.5 rounded-lg transition-all duration-200 hover:scale-110 hover:rotate-90"
                        >
                          <X className="w-4 h-4" />
                        </button>

                        <div className="flex items-center bg-gradient-to-r from-[#007E42]/10 to-[#00a855]/10 border-2 border-[#007E42] rounded-lg overflow-hidden shadow-md">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="flex items-center justify-center px-3 py-1.5 min-h-[36px] hover:bg-[#007E42] hover:text-white transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3.5 h-3.5 text-[#007E42] group-hover:text-white group-disabled:text-gray-400" />
                          </button>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={item.quantity}
                            onFocus={(e) => e.target.select()}
                            onChange={(e) => {
                              const val = e.target.value.replace(/[^0-9]/g, '');
                              if (val === '') {
                                onUpdateQuantity(item.id, 1);
                              } else {
                                const num = parseInt(val, 10);
                                if (num >= 1) {
                                  onUpdateQuantity(item.id, num);
                                }
                              }
                            }}
                            onBlur={(e) => {
                              const num = parseInt(e.target.value, 10);
                              if (isNaN(num) || num < 1) {
                                onUpdateQuantity(item.id, 1);
                              }
                            }}
                            className="w-12 py-1.5 text-sm font-bold text-gray-800 text-center bg-white min-h-[36px] border-0 focus:ring-0 focus:outline-none"
                          />
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="flex items-center justify-center px-3 py-1.5 min-h-[36px] hover:bg-[#007E42] hover:text-white transition-all duration-200 group"
                          >
                            <Plus className="w-3.5 h-3.5 text-[#007E42] group-hover:text-white" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-5 sticky top-24 self-start border border-gray-100 overflow-hidden">
              {/* Decorative gradient background */}
              <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-[#007E42]/5 to-transparent"></div>

              <div className="relative">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-[#007E42]" />
                  Tóm Tắt Đơn Hàng
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-sm text-gray-600">Tạm tính:</span>
                    <span className="font-semibold text-gray-800">{formatPrice(subtotal)}</span>
                  </div>
                  {/* <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Truck className="w-4 h-4" />
                      Phí vận chuyển
                    </span>
                    <span className={`font-semibold ${shippingFee === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                      {shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}
                    </span>
                  </div> */}
                  <div className="flex justify-between items-center p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <span className="text-sm text-gray-600 flex items-center gap-2">
                      <Gift className="w-4 h-4" />
                      Khuyến mại
                    </span>
                    <span className="font-semibold text-gray-800">{formatPrice(discount)}</span>
                  </div>

                  <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-2"></div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-[#007E42]/10 to-[#00a855]/10">
                    <span className="text-base font-bold text-gray-800">Thành tiền:</span>
                    <span className="text-xl font-bold bg-gradient-to-r from-[#007E42] to-[#00a855] bg-clip-text text-transparent">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-gray-500 mb-4 text-center bg-gray-50 py-1.5 rounded-lg">
                  (Giá đã bao gồm VAT)
                </p>

                {/* Checkout Button */}
                <Button
                  onClick={handleCheckout}
                  disabled={hasOutOfStockItems}
                  className={`w-full py-6 text-white rounded-2xl font-bold text-base shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden group ${hasOutOfStockItems
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-[#007E42] to-[#00a855] hover:from-[#005a2f] hover:to-[#007E42]'
                    }`}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></span>
                  <span className="relative flex flex-col items-center gap-0.5">
                    {hasOutOfStockItems ? (
                      <span className="text-sm tracking-wide">CÓ SẢN PHẨM HẾT HÀNG</span>
                    ) : (
                      <>
                        <span className="text-sm tracking-wide">ĐẶT HÀNG NGAY</span>
                        <span className="text-xs font-semibold opacity-90">{formatPrice(total)}</span>
                      </>
                    )}
                  </span>
                </Button>

                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Thanh toán an toàn & bảo mật</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={items}
        onCreateOrder={createOrder}
        onClearCart={onClearCart}
        onMarkItemsAsOutOfStock={onMarkItemsAsOutOfStock}
      />

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  )
}

"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Flame } from "lucide-react";
import { ProductModal } from "@/components/products/ProductModal";
import type { ProductCardProps, Product } from "@/types/product.type";
import { useNavigate } from "react-router-dom";
import {
  getProductImage,
  getProductId,
  isProductOutOfStock,
  PRODUCT_PLACEHOLDER_IMAGE,
} from "@/lib/constants";

export function HoriztionPromotion({ product, onAddToCart }: ProductCardProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState(false);
  const hasDiscount = product.discount_percent > 0;
  const isOutOfStock = isProductOutOfStock(product);
  const navigate = useNavigate();
  const productId = getProductId(product);

  // Lấy image URL, nếu bị lỗi thì dùng placeholder
  const imageUrl = imageError
    ? PRODUCT_PLACEHOLDER_IMAGE
    : getProductImage(product);
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleAddToCart = (product: Product, quantity: number) => {
    // Tạo một sản phẩm với số lượng đã chọn
    const productWithQuantity = { ...product, selectedQuantity: quantity };
    onAddToCart?.(productWithQuantity);
  };

  return (
    <>
      <div className="group relative flex h-full flex-col overflow-hidden rounded-lg bg-white transition-all hover:shadow-lg">
        {/* White Content Area */}
        <div className="flex h-full flex-row rounded-lg bg-white">
          {/* Product Image - Fixed Size */}
          <div
            className="relative w-32 h-32 flex-shrink-0 overflow-hidden cursor-pointer bg-gray-50 flex items-center justify-center"
            onClick={() => {
              if (productId) {
                navigate(`/products-detail/${productId}`);
              }
            }}
          >
            <img
              src={imageUrl}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => {
                // Khi ảnh load lỗi, fallback về placeholder
                setImageError(true);
              }}
            />
            {isOutOfStock && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <span className="rounded-md bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground">
                  Hết hàng
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col p-4 relative flex-1">
            {/* Badges Container */}
            <div className="absolute right-2 top-2 z-10 flex flex-col gap-1">
              {hasDiscount && product.discount_percent >= 15 && (
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg border-0 px-2.5 py-1 animate-pulse">
                  <Flame className="mr-1 h-3 w-3 animate-bounce" />
                  Hot
                </Badge>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col h-full">
              {/* Product Name - Fixed Height */}
              <h3 className="mb-1 text-sm font-semibold leading-tight text-gray-800 line-clamp-2 h-10 cursor-pointer hover:text-green-600 transition-colors"
                onClick={() => {
                  if (productId) {
                    navigate(`/products-detail/${productId}`);
                  }
                }}
              >
                {product.name}
              </h3>

              {/* Price Section - Fixed Height */}
              <div className="mb-2 flex flex-col gap-1 min-h-[3rem]">
                {/* Current Price with Unit */}
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-red-600 sm:text-xl">
                    {formatPrice(product.final_price || product.unit_price)}
                  </span>
                  {product.unit && (
                    <span className="text-xs font-medium text-gray-500">
                      /{product.unit}
                    </span>
                  )}
                </div>

                {/* Original Price and Discount */}
                {hasDiscount && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 line-through">
                      {formatPrice(product.unit_price)}
                      {product.unit && (
                        <span className="text-xs">/{product.unit}</span>
                      )}
                    </span>
                    <div className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
                      -{product.discount_percent}%
                    </div>
                  </div>
                )}

                {/* Stock Status */}
                {!isOutOfStock && product.quantity && product.quantity < 10 && (
                  <p className="text-xs text-orange-600 font-medium">
                    Chỉ còn {product.quantity} sản phẩm
                  </p>
                )}
              </div>

              {/* Add to Cart Button - Always at bottom */}
              <Button
                className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white hover:from-green-700 hover:to-green-600 shadow-md hover:shadow-lg transition-all duration-300 font-semibold rounded-full mt-auto"
                size="sm"
                disabled={isOutOfStock}
                onClick={() => setIsModalOpen(true)}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Modal - Rendered outside card */}
      <ProductModal
        product={product}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddToCart={handleAddToCart}
      />
    </>
  );
}

"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Flame } from "lucide-react";
import { ProductModal } from "../products/ProductModal";
import type { ProductCardProps, Product } from "@/types/product.type";
import {
  getProductImage,
  getProductId,
  isProductOutOfStock,
  PRODUCT_PLACEHOLDER_IMAGE,
} from "@/lib/constants";

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
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
    const productWithQuantity = { ...product, selectedQuantity: quantity };
    onAddToCart?.(productWithQuantity);
  };

  return (
    <>
      <div className="group relative flex flex-col rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:border-green-300 hover:shadow-2xl h-full">
        {/* Badges Container - Right side */}
        <div className="absolute right-2 top-2 z-10 flex flex-col gap-1.5">
          {hasDiscount && product.discount_percent >= 15 && (
            <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg border-0 px-2.5 py-1 animate-pulse">
              <Flame className="mr-1 h-3.5 w-3.5 animate-bounce" />
              Hot
            </Badge>
          )}
        </div>

        {/* Product Image - Aspect Square */}
        <div
          className="relative overflow-hidden cursor-pointer w-full aspect-square flex-shrink-0 bg-white rounded-t-xl"
          onClick={() => {
            if (productId) {
              navigate(`/products-detail/${productId}`);
            }
          }}
        >
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-4 rounded-t-xl transition-transform duration-500 group-hover:scale-110"
            onError={() => {
              setImageError(true);
            }}
          />
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm rounded-t-xl">
              <span className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg">
                Hết hàng
              </span>
            </div>
          )}
        </div>

        {/* Product Info - Fixed Height Bottom Section */}
        <div className="flex flex-col p-2.5 sm:p-3 flex-1">
          {/* Product Name - Fixed Height (2 lines) */}
          <h3
            className="mb-2 text-sm font-semibold leading-snug text-gray-800 line-clamp-2 h-10 cursor-pointer hover:text-green-600 transition-colors"
            onClick={() => {
              if (productId) {
                navigate(`/products-detail/${productId}`);
              }
            }}
          >
            {product.name}
          </h3>

          {/* Price Section - Fixed Height */}
          <div className="mb-2 flex flex-col gap-1 min-h-[3.5rem]">
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

            {/* Original Price with Discount Badge */}
            {hasDiscount && product.unit_price && product.final_price && product.unit_price > product.final_price && (
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

            {/* Stock Warning */}
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
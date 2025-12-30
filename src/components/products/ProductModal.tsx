"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Minus, Plus, X } from "lucide-react";
import type { Product } from "@/types/product.type";
import productService from "@/api/services/productService";
import { getProductImage, getProductId, PRODUCT_PLACEHOLDER_IMAGE } from "@/lib/constants";

interface ProductModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

export function ProductModal({
  product,
  isOpen,
  onClose,
  onAddToCart
}: ProductModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [relatedQuantities, setRelatedQuantities] = useState<Record<string, number>>({});
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loadingRelated, setLoadingRelated] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [relatedImageErrors, setRelatedImageErrors] = useState<Record<string, boolean>>({});
  const productImageRef = useRef<HTMLImageElement>(null);
  const productId = getProductId(product);

  // Load related products khi modal mở
  useEffect(() => {
    const loadRelatedProducts = async () => {
      if (!isOpen || !productId) return;

      try {
        setLoadingRelated(true);
        const related = await productService.getRelatedProducts(productId, 4);
        setRelatedProducts(related);
        setRelatedImageErrors({}); // Reset related image errors khi load lại
      } catch (error) {
        console.error("Error loading related products:", error);
        setRelatedProducts([]);
      } finally {
        setLoadingRelated(false);
      }
    };

    loadRelatedProducts();
  }, [isOpen, productId]);

  // Reset image errors khi modal đóng/mở hoặc product thay đổi
  useEffect(() => {
    if (isOpen) {
      setImageError(false);
      setRelatedImageErrors({});
    }
  }, [isOpen, productId]);

  if (!isOpen) return null;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const hasDiscount = product.discount_percent > 0;
  const maxQuantity = product.quantity || product.stock_quantity || 999;

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity >= 1 && newQuantity <= maxQuantity) {
      setQuantity(newQuantity);
    }
  };

  const createFlyingAnimation = (imageElement: HTMLElement | null, productImage: string) => {
    if (!imageElement) {
      console.warn('Image element not found for flying animation');
      return;
    }

    const imgRect = imageElement.getBoundingClientRect();
    const cartIcon = document.querySelector('[data-cart-icon]');

    if (!cartIcon) {
      console.warn('Cart icon not found with data-cart-icon attribute');
      // Thử tìm bằng cách khác nếu không tìm thấy
      const fallbackCart = document.querySelector('button[aria-label*="Giỏ hàng"]') ||
        document.querySelector('button[aria-label*="Cart"]');
      if (!fallbackCart) {
        console.error('Cannot find cart icon for animation');
        return;
      }
      const cartRect = fallbackCart.getBoundingClientRect();
      animateToCart(imageElement, imgRect, cartRect, productImage);
      return;
    }

    const cartRect = cartIcon.getBoundingClientRect();
    animateToCart(imageElement, imgRect, cartRect, productImage);
  };

  const animateToCart = (
    imageElement: HTMLElement,
    imgRect: DOMRect,
    cartRect: DOMRect,
    productImage: string
  ) => {
    // Tạo clone của hình ảnh
    const flyingImg = document.createElement('img');
    flyingImg.src = productImage;
    flyingImg.style.position = 'fixed';
    flyingImg.style.left = `${imgRect.left}px`;
    flyingImg.style.top = `${imgRect.top}px`;
    flyingImg.style.width = `${imgRect.width}px`;
    flyingImg.style.height = `${imgRect.height}px`;
    flyingImg.style.zIndex = '99999';
    flyingImg.style.transition = 'all 0.8s cubic-bezier(0.45, 0, 0.55, 1)';
    flyingImg.style.pointerEvents = 'none';
    flyingImg.style.objectFit = 'contain';
    flyingImg.style.borderRadius = '8px';
    flyingImg.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';

    document.body.appendChild(flyingImg);

    // Trigger animation sau một frame để CSS transition hoạt động
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        flyingImg.style.left = `${cartRect.left + cartRect.width / 2}px`;
        flyingImg.style.top = `${cartRect.top + cartRect.height / 2}px`;
        flyingImg.style.width = '0px';
        flyingImg.style.height = '0px';
        flyingImg.style.opacity = '0.5';
      });
    });

    // Xóa element sau khi animation xong
    setTimeout(() => {
      if (document.body.contains(flyingImg)) {
        document.body.removeChild(flyingImg);
      }
    }, 800);
  };

  const handleComplete = () => {
    // Tạo hiệu ứng bay vào giỏ hàng cho sản phẩm chính
    createFlyingAnimation(productImageRef.current, getProductImage(product));

    // Delay để animation sản phẩm chính diễn ra trước khi thêm sản phẩm
    setTimeout(() => {
      // Thêm sản phẩm chính vào giỏ hàng
      if (quantity > 0) {
        onAddToCart(product, quantity);
      }

      // Thêm các sản phẩm liên quan có số lượng > 0 vào giỏ hàng với hiệu ứng
      let delay = 200; // Delay giữa các animation
      Object.entries(relatedQuantities).forEach(([productId, qty]) => {
        if (qty > 0) {
          const relatedProduct = relatedProducts.find(p => getProductId(p) === productId);
          if (relatedProduct) {
            setTimeout(() => {
              // Tìm hình ảnh của sản phẩm liên quan
              const relatedImageElement = document.querySelector(`[data-related-product-image="${productId}"]`) as HTMLElement;
              if (relatedImageElement) {
                createFlyingAnimation(relatedImageElement, getProductImage(relatedProduct));
              }

              // Thêm sản phẩm vào giỏ hàng sau khi animation bắt đầu
              setTimeout(() => {
                onAddToCart(relatedProduct, qty);
              }, 400);
            }, delay);
            delay += 200; // Tăng delay cho sản phẩm tiếp theo
          }
        }
      });

      // Đóng modal sau khi tất cả animation hoàn thành
      setTimeout(() => {
        onClose();
        setQuantity(1);
        setRelatedQuantities({});
      }, delay + 800);
    }, 400);
  };

  const handleRelatedQuantityChange = (relatedProductId: string, newQuantity: number) => {
    const relatedProduct = relatedProducts.find(p => getProductId(p) === relatedProductId);
    if (relatedProduct && newQuantity >= 0 && newQuantity <= (relatedProduct.quantity || relatedProduct.stock_quantity || 0)) {
      setRelatedQuantities(prev => ({
        ...prev,
        [relatedProductId]: newQuantity
      }));
    }
  };

  const handleAddRelatedToCart = (relatedProduct: Product) => {
    const relatedProductId = getProductId(relatedProduct);
    let currentQuantity = relatedQuantities[relatedProductId] || 0;

    // Nếu quantity là 0, tự động set thành 1
    if (currentQuantity === 0) {
      currentQuantity = 1;
      setRelatedQuantities(prev => ({
        ...prev,
        [relatedProductId]: 1
      }));
    }

    const stockQuantity = relatedProduct.quantity || relatedProduct.stock_quantity || 0;
    if (currentQuantity > 0 && stockQuantity > 0) {
      // Tìm hình ảnh của sản phẩm liên quan để tạo hiệu ứng bay
      const relatedImageElement = document.querySelector(`[data-related-product-image="${relatedProductId}"]`) as HTMLElement;
      if (relatedImageElement) {
        createFlyingAnimation(relatedImageElement, getProductImage(relatedProduct));
      }

      // Thêm sản phẩm liên quan vào giỏ hàng sau khi animation bắt đầu
      setTimeout(() => {
        onAddToCart(relatedProduct, currentQuantity);

        // Reset quantity về 0 sau khi thêm vào giỏ
        setRelatedQuantities(prev => ({
          ...prev,
          [relatedProductId]: 0
        }));
      }, 400);
    }
  };


  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50">
      <div className="relative mx-0 sm:mx-4 w-full sm:max-w-3xl max-h-[90vh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-lg bg-white shadow-xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4 flex-shrink-0">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-1 pr-2">
            {product.name}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {/* Product Info */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6">
            {/* Product Image */}
            <div className="flex-shrink-0 flex justify-center sm:justify-start">
              <img
                ref={productImageRef}
                src={imageError ? PRODUCT_PLACEHOLDER_IMAGE : getProductImage(product)}
                alt={product.name}
                className="h-32 w-32 sm:h-32 sm:w-32 rounded-lg object-contain"
                onError={() => setImageError(true)}
              />
            </div>

            {/* Product Details */}
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-bold text-gray-900">
                {product.name}
              </h3>

              {/* Price Section */}
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-red-600">
                    {formatPrice(product.final_price || product.unit_price)}
                    {product.unit && (
                      <span className="text-base font-normal text-red-600">
                        /{product.unit}
                      </span>
                    )}
                  </span>

                  {hasDiscount && product.unit_price && product.final_price && product.unit_price > product.final_price && (
                    <>
                      <span className="text-base text-gray-400 line-through">
                        {formatPrice(product.unit_price)}
                        {product.unit && (
                          <span className="text-base">/{product.unit}</span>
                        )}
                      </span>
                      <Badge className="bg-red-600 text-white">
                        -{product.discount_percent}%
                      </Badge>
                    </>
                  )}
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  Còn {product.stock_quantity} suất
                </p>
              </div>

              {/* Quantity Selector */}
              <div className="mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-700">Số lượng:</span>
                  <div className="flex items-center gap-2 rounded-lg border">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity - 1)}
                      disabled={quantity <= 1}
                      className="h-7 w-7 p-0"
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={quantity}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) => {
                        const val = e.target.value.replace(/[^0-9]/g, '');
                        if (val === '') {
                          setQuantity(1);
                        } else {
                          const num = parseInt(val, 10);
                          if (num >= 1 && num <= maxQuantity) {
                            setQuantity(num);
                          } else if (num > maxQuantity) {
                            setQuantity(maxQuantity);
                          } else if (num < 1) {
                            setQuantity(1);
                          }
                        }
                      }}
                      onBlur={() => {
                        if (quantity < 1) setQuantity(1);
                        if (quantity > maxQuantity) setQuantity(maxQuantity);
                      }}
                      className="w-12 text-center font-medium text-sm border-0 focus:ring-0 focus:outline-none"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleQuantityChange(quantity + 1)}
                      disabled={quantity >= maxQuantity}
                      className="h-7 w-7 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products Section */}
          <div className="border-t bg-gray-50 p-4">
            <h3 className="mb-3 text-sm sm:text-base font-semibold text-gray-900">Sản phẩm liên quan</h3>

            {loadingRelated ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
              </div>
            ) : relatedProducts.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm">
                Không có sản phẩm liên quan
              </div>
            ) : (
              <div className="flex gap-2 overflow-x-auto overflow-y-hidden pb-2 scroll-smooth snap-x snap-mandatory" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'thin', msOverflowStyle: '-ms-autohiding-scrollbar' }}>
                {relatedProducts.map((relatedProduct) => {
                  const relatedProductId = getProductId(relatedProduct);
                  const currentQuantity = relatedQuantities[relatedProductId] || 0;
                  const stockQuantity = relatedProduct.quantity || relatedProduct.stock_quantity || 0;
                  const relatedImageUrl = getProductImage(relatedProduct);

                  return (
                    <div key={relatedProductId} className="bg-white rounded-lg shadow-sm border overflow-hidden flex-shrink-0 w-[150px] min-w-[150px] flex flex-col">
                      {/* Product Image */}
                      <div className="relative h-28 flex-shrink-0">
                        <img
                          data-related-product-image={relatedProductId}
                          src={relatedImageErrors[relatedProductId] ? PRODUCT_PLACEHOLDER_IMAGE : relatedImageUrl}
                          alt={relatedProduct.name}
                          className="w-full h-full object-contain bg-gray-50"
                          onError={() => {
                            setRelatedImageErrors(prev => ({ ...prev, [relatedProductId]: true }));
                          }}
                        />
                        {relatedProduct.discount_percent >= 15 && (
                          <Badge className="absolute top-1.5 left-1.5 bg-red-500 text-white text-xs px-1.5 py-0.5">
                            HOT
                          </Badge>
                        )}
                      </div>

                      {/* Product Info */}
                      <div className="p-2.5 flex flex-col flex-1">
                        <h4 className="text-xs font-medium text-green-600 mb-1.5 line-clamp-2 leading-snug min-h-[2.5rem]">
                          {relatedProduct.name}
                        </h4>

                        {/* Price */}
                        <div className="mb-2">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-bold text-red-600 leading-tight">
                              {formatPrice(relatedProduct.final_price || relatedProduct.unit_price)}
                            </span>
                            {relatedProduct.discount_percent > 0 && relatedProduct.unit_price && relatedProduct.final_price && relatedProduct.unit_price > relatedProduct.final_price && (
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-[10px] text-gray-400 line-through">
                                  {formatPrice(relatedProduct.unit_price)}
                                  {relatedProduct.unit && (
                                    <span className="text-[10px]">/{relatedProduct.unit}</span>
                                  )}
                                </span>
                                <Badge className="bg-red-600 text-white text-[10px] px-1 py-0.5 leading-tight">
                                  -{relatedProduct.discount_percent}%
                                </Badge>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Quantity Selector */}
                        <div className="mb-2">
                          <div className="mb-1">
                            <span className="text-[10px] text-gray-600 font-medium">Số lượng:</span>
                          </div>
                          <div className="flex items-center justify-center gap-1 rounded border border-gray-300 w-full">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRelatedQuantityChange(relatedProductId, currentQuantity - 1)}
                              disabled={currentQuantity <= 0}
                              className="h-5 w-5 p-0 min-w-[20px] hover:bg-gray-100"
                            >
                              <Minus className="h-2.5 w-2.5" />
                            </Button>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={currentQuantity}
                              onFocus={(e) => e.target.select()}
                              onChange={(e) => {
                                const val = e.target.value.replace(/[^0-9]/g, '');
                                if (val === '') {
                                  handleRelatedQuantityChange(relatedProductId, 0);
                                } else {
                                  const num = parseInt(val, 10);
                                  if (num >= 0) {
                                    handleRelatedQuantityChange(relatedProductId, num);
                                  }
                                }
                              }}
                              className="w-8 text-center text-xs font-medium border-0 focus:ring-0 focus:outline-none px-0"
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRelatedQuantityChange(relatedProductId, currentQuantity + 1)}
                              className="h-5 w-5 p-0 min-w-[20px] hover:bg-gray-100"
                            >
                              <Plus className="h-2.5 w-2.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Add to Cart Button */}
                        <Button
                          onClick={() => handleAddRelatedToCart(relatedProduct)}
                          disabled={stockQuantity === 0}
                          className="w-full bg-green-600 text-white hover:bg-green-700 text-xs py-1.5 px-2 h-auto font-medium disabled:bg-gray-400 leading-tight mt-auto"
                          size="sm"
                        >
                          <ShoppingCart className="mr-1 h-3 w-3" />
                          {stockQuantity === 0 ? "Hết hàng" : "Thêm vào giỏ"}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex-shrink-0">
          <Button
            onClick={handleComplete}
            className="w-full bg-green-600 text-white hover:bg-green-700"
            size="lg"
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            HOÀN TẤT
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

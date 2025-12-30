import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Flame, Package } from "lucide-react";
import type { Product } from "@/types";

interface ProductGridViewProps {
  products: Product[];
  onDeleteProduct: (id: string) => void;
}

export function ProductGridView({ products, onDeleteProduct }: ProductGridViewProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  if (products.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">
          Chưa có sản phẩm nào trong danh mục này
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Hãy thêm sản phẩm mới vào danh mục này
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {products.map((product, index) => {
        const hasDiscount = product.discount_percent > 0;
        const isOutOfStock = (product.quantity || 0) === 0;

        return (
          <div
            key={product._id}
            style={{ animationDelay: `${index * 30}ms` }}
            className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:border-green-300 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-2"
          >
            {/* Badges Container */}
            <div className="absolute left-2 top-2 z-10 flex flex-col gap-1.5">
              {product.is_hot && (
                <Badge className="bg-gradient-to-r from-red-500 to-orange-500 text-white shadow-lg border-0 px-2.5 py-1 animate-pulse">
                  <Flame className="mr-1 h-3.5 w-3.5 animate-bounce" />
                  Hot
                </Badge>
              )}
            </div>

            {/* PHẦN 1: Product Image - Chiều cao cố định */}
            <div className="relative overflow-hidden h-48 flex-shrink-0">
              <img
                src={
                  product.image_primary ||
                  product.image_url ||
                  "/placeholder.svg"
                }
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <span className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg">
                    Hết hàng
                  </span>
                </div>
              )}
            </div>

            {/* PHẦN 2: Product Info - Có thể co giãn */}
            <div className="flex flex-col flex-1 p-2.5 sm:p-3">
              {/* Product Name */}
              <h3 className="mb-2 text-sm font-semibold leading-snug text-gray-800 line-clamp-2 min-h-[2.5rem] transition-colors">
                {product.name}
              </h3>

              {/* Price Section */}
              <div className="mb-2 flex flex-col gap-1">
                {/* Current Price with Unit */}
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-bold text-red-600 sm:text-xl">
                    {formatPrice(product.final_price)}
                  </span>
                  {product.unit && (
                    <span className="text-xs font-medium text-gray-500">
                      /{product.unit}
                    </span>
                  )}
                </div>

                {/* Original Price with Discount Badge */}
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

                {/* Stock Warning */}
                {!isOutOfStock && (product.quantity || 0) < 10 && (
                  <p className="text-xs text-orange-600 font-medium">
                    Chỉ còn {product.quantity} sản phẩm
                  </p>
                )}
              </div>

              {/* PHẦN 3: Action Buttons - Luôn dính đáy với margin-top: auto */}
              <div className="flex gap-2 mt-auto">
                <Link
                  to={`/admin/products/edit/${product._id}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 border-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Sửa
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
                  onClick={() => onDeleteProduct(product._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}


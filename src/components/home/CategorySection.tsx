import { Link } from "react-router-dom";
import { ProductCard } from "@/components/products/ProductCard";
import Banners from "@/components/productPage/banner/Banners";
import type { Product } from "@/types/product.type";
import type { Banner } from "@/types/banner.type";

interface CategorySectionProps {
  categoryName: string;
  categorySlug?: string; // Thêm categorySlug để dùng trong link
  products: Product[];
  banners?: Banner[];
  onAddToCart?: (product: Product) => void;
}

export default function CategorySection({
  categoryName,
  categorySlug,
  products,
  banners,
  onAddToCart,
}: CategorySectionProps) {
  return (
    <div className="mb-2">
      {/* Container with border frame */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Category Header - With curved bottom border */}
        <div className="relative bg-gradient-to-r from-green-50 to-white py-4 sm:py-5 border-b-2 border-green-100">
          <div className="flex justify-center">
            <div className="inline-flex items-center justify-center rounded-full bg-white border-2 border-green-600 px-8 sm:px-12 py-2.5 sm:py-3.5 shadow-md">
              <h2 className="text-base sm:text-xl font-bold text-green-700 text-center uppercase tracking-wide">
                {categoryName}
              </h2>
            </div>
          </div>
        </div>

        {/* Products Grid - Inside the frame */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-0">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.slice(0, 5).map((product, index) => (
              <div
                key={product.id || product._id}
                className={`h-full ${index === 4 ? "hidden xl:block" : ""}`}
              >
                <ProductCard
                  product={product}
                  onAddToCart={onAddToCart}
                />
              </div>
            ))}
          </div>
        </div>

        {/* View More Link - Inside frame at bottom, sát bên dưới sản phẩm */}
        {/* Luôn hiển thị nút "Xem thêm" nếu có categorySlug */}
        {categorySlug && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-3 sm:pt-4 bg-gray-50 border-t border-gray-100 flex justify-center">
            <Link
              to={`/products?category=${categorySlug}`}
              className="inline-flex items-center text-gray-700 hover:text-green-700 font-semibold text-sm sm:text-base transition-colors duration-200 group"
            >
              <span>Xem thêm {categoryName}</span>
              <svg
                className="ml-1.5 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* Banner Section - Outside the frame */}
      {banners && banners.length > 0 && (
        <div className="mt-1">
          <Banners banners={banners} />
        </div>
      )}
    </div>
  );
}


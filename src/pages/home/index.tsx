import { useState, useEffect } from "react";
import { CategoryNav } from "@/components/category/CategoryNav";
import MainBanner from "@/components/home/MainBanner";
import CategoryProductsSection from "@/components/category/CategoryProductsSection";
import { useCart } from "@/components/cart/CartContext";
import { categoryService, bannerService } from "@/api";
import { getProductId, getProductImage } from "@/lib/constants";
import type { Product } from "@/types";
import type { Banner } from "@/types/banner.type";

interface Category {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
}

export default function HomePage() {
  const { addToCart } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);
  const [mainBanners, setMainBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const categoriesData = await categoryService.getRootCategories();
        setCategories(categoriesData);

        try {
          const banners = await bannerService.getBanners();
          setMainBanners(banners);
        } catch (error) {
          console.error("Error fetching main banners:", error);
          setMainBanners([]);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddToCart = (
    product: Product & { selectedQuantity?: number }
  ) => {
    addToCart({
      id: getProductId(product),
      name: product.name,
      price: product.final_price || product.unit_price,
      image: getProductImage(product),
      unit: product.unit || "1 sản phẩm",
      stock: product.quantity || product.stock_quantity || 0,
      quantity: product.selectedQuantity || 1,
      original_price: product.unit_price,
    });

  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 w-full flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 w-full">
      <div className="w-full">
        <div className="w-full bg-white overflow-hidden mb-1">
          <CategoryNav />
        </div>
      </div>

      <div className="w-full">
        <MainBanner banners={mainBanners} />

        <div className="space-y-1 sm:space-y-2">
          {categories.map((category) => (
            <CategoryProductsSection
              key={category._id || category.id}
              title={category.name}
              categorySlug={category.slug}
              onAddToCart={handleAddToCart}
            />
          ))}

          {categories.length === 0 && (
            <div className="bg-white rounded-lg p-8 text-center">
              <p className="text-gray-500">
                Chưa có danh mục sản phẩm. Vui lòng thêm danh mục trong trang quản trị.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// {categories.length === 0 && (
//             <div className="bg-white rounded-lg p-8 text-center">
//               <p className="text-gray-500">
//                 Chưa có danh mục sản phẩm. Vui lòng thêm danh mục trong trang quản trị.
//               </p>
//             </div>
//           )}
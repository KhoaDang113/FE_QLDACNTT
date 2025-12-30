"use client";

import { useRef, useState, useEffect } from "react";
import { Link } from "react-router-dom";
import CategoryProductsSection from "@/components/category/CategoryProductsSection";
import { useCart } from "@/components/cart/CartContext";
import { categoryService } from "@/api";
import type { Product } from "@/types/product.type";
import type { Category } from "@/types/category.type";
import { ChevronLeft } from "lucide-react";
import ScrollButton from "@/components/scroll/ScrollButton";
import { getProductId, getProductImage, CATEGORY_PLACEHOLDER_IMAGE } from "@/lib/constants";

export default function KhuyenMaiPage() {
  const { addToCart } = useCart();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [promotionCategories, setPromotionCategories] = useState<Category[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await categoryService.getRootCategories();
        setPromotionCategories(data);
      } catch (e) {
        console.error("Error fetching categories for promotion page", e);
        setPromotionCategories([]);
      }
    })();
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
    });

    // TODO: Hiển thị thông báo đã thêm vào giỏ hàng
  };

  const handleCategoryClick = (categoryId: string | undefined) => {
    if (!categoryId) return;
    const section = sectionRefs.current[categoryId];
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftButton(scrollLeft > 1);
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 1;
      setShowRightButton(!isAtEnd);
    }
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -400 : 400;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();
    window.addEventListener("resize", checkScroll);
    container.addEventListener("scroll", checkScroll);

    const handleWheel = (e: WheelEvent) => {
      if (isMouseOver) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };

    container.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      window.removeEventListener("resize", checkScroll);
      container.removeEventListener("scroll", checkScroll);
      container.removeEventListener("wheel", handleWheel);
    };
  }, [isMouseOver]);

  return (
    <div className="min-h-screen bg-blue-50 w-full">
      {/* Page Header */}
      <div className="bg-white border-b mb-3 w-full">
        <div className="w-full px-3 sm:px-4 py-4 flex items-center">
          <Link to="/" className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors">
            <ChevronLeft className="w-3 h-3" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            Khuyến Mãi Sốc
          </h1>
        </div>
      </div>

      {/* Container chung với spacing đều nhau - Full width */}
      <div className="w-full">
        <div className="space-y-1 sm:space-y-2 w-full">
          {/* Thanh danh mục ngang */}
          <div className="w-full bg-white overflow-hidden">
            <div
              className="w-full bg-background relative group/container"
              onMouseEnter={() => setIsMouseOver(true)}
              onMouseLeave={() => setIsMouseOver(false)}
            >
              {/* Scroll buttons */}
              <div className="opacity-0 group-hover/container:opacity-100 transition-opacity">
                {showLeftButton && (
                  <ScrollButton direction="left" onClick={() => scroll("left")} />
                )}
                {showRightButton && (
                  <ScrollButton direction="right" onClick={() => scroll("right")} />
                )}
              </div>

              <div
                ref={scrollContainerRef}
                className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                <div className="flex p-1 gap-4">
                  {promotionCategories.map((category) => (
                    <div key={category._id || category.id} className="flex items-center flex-shrink-0">
                      <button
                        onClick={() => handleCategoryClick(category.slug || category._id || category.id)}
                        className="flex flex-col items-center gap-2 min-w-[80px] max-w-[80px] group"
                      >
                        <div className="relative">
                          <div className="w-16 h-16 rounded-lg overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                            <img
                              src={category.image || CATEGORY_PLACEHOLDER_IMAGE}
                              alt={category.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        </div>
                        <span className="text-xs text-center leading-tight max-w-[80px] truncate text-foreground">
                          {category.name}
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Category Sections with Products - Banners được hiển thị trên mỗi section */}
          {promotionCategories.map((category) => {
            const sectionId = category.slug || category._id || category.id;
            return (
              <div
                key={sectionId}
                ref={(el) => {
                  if (sectionId) {
                    sectionRefs.current[sectionId] = el;
                  }
                }}
                id={sectionId}
                className="w-full [&>div]:mb-0"
              >
                <CategoryProductsSection
                  title={category.name}
                  categorySlug={category.slug}
                  isPromotion
                  onAddToCart={handleAddToCart}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

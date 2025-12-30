"use client";

import { useRef, useState, useEffect } from "react";
import ScrollButton from "@/components/scroll/ScrollButton";
import { useNavigate } from "react-router-dom";
import type { CategoryNav as Category, CategoryNavProps } from "@/types/category.type";
import { categoryService } from "@/api";
import { toCategoryNav, getCategoryImage } from "@/lib/constants";

export function CategoryNav({
  categories: propCategories,
  selectedCategoryId,
  onCategorySelect,
  variant = "home",
  showScrollButtons = true,
}: CategoryNavProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [categories, setCategories] = useState<Category[]>(propCategories || []);
  const [loading, setLoading] = useState(!propCategories);
  const navigate = useNavigate();

  // Update categories khi propCategories thay đổi
  useEffect(() => {
    if (propCategories) {
      setCategories(propCategories);
      setLoading(false);
    } else {
      // Chỉ fetch từ API nếu không có propCategories
      const fetchCategories = async () => {
        try {
          setLoading(true);
          // Lấy root categories (cấp 1) từ API
          const data = await categoryService.getRootCategories();

          // Convert sang CategoryNav format
          const navCategories = data.map(toCategoryNav);
          setCategories(navCategories);
        } catch (error) {
          console.error("Error fetching categories:", error);
          // Không có fallback data - hiển thị empty state
          setCategories([]);
        } finally {
          setLoading(false);
        }
      };

      fetchCategories();
    }
  }, [propCategories]);

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

  const handleCategoryClick = (category: Category) => {
    onCategorySelect?.(category);
    // Dùng slug thay vì id để SEO friendly
    navigate(`/products?category=${category.slug || category.id}`);
  };

  const handlePromotionClick = () => {
    navigate("/khuyen-mai");
  };

  const getContainerStyles = () => {
    switch (variant) {
      case "product-page":
        return "w-full bg-background";
      case "home":
      default:
        return "w-full bg-background";
    }
  };

  const getItemStyles = (category: Category) => {
    // So sánh với slug hoặc id để hỗ trợ cả 2 cách
    const isSelected = selectedCategoryId === category.slug || selectedCategoryId === category.id;

    switch (variant) {
      case "product-page":
        return `
          flex flex-col items-center gap-2 min-w-[80px] group
          ${isSelected ? "ring-1 ring-green-500 ring-offset-1 rounded-lg" : ""}
        `;
      case "home":
      default:
        return "flex flex-col items-center gap-2 min-w-[80px] group";
    }
  };

  const getImageStyles = () => {
    switch (variant) {
      case "product-page":
        return "relative";
      case "home":
      default:
        return "relative";
    }
  };

  const getImageContainerStyles = () => {
    switch (variant) {
      case "product-page":
        return "w-16 h-16 rounded-lg overflow-hidden transition-transform group-hover:scale-105";
      case "home":
      default:
        return "w-16 h-16 rounded-lg overflow-hidden transition-transform group-hover:scale-105";
    }
  };

  const getTextStyles = (category: Category) => {
    // So sánh với slug hoặc id để hỗ trợ cả 2 cách
    const isSelected = selectedCategoryId === category.slug || selectedCategoryId === category.id;

    switch (variant) {
      case "product-page":
        return `text-xs text-center leading-tight max-w-[80px] truncate ${isSelected ? "text-green-600 font-semibold" : "text-foreground"
          }`;
      case "home":
      default:
        return "text-xs text-center leading-tight max-w-[80px] truncate text-foreground";
    }
  };

  const getGapStyles = () => {
    switch (variant) {
      case "product-page":
        return "gap-4";
      case "home":
      default:
        return "gap-4";
    }
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className={`${getContainerStyles()} relative`}>
        <div className="w-full overflow-x-hidden">
          <div className="flex p-1 gap-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-2 min-w-[80px]">
                <div className="w-16 h-16 rounded-lg bg-gray-200 animate-pulse" />
                <div className="w-16 h-3 bg-gray-200 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${getContainerStyles()} relative group/container`}
      onMouseEnter={() => setIsMouseOver(true)}
      onMouseLeave={() => setIsMouseOver(false)}
    >
      {/* Scroll buttons - hiển thị cho cả home và product-page */}
      {showScrollButtons && (
        <div className="opacity-0 group-hover/container:opacity-100 transition-opacity">
          {showLeftButton && (
            <ScrollButton direction="left" onClick={() => scroll("left")} />
          )}
          {showRightButton && (
            <ScrollButton direction="right" onClick={() => scroll("right")} />
          )}
        </div>
      )}

      <div
        ref={scrollContainerRef}
        className="w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <div className={`flex p-1 ${getGapStyles()}`}>
          {/* Nút KHUYẾN MÃI SỐC riêng */}
          <div className="flex items-center">
            <button
              onClick={handlePromotionClick}
              className="flex flex-col items-center gap-2 min-w-[80px] group"
            >
              <div className="relative">
                <div className="w-16 h-16 rounded-lg overflow-hidden transition-transform group-hover:scale-105 bg-gray-100">
                  <img
                    src="https://cdnv2.tgdd.vn/bhx-static/bhx/menuheader/flash-sale_202509181309465062.gif"
                    alt="KHUYẾN MÃI SỐC"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <span className="text-xs text-center leading-tight max-w-[80px] truncate text-red-600">
                KHUYẾN MÃI SỐC
              </span>
            </button>
          </div>

          {/* Các category khác */}
          {categories.map((category) => (
            <div key={category.id} className="flex items-center">
              <button
                onClick={() => handleCategoryClick(category)}
                className={getItemStyles(category)}
              >
                <div className={getImageStyles()}>
                  <div className={`${getImageContainerStyles()} bg-gray-100`}>
                    <img
                      src={getCategoryImage(category)}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Badge - chỉ hiển thị ở variant home */}
                  {variant === "home" && category.badge && (
                    <div
                      className={`absolute -top-1 -right-1 ${category.badgeColor} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md whitespace-nowrap`}
                    >
                      {category.badge}
                    </div>
                  )}
                </div>

                <span className={getTextStyles(category)}>{category.name}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CategoryNav;

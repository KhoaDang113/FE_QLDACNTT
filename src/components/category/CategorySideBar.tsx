"use client";

import { useState, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import type { Category } from "@/types/category.type";
import { categoryService } from "@/api";
import { getCategoryImage } from "@/lib/constants";

export function CategorySidebar({
  isMobile = false,
  onClose,
}: {
  isMobile?: boolean;
  onClose?: () => void;
}) {
  // Thay đổi state từ mảng string[] sang string | null để chỉ giữ 1 category được mở
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<(Category & { children: Category[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch categories từ API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        // Lấy tất cả categories từ BE (đã có subCategories nested)
        const allCategories = await categoryService.getAllCategories();

        // Backend đã trả về nested structure với subCategories
        // Chỉ cần chuyển subCategories -> children
        const normalizedCategories = allCategories.map((cat: Category & { subCategories?: Category[] }) => ({
          ...cat,
          children: cat.subCategories || [],
        }));

        setCategories(normalizedCategories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        // Không có fallback data - hiển thị empty state
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const toggleCategory = (categoryName: string) => {
    setExpandedCategory((prev) => (prev === categoryName ? null : categoryName));
  };

  const handleCategoryClick = (category: Category & { children?: Category[] }) => {
    // Nếu có children (subcategories) thì toggle, không thì navigate
    if (category.children && category.children.length > 0) {
      // Trên mobile: luôn set category được click làm active
      if (isMobile) {
        setExpandedCategory(category.name);
      } else {
        // Desktop: toggle (mở cái mới sẽ tự đóng cái cũ do logic của setExpandedCategory)
        toggleCategory(category.name);
      }
    } else {
      // Navigate tới products page với slug
      navigate(`/products?category=${category.slug}`);
      if (isMobile) {
        onClose?.();
      }
    }
  };

  const handlePromotionClick = () => {
    navigate("/khuyen-mai");
    if (isMobile) {
      onClose?.();
    }
  };

  const handleSubCategoryClick = (subCategory: Category) => {
    navigate(`/products?category=${subCategory.slug}`);
    if (isMobile) {
      onClose?.();
    }
  };

  // Loading State
  if (loading) {
    return (
      <aside className={cn(
        "bg-white shadow-md",
        isMobile ? "fixed inset-0 w-full h-full z-50" : "w-60"
      )}>
        <div className="p-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-4" />
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-10 bg-gray-200 rounded animate-pulse mb-2" />
          ))}
        </div>
      </aside>
    );
  }

  // Mobile Layout - Two Column Style
  if (isMobile) {
    const selectedCategory = categories.find(cat => expandedCategory === cat.name);

    return (
      <aside className="fixed inset-0 w-full h-full bg-white flex flex-col z-50">
        {/* Header */}
        <div className="text-gray-800 p-4 font-bold text-sm uppercase flex-shrink-0 flex items-center justify-between border-b-2">
          <span>Danh mục sản phẩm</span>
          {onClose && (
            <button
              onClick={onClose}
              className="hover:bg-gray-100 rounded p-1 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Mobile Two Column Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Column - Categories List (1/3) */}
          <div className="w-1/3 bg-gray-50 overflow-y-auto border-r border-gray-200">
            {categories.map((category) => (
              <button
                key={category.name}
                onClick={() => handleCategoryClick(category)}
                className={cn(
                  "w-full p-3 text-left text-xs font-medium text-gray-700 hover:bg-gray-100 transition-colors border-b border-gray-100",
                  expandedCategory === category.name && "bg-white text-primary font-semibold"
                )}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Right Column - Subcategories Grid (2/3) */}
          <div className="w-2/3 overflow-y-auto p-4">
            {selectedCategory && selectedCategory.children && selectedCategory.children.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {selectedCategory.children.map((subCategory) => (
                  <button
                    key={subCategory.name}
                    onClick={() => handleSubCategoryClick(subCategory)}
                    className="bg-white border border-gray-200 rounded-lg p-3 text-center hover:shadow-sm transition-all"
                  >
                    <div className="w-12 h-12 mb-2 mx-auto">
                      <img
                        src={getCategoryImage(subCategory)}
                        alt={subCategory.name}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://cdnv2.tgdd.vn/bhx-static/bhx/Category/Images/8788/trai-cay_202509081009396955.png";
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-700 leading-tight font-medium">
                      {subCategory.name}
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                Chọn danh mục để xem sản phẩm
              </div>
            )}
          </div>
        </div>
      </aside>
    );
  }

  // Desktop Layout
  return (
    <aside
      className={cn(
        "w-64 bg-white border-r border-gray-200 flex flex-col z-10 2xl:ml-33",
        "h-[98%] fixed left-0 top-0 bottom-0 hidden lg:flex pt-[88px]"
      )}
    >
      {/* Header */}
      <div className="text-gray-800 p-4 font-bold text-sm uppercase flex-shrink-0 flex items-center justify-between border-b-2">
        <span>Danh mục sản phẩm</span>
      </div>

      {/* Categories */}
      <nav className="py-2 overflow-y-auto flex-1 no-scrollbar">
        {/* Nút KHUYẾN MÃI SỐC riêng */}
        <div className="border-b border-gray-100">
          <button
            onClick={handlePromotionClick}
            className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-gray-50 transition-colors text-red-600"
          >
            <div className="flex items-center gap-2">
              <span>KHUYẾN MÃI SỐC</span>
            </div>
          </button>
        </div>

        {categories.map((category) => (
          <div key={category.name} className="border-b border-gray-100">
            {/* Parent Category */}
            <button
              onClick={() => handleCategoryClick(category)}
              className="w-full flex items-center justify-between px-4 py-3 text-left text-sm font-semibold hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <span>{category.name}</span>
              </div>
              {category.children && category.children.length > 0 && (
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform text-gray-400",
                    expandedCategory === category.name && "rotate-180"
                  )}
                />
              )}
            </button>

            {/* Sub Categories (cấp 2) */}
            {category.children && category.children.length > 0 &&
              expandedCategory === category.name && (
                <div className="bg-gray-50 py-1">
                  {category.children.map((subCategory) => (
                    <Link
                      key={subCategory.slug || subCategory.name}
                      to={`/products?category=${subCategory.slug}`}
                      className="block px-4 py-2 pl-8 text-sm text-gray-700 hover:text-primary hover:bg-white transition-colors"
                      onClick={() => isMobile && onClose?.()}
                    >
                      {subCategory.name}
                    </Link>
                  ))}
                </div>
              )}
          </div>
        ))}
      </nav>
    </aside>
  );
}
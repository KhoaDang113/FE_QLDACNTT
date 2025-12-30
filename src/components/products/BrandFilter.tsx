import { useRef, useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Brand } from "@/types/brand.type";

interface BrandFilterProps {
  brands: Brand[];
  selectedBrands: string[];
  onBrandToggle: (brandSlug: string) => void;
  loading?: boolean;
}

export default function BrandFilter({
  brands,
  selectedBrands,
  onBrandToggle,
  loading = false,
}: BrandFilterProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Check scroll position
  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    setCanScrollLeft(container.scrollLeft > 0);
    setCanScrollRight(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [brands]);

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = 300;
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });

    setTimeout(checkScroll, 300);
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-3">
        <div className="h-16 w-20 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-16 w-20 bg-gray-200 animate-pulse rounded"></div>
        <div className="h-16 w-20 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (brands.length === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Left Arrow */}
      {canScrollLeft && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
      )}

      {/* Brand Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-3 overflow-x-auto scrollbar-hide py-2"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {brands.map((brand) => {
          const isSelected = selectedBrands.includes(brand.slug);
          return (
            <button
              key={brand._id || brand.id}
              onClick={() => onBrandToggle(brand.slug)}
              className={`relative flex-shrink-0 flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all duration-200 ${
                isSelected
                  ? "border-green-500 bg-green-50 shadow-md scale-105"
                  : "border-gray-200 bg-white hover:border-green-300 hover:shadow-sm"
              }`}
              style={{ width: "70px" }}
            >
              {/* Brand Image */}
              {brand.image ? (
                <div className="w-12 h-12 flex items-center justify-center bg-white rounded overflow-hidden">
                  <img
                    src={brand.image}
                    alt={brand.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 rounded">
                  <span className="text-xs font-bold text-gray-500">
                    {brand.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Brand Name */}
              <span
                className={`text-[10px] text-center line-clamp-1 font-medium leading-tight ${
                  isSelected ? "text-green-700" : "text-gray-700"
                }`}
              >
                {brand.name}
              </span>

              {/* Selected Indicator - Check Icon */}
              {isSelected && (
                <div className="absolute top-0.5 right-0.5 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                  <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white shadow-md rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      )}

      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

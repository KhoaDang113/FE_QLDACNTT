import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SORT_OPTIONS, BRAND_OPTIONS } from "@/lib/constants";
import type { FilterBarFilters } from "@/types/filter.type";
import { ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

interface FilterBarProps {
  onFilterChange?: (filters: FilterBarFilters) => void;
  onBrandSelect?: (brandId: string) => void;
  selectedBrands?: string[];
}

export default function FilterBar({
  onFilterChange,
  onBrandSelect,
  selectedBrands = [],
}: FilterBarProps) {
  // Sử dụng props hoặc default values
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showBrandDropdown, setShowBrandDropdown] = useState(false);
  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const totalSlides = Math.ceil(BRAND_OPTIONS.length / 4);
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  // Đóng dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        brandDropdownRef.current &&
        !brandDropdownRef.current.contains(event.target as Node)
      ) {
        setShowBrandDropdown(false);
      }
    };

    if (showBrandDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showBrandDropdown]);

  const [filters, setFilters] = useState<FilterBarFilters>({
    sort: "default",
    brand: "all",
  });

  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof FilterBarFilters, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange?.(newFilters);
  };

  const handleBrandClick = (brandId: string) => {
    // Gọi callback để thông báo cho component cha
    onBrandSelect?.(brandId);
    // Đóng dropdown sau khi chọn
    setShowBrandDropdown(false);
  };

  const clearAllFilters = () => {
    const defaultFilters: FilterBarFilters = {
      sort: "default",
      brand: "all",
    };
    setFilters(defaultFilters);
    onFilterChange?.(defaultFilters);

    // Clear tất cả selected brands bằng cách gọi onBrandSelect cho từng brand
    selectedBrands.forEach((brandId) => {
      onBrandSelect?.(brandId);
    });

    // Đóng dropdown
    setShowBrandDropdown(false);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.sort !== "default") count++;
    if (filters.brand !== "all") count++;
    if (selectedBrands.length > 0) count++;
    return count;
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      {/* Filter Controls */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Brand Buttons */}
        <div className=" flex flex-nowrap relative gap-2 max-w-[220px] overflow-x-auto no-scrollbar">
          {totalSlides > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/90 hover:bg-white shadow-lg"
                onClick={prevSlide}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/90 hover:bg-white shadow-lg"
                onClick={nextSlide}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}
          <div
            className="flex transition-transform ease-in-out gap-2"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {BRAND_OPTIONS.map((brand) => (
              <img
                key={brand.value}
                src={brand.logo}
                alt={brand.label}
                className={`  w-12 h-8 hover:border-2 hover:border-green-500 cursor-pointer transition-all   ${
                  selectedBrands.includes(brand.value)
                    ? "border-2 border-green-500"
                    : ""
                }`}
                onClick={() => handleBrandClick(brand.value)}
              />
            ))}
          </div>
        </div>
        {/* Filter Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="bg-white border-green-500 text-green-600 hover:bg-green-50"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z"
            />
          </svg>
          Bộ lọc
          {getActiveFiltersCount() > 0 && (
            <Badge
              variant="secondary"
              className="ml-2 bg-green-100 text-green-600"
            >
              {getActiveFiltersCount()}
            </Badge>
          )}
        </Button>

        {/* Dropdown Filters */}

        {/* Sort Dropdown */}
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange("sort", e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Brand Dropdown */}
        <div
          ref={brandDropdownRef}
          className="px-3 py-2 border relative border-gray-300 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 h-10"
          onClick={() => setShowBrandDropdown(!showBrandDropdown)}
        >
          <span className="pr-4">Thuơng hiệu</span>
          <ChevronDown className="w-4 h-4 absolute right-0 top-[50%] -translate-y-1/2" />
          {showBrandDropdown && (
            <div className="absolute p-4 top-full left-0 w-[300px] grid grid-cols-4 gap-4 z-100 bg-white shadow-lg rounded-md">
              {BRAND_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  onClick={() => handleBrandClick(option.value)}
                >
                  <img
                    src={option.logo}
                    alt={option.label}
                    className="w-12 h-8"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clear Filters Button */}
        {getActiveFiltersCount() > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Xóa bộ lọc
          </Button>
        )}
      </div>
    </div>
  );
}
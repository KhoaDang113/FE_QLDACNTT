import { useEffect, useMemo, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, PackageSearch } from "lucide-react";
import { productService } from "@/api";
import type { Product } from "@/types/product.type";
import type { Category } from "@/types/category.type";
import type { Brand } from "@/types/brand.type";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/button";
import { useCart } from "@/components/cart/CartContext";
import { getProductId, getProductImage } from "@/lib/constants";
import { mapProductsFromApi } from "@/lib/utils/productMapper";


export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = (searchParams.get("q") || "").trim();
  const categoryParam = searchParams.get("category") || "";
  const brandParam = searchParams.get("brand") || "";
  const selectedCategories = categoryParam ? categoryParam.split(' ').filter(Boolean) : [];
  const selectedBrands = brandParam ? brandParam.split(' ').filter(Boolean) : [];
  const sortParam = searchParams.get("sort") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [skip, setSkip] = useState(0);
  const [lastBatchSize, setLastBatchSize] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categoryScrollState, setCategoryScrollState] = useState({ atStart: true, atEnd: false });
  const [brandScrollState, setBrandScrollState] = useState({ atStart: true, atEnd: false });
  const { addToCart } = useCart();

  const debouncedQuery = useMemo(() => queryParam, [queryParam]);

  useEffect(() => {
    setProducts([]);
    setSkip(0);
    setLastBatchSize(0);
    setHasMore(false);
    setError(null);
    setHasSearched(false);
  }, [queryParam, categoryParam, brandParam, sortParam]);

  useEffect(() => {
    if (!debouncedQuery) {
      setProducts([]);
      setLoading(false);
      return;
    }

    let isCancelled = false;
    setLoading(true);
    setError(null);

    const searchParams: { skip: number; category?: string; brand?: string; sortOrder?: string } = { skip };
    if (categoryParam) searchParams.category = categoryParam;
    if (brandParam) searchParams.brand = brandParam;
    if (sortParam) searchParams.sortOrder = sortParam;

    productService
      .searchProducts(debouncedQuery, searchParams)
      .then((response) => {
        if (isCancelled) return;

        const rawProducts = response?.products ?? [];
        const mappedProducts = mapProductsFromApi(rawProducts);
        const categoryProducts = response?.categories ?? [];
        const brandProducts = response?.brands ?? []

        setBrands(brandProducts);
        setCategories(categoryProducts);
        setProducts((prev) => (skip === 0 ? mappedProducts : [...prev, ...mappedProducts]));
        setLastBatchSize(rawProducts.length);
        setHasMore(rawProducts.length > 0 && rawProducts.length === (response.actualLimit ?? rawProducts.length));
        setHasSearched(true);
      })
      .catch((err: unknown) => {
        if (isCancelled) return;

        let message = "Không thể tìm kiếm sản phẩm ngay lúc này. Vui lòng thử lại sau.";
        if (typeof err === "object" && err !== null && "response" in err) {
          const serverMessage =
            (err as { response?: { data?: { message?: string } } }).response?.data?.message;
          if (typeof serverMessage === "string" && serverMessage.trim().length > 0) {
            message = serverMessage;
          }
        } else if (err instanceof Error && err.message) {
          message = err.message;
        }

        setError(message);
        if (skip === 0) {
          setProducts([]);
        }
        setHasMore(false);
      })
      .finally(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [debouncedQuery, skip, categoryParam, brandParam, sortParam]);

  const checkScrollPosition = useCallback((
    element: HTMLElement,
    setState: React.Dispatch<React.SetStateAction<{ atStart: boolean; atEnd: boolean }>>
  ) => {
    const { scrollLeft, scrollWidth, clientWidth } = element;
    const atStart = scrollLeft <= 1;
    const atEnd = scrollLeft + clientWidth >= scrollWidth - 1;
    setState({ atStart, atEnd });
  }, []);

  const handleCategoryScroll = () => {
    const container = document.getElementById('category-scroll');
    if (container) {
      checkScrollPosition(container, setCategoryScrollState);
    }
  };

  const handleBrandScroll = () => {
    const container = document.getElementById('brand-scroll');
    if (container) {
      checkScrollPosition(container, setBrandScrollState);
    }
  };

  // Check scroll position on mount and when content changes
  useEffect(() => {
    setTimeout(() => {
      const categoryContainer = document.getElementById('category-scroll');
      const brandContainer = document.getElementById('brand-scroll');
      
      if (categoryContainer) {
        checkScrollPosition(categoryContainer, setCategoryScrollState);
      }
      if (brandContainer) {
        checkScrollPosition(brandContainer, setBrandScrollState);
      }
    }, 100);
  }, [categories, brands, checkScrollPosition]);

  const handleLoadMore = () => {
    if (!hasMore || loading || lastBatchSize === 0) {
      return;
    }
    setSkip((prev) => prev + lastBatchSize);
  };

  const handleAddToCart = (product: Product & { selectedQuantity?: number }) => {
    const productId = getProductId(product);
    if (!productId) {
      return;
    }

    addToCart({
      id: productId,
      name: product.name,
      price: product.final_price || product.unit_price,
      image: getProductImage(product),
      unit: product.unit || "1 sản phẩm",
      stock: product.quantity || product.stock_quantity || 0,
      quantity: product.selectedQuantity || 1,
    });
  };

  const toggleCategory = (slug: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentCategories = selectedCategories.slice();
    
    if (currentCategories.includes(slug)) {
      const filtered = currentCategories.filter(s => s !== slug);
      if (filtered.length === 0) {
        newParams.delete("category");
      } else {
        newParams.set("category", filtered.join(' '));
      }
    } else {
      currentCategories.push(slug);
      newParams.set("category", currentCategories.join(' '));
    }
    
    setSearchParams(newParams);
  };

  const toggleBrand = (slug: string) => {
    const newParams = new URLSearchParams(searchParams);
    const currentBrands = selectedBrands.slice();
    
    if (currentBrands.includes(slug)) {
      const filtered = currentBrands.filter(s => s !== slug);
      if (filtered.length === 0) {
        newParams.delete("brand");
      } else {
        newParams.set("brand", filtered.join(' '));
      }
    } else {
      currentBrands.push(slug);
      newParams.set("brand", currentBrands.join(' '));
    }
    
    setSearchParams(newParams);
  };

  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("category");
    newParams.delete("brand");
    newParams.delete("sort");
    setSearchParams(newParams);
  };



  const hasActiveFilters = categoryParam || brandParam || sortParam;

  const isInitialLoading = loading && skip === 0;
  const isLoadingMore = loading && skip > 0;
  const shouldShowEmptyState = !queryParam && !loading;
  const shouldShowNoResults = hasSearched && products.length === 0 && !loading && !error;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-blue-50 w-full">
      <div className="w-full">
        {error && (
          <div className="px-4 sm:px-6 mb-4 pt-4">
            <div className="rounded-xl border border-red-200 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-sm">
              {error}
            </div>
          </div>
        )}

        {/* Filters */}
        {queryParam && (
          <div className="mb-4">
            <div className="bg-white shadow-sm border-t border-b border-gray-200 py-4 w-full space-y-4">
              {/* Categories Section */}
              {categories.length > 0 && (
                <div className="px-4">
                  <label className="block text-md font-medium text-gray-700 mb-3">
                    Lọc theo ngành hàng:
                  </label>
                  <div className="relative group">
                    {/* Left Arrow - Only show when not at start */}
                    {!categoryScrollState.atStart && (
                      <button
                        onClick={() => {
                          const container = document.getElementById('category-scroll');
                          if (container) container.scrollLeft -= 200;
                        }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Scroll left"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                    )}

                    {/* Categories Container */}
                    <div
                      id="category-scroll"
                      className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide scroll-smooth"
                      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                      onScroll={handleCategoryScroll}
                    >
                      {categories.map((cat) => {
                        const isSelected = selectedCategories.includes(cat.slug || "");
                        return (
                          <button
                            key={cat._id || cat.id}
                            onClick={() => toggleCategory(cat.slug || "")}
                            className={`
                              flex-shrink-0 w-32 p-3 rounded-lg border-2 transition-all
                              flex flex-col items-center gap-2 text-center
                              ${isSelected 
                                ? "bg-green-50 border-green-500 shadow-md" 
                                : "bg-white border-gray-200 hover:border-green-300 hover:shadow-sm"
                              }
                            `}
                          >
                            {cat.image && (
                              <div className="w-16 h-16 flex items-center justify-center">
                                <img 
                                  src={cat.image} 
                                  alt={cat.name}
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                            )}
                            <span className={`text-xs font-medium ${isSelected ? "text-green-700" : "text-gray-700"}`}>
                              {cat.name}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Right Arrow - Only show when not at end */}
                    {!categoryScrollState.atEnd && (
                      <button
                        onClick={() => {
                          const container = document.getElementById('category-scroll');
                          if (container) container.scrollLeft += 200;
                        }}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Scroll right"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Brands Section with Sort Dropdown */}
              <div className="px-4">
                  <div className="flex items-center gap-3">
                    {/* Sort Dropdown */}
                    <div className="flex-shrink-0">
                      <select
                        value={sortParam}
                        onChange={(e) => handleFilterChange("sort", e.target.value)}
                        className="px-3 py-2 text-sm border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Sắp xếp theo</option>
                        <option value="price-asc">Giá tăng dần</option>
                        <option value="price-desc">Giá giảm dần</option>
                        <option value="hot">Khuyến mãi</option>
                        <option value="new">Mới nhất</option>
                      </select>
                    </div>
                    {/* Brands Container with Arrows */}

                  {brands.length > 0 && (
                    <div className="flex-1 relative group overflow-hidden min-w-0">
                      {/* Left Arrow - Only show when not at start */}
                      {!brandScrollState.atStart && (
                        <button
                          onClick={() => {
                            const container = document.getElementById('brand-scroll');
                            if (container) container.scrollLeft -= 200;
                          }}
                          className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Scroll left"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                        </button>
                      )}

                      {/* Brands */}
                      <div
                        id="brand-scroll"
                        className="flex gap-2 overflow-x-auto scrollbar-hide scroll-smooth px-1 py-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        onScroll={handleBrandScroll}
                      >
                        {brands.map((brand) => {
                          const isSelected = selectedBrands.includes(brand.slug || "");
                          return (
                            <button
                              key={brand._id || brand.id}
                              onClick={() => toggleBrand(brand.slug || "")}
                              className={`
                                flex-shrink-0 h-14 w-20 rounded-lg transition-all overflow-hidden
                                border-2 flex items-center justify-center p-1
                                ${isSelected 
                                  ? "bg-green-500 border-green-600 shadow-lg scale-105" 
                                  : "bg-white border-gray-200 hover:border-green-300 hover:shadow-md"
                                }
                              `}
                            >
                              {brand.image ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  <img 
                                    src={brand.image} 
                                    alt={brand.name}
                                    className="max-w-full max-h-full object-contain rounded-sm"
                                  />
                                </div>
                              ) : (
                                <span className={`text-xs font-medium ${isSelected ? "text-white" : "text-gray-700"}`}>
                                  {brand.name}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Right Arrow - Only show when not at end */}
                      {!brandScrollState.atEnd && (
                        <button
                          onClick={() => {
                            const container = document.getElementById('brand-scroll');
                            if (container) container.scrollLeft += 200;
                          }}
                          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Scroll right"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      )}
                    </div>
                  
                    )}
                </div>
              </div>
            </div>
          </div>
        )}

        {shouldShowEmptyState && (
          <div className="px-4 sm:px-6 py-10 text-center">
            <PackageSearch className="mx-auto h-12 w-12 text-green-500" />
            <h2 className="mt-4 text-lg font-semibold text-gray-800">
              Nhập từ khóa vào thanh tìm kiếm phía trên
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Ví dụ: “cá hộp”, “sữa tươi”, “nước mắm”, hoặc tên thương hiệu bạn yêu thích.
            </p>
          </div>
        )}

        {isInitialLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center gap-3 text-green-600">
              <Loader2 className="h-6 w-6 animate-spin" />
              <span>Đang tìm kiếm sản phẩm...</span>
            </div>
          </div>
        )}

        {shouldShowNoResults && (
          <div className="px-4 sm:px-6 py-10 text-center">
            <PackageSearch className="mx-auto h-12 w-12 text-gray-400" />
            <h2 className="mt-4 text-lg font-semibold text-gray-800">
              Không tìm thấy sản phẩm phù hợp
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Thử nhập từ khóa khác hoặc xem các ngành hàng trong menu bên trái.
            </p>
            <Button
              variant="outline"
              className="mt-6 rounded-full border-green-500 text-green-600 hover:bg-green-50"
              onClick={() => setSearchParams({})}
            >
              Xóa từ khóa tìm kiếm
            </Button>
          </div>
        )}

        {!isInitialLoading && products.length > 0 && (
          <div>
            <div className="bg-white shadow-sm border-b border-gray-200 overflow-hidden w-full">
              <div className="p-4 flex flex-col gap-4">
                <div className="text-sm text-gray-500">
                  {`Đang hiển thị ${products.length} sản phẩm${queryParam ? ` cho từ khóa "${queryParam}"` : ""}.`}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {products.map((product) => (
                    <ProductCard
                      key={product.id || product._id}
                      product={product}
                      onAddToCart={handleAddToCart}
                    />
                  ))}
                </div>

                {isLoadingMore && (
                  <div className="flex items-center justify-center py-4 text-green-600">
                    <Loader2 className="h-5 w-5 animate-spin mr-2" />
                    <span>Đang tải thêm sản phẩm...</span>
                  </div>
                )}

                {hasMore && !isLoadingMore && (
                  <div className="flex justify-center pt-2">
                    <Button
                      onClick={handleLoadMore}
                      className="rounded-full bg-green-600 hover:bg-green-700 text-white px-6 shadow-md"
                    >
                      Xem thêm sản phẩm
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}


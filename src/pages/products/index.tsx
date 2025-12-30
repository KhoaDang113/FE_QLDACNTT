import { CategoryNav } from "@/components/category/CategoryNav";
import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import type { CategoryNav as Category, Category as CategoryType } from "@/types/category.type";
import type { Product } from "@/types/product.type";
import type { Banner } from "@/types/banner.type";
import type { Brand } from "@/types/brand.type";
import Banners from "@/components/productPage/banner/Banners";
import Article from "@/components/productPage/article/Article";
import ProductGridWithBanners from "@/components/products/ProductGridWithBanners";
import BrandFilter from "@/components/products/BrandFilter";
import ShockingDeal from "@/components/products/ShockingDeal";
import { bannerService, categoryService, productService } from "@/api";
import { toCategoryNav, getProductId, getProductImage } from "@/lib/constants";
import { useCart } from "@/components/cart/CartContext";
import { useNotification } from "@/hooks/useNotification";
import { mapProductFromApi } from "@/lib/utils/productMapper";

export default function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState<CategoryType | null>(
    null
  );
  const [promotionProducts, setPromotionProducts] = useState<Product[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const { showNotification } = useNotification();
  const { addToCart } = useCart();

  // Lấy parameters từ URL
  const categoryFromUrl = searchParams.get("category");
  const brandsFromUrl = searchParams.get("brand"); // Đổi từ "brands" sang "brand"
  const sortParam = searchParams.get("sort") || "";

  // States for advanced filters
  const [allCategories, setAllCategories] = useState<(CategoryType & { subCategories?: CategoryType[] })[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  // Fetch category info và products khi categoryFromUrl thay đổi
  useEffect(() => {
    const loadCategoryData = async () => {
      if (!categoryFromUrl) {
        setLoading(false);
        setBanners([]);
        return;
      }

      try {
        setLoading(true);
        setSelectedCategoryId(categoryFromUrl);
        setCategories([]);

        const category = await categoryService.getCategoryBySlug(
          categoryFromUrl
        );
        setCurrentCategory(category);

        // 2. Kiểm tra xem category này là level 1 hay level 2
        // Backend transform _id thành id khi serialize JSON, nên ưu tiên id trước
        const categoryId = category.id || category._id || "";

        // Xử lý parent_id: có thể là string, object (populated), hoặc null
        let parentIdValue: string | null = null;
        if (category.parent_id) {
          if (typeof category.parent_id === "string") {
            parentIdValue = category.parent_id;
          } else if (
            typeof category.parent_id === "object" &&
            category.parent_id !== null
          ) {
            // Nếu được populate, lấy id từ object
            parentIdValue =
              (category.parent_id as any).id ||
              (category.parent_id as any)._id ||
              null;
          }
        }

        const isLevel1 = !parentIdValue;

        // 3. Fetch subcategories hoặc siblings từ getAllCategories (giống CategorySidebar)
        // Sử dụng getAllCategories() vì nó đã có nested structure với subCategories

        try {
          const allCategories = await categoryService.getAllCategories();
          if (
            allCategories &&
            Array.isArray(allCategories) &&
            allCategories.length > 0
          ) {
            // Helper function để so sánh ID (chuyển về string để so sánh)
            const compareIds = (
              id1: string | undefined | null,
              id2: string | undefined | null
            ): boolean => {
              if (!id1 || !id2) return false;
              return String(id1) === String(id2);
            };

            if (isLevel1) {
              // Category level 1: Tìm category này trong allCategories và lấy subCategories
              // Tìm theo ID hoặc slug (fallback)
              const currentCategoryData = allCategories.find(
                (cat: CategoryType & { subCategories?: CategoryType[] }) => {
                  const catId = cat.id || cat._id;
                  const catSlug = cat.slug;
                  // So sánh theo ID hoặc slug
                  return (
                    compareIds(catId, categoryId) || catSlug === categoryFromUrl
                  );
                }
              );

              if (currentCategoryData) {
                const subCategories = currentCategoryData.subCategories || [];
                if (subCategories.length > 0) {
                  const navCategories = subCategories.map(toCategoryNav);
                  setCategories(navCategories);
                } else {
                  setCategories([]);
                }
              } else {
                setCategories([]);
              }
            } else {
              const parentCategoryData = allCategories.find(
                (cat: CategoryType & { subCategories?: CategoryType[] }) => {
                  const catId = cat.id || cat._id;
                  return compareIds(catId, parentIdValue);
                }
              );

              if (parentCategoryData) {
                const siblings = parentCategoryData.subCategories || [];

                if (siblings.length > 0) {
                  const navCategories = siblings.map(toCategoryNav);
                  setCategories(navCategories);
                } else {
                  setCategories([]);
                }
              } else {
                setCategories([]);
              }
            }
          } else {
            setCategories([]);
          }
        } catch (error) {
          console.error("=== Error fetching all categories ===");
          console.error("Error object:", error);
          if (error && typeof error === "object" && "response" in error) {
            const axiosError = error as any;
            console.error("Response status:", axiosError.response?.status);
            console.error("Response data:", axiosError.response?.data);
          }
          if (error instanceof Error) {
            console.error("Error message:", error.message);
            console.error("Error stack:", error.stack);
          }
          setCategories([]);
          // Không throw error để không block việc load products
        }

        // 4. Lấy banners cho category hiện tại
        await fetchBanners(categoryFromUrl);

        // 5. Lấy products theo category slug (không block bởi categories)
        await fetchProductsByCategory(categoryFromUrl);

        // 6. Lấy promotion products
        await fetchPromotionProducts(categoryFromUrl);
      } catch (error) {
        console.error("=== Error loading category data ===");
        console.error("Error object:", error);
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as any;
          console.error("Response status:", axiosError.response?.status);
          console.error("Response data:", axiosError.response?.data);
        }
        if (error instanceof Error) {
          console.error("Error message:", error.message);
          console.error("Error stack:", error.stack);
        }
        showNotification({
          type: "error",
          title: "Lỗi",
          message: "Không thể tải dữ liệu danh mục. Vui lòng thử lại sau.",
          duration: 5000,
        });
        setCategories([]);
        setProducts([]);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    // Debounce: Đợi 1s sau khi brand thay đổi để user có thể chọn nhiều brands
    const timeoutId = setTimeout(() => {
      loadCategoryData();
    }, brandsFromUrl ? 1000 : 0); // 1s debounce cho brand filter, instant cho category/sort

    return () => clearTimeout(timeoutId);
  }, [categoryFromUrl, brandsFromUrl, sortParam, showNotification]);

  // Đồng bộ selectedBrands với URL (space-separated)
  useEffect(() => {
    if (brandsFromUrl) {
      const brandsArray = brandsFromUrl
        .split(" ") // Đổi từ "," sang " " (space)
        .filter((brand) => brand.trim() !== "");
      setSelectedBrands(brandsArray);
    } else {
      setSelectedBrands([]);
    }
  }, [brandsFromUrl]);

  // Load all categories for filters (brands sẽ được load từ getCategoryProducts API)
  useEffect(() => {
    const loadFilters = async () => {
      try {
        setLoadingFilters(true);
        const categoriesData = await categoryService.getAllCategories();

        // Filter active parent categories (level 1)
        const activeCategories = categoriesData.filter((cat) => {
          const isActive = cat.is_active !== undefined ? cat.is_active : true;
          const isDeleted = cat.is_deleted !== undefined ? cat.is_deleted : false;
          const isParent = !cat.parent_id || cat.parent_id === null;
          return isActive && !isDeleted && isParent;
        });

        setAllCategories(activeCategories);
      } catch (error) {
        console.error("Error loading filters:", error);
        setAllCategories([]);
      } finally {
        setLoadingFilters(false);
      }
    };
    loadFilters();
  }, []);


  // Sử dụng API mới getCategoryProducts - trả về cả products VÀ brands
  const fetchProductsByCategory = async (categorySlug: string) => {
    try {
      const result = await productService.getCategoryProducts(categorySlug, {
        brand: brandsFromUrl || undefined,
        sortOrder: sortParam || undefined,
        skip: 0
      });
      
      // Map products từ API format sang frontend format
      const mappedProducts = result.products.map(mapProductFromApi);
      setProducts(mappedProducts);
      
      // Set brands từ API response - chỉ brands có sản phẩm trong category này
      setBrands(result.brands);
    } catch (error) {
      console.error("Error fetching products:", error);
      setProducts([]);
      setBrands([]);
    }
  };

  const fetchBanners = async (categorySlug: string) => {
    try {
      const categoryBanners = await bannerService.getBanners(categorySlug);

      if (categoryBanners.length > 0) {
        setBanners(categoryBanners);
        return;
      }
      const defaultBanners = await bannerService.getBanners();
      setBanners(defaultBanners);
    } catch (error) {
      console.error("Error fetching banners:", error);
      setBanners([]);
    }
  };

  const fetchPromotionProducts = async (categorySlug: string) => {
    try {
      const apiProducts = await productService.getProductPromotions(
        categorySlug,
        { limit: 12 }
      );
      // Map products từ API format sang frontend format
      const mappedProducts = apiProducts.map(mapProductFromApi);
      setPromotionProducts(mappedProducts);
    } catch (error) {
      console.error("Error fetching promotion products:", error);
      setPromotionProducts([]);
    }
  };

  const handleCategorySelect = (category: Category) => {
    // Update URL khi chọn category
    setSearchParams({ category: category.slug || category.id });
  };

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

  // Handler for advanced filter changes
  const handleFilterChange = (key: string, value: string) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    // Keep category param if exists
    if (categoryFromUrl && key !== "category") {
      newParams.set("category", categoryFromUrl);
    }
    setSearchParams(newParams);
  };

  const handleBrandToggle = (brandSlug: string) => {
    const newSelectedBrands = selectedBrands.includes(brandSlug)
      ? selectedBrands.filter((slug) => slug !== brandSlug) // Bỏ chọn nếu đã chọn
      : [...selectedBrands, brandSlug]; // Thêm vào nếu chưa chọn

    setSelectedBrands(newSelectedBrands);

    // Cập nhật URL với brands mới (space-separated)
    const newSearchParams = new URLSearchParams(searchParams);
    if (newSelectedBrands.length > 0) {
      newSearchParams.set("brand", newSelectedBrands.join(" ")); // Đổi từ "brands" thành "brand" và dấu space
    } else {
      newSearchParams.delete("brand");
    }

    setSearchParams(newSearchParams);
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 w-full">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50 w-full">
      {/* Category Navigation - Hiển thị subcategories (level 2) hoặc siblings */}
      {categories.length > 0 && (
        <div className="w-full bg-white overflow-hidden mb-4">
          <CategoryNav
            categories={categories}
            variant="product-page"
            selectedCategoryId={selectedCategoryId}
            onCategorySelect={handleCategorySelect}
          />
        </div>
      )}

      {/* Filter Section - Sticky Horizontal Layout */}
      {categoryFromUrl && (
        <div className="sticky top-22 bg-white shadow-md border-b border-gray-200 mb-4">
          <div className="max-w-screen-2xl mx-auto">
            <div className="flex items-center gap-4">
              {/* Brand Filter - Compact Horizontal */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <h3 className="text-sm font-bold text-gray-800 pl-2">Thương hiệu</h3>
                    {selectedBrands.length > 0 && (
                      <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        {selectedBrands.length}
                      </span>
                    )}
                  </div>
                  
                  {/* Brands - Inline */}
                  <div className="flex-1 min-w-0">
                    <BrandFilter
                      brands={brands}
                      selectedBrands={selectedBrands}
                      onBrandToggle={handleBrandToggle}
                      loading={loadingFilters}
                    />
                  </div>

                  {/* Clear Button */}
                  {selectedBrands.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectedBrands([]);
                        const newParams = new URLSearchParams(searchParams);
                        newParams.delete("brand");
                        setSearchParams(newParams);
                      }}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors font-medium flex-shrink-0"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Xóa bộ lọc
                    </button>
                  )}
                </div>
              </div>

              {/* Separator */}
              <div className="w-px h-8 bg-gray-200"></div>

              {/* Sort Dropdown - Compact */}
              <div className="flex items-center gap-2 flex-shrink-0 pr-2">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                <label className="text-sm font-semibold text-gray-700 whitespace-nowrap">
                  Sắp xếp
                </label>
                <select
                  value={sortParam}
                  onChange={(e) => handleFilterChange("sort", e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-gray-300 transition-colors"
                >
                  <option value="">Mặc định</option>
                  <option value="price-asc">Giá tăng dần</option>
                  <option value="price-desc">Giá giảm dần</option>
                  <option value="hot">Khuyến mãi nhiều</option>
                  <option value="new">Mới nhất</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shocking Deal Section - Top Priority */}
      {promotionProducts.length > 0 && (
        <div className="mb-4">
          <ShockingDeal
            products={promotionProducts}
            onAddToCart={handleAddToCart}
          />
        </div>
      )}
      
      {/* Banners Section */}
      {banners.length > 0 && (
        <div className="mb-4">
          <Banners banners={banners} />
        </div>
      )}

      {/* Hiển thị sản phẩm với banner xen kẽ */}
      <div className="mt-8">
        {products.length > 0 ? (
          <>
            <ProductGridWithBanners
              products={products}
              banners={banners}
              onAddToCart={handleAddToCart}
              rowsPerBanner={2}
            />
            {currentCategory?.description && (
              <div className="mt-8">
                <Article
                  article={{
                    id: 1,
                    title: `${currentCategory.name} là gì?`,
                    content: currentCategory.description,
                  }}
                  variant="compact"
                />
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 text-lg mb-4">
              Chưa có sản phẩm nào trong danh mục này
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

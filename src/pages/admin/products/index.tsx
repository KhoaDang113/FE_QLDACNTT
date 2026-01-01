import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { ProductHierarchicalView } from "@/components/admin/products/ProductHierarchicalView";
import { Button } from "@/components/ui/button";
import { Plus, Grid3x3, List, ShoppingBag } from "lucide-react";
import type { Product, Category } from "@/types";
import productService from "@/api/services/productService";
import categoryService from "@/api/services/catalogService";

type ViewMode = "table" | "hierarchical";

export default function ProductsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("hierarchical");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [productsResponse, categoriesResponse] = await Promise.all([
          productService.getProductsAdmin(1, 1000),
          categoryService.getCategoriesAdmin(1, 1000),
        ]);

        setProducts(productsResponse.products);
        setCategories(categoriesResponse.categories);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Quản lý Sản phẩm</h1>
              <p className="text-green-100 mt-1">
                Tổng cộng {products.length} sản phẩm trong hệ thống
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm">
              <Button
                variant={viewMode === "hierarchical" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("hierarchical")}
                className={`gap-2 rounded-r-none ${viewMode === "hierarchical" ? "bg-white text-green-600" : "text-white hover:bg-white/20"}`}
              >
                <Grid3x3 className="w-4 h-4" />
                Menu phân cấp
              </Button>
              <Button
                variant={viewMode === "table" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setViewMode("table")}
                className={`gap-2 rounded-l-none ${viewMode === "table" ? "bg-white text-green-600" : "text-white hover:bg-white/20"}`}
              >
                <List className="w-4 h-4" />
                Bảng
              </Button>
            </div>
            <Link to="/admin/products/add">
              <Button className="gap-2 bg-white text-green-600 hover:bg-green-50 shadow-md">
                <Plus className="w-4 h-4" />
                Thêm Sản phẩm
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Có lỗi xảy ra</h3>
            <p className="text-gray-500 text-center max-w-sm">{error}</p>
          </div>
        ) : viewMode === "table" ? (
          <>
            <div className="p-4 md:p-6 border-b bg-gray-50/50">
              <ProductFilters
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                categoryFilter={categoryFilter}
                setCategoryFilter={setCategoryFilter}
                brandFilter={brandFilter}
                setBrandFilter={setBrandFilter}
                lowStockOnly={lowStockOnly}
                setLowStockOnly={setLowStockOnly}
                categories={categories}
              />
            </div>
            <ProductTable
              searchTerm={searchTerm}
              categoryFilter={categoryFilter}
              brandFilter={brandFilter}
              lowStockOnly={lowStockOnly}
              products={products}
            />
          </>
        ) : (
          <ProductHierarchicalView />
        )}
      </div>
    </div>
  );
}


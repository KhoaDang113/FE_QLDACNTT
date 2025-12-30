import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ProductFilters } from "@/components/admin/products/ProductFilters";
import { ProductTable } from "@/components/admin/products/ProductTable";
import { ProductHierarchicalView } from "@/components/admin/products/ProductHierarchicalView";
import { Button } from "@/components/ui/button";
import { Plus, Grid3x3, List } from "lucide-react";
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

  // Fetch products and categories from API
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch both products and categories in parallel
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải danh sách sản phẩm...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý Sản phẩm
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý toàn bộ sản phẩm trong hệ thống
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "hierarchical" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("hierarchical")}
              className="gap-2 rounded-r-none"
            >
              <Grid3x3 className="w-4 h-4" />
              Menu phân cấp
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-2 rounded-l-none"
            >
              <List className="w-4 h-4" />
              Bảng
            </Button>
          </div>
          <Link to="/admin/products/add">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm Sản phẩm
            </Button>
          </Link>
        </div>
      </div>

      {viewMode === "table" && (
        <>
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

          <ProductTable
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            brandFilter={brandFilter}
            lowStockOnly={lowStockOnly}
            products={products}
          />
        </>
      )}

      {viewMode === "hierarchical" && <ProductHierarchicalView />}
    </div>
  );
}

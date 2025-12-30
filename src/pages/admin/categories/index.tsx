import { useState, useEffect, useCallback } from "react";
import { CategoryTable } from "@/components/admin/categories/CategoryTable";
import { SearchBar } from "@/components/common/SearchBar";
import type { Category } from "@/types";
import categoryService from "@/api/services/catalogService";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Load tất cả categories 1 lần, không filter ở API
      const response = await categoryService.getCategoriesAdmin(1, 1000);

      // Lưu tất cả categories dạng flat (không build tree ở đây nữa)
      // Tree sẽ được build trong CategoryTable
      setCategories(response.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Không thể tải danh sách danh mục. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch categories on mount (chỉ 1 lần)
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Đang tải danh sách danh mục...</p>
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
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản lý Danh mục</h1>
        <p className="text-muted-foreground mt-1">Quản lý danh mục sản phẩm</p>
      </div>

      <div className="flex gap-4">
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Tìm kiếm theo tên hoặc ID..."
          storageKey="admin_category_search_history"
          className="flex-1"
        />
      </div>

      <CategoryTable
        searchTerm={searchTerm}
        categories={categories}
        onRefresh={fetchCategories}
      />
    </div>
  );
}

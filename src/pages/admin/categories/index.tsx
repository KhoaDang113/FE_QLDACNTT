import { useState, useEffect, useCallback } from "react";
import { CategoryTable } from "@/components/admin/categories/CategoryTable";
import { SearchBar } from "@/components/common/SearchBar";
import type { Category } from "@/types";
import categoryService from "@/api/services/catalogService";
import { FolderTree } from "lucide-react";

export default function CategoriesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await categoryService.getCategoriesAdmin(1, 1000);
      setCategories(response.categories);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Không thể tải danh sách danh mục. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <FolderTree className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Quản lý Danh mục</h1>
              <p className="text-emerald-100 mt-1">
                Tổng cộng {categories.length} danh mục trong hệ thống
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {/* Search */}
        <div className="p-4 md:p-6 border-b bg-gray-50/50">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Tìm kiếm theo tên hoặc ID..."
              storageKey="admin_category_search_history"
              className="flex-1"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600 mb-4"></div>
            <p className="text-gray-500">Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <FolderTree className="w-10 h-10 text-red-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Có lỗi xảy ra</h3>
            <p className="text-gray-500 text-center max-w-sm">{error}</p>
          </div>
        ) : (
          <CategoryTable
            searchTerm={searchTerm}
            categories={categories}
            onRefresh={fetchCategories}
          />
        )}
      </div>
    </div>
  );
}


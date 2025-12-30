import { useState, useEffect, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { CategoryForm } from "@/components/admin/categories/CategoryForm";
import type { Category } from "@/types/category.type.ts";
import categoryService from "@/api/services/catalogService";
import { buildCategoryTree, flattenCategories } from "./CategoryTreeUtils";
import { CategoryTableRow } from "./CategoryTableRow";

interface CategoryTableProps {
  searchTerm: string;
  categories: Category[];
  onRefresh?: () => void;
}

export function CategoryTable({
  searchTerm,
  categories,
  onRefresh,
}: CategoryTableProps) {
  const [localCategories, setLocalCategories] =
    useState<Category[]>(categories);
  const [editId, setEditId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [parentIdForNewChild, setParentIdForNewChild] = useState<string | null>(
    null
  );
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setLocalCategories(categories);
  }, [categories]);

  const categoryTree = useMemo(() => {
    return buildCategoryTree(localCategories);
  }, [localCategories]);

  const filteredCategories = useMemo(() => {
    return flattenCategories(categoryTree, searchTerm, expandedIds);
  }, [categoryTree, searchTerm, expandedIds]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleDelete = async (id: string) => {
    try {
      // Kiểm tra số lượng sản phẩm trong danh mục
      const { count } = await categoryService.getProductCount(id);

      if (count > 0) {
        // Nếu có sản phẩm, hỏi admin có muốn xóa cả sản phẩm không
        const confirmMessage = `Danh mục này có ${count} sản phẩm. Nếu xóa sẽ xóa luôn tất cả sản phẩm trong danh mục.\n\nBạn có chắc chắn muốn xóa?`;
        if (window.confirm(confirmMessage)) {
          const result = await categoryService.deleteCategoryWithProducts(id);
          setLocalCategories(localCategories.filter((cat) => cat._id !== id));
          if (onRefresh) onRefresh();
          toast.success(`Xóa danh mục thành công! Đã xóa ${result.deletedProductsCount} sản phẩm.`);
        }
      } else {
        // Nếu không có sản phẩm, xóa bình thường
        if (window.confirm("Bạn có chắc chắn muốn xóa danh mục này?")) {
          await categoryService.deleteCategory(id);
          setLocalCategories(localCategories.filter((cat) => cat._id !== id));
          if (onRefresh) onRefresh();
          toast.success("Xóa danh mục thành công!");
        }
      }
    } catch (error: unknown) {
      console.error("Error deleting category:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Không thể xóa danh mục. Vui lòng thử lại sau.");
    }
  };

  const handleCategoryAdded = () => {
    setIsAddingNew(false);
    setParentIdForNewChild(null);
    if (onRefresh) onRefresh();
  };

  const handleCategoryUpdated = () => {
    setEditId(null);
    if (onRefresh) onRefresh();
  };

  const handleAddSubCategory = (parentId: string) => {
    setParentIdForNewChild(parentId);
    setIsAddingNew(true);
  };

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            Danh sách Danh mục ({filteredCategories.length})
          </h3>
          <Button
            size="sm"
            onClick={() => setIsAddingNew(true)}
            className="gap-2"
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table
            className="admin-table"
            style={{ tableLayout: "fixed", width: "100%" }}
          >
            <thead>
              <tr>
                <th style={{ width: "50px" }}></th>
                <th style={{ width: "120px" }}>ID</th>
                <th style={{ width: "80px" }}>Ảnh</th>
                <th style={{ width: "280px" }}>Tên danh mục</th>
                <th style={{ width: "180px" }}>Slug</th>
                <th style={{ width: "140px" }}>Danh mục cha</th>
                <th style={{ width: "120px" }}>Trạng thái</th>
                <th style={{ width: "180px" }}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.map((category) => (
                <CategoryTableRow
                  key={category._id}
                  category={category}
                  isExpanded={expandedIds.has(category._id)}
                  onToggleExpand={toggleExpand}
                  onEdit={setEditId}
                  onDelete={handleDelete}
                  onAddSubCategory={handleAddSubCategory}
                />
              ))}
            </tbody>
          </table>
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Không tìm thấy danh mục nào</p>
          </div>
        )}
      </Card>

      {/* Add/Edit Dialog */}
      {(isAddingNew || !!editId) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-background p-6 rounded-lg max-w-2xl w-full max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              {editId
                ? "Chỉnh sửa danh mục"
                : parentIdForNewChild
                  ? "Thêm danh mục con"
                  : "Thêm danh mục mới"}
            </h3>
            <CategoryForm
              mode={editId ? "edit" : "add"}
              categoryId={editId || undefined}
              parentId={parentIdForNewChild || undefined}
              allCategories={localCategories}
              onSuccess={editId ? handleCategoryUpdated : handleCategoryAdded}
              onCancel={() => {
                setIsAddingNew(false);
                setParentIdForNewChild(null);
                setEditId(null);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
}

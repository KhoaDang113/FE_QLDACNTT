import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, ChevronRight, ChevronDown, Plus } from "lucide-react";
import type { Category } from "@/types";
import { toast } from "sonner";

interface CategoryTableRowProps {
  category: Category;
  isExpanded: boolean;
  onToggleExpand: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubCategory: (parentId: string) => void;
}

export function CategoryTableRow({
  category,
  isExpanded,
  onToggleExpand,
  onEdit,
  onDelete,
  onAddSubCategory,
}: CategoryTableRowProps) {
  const indent = (category.level || 0) * 20;
  const hasChildren = category.subCategories && category.subCategories.length > 0;

  return (
    <tr>
      {/* Expand/Collapse column */}
      <td style={{ width: "50px", padding: "8px" }}>
        <div
          style={{ paddingLeft: `${indent}px` }}
          className="flex items-center"
        >
          {hasChildren ? (
            <button
              onClick={() => onToggleExpand(category._id)}
              className="p-1 hover:bg-accent rounded transition-colors flex-shrink-0"
              type="button"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </button>
          ) : (
            <span className="w-6" />
          )}
        </div>
      </td>

      {/* ID column */}
      <td className="font-medium text-foreground text-xs" style={{ width: "120px" }}>
        <div
          className="truncate cursor-pointer hover:text-primary"
          title={`${category._id} (Click để copy)`}
          onClick={() => {
            navigator.clipboard.writeText(category._id);
            toast.success("Đã copy ID: " + category._id);
          }}
        >
          {category._id.substring(0, 10)}...
        </div>
      </td>

      {/* Image column */}
      <td style={{ width: "80px" }}>
        <img
          src={category.image || "/placeholder.svg"}
          alt={category.name}
          className="w-10 h-10 rounded object-cover"
        />
      </td>

      {/* Name column */}
      <td className="text-foreground" style={{ width: "280px" }}>
        <div className="flex items-center gap-2">
          {(category.level || 0) > 0 && (
            <span className="text-muted-foreground text-sm flex-shrink-0">
              └─
            </span>
          )}

          <span
            className={
              (category.level || 0) > 0
                ? "font-normal truncate"
                : "font-semibold truncate"
            }
            title={category.name}
          >
            {category.name}
          </span>

          {hasChildren && (
            <Badge
              variant="secondary"
              className="text-xs ml-auto flex-shrink-0"
            >
              {category.subCategories!.length}
            </Badge>
          )}
        </div>
      </td>

      {/* Slug column */}
      <td className="text-muted-foreground text-sm" style={{ width: "180px" }}>
        <div className="truncate" title={category.slug}>
          {category.slug}
        </div>
      </td>

      {/* Parent category column */}
      <td style={{ width: "140px" }}>
        {category.parent_id ? (
          <Badge variant="outline" className="text-xs">
            Danh mục con
          </Badge>
        ) : (
          <Badge variant="default" className="text-xs">
            Danh mục gốc
          </Badge>
        )}
      </td>

      {/* Status column */}
      <td style={{ width: "120px" }}>
        <Badge
          variant={category.is_active ? "default" : "secondary"}
          className="text-xs"
        >
          {category.is_active ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      </td>

      {/* Actions column */}
      <td style={{ width: "180px" }}>
        <div className="flex gap-1 whitespace-nowrap">
          {/* Nếu là danh mục gốc, hiện nút "Thêm con" */}
          {!category.parent_id && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 flex-shrink-0"
              onClick={() => onAddSubCategory(category._id)}
              title="Thêm danh mục con"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xl:inline">Con</span>
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 flex-shrink-0"
            onClick={() => onEdit(category._id)}
          >
            <Edit2 className="w-4 h-4" />
            <span className="hidden xl:inline">Sửa</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive flex-shrink-0"
            onClick={() => onDelete(category._id)}
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden xl:inline">Xóa</span>
          </Button>
        </div>
      </td>
    </tr>
  );
}


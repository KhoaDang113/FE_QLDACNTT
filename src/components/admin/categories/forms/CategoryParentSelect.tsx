import type { Category } from "@/types";

interface CategoryParentSelectProps {
  parentId: string;
  availableCategories: Category[];
  isSubmitting: boolean;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
}

export function CategoryParentSelect({
  parentId,
  availableCategories,
  isSubmitting,
  onInputChange,
}: CategoryParentSelectProps) {
  return (
    <div>
      <label htmlFor="parent_id" className="block text-sm font-medium mb-1">
        Danh mục cha (Tùy chọn)
      </label>
      <select
        id="parent_id"
        name="parent_id"
        value={parentId}
        onChange={onInputChange}
        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
        disabled={isSubmitting}
      >
        <option value="">-- Danh mục gốc --</option>
        {availableCategories.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </select>
      <p className="text-xs text-muted-foreground mt-1">
        Không chọn nếu muốn tạo danh mục gốc
      </p>
    </div>
  );
}


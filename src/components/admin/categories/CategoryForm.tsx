import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "@/types";
import categoryService from "@/api/services/catalogService";
import { CategoryBasicFields } from "./forms/CategoryBasicFields";
import { CategoryParentSelect } from "./forms/CategoryParentSelect";
import { CategoryMediaFields } from "./forms/CategoryMediaFields";

interface CategoryFormProps {
  mode: "add" | "edit";
  categoryId?: string;
  parentId?: string; // Pre-select parent khi thêm danh mục con
  onSuccess: () => void;
  onCancel: () => void;
  allCategories?: Category[];
}

interface FormData {
  name: string;
  slug: string;
  image: string;
  description: string;
  parent_id: string;
  is_active: boolean;
}

const initialFormData: FormData = {
  name: "",
  slug: "",
  image: "",
  description: "",
  parent_id: "",
  is_active: true,
};

export function CategoryForm({
  mode,
  categoryId,
  parentId,
  onSuccess,
  onCancel,
  allCategories = [],
}: CategoryFormProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [parentCategory, setParentCategory] = useState<Category | null>(null);
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);

  useEffect(() => {
    const loadCategoryData = async () => {
      if (mode === "edit" && categoryId) {
        try {
          setIsLoading(true);
          const category = await categoryService.getCategoryById(categoryId);
          setFormData({
            name: category.name || "",
            slug: category.slug || "",
            image: category.image || "",
            description: category.description || "",
            parent_id: category.parent_id || "",
            is_active: category.is_active ?? true,
          });

          // Load parent category info nếu là danh mục con
          if (category.parent_id) {
            const parent = allCategories.find(
              (c) => c._id === category.parent_id
            );
            if (parent) {
              setParentCategory(parent);
            }
          }
        } catch (error) {
          console.error("Error loading category:", error);
          toast.error("Không thể tải dữ liệu danh mục");
        } finally {
          setIsLoading(false);
        }
      } else if (mode === "add" && parentId) {
        // Pre-select parent khi thêm danh mục con
        setFormData((prev) => ({ ...prev, parent_id: parentId }));
        const parent = allCategories.find((c) => c._id === parentId);
        if (parent) {
          setParentCategory(parent);
        }
      }
    };

    loadCategoryData();
  }, [mode, categoryId, parentId, allCategories]);

  // Kiểm tra slug trùng lặp
  const checkSlugUniqueness = async (slug: string): Promise<boolean> => {
    if (!slug.trim()) return true;

    try {
      setIsCheckingSlug(true);
      const exists = await categoryService.checkSlug(
        slug.trim(),
        mode === "edit" ? categoryId : undefined
      );
      return !exists;
    } catch (error) {
      console.error("Error checking slug:", error);
      return true; // Cho phép submit nếu check lỗi, backend sẽ xử lý
    } finally {
      setIsCheckingSlug(false);
    }
  };

  // Xử lý sự kiện blur trên slug field
  const handleSlugBlur = async () => {
    if (formData.slug.trim()) {
      const isUnique = await checkSlugUniqueness(formData.slug);
      if (!isUnique) {
        setErrors((prev) => ({
          ...prev,
          slug: "Đã có slug này, vui lòng đổi slug khác",
        }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          if (newErrors.slug === "Đã có slug này, vui lòng đổi slug khác") {
            delete newErrors.slug;
          }
          return newErrors;
        });
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Tên danh mục là bắt buộc";
    if (!formData.slug.trim()) newErrors.slug = "Slug là bắt buộc";

    // Kiểm tra các trường bắt buộc khi tạo mới
    if (mode === "add") {
      if (!formData.description.trim()) newErrors.description = "Mô tả là bắt buộc";
      if (!imageFile && !formData.image) newErrors.image = "Ảnh danh mục là bắt buộc";
    }

    // Giữ lại lỗi slug trùng nếu có
    if (errors.slug === "Đã có slug này, vui lòng đổi slug khác") {
      newErrors.slug = errors.slug;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    // Auto-generate slug from name
    if (name === "name" && !formData.slug) {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      setFormData((prev) => ({ ...prev, slug }));
    }
  };

  const handleImageFileChange = (file: File | null) => {
    setImageFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name.trim());
      formDataToSend.append("slug", formData.slug.trim());

      if (formData.parent_id) {
        formDataToSend.append("parent_id", formData.parent_id);
      }

      if (formData.description.trim()) {
        formDataToSend.append("description", formData.description.trim());
      }

      formDataToSend.append("is_active", formData.is_active.toString());

      // Add image file if selected
      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      if (mode === "edit" && categoryId) {
        await categoryService.updateCategory(categoryId, formDataToSend);
        toast.success("Cập nhật danh mục thành công!");
      } else {
        await categoryService.createCategory(formDataToSend);
        toast.success("Thêm danh mục mới thành công!");
      }

      onSuccess();
    } catch (error) {
      console.error("Error submitting form:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể lưu danh mục. Vui lòng thử lại sau.";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const availableParentCategories = allCategories.filter(
    (cat) => cat._id !== categoryId && !cat.parent_id
  );

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Đang tải dữ liệu...</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <CategoryBasicFields
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          isCheckingSlug={isCheckingSlug}
          onInputChange={handleInputChange}
          onSlugBlur={handleSlugBlur}
        />

        {/* Hiển thị parent category */}
        {parentCategory && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-100">
                📂 Danh mục cha:
              </span>
              <span className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                {parentCategory.name}
              </span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Danh mục này sẽ là danh mục con của "{parentCategory.name}"
            </p>
          </div>
        )}

        {/* Chỉ hiển thị select nếu không có parent được chọn sẵn */}
        {!parentCategory && (
          <CategoryParentSelect
            parentId={formData.parent_id}
            availableCategories={availableParentCategories}
            isSubmitting={isSubmitting}
            onInputChange={handleInputChange}
          />
        )}

        <CategoryMediaFields
          formData={formData}
          errors={errors}
          isSubmitting={isSubmitting}
          mode={mode}
          onInputChange={handleInputChange}
          onImageFileChange={handleImageFileChange}
        />

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="is_active"
            name="is_active"
            checked={formData.is_active}
            onChange={handleInputChange}
            className="w-4 h-4"
            disabled={isSubmitting}
          />
          <label htmlFor="is_active" className="text-sm font-medium">
            Kích hoạt danh mục
          </label>
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 gap-2"
          >
            <Save className="w-4 h-4" />
            {isSubmitting
              ? "Đang lưu..."
              : mode === "edit"
                ? "Cập nhật"
                : "Thêm mới"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 gap-2 bg-transparent"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
            Hủy
          </Button>
        </div>
      </form>
    </Card>
  );
}

import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface CategoryBasicFieldsProps {
  formData: {
    name: string;
    slug: string;
  };
  errors: Record<string, string>;
  isSubmitting: boolean;
  isCheckingSlug?: boolean;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => void;
  onSlugBlur?: () => void;
}

export function CategoryBasicFields({
  formData,
  errors,
  isSubmitting,
  isCheckingSlug = false,
  onInputChange,
  onSlugBlur,
}: CategoryBasicFieldsProps) {
  return (
    <>
      <div>
        <label htmlFor="name" className="block text-sm font-medium mb-1">
          Tên danh mục *
        </label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={onInputChange}
          placeholder="Nhập tên danh mục"
          className={errors.name ? "border-destructive" : ""}
          disabled={isSubmitting}
        />
        {errors.name && (
          <p className="text-sm text-destructive mt-1">{errors.name}</p>
        )}
      </div>

      <div>
        <label htmlFor="slug" className="block text-sm font-medium mb-1">
          Slug *
        </label>
        <div className="relative">
          <Input
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={onInputChange}
            onBlur={onSlugBlur}
            placeholder="ten-danh-muc"
            className={errors.slug ? "border-destructive pr-10" : ""}
            disabled={isSubmitting}
          />
          {isCheckingSlug && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
        {errors.slug && (
          <p className="text-sm text-destructive mt-1">{errors.slug}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          Tự động tạo từ tên danh mục
        </p>
      </div>
    </>
  );
}

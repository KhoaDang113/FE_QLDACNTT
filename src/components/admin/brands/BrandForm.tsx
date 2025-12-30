import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { ImageIcon } from "lucide-react";
import type { Brand, BrandFormData } from "@/types/brand.type";

interface BrandFormProps {
  brand?: Brand | null;
  onSubmit: (data: BrandFormData) => void;
  onCancel: () => void;
}

export function BrandForm({ brand, onSubmit, onCancel }: BrandFormProps) {
  const [formData, setFormData] = useState<BrandFormData>({
    name: "",
    slug: "",
    description: "",
    image: "",
    isActive: true,
  });
  const [imagePreview, setImagePreview] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (brand) {
      setFormData({
        name: brand.name,
        slug: brand.slug,
        description: brand.description || "",
        image: brand.image,
        isActive: brand.is_active,
      });
      setImagePreview(brand.image);
    }
  }, [brand]);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        setFormData((prev) => ({
          ...prev,
          image: imageData,
        }));
        setImagePreview(imageData);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên thương hiệu không được để trống";
    }
    if (!formData.slug.trim()) {
      newErrors.slug = "Slug không được để trống";
    }
    if (!brand && !formData.image) {
      newErrors.image = "Ảnh thương hiệu là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      {/* Name */}
      <div className="space-y-2">
        <Label htmlFor="name">Tên thương hiệu *</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={handleNameChange}
          placeholder="Nhập tên thương hiệu"
          className={errors.name ? "border-red-500" : ""}
        />
        {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <Label htmlFor="slug">Slug *</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, slug: e.target.value }))
          }
          placeholder="slug-tu-dong"
          className={errors.slug ? "border-red-500" : ""}
        />
        {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
        <p className="text-xs text-muted-foreground">
          Slug tự động tạo từ tên, bạn có thể chỉnh sửa
        </p>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Mô tả</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          placeholder="Mô tả thương hiệu (không bắt buộc)"
          rows={3}
        />
      </div>

      {/* Image */}
      <div className="space-y-2">
        <Label>Ảnh thương hiệu {!brand && "*"}</Label>
        <div className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer hover:bg-muted/50 transition">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-input"
          />
          <label htmlFor="image-input" className="cursor-pointer block">
            {imagePreview ? (
              <div className="space-y-2">
                <img
                  src={imagePreview || "/placeholder.svg"}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded mx-auto"
                />
                <p className="text-sm text-muted-foreground">
                  Click để thay đổi ảnh
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click để upload ảnh hoặc kéo thả
                </p>
              </div>
            )}
          </label>
        </div>
        {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
      </div>

      {/* Active Status */}
      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
        <Label htmlFor="status" className="cursor-pointer">
          Kích hoạt thương hiệu
        </Label>
        <Switch
          id="status"
          checked={formData.isActive}
          onCheckedChange={(checked) =>
            setFormData((prev) => ({ ...prev, isActive: checked }))
          }
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 justify-end pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button type="submit">{brand ? "Cập nhật" : "Thêm thương hiệu"}</Button>
      </div>
    </form>
  );
}

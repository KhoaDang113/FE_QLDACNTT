import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Save } from "lucide-react";
import { typeComboService } from "@/api";
import type { TypeCombo } from "@/types/typeCombo.type";
import { toast } from "sonner";

interface TypeComboFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  typeCombo?: TypeCombo | null;
  onSuccess: () => void;
}

interface FormData {
  name: string;
  slug: string;
  description: string;
  order_index: number;
  is_active: boolean;
}

const initialFormData: FormData = {
  name: "",
  slug: "",
  description: "",
  order_index: 0,
  is_active: true,
};

export function TypeComboFormModal({
  open,
  onOpenChange,
  typeCombo,
  onSuccess,
}: TypeComboFormModalProps) {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mode = typeCombo ? "edit" : "add";

  useEffect(() => {
    if (typeCombo) {
      setFormData({
        name: typeCombo.name,
        slug: typeCombo.slug,
        description: typeCombo.description || "",
        order_index: typeCombo.order_index,
        is_active: typeCombo.is_active,
      });
    } else {
      setFormData(initialFormData);
    }
    setErrors({});
  }, [typeCombo, open]);

  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
  };

  const handleNameChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      name: value,
      slug: mode === "add" ? generateSlug(value) : prev.slug,
    }));
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Tên loại món ăn là bắt buộc";
    if (!formData.slug.trim()) newErrors.slug = "Slug là bắt buộc";
    if (formData.order_index < 0) newErrors.order_index = "Thứ tự phải >= 0";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsSubmitting(true);

    try {
      if (mode === "add") {
        await typeComboService.createTypeCombo(formData);
        toast.success("Thêm loại món ăn thành công");
      } else {
        await typeComboService.updateTypeCombo(typeCombo!._id, formData);
        toast.success("Cập nhật loại món ăn thành công");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      const message = error?.response?.data?.message || "Có lỗi xảy ra";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {mode === "add" ? "Thêm loại món ăn mới" : "Chỉnh sửa loại món ăn"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Tên loại món ăn <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Ví dụ: Món xào, Món chay..."
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">
              Slug <span className="text-red-500">*</span>
            </Label>
            <Input
              id="slug"
              value={formData.slug}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, slug: e.target.value }));
                if (errors.slug) setErrors((prev) => ({ ...prev, slug: "" }));
              }}
              placeholder="mon-xao, mon-chay..."
            />
            {errors.slug && <p className="text-sm text-red-500">{errors.slug}</p>}
            <p className="text-xs text-muted-foreground">
              {mode === "add" && "Tự động tạo từ tên"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="Mô tả ngắn về loại món ăn"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="order_index">Thứ tự hiển thị</Label>
            <Input
              id="order_index"
              type="number"
              min="0"
              value={formData.order_index}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, order_index: parseInt(e.target.value) || 0 }));
                if (errors.order_index) setErrors((prev) => ({ ...prev, order_index: "" }));
              }}
            />
            {errors.order_index && <p className="text-sm text-red-500">{errors.order_index}</p>}
            <p className="text-xs text-muted-foreground">Số nhỏ hơn sẽ hiển thị trước</p>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="is_active">Đang hoạt động</Label>
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, is_active: checked }))
              }
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <Save className="w-4 h-4" />
              {isSubmitting ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

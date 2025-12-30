import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Category } from "@/types";
import categoryService from "@/api/services/catalogService";
import bannerService from "@/api/services/bannerService";
import { toast } from "sonner";

interface BannerFormProps {
  mode: "create" | "edit";
  bannerId?: string;
}

export function BannerForm({ mode, bannerId }: BannerFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form fields
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [link, setLink] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getAllCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };
    fetchCategories();
  }, []);

  // Load banner data if editing
  useEffect(() => {
    if (mode === "edit" && bannerId) {
      const fetchBanner = async () => {
        try {
          setLoading(true);
          // Lấy tất cả banners và tìm banner cần edit
          const allBanners = await bannerService.getAllBanners();
          const banner = allBanners.find(
            (b) => b._id === bannerId || b.id === bannerId
          );

          if (banner) {
            setImagePreview(banner.image || banner.image_url || "");
            setLink(banner.link || banner.link_url || "");
            setCategoryId(banner.category_id || "");
            setIsActive(banner.is_active ?? true);
          }
        } catch (error) {
          console.error("Error fetching banner:", error);
          toast.error("Không thể tải thông tin banner");
        } finally {
          setLoading(false);
        }
      };
      fetchBanner();
    }
  }, [mode, bannerId]);

  const handleImageChange = (file: File | null) => {
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!link.trim()) {
      toast.error("Vui lòng nhập link URL");
      return;
    }

    if (mode === "create" && !imageFile) {
      toast.error("Vui lòng chọn hình ảnh");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      if (imageFile) {
        formData.append("image", imageFile);
      }
      formData.append("link", link);
      if (categoryId) {
        formData.append("category_id", categoryId);
      }
      formData.append("is_active", String(isActive));

      if (mode === "create") {
        await bannerService.createBanner(formData);
        toast.success("Tạo banner thành công!");
      } else if (mode === "edit" && bannerId) {
        await bannerService.updateBanner(bannerId, formData);
        toast.success("Cập nhật banner thành công!");
      }

      navigate("/admin/banners");
    } catch (error: any) {
      console.error("Error saving banner:", error);
      toast.error(
        error?.response?.data?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6 space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <Label htmlFor="image">
            Hình ảnh <span className="text-destructive">*</span>
          </Label>
          <div className="space-y-4">
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleImageChange(file);
                }
              }}
              className="cursor-pointer"
            />
            {imagePreview && (
              <div className="relative w-full h-64 border border-border rounded-lg overflow-hidden">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            Upload hình ảnh banner (khuyến nghị 1200x400px)
          </p>
        </div>

        {/* Link URL */}
        <div className="space-y-2">
          <Label htmlFor="link">
            Link URL <span className="text-destructive">*</span>
          </Label>
          <Input
            id="link"
            type="url"
            placeholder="https://example.com"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
          />
          <p className="text-sm text-muted-foreground">
            URL mà banner sẽ dẫn đến khi người dùng click
          </p>
        </div>

        {/* Category Selection */}
        <div className="space-y-2">
          <Label htmlFor="category">Danh mục (tùy chọn)</Label>
          <Select
            value={categoryId || "none"}
            onValueChange={(value) => setCategoryId(value === "none" ? "" : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Chọn danh mục" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Không có danh mục</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category._id} value={category._id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Chọn danh mục để hiển thị banner trong danh mục đó
          </p>
        </div>

        {/* Active Status */}
        <div className="flex items-center justify-between space-x-2">
          <div className="space-y-0.5">
            <Label htmlFor="is_active">Trạng thái hoạt động</Label>
            <p className="text-sm text-muted-foreground">
              Banner sẽ được hiển thị trên trang web khi ở trạng thái hoạt động
            </p>
          </div>
          <Switch
            id="is_active"
            checked={isActive}
            onCheckedChange={setIsActive}
          />
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center gap-3">
        <Button type="submit" disabled={loading}>
          {loading
            ? "Đang xử lý..."
            : mode === "create"
              ? "Tạo Banner"
              : "Cập nhật Banner"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/admin/banners")}
        >
          Hủy
        </Button>
      </div>
    </form>
  );
}

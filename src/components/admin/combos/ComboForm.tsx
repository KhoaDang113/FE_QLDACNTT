import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Save, Image as ImageIcon, X } from "lucide-react";
import { comboService, typeComboService } from "@/api";
import type { TypeCombo } from "@/types/typeCombo.type";
import { toast } from "sonner";

interface ComboFormProps {
  mode: "add" | "edit";
  comboId?: string;
}

interface FormData {
  name: string;
  description: string;
  type_combo_id: string;
  is_active: boolean;
}

const initialFormData: FormData = {
  name: "",
  description: "",
  type_combo_id: "",
  is_active: true,
};

export function ComboForm({ mode, comboId }: ComboFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [typeCombos, setTypeCombos] = useState<TypeCombo[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(true);
  const [currentTypeComboName, setCurrentTypeComboName] = useState<string>("");

  // Image states
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [currentImage, setCurrentImage] = useState<string>("");

  useEffect(() => {
    loadTypeCombos();
  }, []);

  useEffect(() => {
    if (mode === "edit" && comboId) {
      loadComboData();
    }
  }, [mode, comboId]);

  const loadTypeCombos = async () => {
    try {
      setLoadingTypes(true);
      const data = await typeComboService.getTypeCombos();
      setTypeCombos(data);
    } catch (error) {
      console.error("Error loading type combos:", error);
      toast.error("Không thể tải danh sách loại món ăn");
    } finally {
      setLoadingTypes(false);
    }
  };

  const loadComboData = async () => {
    try {
      setIsLoading(true);
      const combo = await comboService.getComboById(comboId!);
      setFormData({
        name: combo.name,
        description: combo.description,
        type_combo_id: combo.type_combo_id || combo.type_combo?._id || "",
        is_active: combo.is_active,
      });

      if (combo.image) {
        setCurrentImage(combo.image);
      }

      // Lưu tên type combo hiện tại để hiển thị
      if (combo.type_combo && combo.type_combo.name) {
        setCurrentTypeComboName(combo.type_combo.name);
      }
    } catch (error) {
      console.error("Error loading combo:", error);
      toast.error("Không thể tải thông tin combo");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Tên món ăn là bắt buộc";
    if (!formData.description.trim()) newErrors.description = "Mô tả là bắt buộc";
    if (!formData.type_combo_id) newErrors.type_combo_id = "Loại món ăn là bắt buộc";

    if (mode === "add" && !imageFile && !currentImage) {
      newErrors.image = "Ảnh là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCurrentImage(reader.result as string);
      };
      reader.readAsDataURL(file);
      setImageFile(file);
      if (errors.image) {
        setErrors((prev) => ({ ...prev, image: "" }));
      }
    }
  };

  const removeImage = () => {
    setCurrentImage("");
    setImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsSubmitting(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("type_combo_id", formData.type_combo_id);
      formDataToSend.append("is_active", formData.is_active.toString());

      if (imageFile) {
        formDataToSend.append("image", imageFile);
      }

      if (mode === "add") {
        await comboService.createCombo(formDataToSend);
        toast.success("Thêm món ăn thành công");
      } else {
        await comboService.updateCombo(comboId!, formDataToSend);
        toast.success("Cập nhật món ăn thành công");
      }

      navigate("/admin/combos");
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      toast.error("Có lỗi xảy ra");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Đang tải...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2">
        <Link to="/admin/combos">
          <Button variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>

            <div className="space-y-2">
              <Label htmlFor="name">Tên món ăn <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nhập tên món ăn"
              />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type_combo_id">Loại món ăn <span className="text-red-500">*</span></Label>

              <Select
                value={formData.type_combo_id}
                onValueChange={(value) => {
                  setFormData((prev) => ({ ...prev, type_combo_id: value }));
                  if (errors.type_combo_id) {
                    setErrors((prev) => ({ ...prev, type_combo_id: "" }));
                  }
                }}
                disabled={loadingTypes}
              >
                <SelectTrigger id="type_combo_id">
                  <SelectValue placeholder={loadingTypes ? "Đang tải..." : "Chọn loại món ăn"} />
                </SelectTrigger>
                <SelectContent>
                  {typeCombos.map((typeCombo) => {
                    return (
                      <SelectItem key={typeCombo._id} value={typeCombo._id}>
                        {typeCombo.name}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.type_combo_id && <p className="text-sm text-red-500">{errors.type_combo_id}</p>}

              {mode === "edit" && currentTypeComboName && (
                <p className="text-xs text-muted-foreground">
                  Loại hiện tại: <span className="font-medium">{currentTypeComboName}</span>
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Mô tả <span className="text-red-500">*</span></Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Mô tả chi tiết món ăn"
                rows={5}
              />
              {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Trạng thái</h3>
            <div className="flex items-center justify-between">
              <Label htmlFor="is_active">Đang kinh doanh</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) =>
                  setFormData((prev) => ({ ...prev, is_active: checked }))
                }
              />
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">Hình ảnh <span className="text-red-500">*</span></h3>
            <div className="space-y-4">
              <Input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              {currentImage ? (
                <div className="relative w-full h-48 border border-border rounded-lg overflow-hidden group">
                  <img
                    src={currentImage}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={removeImage}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="w-full h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Chưa có ảnh</p>
                  </div>
                </div>
              )}
              {errors.image && <p className="text-sm text-red-500">{errors.image}</p>}
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          <Save className="w-4 h-4" />
          {isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
        </Button>
      </div>
    </form>
  );
}

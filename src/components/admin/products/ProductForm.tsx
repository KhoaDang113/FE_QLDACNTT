import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MultipleImageUpload } from "@/components/admin/products/MultipleImageUpload";
import { ArrowLeft, Save } from "lucide-react";
import { ProductBasicInfo } from "./forms/ProductBasicInfo";
import { ProductPricing } from "./forms/ProductPricing";
import { ProductInventory } from "./forms/ProductInventory";
import { ProductStatus } from "./forms/ProductStatus";
import productService from "@/api/services/productService";
import { toast } from "sonner";

interface ProductFormProps {
  mode: "add" | "edit";
  productId?: string;
}

interface FormData {
  name: string;
  slug: string;
  unit: string;
  category_id: string;
  brand_id: string;
  unit_price: string;
  final_price: string;
  discount_percent: string;
  stock_quantity: string;
  is_hot: boolean;
  stock_status: "in_stock" | "out_of_stock" | "preorder";
  is_active: boolean;
}

const initialFormData: FormData = {
  name: "",
  slug: "",
  unit: "",
  category_id: "",
  brand_id: "",
  unit_price: "",
  final_price: "",
  discount_percent: "",
  stock_quantity: "",
  is_hot: false,
  stock_status: "in_stock",
  is_active: true,
};

export function ProductForm({ mode, productId }: ProductFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Image states
  const [primaryImageFile, setPrimaryImageFile] = useState<File | null>(null);
  const [galleryImageFiles, setGalleryImageFiles] = useState<File[]>([]);
  const [currentPrimaryImage, setCurrentPrimaryImage] = useState<string>("");
  const [currentGalleryImages, setCurrentGalleryImages] = useState<string[]>(
    []
  );

  // Load product data if in edit mode
  useEffect(() => {
    if (mode === "edit" && productId) {
      loadProductData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, productId]);

  const loadProductData = async () => {
    try {
      setIsLoading(true);
      const product = await productService.getProductById(productId!);

      // Populate form data
      const unitPrice = product.unit_price?.toString() || "";
      const discountPercent = product.discount_percent?.toString() || "0";
      
      // Tính lại giá bán từ giá gốc và % giảm giá
      let finalPrice = "";
      if (unitPrice) {
        const unitPriceNum = parseFloat(unitPrice);
        const discountPercentNum = parseFloat(discountPercent) || 0;
        finalPrice = discountPercentNum > 0
          ? (unitPriceNum * (1 - discountPercentNum / 100)).toFixed(0)
          : unitPrice;
      }
      
      setFormData({
        name: product.name || "",
        slug: product.slug || "",
        unit: product.unit || "",
        category_id:
          typeof product.category_id === "string" ? product.category_id : "",
        brand_id: typeof product.brand_id === "string" ? product.brand_id : "",
        unit_price: unitPrice,
        final_price: finalPrice || product.final_price?.toString() || "",
        discount_percent: discountPercent,
        stock_quantity:
          product.quantity?.toString() ||
          product.stock_quantity?.toString() ||
          "",
        is_hot: product.is_hot || false,
        stock_status: product.stock_status || "in_stock",
        is_active: product.is_active !== undefined ? product.is_active : true,
      });

      // Set existing images
      if (product.image_primary) {
        setCurrentPrimaryImage(product.image_primary);
      }
      if (product.images && product.images.length > 0) {
        setCurrentGalleryImages(product.images);
      }
    } catch (error) {
      console.error("Error loading product:", error);
      toast.error("Không thể tải thông tin sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) newErrors.name = "Tên sản phẩm là bắt buộc";
    if (!formData.slug.trim()) newErrors.slug = "Slug là bắt buộc";
    if (!formData.category_id) newErrors.category_id = "Danh mục là bắt buộc";
    if (!formData.brand_id) newErrors.brand_id = "Thương hiệu là bắt buộc";
    if (!formData.unit_price) newErrors.unit_price = "Giá gốc là bắt buộc";

    // Check for primary image only in add mode
    if (mode === "add" && !primaryImageFile && !currentPrimaryImage) {
      newErrors.image_primary = "Ảnh chính là bắt buộc";
    }

    // Note: stock_quantity validation removed - it's managed in inventory module

    if (formData.unit_price && formData.final_price) {
      if (
        Number.parseFloat(formData.final_price) >
        Number.parseFloat(formData.unit_price)
      ) {
        newErrors.final_price = "Giá bán không được lớn hơn giá gốc";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    // Auto-generate slug from name
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      
      setFormData((prev) => ({ ...prev, [name]: value, slug }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFinalPriceChange = (finalPrice: string) => {
    setFormData((prev) => ({ ...prev, final_price: finalPrice }));
    if (errors.final_price) {
      setErrors((prev) => ({ ...prev, final_price: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handlePrimaryImageChange = (file: File | null) => {
    setPrimaryImageFile(file);
    if (errors.image_primary) {
      setErrors((prev) => ({ ...prev, image_primary: "" }));
    }
  };

  const handleGalleryImagesChange = (files: File[]) => {
    setGalleryImageFiles(files);
  };

  const handleIsHotChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, is_hot: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData
      const formDataToSend = new FormData();

      // Add all form fields
      formDataToSend.append("name", formData.name);
      formDataToSend.append("slug", formData.slug);
      formDataToSend.append("category_id", formData.category_id);
      formDataToSend.append("brand_id", formData.brand_id);
      formDataToSend.append("unit_price", formData.unit_price);
      formDataToSend.append("stock_status", formData.stock_status);
      formDataToSend.append("is_active", formData.is_active.toString());

      if (formData.unit) formDataToSend.append("unit", formData.unit);
      if (formData.discount_percent)
        formDataToSend.append("discount_percent", formData.discount_percent);
      if (formData.final_price)
        formDataToSend.append("final_price", formData.final_price);

      // Luôn gửi quantity để đảm bảo backend nhận được
      // Mode add: quantity = 0
      // Mode edit: không gửi quantity (backend giữ nguyên)
      if (mode === "add") {
        formDataToSend.append("quantity", "0");
      }
      // Edit mode: không gửi quantity vì được quản lý trong inventory module

      // Add primary image if new file is selected
      if (primaryImageFile) {
        formDataToSend.append("image_primary", primaryImageFile);
      }

      // Add gallery images if new files are selected
      if (galleryImageFiles.length > 0) {
        galleryImageFiles.forEach((file) => {
          formDataToSend.append("images", file);
        });
      }

      // Call API
      if (mode === "add") {
        await productService.createProduct(formDataToSend);
        toast.success("Thêm sản phẩm thành công");
      } else {
        await productService.updateProduct(productId!, formDataToSend);
        toast.success("Cập nhật sản phẩm thành công");
      }

      navigate("/admin/products");
    } catch (error: unknown) {
      console.error("Error submitting form:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Có lỗi xảy ra";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex gap-2">
        <Link to="/admin/products">
          <Button variant="outline" className="gap-2 bg-transparent">
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </Link>
      </div>

      <ProductBasicInfo
        formData={formData}
        errors={errors}
        onInputChange={handleInputChange}
        onSelectChange={handleSelectChange}
      />

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Ảnh sản phẩm</h3>
        <MultipleImageUpload
          onPrimaryImageChange={handlePrimaryImageChange}
          onGalleryImagesChange={handleGalleryImagesChange}
          currentPrimaryImage={currentPrimaryImage}
          currentGalleryImages={currentGalleryImages}
        />
        {errors.image_primary && (
          <p className="text-sm text-red-500 mt-2">{errors.image_primary}</p>
        )}
      </Card>

      <ProductPricing
        formData={formData}
        errors={errors}
        onInputChange={handleInputChange}
        onFinalPriceChange={handleFinalPriceChange}
      />

      <ProductInventory
        mode={mode}
        formData={formData}
        errors={errors}
        onInputChange={handleInputChange}
      />

      <ProductStatus
        is_hot={formData.is_hot}
        onIsHotChange={handleIsHotChange}
      />

      <div className="flex gap-3 justify-end">
        <Link to="/admin/products">
          <Button type="button" variant="outline">
            Hủy
          </Button>
        </Link>
        <Button type="submit" disabled={isSubmitting} className="gap-2">
          <Save className="w-4 h-4" />
          {isSubmitting
            ? "Đang lưu..."
            : mode === "add"
            ? "Thêm sản phẩm"
            : "Cập nhật sản phẩm"}
        </Button>
      </div>
    </form>
  );
}

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import categoryService from "@/api/services/catalogService";
import brandService from "@/api/services/brandService";
import type { Category, Brand } from "@/types";

interface ProductBasicInfoProps {
  formData: {
    name: string;
    category_id: string;
    brand_id: string;
    unit?: string;
  };
  errors: Record<string, string>;
  onInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onSelectChange: (name: string, value: string) => void;
}

export function ProductBasicInfo({
  formData,
  errors,
  onInputChange,
  onSelectChange,
}: ProductBasicInfoProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesData, brandsData] = await Promise.all([
        categoryService.getCategoriesAdmin(1, 1000),
        brandService.getBrandsAdmin(1, 1000),
      ]);
      
      // Filter active categories and brands
      const activeCategories = categoriesData.categories.filter(c => c.is_active && !c.is_deleted);
      const activeBrands = brandsData.brands.filter(b => b.is_active && !b.is_deleted);
      
      // Sort categories: root categories first, then subcategories
      const sortedCategories = activeCategories.sort((a, b) => {
        // Root categories come first
        if (!a.parent_id && b.parent_id) return -1;
        if (a.parent_id && !b.parent_id) return 1;
        // If both are root or both are subcategories, sort by name
        return a.name.localeCompare(b.name);
      });
      
      setCategories(sortedCategories);
      setBrands(activeBrands);
    } catch (error) {
      console.error("Error loading categories and brands:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Tên sản phẩm *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={onInputChange}
            placeholder="Nhập tên sản phẩm"
            className={errors.name ? "border-destructive" : ""}
          />
          {errors.name && (
            <p className="text-sm text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="category_id">Danh mục *</Label>
            <select
              value={formData.category_id}
              onChange={(e) => onSelectChange("category_id", e.target.value)}
              className={`w-full px-3 py-2 border bg-background rounded-md text-sm ${
                errors.category_id ? "border-destructive" : "border-input"
              }`}
              disabled={loading}
            >
              <option value="">
                {loading ? "Đang tải..." : "Chọn danh mục"}
              </option>
              {categories.map((category) => {
                // Root category (parent) - không cho chọn, chỉ hiển thị
                if (!category.parent_id) {
                  return (
                    <optgroup key={category._id} label={`${category.name}`}>
                      {/* Show subcategories under this parent */}
                      {categories
                        .filter(subCat => subCat.parent_id === category._id)
                        .map(subCategory => (
                          <option key={subCategory._id} value={subCategory._id}>
                            {subCategory.name}
                          </option>
                        ))
                      }
                    </optgroup>
                  );
                }
                // Skip subcategories here as they're already rendered under their parent
                return null;
              })}
            </select>
            {errors.category_id && (
              <p className="text-sm text-destructive mt-1">
                {errors.category_id}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Chỉ có thể chọn danh mục con (subcategory)
            </p>
          </div>

          <div>
            <Label htmlFor="brand_id">Thương hiệu *</Label>
            <select
              value={formData.brand_id}
              onChange={(e) => onSelectChange("brand_id", e.target.value)}
              className={`w-full px-3 py-2 border bg-background rounded-md text-sm ${
                errors.brand_id ? "border-destructive" : "border-input"
              }`}
              disabled={loading}
            >
              <option value="">
                {loading ? "Đang tải..." : "Chọn thương hiệu"}
              </option>
              {brands.map((brand) => (
                <option key={brand._id} value={brand._id}>
                  {brand.name}
                </option>
              ))}
            </select>
            {errors.brand_id && (
              <p className="text-sm text-destructive mt-1">
                {errors.brand_id}
              </p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="unit">Đơn vị tính</Label>
          <Input
            id="unit"
            name="unit"
            value={formData.unit || ""}
            onChange={onInputChange}
            placeholder="VD: kg, lít, hộp, gói..."
          />
          <p className="text-xs text-muted-foreground mt-1">
            Đơn vị đo lường của sản phẩm (kg, lít, hộp, gói, v.v.)
          </p>
        </div>
      </div>
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductPricingProps {
  formData: {
    unit_price: string;
    final_price: string;
    discount_percent: string;
  };
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFinalPriceChange?: (finalPrice: string) => void;
}

export function ProductPricing({
  formData,
  errors,
  onInputChange,
  onFinalPriceChange,
}: ProductPricingProps) {
  // Tự động tính giá bán khi giá gốc hoặc % giảm giá thay đổi
  const handlePriceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onInputChange(e);

    // Nếu thay đổi giá gốc hoặc % giảm giá, tự động tính giá bán
    if (name === "unit_price" || name === "discount_percent") {
      const unitPrice = name === "unit_price"
        ? parseFloat(value) || 0
        : parseFloat(formData.unit_price) || 0;

      const discountPercent = name === "discount_percent"
        ? parseFloat(value) || 0
        : parseFloat(formData.discount_percent) || 0;

      if (unitPrice > 0) {
        const finalPrice = discountPercent > 0
          ? unitPrice * (1 - discountPercent / 100)
          : unitPrice;

        const finalPriceStr = finalPrice.toFixed(0);
        if (onFinalPriceChange) {
          onFinalPriceChange(finalPriceStr);
        }
      }
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Giá cả</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Giá gốc */}
          <div>
            <Label htmlFor="unit_price">Giá gốc *</Label>
            <Input
              id="unit_price"
              name="unit_price"
              type="number"
              value={formData.unit_price}
              onChange={handlePriceInputChange}
              placeholder="0"
              min="0"
              step="1"
              className={errors.unit_price ? "border-destructive" : ""}
            />
            {errors.unit_price && (
              <p className="text-sm text-destructive mt-1">
                {errors.unit_price}
              </p>
            )}
          </div>

          {/* Giảm giá (%) - Đổi vị trí lên thứ 2 */}
          <div>
            <Label htmlFor="discount_percent">Giảm giá (%)</Label>
            <Input
              id="discount_percent"
              name="discount_percent"
              type="number"
              value={formData.discount_percent}
              onChange={handlePriceInputChange}
              placeholder="0"
              min="0"
              max="100"
              step="1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Giá bán sẽ tự động tính khi nhập giá gốc và % giảm giá
            </p>
          </div>

          {/* Giá bán - Đổi vị trí xuống thứ 3, readonly */}
          <div>
            <Label htmlFor="final_price">Giá bán *</Label>
            <Input
              id="final_price"
              name="final_price"
              type="number"
              value={formData.final_price}
              onChange={onInputChange}
              placeholder="0"
              readOnly
              className={errors.final_price ? "border-destructive bg-muted" : "bg-muted cursor-not-allowed"}
            />
            {errors.final_price && (
              <p className="text-sm text-destructive mt-1">
                {errors.final_price}
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Tự động tính từ giá gốc và % giảm giá
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
}

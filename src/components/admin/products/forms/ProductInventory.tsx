import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

interface ProductInventoryProps {
  mode: "add" | "edit";
  formData: {
    stock_quantity: string;
  };
  errors: Record<string, string>;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProductInventory({
  mode,
  formData,
  errors,
  onInputChange,
}: ProductInventoryProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Kho hàng</h3>
      <div className="space-y-4">
        {mode === "edit" && (
          <div>
            <Label htmlFor="stock_quantity">Số lượng tồn kho</Label>
            <Input
              id="stock_quantity"
              name="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={onInputChange}
              placeholder="0"
              disabled
              className="bg-muted cursor-not-allowed"
            />
            <div className="flex items-start gap-2 mt-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <p>
                Số lượng tồn kho chỉ có thể chỉnh sửa trong phần{" "}
                <strong>Quản lý Kho</strong>. Sử dụng chức năng Nhập/Xuất kho để
                cập nhật số lượng.
              </p>
            </div>
          </div>
        )}

        {mode === "add" && (
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  Số lượng tồn kho mặc định
                </p>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Khi thêm sản phẩm mới, số lượng tồn kho sẽ được đặt mặc định là{" "}
                  <strong>0</strong>. Bạn có thể cập nhật số lượng sau khi tạo sản
                  phẩm thông qua <strong>Quản lý Kho</strong>.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

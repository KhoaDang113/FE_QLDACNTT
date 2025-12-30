import { Card } from "@/components/ui/card";
import { AlertCircle, CheckCircle2 } from "lucide-react";

interface LowStockProduct {
  id: string;
  name: string;
  quantity: number;
  unit: string;
}

interface LowStockAlertProps {
  data?: LowStockProduct[];
  loading?: boolean;
}

export function LowStockAlert({ data = [], loading }: LowStockAlertProps) {
  const hasLowStock = data.length > 0;

  return (
    <Card className={`p-6 ${hasLowStock ? "border-orange-200 bg-orange-50" : "border-green-200 bg-green-50"}`}>
      <div className="mb-4">
        <h3 className={`text-lg font-semibold flex items-center gap-2 ${hasLowStock ? "text-orange-900" : "text-green-900"}`}>
          {hasLowStock ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <CheckCircle2 className="w-5 h-5" />
          )}
          {hasLowStock ? "Cảnh báo hàng tồn thấp" : "Hàng tồn kho ổn định"}
        </h3>
        <p className={`text-sm ${hasLowStock ? "text-orange-700" : "text-green-700"}`}>
          {hasLowStock ? "Các sản phẩm sắp hết hàng" : "Tất cả sản phẩm còn đủ hàng"}
        </p>
      </div>
      {loading ? (
        <div className="h-[120px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
        </div>
      ) : hasLowStock ? (
        <div className="space-y-3">
          {data.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-3 bg-white rounded-lg border border-orange-200"
            >
              <div>
                <p className="font-medium text-foreground">{item.name}</p>
                <p className="text-sm text-muted-foreground">
                  Tồn kho: {item.quantity}
                </p>
              </div>
              <span className="text-sm font-semibold text-orange-600">
                Cảnh báo
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-green-700">
          <CheckCircle2 className="w-8 h-8 mx-auto mb-2" />
          <p>Không có sản phẩm nào có số lượng thấp</p>
        </div>
      )}
    </Card>
  );
}

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface RecentOrder {
  id: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
}

interface RecentOrdersProps {
  data?: RecentOrder[];
  loading?: boolean;
}

const statusLabels: Record<string, string> = {
  pending: "Chờ xác nhận",
  confirmed: "Đã xác nhận",
  assigned: "Đã phân công",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  assigned: "bg-indigo-100 text-indigo-800",
  shipped: "bg-cyan-100 text-cyan-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

function formatCurrency(value: number): string {
  return value.toLocaleString("vi-VN") + "₫";
}

export function RecentOrders({ data = [], loading }: RecentOrdersProps) {
  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Đơn hàng gần đây</h3>
        <p className="text-sm text-muted-foreground">5 đơn hàng mới nhất</p>
      </div>
      {loading ? (
        <div className="h-[200px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
        </div>
      ) : data.length === 0 ? (
        <div className="h-[200px] flex items-center justify-center text-muted-foreground">
          Chưa có đơn hàng nào
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex-1">
                <p className="font-medium text-foreground">
                  {order.id.slice(-8).toUpperCase()}
                </p>
                <p className="text-sm text-muted-foreground">{order.customer}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-foreground">
                  {formatCurrency(order.total)}
                </p>
                <Badge className={statusColors[order.status] || "bg-gray-100 text-gray-800"}>
                  {statusLabels[order.status] || order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

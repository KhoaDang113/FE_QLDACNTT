import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { Calendar, MapPin, Phone, User, Package } from "lucide-react";
import type { Order } from "@/types/order";

interface OrderDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
}

export function OrderDetailDialog({
  isOpen,
  onClose,
  order,
}: OrderDetailDialogProps) {
  if (!order) return null;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Package className="h-6 w-6" />
            Chi Tiết Đơn Hàng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Header with Order ID and Status */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-gray-900">
                  Mã đơn hàng: #{order.id}
                </span>
                <OrderStatusBadge status={order.status} />
              </div>
            </CardContent>
          </Card>

          {/* Customer Info */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold mb-3 pb-3 border-b border-gray-200 text-gray-900">
                Thông tin khách hàng
              </h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Ngày tạo:</span>
                  <span>{formatDate(order.created_at)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Tên người nhận:</span>
                  <span>{order.customer_name}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-700">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Số điện thoại:</span>
                  <span>{order.customer_phone}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-700">
                  <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                  <span className="font-medium">Địa chỉ:</span>
                  <span className="flex-1">{order.customer_address}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <h3 className="text-sm font-bold mb-3 pb-3 border-b border-gray-200 text-gray-900">
                Sản phẩm đã đặt
              </h3>
              <div className="space-y-3">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4 p-3 border border-gray-200 rounded"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/64x64?text=No+Image";
                      }}
                    />
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{item.name}</h4>
                      <p className="text-xs text-gray-600">
                        {item.quantity} {item.unit} ×{" "}
                        {item.price.toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Total */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  Tổng tiền cước:
                </span>
                <span className="text-base font-bold text-green-600">
                  {order.total_amount.toLocaleString("vi-VN")}đ
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

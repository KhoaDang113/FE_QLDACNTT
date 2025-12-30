import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Trash2, Eye, Phone, MapPin, Calendar, User, Truck } from "lucide-react";
import type { Order } from "@/types/order.type";
import { OrderStatusBadge } from "./OrderStatusBadge";

interface OrderListItemProps {
  order: Order;
  onConfirm: (orderId: string) => Promise<void>;
  onCancel: (orderId: string, reason?: string) => Promise<void>;
  onDeliver: (orderId: string) => Promise<void>;
  onViewDetail: (order: Order) => void;
}

export function OrderListItem({
  order,
  onConfirm,
  onCancel,
  onDeliver,
  onViewDetail,
}: OrderListItemProps) {
  const [actionLoading, setActionLoading] = useState<
    null | "confirm" | "cancel" | "deliver"
  >(null);

  const handleConfirm = async () => {
    if (actionLoading) return;
    try {
      setActionLoading("confirm");
      await onConfirm(order.id);
    } catch (error) {
      console.error("Confirm order failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (actionLoading) return;
    let reason: string | undefined;
    if (order.status === "pending") {
      reason = undefined;
    } else {
      const promptValue = window.prompt(
        "Nhập lý do hủy đơn hàng",
        "Hủy bởi nhân viên"
      );
      if (promptValue === null) {
        return;
      }
      reason = promptValue || undefined;
    }
    try {
      setActionLoading("cancel");
      await onCancel(order.id, reason);
    } catch (error) {
      console.error("Cancel order failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeliver = async () => {
    if (actionLoading) return;
    try {
      setActionLoading("deliver");
      await onDeliver(order.id);
    } catch (error) {
      console.error("Deliver order failed:", error);
    } finally {
      setActionLoading(null);
    }
  };

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
    <Card className="border border-gray-200 shadow-sm hover:shadow-md transition-shadow h-full">
      <CardContent className="p-3 sm:p-4 flex flex-col h-full">
        <div className="space-y-3 flex-1">
          {/* Mã đơn hàng - trên cùng */}
          <div className="pb-2 border-b border-gray-200 flex items-center justify-between gap-3">
            <div>
              <span className="text-sm font-bold text-gray-900 truncate max-w-[65%]">
                {order.id}
              </span>
            </div>
            <OrderStatusBadge status={order.status} />
          </div>

          {/* Thông tin đơn hàng */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Calendar className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="font-medium">Ngày tạo:</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <User className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="font-medium">Người nhận:</span>
              <span className="truncate" title={order.customer_name}>
                {order.customer_name}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Phone className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="font-medium">Số điện thoại:</span>
              <span>{order.customer_phone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin className="w-4 h-4 text-gray-500 flex-shrink-0" />
              <span className="font-medium">Địa chỉ:</span>
              <span className="truncate flex-1" title={order.customer_address}>
                {order.customer_address}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <span className="font-medium">Sản phẩm:</span>
              <span
                className="truncate flex-1"
                title={order.items
                  .map((item) => `${item.name} (${item.quantity} ${item.unit})`)
                  .join(", ")}
              >
                {order.items
                  .map((item) => `${item.name} (${item.quantity} ${item.unit})`)
                  .join(", ")}
              </span>
            </div>
          </div>

          {/* Tổng tiền */}
          <div className="pt-2 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Tổng tiền cước:
              </span>
              <span className="text-base font-bold text-green-600">
                {order.total_amount.toLocaleString("vi-VN")}đ
              </span>
            </div>
          </div>
        </div>

        {/* Các nút xác nhận, hủy, giao hàng */}
        <div className="mt-3 pt-2 border-t border-dashed border-gray-200 flex flex-col gap-2">
          {order.status === "pending" && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleConfirm}
                  size="sm"
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                  disabled={actionLoading !== null}
                >
                  <Check className="w-4 h-4 mr-1" />
                  {actionLoading === "confirm"
                    ? "Đang xác nhận..."
                    : "Xác nhận"}
                </Button>
                <Button
                  onClick={handleCancel}
                  size="sm"
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                  disabled={actionLoading !== null}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  {actionLoading === "cancel" ? "Đang hủy..." : "Hủy"}
                </Button>
              </div>
              <Button
                onClick={() => onViewDetail(order)}
                variant="outline"
                size="sm"
                className="w-full border-green-500 text-green-600 hover:bg-green-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem chi tiết
              </Button>
            </>
          )}
          {order.status === "confirmed" && (
            <>
              <div className="w-full text-center text-sm font-medium py-2 text-yellow-600 bg-yellow-50 rounded">
                Đơn hàng đang được giao cho tài xế
              </div>
              <Button
                onClick={() => onViewDetail(order)}
                variant="outline"
                size="sm"
                className="w-full border-green-500 text-green-600 hover:bg-green-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem chi tiết
              </Button>
            </>
          )}
          {
            order.status === "assigned" && (
              <>
                <div className="w-full text-center text-sm font-medium py-2 text-purple-600 bg-purple-50 rounded">
                  Tài xế đã nhận hàng, đợi tài xế đi giao
                </div>
                <Button
                  onClick={() => onViewDetail(order)}
                  variant="outline"
                  size="sm"
                  className="w-full border-green-500 text-green-600 hover:bg-green-50"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Xem chi tiết
                </Button>
              </>
            )
          }
          {order.status === "shipped" && (
            <>
              <div className="w-full text-center text-sm font-medium py-2 text-blue-600 bg-blue-50 rounded">
                Đơn hàng đang được giao
              </div>
              <Button
                onClick={() => onViewDetail(order)}
                variant="outline"
                size="sm"
                className="w-full border-green-500 text-green-600 hover:bg-green-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem chi tiết
              </Button>
            </>
          )}
          {order.status === "delivered" && (
            <>
              <div className="w-full text-center text-sm font-medium py-2 text-green-600 bg-green-50 rounded">
                Đơn hàng đã được giao
              </div>
              <Button
                onClick={() => onViewDetail(order)}
                variant="outline"
                size="sm"
                className="w-full border-green-500 text-green-600 hover:bg-green-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem chi tiết
              </Button>
            </>
          )}
          {order.status === "cancelled" && (
            <>
              <div className="w-full text-center text-sm font-medium py-2 text-red-600 bg-red-50 rounded">
                Đơn hàng đã bị hủy
              </div>
              <Button
                onClick={() => onViewDetail(order)}
                variant="outline"
                size="sm"
                className="w-full border-green-500 text-green-600 hover:bg-green-50"
              >
                <Eye className="w-4 h-4 mr-2" />
                Xem chi tiết
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}


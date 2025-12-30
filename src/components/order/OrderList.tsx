import type { Order } from "@/types/order.type";
import { OrderListItem } from "./OrderListItem";

interface OrderListProps {
  orders: Order[];
  onConfirm: (orderId: string) => Promise<void>;
  onCancel: (orderId: string, reason?: string) => Promise<void>;
  onDeliver: (orderId: string) => Promise<void>;
  onViewDetail: (order: Order) => void;
}

export function OrderList({
  orders,
  onConfirm,
  onCancel,
  onDeliver,
  onViewDetail,
}: OrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-sm">Không có đơn hàng nào</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
      {orders.map((order) => (
        <OrderListItem
          key={order.id}
          order={order}
          onConfirm={onConfirm}
          onCancel={onCancel}
          onDeliver={onDeliver}
          onViewDetail={onViewDetail}
        />
      ))}
    </div>
  );
}


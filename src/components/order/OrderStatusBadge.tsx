import type { Order } from "@/types/order.type";

interface OrderStatusBadgeProps {
  status: Order["status"];
}

export function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "Chờ Xác Nhận",
      color: "bg-amber-500 text-white",
    },
    confirmed: {
      label: "Đã Xác Nhận",
      color: "bg-blue-500 text-white",
    },
    assigned: {
      label: "Tài xế đã nhận hàng",
      color: "bg-purple-500 text-white",
    },
    shipped: {
      label: "Đang Giao Hàng",
      color: "bg-cyan-500 text-white",
    },
    delivered: {
      label: "Đã Giao Hàng",
      color: "bg-green-500 text-white",
    },
    rejected: {
      label: "Đã Từ Chối",
      color: "bg-red-500 text-white",
    },
    cancelled: {
      label: "Đã Hủy",
      color: "bg-red-500 text-white",
    },
  };

  const config = statusConfig[status] ?? statusConfig.pending;
  return (
    <span className={`${config.color} px-3 py-1 rounded text-xs font-semibold`}>
      {config.label}
    </span>
  );
}


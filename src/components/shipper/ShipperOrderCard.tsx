import type { Order } from "@/types/order.type";
import { Package, Navigation, Clock, Wallet } from "lucide-react";

interface ShipperOrderCardProps {
  order: Order;
  onStartDelivery?: (orderId: string) => void;
  onComplete?: (orderId: string) => void;
}

export function ShipperOrderCard({
  order,
  onStartDelivery,
  onComplete,
}: ShipperOrderCardProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount).replace('₫', 'đ');
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDeliveryTime = (isoString?: string) => {
    if (!isoString) return "Chưa xác định";
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 0) return "Đã quá giờ";
    if (diffMins < 60) return `~${diffMins} phút`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return `~${hours}h${mins > 0 ? ` ${mins}p` : ''}`;
  };

  const getOrderCode = (id: string) => {
    return `ORD-${id.slice(-3).toUpperCase()}`;
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case "confirmed":
        return (
          <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
            Đã giao
          </span>
        );
      case "shipped":
        return (
          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm font-medium">
            Đang giao hàng
          </span>
        );
      default:
        return null;
    }
  };

  const getActionButton = () => {
    // Confirmed - start delivery
    if (order.status === "assigned") {
      return (
        <button
          onClick={() => onStartDelivery?.(order.id)}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-green-500/50"
        >
          <Navigation className="w-5 h-5" />
          Bắt đầu giao
        </button>
      );
    }

    // Shipped - complete delivery
    if (order.status === "shipped") {
      return (
        <button
          onClick={() => onComplete?.(order.id)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white py-3 px-6 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-purple-500/50"
        >
          <Package className="w-5 h-5" />
          Hoàn thành
        </button>
      );
    }

    return null;
  };

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-700 hover:border-green-500/50 transition-all duration-300 shadow-xl hover:shadow-green-500/20">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
            <Package className="w-6 h-6 text-green-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">{getOrderCode(order.id)}</h3>
            <p className="text-sm text-gray-400">{formatTime(order.created_at)}</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      {/* Customer Info */}
      <div className="mb-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700">
        <div className="flex items-start gap-3 mb-2">
          <Navigation className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-bold text-white mb-1">{order.customer_name}</p>
            <p className="text-sm text-gray-300">{order.customer_address}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-gray-300 mt-2">
          <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
          </svg>
          <span className="text-sm">{order.customer_phone}</span>
        </div>
      </div>

      {/* Items */}
      <div className="mb-4">
        <p className="text-sm text-gray-400 mb-2 font-semibold">Món:</p>
        <p className="text-white">
          {order.items.map((item) => item.name).join(", ")}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
          <div className="flex items-center gap-2 text-blue-400 mb-1">
            <Navigation className="w-4 h-4" />
            <span className="text-xs font-semibold">Khoảng cách</span>
          </div>
          <p className="text-sm font-bold text-white">
            {order.delivery_distance 
              ? `${order.delivery_distance.toFixed(1)} km`
              : "N/A"}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
          <div className="flex items-center gap-2 text-yellow-400 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs font-semibold">Thời gian</span>
          </div>
          <p className="text-sm font-bold text-white">
            {formatDeliveryTime(order.estimated_delivery_time)}
          </p>
        </div>
        <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
          <div className="flex items-center gap-2 text-green-400 mb-1">
            <Wallet className="w-4 h-4" />
            <span className="text-xs font-semibold">Thu nhập</span>
          </div>
          <p className="text-sm font-bold text-green-400">
            {formatCurrency(order.shipping_fee || 0)}
          </p>
        </div>
      </div>

      {/* Action Button */}
      {getActionButton()}
    </div>
  );
}

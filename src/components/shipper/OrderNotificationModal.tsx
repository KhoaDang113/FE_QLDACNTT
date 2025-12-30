import type { Order } from "@/types/order.type";
import { X, MapPin, Phone, Package, Clock, Navigation } from "lucide-react";
import { useState } from "react";

interface OrderNotificationModalProps {
  order: Order;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
}

export function OrderNotificationModal({
  order,
  onAccept,
  onReject,
  onClose,
}: OrderNotificationModalProps) {
  const [processing, setProcessing] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount).replace('₫', 'đ');
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

  const handleAccept = async () => {
    setProcessing(true);
    await onAccept();
    setProcessing(false);
  };

  const handleReject = async () => {
    setProcessing(true);
    await onReject();
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg bg-gradient-to-br from-gray-800 to-gray-900 rounded-3xl shadow-2xl border border-gray-700 animate-in zoom-in duration-300">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-green-500 to-emerald-600 p-6 rounded-t-3xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
            disabled={processing}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Package className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Đơn hàng mới!</h2>
              <p className="text-white/80 text-sm">Bạn có muốn nhận đơn này?</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Customer Info */}
          <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
            <div className="flex items-start gap-3 mb-3">
              <MapPin className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-bold text-white mb-1">{order.customer_name}</p>
                <p className="text-sm text-gray-300">{order.customer_address}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-gray-300">
              <Phone className="w-4 h-4 text-green-400" />
              <span className="text-sm">{order.customer_phone}</span>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-gray-800/50 rounded-2xl p-4 border border-gray-700">
            <p className="text-sm text-gray-400 mb-2 font-semibold flex items-center gap-2">
              <Package className="w-4 h-4" />
              Sản phẩm
            </p>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-white">{item.name}</span>
                  <span className="text-gray-400">x{item.quantity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 border border-blue-500/30">
              <div className="flex items-center gap-2 text-blue-400 mb-1">
                <Navigation className="w-4 h-4" />
                <span className="text-xs font-semibold">Khoảng cách</span>
              </div>
              <p className="text-lg font-bold text-white">
                {order.delivery_distance 
                  ? `${order.delivery_distance.toFixed(1)} km`
                  : "N/A"}
              </p>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-4 border border-yellow-500/30">
              <div className="flex items-center gap-2 text-yellow-400 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-semibold">Thời gian</span>
              </div>
              <p className="text-lg font-bold text-white">
                {formatDeliveryTime(order.estimated_delivery_time)}
              </p>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 border border-green-500/30">
              <div className="flex items-center gap-2 text-green-400 mb-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-semibold">Thu nhập</span>
              </div>
              <p className="text-lg font-bold text-green-400">
                {formatCurrency(order.shipping_fee || 0)}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={handleReject}
            disabled={processing}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Từ chối
          </button>
          <button
            onClick={handleAccept}
            disabled={processing}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-4 px-6 rounded-xl font-semibold transition-all duration-300 shadow-lg shadow-green-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {processing ? "Đang xử lý..." : "Nhận đơn"}
          </button>
        </div>
      </div>
    </div>
  );
}

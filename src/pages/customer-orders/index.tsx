import { useState, useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { CustomerOrderCard } from "@/components/order/CustomerOrderCard";
import { useOrders } from "@/hooks/useOrders";

type FilterType = "all" | "pending" | "delivered" | "cancelled";

const FILTER_TABS: { key: FilterType; label: string }[] = [
  { key: "all", label: "Tất cả" },
  { key: "pending", label: "Đang xử lý" },
  { key: "delivered", label: "Đã giao" },
  { key: "cancelled", label: "Đã hủy" },
];

const FILTER_LABELS: Record<FilterType, string> = {
  all: "",
  pending: "Đang xử lý",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export default function CustomerOrdersPage() {
  const { orders, loading, error, cancelOrder, payOrder, fetchOrders } = useOrders();
  const [filter, setFilter] = useState<FilterType>("all");

  const filteredOrders = useMemo(() =>
    orders.filter((order) => {
      if (filter === "all") return true;
      if (filter === "pending") return order.status === "pending" || order.status === "confirmed";
      return order.status === filter;
    }), [orders, filter]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
            <Link
              to="/"
              className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">
              Đơn Hàng Từng Mua
            </h1>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
            <p className="text-gray-600">Đang tải danh sách đơn hàng...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-blue-50">
        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
            <Link
              to="/"
              className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
            </Link>
            <h1 className="text-xl font-bold text-gray-800">
              Đơn Hàng Từng Mua
            </h1>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="bg-white rounded-lg border border-red-200 p-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#007E42] hover:bg-[#006633] text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Thử lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center">
          <Link
            to="/"
            className="mr-4 hover:bg-gray-100 p-2 rounded-full transition-colors"
          >
            <ChevronLeft className="w-3 h-3" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">Đơn Hàng Từng Mua</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Filter tabs */}
        <div className="mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide">
          <div className="bg-white rounded-lg border border-gray-200 p-1 inline-flex min-w-max">
            {FILTER_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${filter === key
                    ? "bg-[#007E42] text-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                  }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Orders list */}
        <div className="space-y-4">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <CustomerOrderCard
                key={order.id}
                order={order}
                onCancelOrder={cancelOrder}
                onPayOrder={payOrder}
                onOrderUpdate={fetchOrders}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <div className="max-w-sm mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có đơn hàng nào
                </h3>
                <p className="text-gray-600 mb-6">
                  {filter === "all"
                    ? "Bạn chưa có đơn hàng nào. Hãy bắt đầu mua sắm ngay!"
                    : `Bạn chưa có đơn hàng nào ở trạng thái "${FILTER_LABELS[filter]}"`}
                </p>
                <Link
                  to="/"
                  className="inline-block bg-[#007E42] hover:bg-[#006633] text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  Khám phá sản phẩm
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

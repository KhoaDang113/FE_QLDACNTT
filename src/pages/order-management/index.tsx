"use client";

import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useOrders";
import { Search, ClipboardList } from "lucide-react";
import { OrderList } from "@/components/order/OrderList";
import { useNotification } from "@/hooks/useNotification";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

type FilterType = "all" | "pending" | "confirmed" | "delivered" | "rejected" | "cancelled";

const FILTER_CONFIG: { key: FilterType; label: string; color?: string }[] = [
  { key: "all", label: "Tất Cả" },
  { key: "pending", label: "Chờ Xác Nhận" },
  { key: "confirmed", label: "Đã Xác Nhận" },
  { key: "delivered", label: "Đã Giao Hàng" },
  { key: "cancelled", label: "Đã Hủy", color: "red" },
];

const FILTER_TITLES: Record<FilterType, string> = {
  all: "Tất cả đơn hàng",
  pending: "Đơn hàng chờ xác nhận",
  confirmed: "Đơn hàng đã xác nhận",
  delivered: "Đơn hàng đã giao",
  rejected: "Đơn hàng đã từ chối",
  cancelled: "Đơn hàng đã hủy",
};

export default function OrdersPage() {
  const { orders, loading, error, confirmOrder, cancelOrder, deliverOrder } =
    useOrders();
  const { showNotification } = useNotification();
  const [filter, setFilter] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, searchQuery]);

  const handleConfirmOrder = async (orderId: string) => {
    try {
      await confirmOrder(orderId);
      showNotification({
        type: "success",
        title: "Xác nhận đơn hàng",
        message: `Đơn hàng ${orderId} đã được xác nhận.`,
        duration: 4000,
      });
    } catch (err: Error | unknown) {
      let message = "Không thể xác nhận đơn hàng.";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;
        if (response?.data?.message) {
          message = response.data.message;
        }
      }
      showNotification({
        type: "error",
        title: "Lỗi xác nhận",
        message,
        duration: 4000,
      });
      throw err;
    }
  };

  const handleDeliverOrder = async (orderId: string) => {
    try {
      await deliverOrder(orderId);
      showNotification({
        type: "success",
        title: "Giao hàng",
        message: `Đã cập nhật đơn hàng ${orderId} sang trạng thái giao thành công.`,
        duration: 4000,
      });
    } catch (err: Error | unknown) {
      let message = "Không thể cập nhật trạng thái giao hàng.";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;
        if (response?.data?.message) {
          message = response.data.message;
        }
      }
      showNotification({
        type: "error",
        title: "Lỗi giao hàng",
        message,
        duration: 4000,
      });
      throw err;
    }
  };

  const handleCancelOrder = async (orderId: string, reason?: string) => {
    try {
      await cancelOrder(orderId, reason);
      showNotification({
        type: "info",
        title: "Hủy đơn hàng",
        message: `Đơn hàng ${orderId} đã được hủy.`,
        duration: 4000,
      });
    } catch (err: Error | unknown) {
      let message = "Không thể hủy đơn hàng.";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } })
          .response;
        if (response?.data?.message) {
          message = response.data.message;
        }
      }
      showNotification({
        type: "error",
        title: "Lỗi hủy đơn",
        message,
        duration: 4000,
      });
      throw err;
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (filter !== "all") {
        if (filter === "confirmed") {
          if (!["confirmed", "shipped"].includes(order.status)) return false;
        } else if (order.status !== filter) {
          return false;
        }
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          order.id.toLowerCase().includes(query) ||
          order.customer_name.toLowerCase().includes(query) ||
          order.customer_phone.includes(query) ||
          order.customer_address.toLowerCase().includes(query)
        );
      }

      return true;
    });
  }, [orders, filter, searchQuery]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter(
      (o) => o.status === "confirmed" || o.status === "shipped"
    ).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    rejected: orders.filter((o) => o.status === "rejected").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  }), [orders]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <ClipboardList className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Quản lý Đơn hàng</h1>
                <p className="text-indigo-100 mt-1">
                  Tổng cộng {stats.total} đơn hàng trong hệ thống
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {/* Search & Filter */}
          <div className="p-4 md:p-6 border-b bg-gray-50/50 space-y-4">
            {/* Search Box */}
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo mã đơn, tên, SĐT, địa chỉ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex flex-wrap gap-2">
              {FILTER_CONFIG.map(({ key, label, color }) => {
                const count = key === "all" ? stats.total : stats[key as keyof Omit<typeof stats, 'total'>];
                return (
                  <Button
                    key={key}
                    variant={filter === key ? "default" : "outline"}
                    onClick={() => setFilter(key)}
                    size="sm"
                    className={`text-xs ${filter === key
                        ? color === "red"
                          ? "bg-red-600 hover:bg-red-700 text-white"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                        : ""
                      }`}
                  >
                    {label} ({count})
                  </Button>
                );
              })}
            </div>
          </div>

          {/* Orders List */}
          <div className="p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                {FILTER_TITLES[filter]}
              </h2>
              <p className="text-sm text-gray-500">
                Hiển thị {paginatedOrders.length} / {filteredOrders.length} đơn hàng
              </p>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500">Đang tải danh sách đơn hàng...</p>
              </div>
            ) : error ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="w-10 h-10 text-red-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Có lỗi xảy ra</h3>
                <p className="text-gray-500 text-center max-w-sm">{error}</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <ClipboardList className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">Không có đơn hàng</h3>
                <p className="text-gray-500 text-center max-w-sm">
                  {searchQuery
                    ? `Không tìm thấy đơn hàng nào với từ khóa "${searchQuery}"`
                    : `Chưa có đơn hàng nào ở trạng thái này`}
                </p>
              </div>
            ) : (
              <>
                <OrderList
                  orders={paginatedOrders}
                  onConfirm={handleConfirmOrder}
                  onCancel={handleCancelOrder}
                  onDeliver={handleDeliverOrder}
                  onViewDetail={(order) => navigate(`/staff/orders/order/${order.id}`)}
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                          (page) => {
                            if (
                              totalPages > 10 &&
                              page !== 1 &&
                              page !== totalPages &&
                              Math.abs(page - currentPage) > 2
                            ) {
                              if (Math.abs(page - currentPage) === 3) {
                                return (
                                  <PaginationItem key={page}>
                                    <span className="px-2">...</span>
                                  </PaginationItem>
                                );
                              }
                              return null;
                            }

                            return (
                              <PaginationItem key={page}>
                                <PaginationLink
                                  isActive={page === currentPage}
                                  onClick={() => setCurrentPage(page)}
                                >
                                  {page}
                                </PaginationLink>
                              </PaginationItem>
                            );
                          }
                        )}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              setCurrentPage((p) => Math.min(totalPages, p + 1))
                            }
                            className={
                              currentPage === totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


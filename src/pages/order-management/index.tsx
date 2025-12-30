"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/hooks/useOrders";
import { Search } from "lucide-react";
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

export default function OrdersPage() {
  const { orders, loading, error, confirmOrder, cancelOrder, deliverOrder } =
    useOrders();
  const { showNotification } = useNotification();
  const [filter, setFilter] = useState<
    "all" | "pending" | "confirmed" | "delivered" | "rejected" | "cancelled"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Reset page when filter or search changes
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

  const filteredOrders = orders.filter((order) => {
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

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    confirmed: orders.filter(
      (o) => o.status === "confirmed" || o.status === "shipped"
    ).length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    rejected: orders.filter((o) => o.status === "rejected").length,
    cancelled: orders.filter((o) => o.status === "cancelled").length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="max-w-7xl mx-auto p-4">
        {/* Search Box */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Mã đơn hàng ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-white rounded shadow-sm border border-gray-200">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            size="sm"
            className={`text-xs ${filter === "all"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : ""
              }`}
          >
            Tất Cả ({stats.total})
          </Button>
          <Button
            variant={filter === "pending" ? "default" : "outline"}
            onClick={() => setFilter("pending")}
            size="sm"
            className={`text-xs ${filter === "pending"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : ""
              }`}
          >
            Chờ Xác Nhận ({stats.pending})
          </Button>
          <Button
            variant={filter === "confirmed" ? "default" : "outline"}
            onClick={() => setFilter("confirmed")}
            size="sm"
            className={`text-xs ${filter === "confirmed"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : ""
              }`}
          >
            Đã Xác Nhận ({stats.confirmed})
          </Button>
          <Button
            variant={filter === "delivered" ? "default" : "outline"}
            onClick={() => setFilter("delivered")}
            size="sm"
            className={`text-xs ${filter === "delivered"
              ? "bg-green-600 hover:bg-green-700 text-white"
              : ""
              }`}
          >
            Đã Giao Hàng ({stats.delivered})
          </Button>
          <Button
            variant={filter === "cancelled" ? "default" : "outline"}
            onClick={() => setFilter("cancelled")}
            size="sm"
            className={`text-xs ${filter === "cancelled"
              ? "bg-red-600 hover:bg-red-700 text-white"
              : ""
              }`}
          >
            Đã Hủy ({stats.cancelled})
          </Button>
        </div>

        {/* Orders List */}
        <div className="bg-white rounded shadow-sm border border-gray-200 p-4">
          <div className="mb-4">
            <h2 className="text-base font-bold text-gray-900">
              {filter === "all"
                ? "Tất cả đơn hàng"
                : filter === "pending"
                  ? "Đơn hàng chờ xác nhận"
                  : filter === "confirmed"
                    ? "Đơn hàng đã xác nhận"
                    : filter === "delivered"
                      ? "Đơn hàng đã giao"
                      : filter === "rejected"
                        ? "Đơn hàng đã từ chối"
                        : "Đơn hàng đã hủy"}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12 text-gray-500">
              Đang tải danh sách đơn hàng...
            </div>
          ) : error ? (
            <div className="py-12 text-center text-red-600 text-sm">
              {error}
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
  );
}

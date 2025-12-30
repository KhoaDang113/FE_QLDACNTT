"use client";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Phone, MapPin, Calendar, User, Check, Trash2, Truck, Package } from "lucide-react";
import type { Order } from "@/types/order.type";
import { OrderStatusBadge } from "@/components/order/OrderStatusBadge";
import { orderService } from "@/api";
import { useNotification } from "@/hooks/useNotification";

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

export default function OrderDetailView() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { showNotification } = useNotification();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<
        null | "confirm" | "cancel" | "deliver"
    >(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const data = await orderService.getStaffOrderById(id);
                setOrder(data);
            } catch (err) {
                console.error("Error fetching order:", err);
                setError("Không thể tải thông tin đơn hàng");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [id]);

    const handleConfirm = async () => {
        if (!order || actionLoading) return;
        try {
            setActionLoading("confirm");
            const updatedOrder = await orderService.confirmOrderByStaff(order.id);
            setOrder(updatedOrder);
            showNotification({
                type: "success",
                title: "Thành công",
                message: "Đã xác nhận đơn hàng",
            });
        } catch (error) {
            console.error("Confirm order failed:", error);
            showNotification({
                type: "error",
                title: "Lỗi",
                message: "Không thể xác nhận đơn hàng",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleCancel = async () => {
        if (!order || actionLoading) return;
        let reason: string | undefined;
        if (order.status === "pending") {
            reason = "Hủy bởi nhân viên";
        } else {
            const promptValue = window.prompt(
                "Nhập lý do hủy đơn hàng",
                "Hủy bởi nhân viên"
            );
            if (promptValue === null) return;
            reason = promptValue || "Hủy bởi nhân viên";
        }

        try {
            setActionLoading("cancel");
            const updatedOrder = await orderService.cancelOrderByStaff(
                order.id,
                reason
            );
            setOrder(updatedOrder);
            showNotification({
                type: "success",
                title: "Thành công",
                message: "Đã hủy đơn hàng",
            });
        } catch (error) {
            console.error("Cancel order failed:", error);
            showNotification({
                type: "error",
                title: "Lỗi",
                message: "Không thể hủy đơn hàng",
            });
        } finally {
            setActionLoading(null);
        }
    };

    const handleDeliver = async () => {
        if (!order || actionLoading) return;
        try {
            setActionLoading("deliver");
            // Backend flow: confirm -> ship -> deliver
            // If currently confirmed, ship it first
            if (order.status === "confirmed") {
                const shippedOrder = await orderService.shipOrder(order.id);
                setOrder(shippedOrder);
                showNotification({
                    type: "success",
                    title: "Thành công",
                    message: "Đơn hàng đang được giao",
                });
            } else if (order.status === "shipped") {
                const deliveredOrder = await orderService.deliverOrderByStaff(order.id);
                setOrder(deliveredOrder);
                showNotification({
                    type: "success",
                    title: "Thành công",
                    message: "Đơn hàng đã giao thành công",
                });
            }
        } catch (error) {
            console.error("Deliver order failed:", error);
            showNotification({
                type: "error",
                title: "Lỗi",
                message: "Không thể cập nhật trạng thái giao hàng",
            });
        } finally {
            setActionLoading(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500 flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    Đang tải thông tin đơn hàng...
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="text-red-500 mb-4 font-medium">
                    {error || "Không tìm thấy đơn hàng"}
                </div>
                <Button onClick={() => navigate("/staff/orders")} variant="outline">
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Quay lại danh sách
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-12">
            {/* Top Navigation Bar */}
            <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => navigate("/staff/orders")}
                            variant="ghost"
                            size="sm"
                            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                        >
                            <ChevronLeft className="w-5 h-5 mr-1" />
                            Quay lại
                        </Button>
                        <div className="h-6 w-px bg-gray-300 mx-2 hidden sm:block" />
                        <div className="flex items-center gap-3">
                            <h1 className="text-lg font-bold text-gray-900">
                                Đơn hàng #{order.id}
                            </h1>
                            <OrderStatusBadge status={order.status} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Products & Payment */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Products List & Payment Info */}
                        <Card className="border-gray-200 shadow-sm overflow-hidden">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-2">
                                    <Package className="w-5 h-5 text-green-600" />
                                    <CardTitle className="text-base font-bold text-gray-900">
                                        Danh sách sản phẩm ({order.items.length})
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-gray-100">
                                    {order.items.map((item) => (
                                        <div
                                            key={item.id}
                                            className="flex items-start gap-4 p-4 hover:bg-gray-50/50 transition-colors"
                                        >
                                            <div className="w-20 h-20 flex-shrink-0 border border-gray-200 rounded-lg overflow-hidden bg-white">
                                                <img
                                                    src={item.image}
                                                    alt={item.name}
                                                    className="w-full h-full object-cover"
                                                    onError={(e) => {
                                                        e.currentTarget.src =
                                                            "https://via.placeholder.com/80x80?text=No+Image";
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                                                    {item.name}
                                                </h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                                                    <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium">
                                                        {item.unit}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <div className="text-sm text-gray-600">
                                                        {item.quantity} x{" "}
                                                        <span className="font-medium text-gray-900">
                                                            {item.price.toLocaleString("vi-VN")}đ
                                                        </span>
                                                    </div>
                                                    <div className="font-bold text-green-600">
                                                        {(item.price * item.quantity).toLocaleString("vi-VN")}đ
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Payment Info merged here */}
                                <div className="bg-gray-50/30 p-4 border-t border-gray-100">
                                    <div className="space-y-3">
                                        {(order.discount || 0) > 0 && (
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Giảm giá:</span>
                                                <span className="font-medium text-green-600">
                                                    -{(order.discount || 0).toLocaleString("vi-VN")}đ
                                                </span>
                                            </div>
                                        )}
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Phí vận chuyển:</span>
                                            <span className="font-medium text-gray-900">
                                                {(order.shipping_fee || 15000).toLocaleString("vi-VN")}đ
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                                            <span className="text-base font-bold text-gray-900">
                                                Tổng cộng:
                                            </span>
                                            <span className="text-xl font-bold text-green-600">
                                                {order.total_amount.toLocaleString("vi-VN")}đ
                                            </span>
                                        </div>
                                        <div className="flex justify-end">
                                            <span
                                                className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${order.payment_status === "paid"
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-yellow-100 text-yellow-800"
                                                    }`}
                                            >
                                                {order.payment_status === "paid"
                                                    ? "Đã thanh toán"
                                                    : "Chưa thanh toán"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Actions & Customer Info */}
                    <div className="space-y-6">
                        {/* Actions Card */}
                        {["pending", "confirmed", "shipped"].includes(order.status) && (
                            <Card className="border-green-200 shadow-md bg-green-50/30">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-sm font-bold text-green-800 uppercase tracking-wide">
                                        Thao tác xử lý
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {order.status === "pending" && (
                                        <>
                                            <Button
                                                onClick={handleConfirm}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                                disabled={actionLoading !== null}
                                            >
                                                <Check className="w-4 h-4 mr-2" />
                                                {actionLoading === "confirm" ? "Đang xử lý..." : "Xác nhận đơn hàng"}
                                            </Button>
                                            <Button
                                                onClick={handleCancel}
                                                variant="outline"
                                                className="w-full border-red-500 text-red-600 hover:bg-red-50"
                                                disabled={actionLoading !== null}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                {actionLoading === "cancel" ? "Đang xử lý..." : "Hủy đơn hàng"}
                                            </Button>
                                        </>
                                    )}

                                    {order.status === "confirmed" && (
                                        <>
                                            <Button
                                                onClick={handleDeliver}
                                                className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                                disabled={actionLoading !== null}
                                            >
                                                <Truck className="w-4 h-4 mr-2" />
                                                {actionLoading === "deliver" ? "Đang xử lý..." : "Bắt đầu giao hàng"}
                                            </Button>
                                            <Button
                                                onClick={handleCancel}
                                                variant="outline"
                                                className="w-full border-red-500 text-red-600 hover:bg-red-50"
                                                disabled={actionLoading !== null}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                {actionLoading === "cancel" ? "Đang xử lý..." : "Hủy đơn hàng"}
                                            </Button>
                                        </>
                                    )}

                                    {order.status === "shipped" && (
                                        <Button
                                            onClick={handleDeliver}
                                            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-sm"
                                            disabled={actionLoading !== null}
                                        >
                                            <Check className="w-4 h-4 mr-2" />
                                            {actionLoading === "deliver"
                                                ? "Đang xử lý..."
                                                : "Xác nhận đã giao thành công"}
                                        </Button>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Customer Info */}
                        <Card className="border-gray-200 shadow-sm">
                            <CardHeader className="bg-gray-50/50 border-b border-gray-100 pb-3">
                                <div className="flex items-center gap-2">
                                    <User className="w-5 h-5 text-gray-600" />
                                    <CardTitle className="text-base font-bold text-gray-900">
                                        Thông tin khách hàng
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="p-4 pt-3 space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <User className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase">Người nhận</p>
                                        <p className="text-sm font-semibold text-gray-900">{order.customer_name}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <Phone className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase">Số điện thoại</p>
                                        <p className="text-sm font-medium text-gray-900">{order.customer_phone}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <MapPin className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase">Địa chỉ giao hàng</p>
                                        <p className="text-sm text-gray-700 leading-snug">{order.customer_address}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3 pt-2 border-t border-gray-100">
                                    <div className="bg-gray-100 p-2 rounded-full">
                                        <Calendar className="w-4 h-4 text-gray-600" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-medium uppercase">Ngày đặt hàng</p>
                                        <p className="text-sm text-gray-700">{formatDate(order.created_at)}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

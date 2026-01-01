import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Check, Package, Truck, MapPin, Phone, User, ShoppingBag, ChevronRight, Home, Mail, Clock } from "lucide-react";
import { orderService } from "@/api";
import type { Order } from "@/types/order.type";
import { Button } from "@/components/ui/button";

export default function PaymentSuccessPage() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        setError("Không tìm thấy mã đơn hàng");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const fetchedOrder = await orderService.getOrderById(orderId);
        setOrder(fetchedOrder);
      } catch (err) {
        console.error("Error fetching order:", err);
        setError("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang xác nhận thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800 mb-3">Đã xảy ra lỗi</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/my-orders">
            <Button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3">
              Quay lại đơn hàng
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-blue-50">
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">Đặt hàng thành công</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-4">
          <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-8 text-center">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Check className="w-10 h-10 text-green-500" strokeWidth={3} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Thanh toán thành công!</h2>
            <p className="text-green-100">Cảm ơn bạn đã mua hàng tại cửa hàng của chúng tôi</p>
          </div>
        </div>

        {order && (
          <>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Mã đơn hàng</p>
                    <p className="text-lg font-bold text-gray-800">#{order.id}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-green-700">Đã thanh toán</span>
                </div>
              </div>

              <div className="py-4 border-b border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Tổng thanh toán</p>
                <p className="text-3xl font-bold text-green-600">{formatPrice(order.total_amount)}đ</p>
              </div>

              <div className="pt-4">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-gray-400" />
                  <h3 className="font-semibold text-gray-800">Thông tin giao hàng</h3>
                </div>
                <div className="space-y-3 pl-7">
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Người nhận</p>
                      <p className="text-gray-700">{order.customer_name}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Số điện thoại</p>
                      <p className="text-gray-700">{order.customer_phone}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-400">Địa chỉ</p>
                      <p className="text-gray-700">{order.customer_address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-800">
                  Sản phẩm đã đặt ({order.items.length})
                </h3>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {order.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center border border-gray-200">
                        <span className="text-sm font-semibold text-gray-600">{item.quantity}x</span>
                      </div>
                      <span className="text-gray-800 font-medium">{item.name}</span>
                    </div>
                    <span className="font-semibold text-green-600">{formatPrice(item.price * item.quantity)}đ</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 mb-4">
              <h3 className="font-semibold text-gray-800 mb-4">Bước tiếp theo</h3>
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Kiểm tra email</p>
                    <p className="text-sm text-gray-500">Bạn sẽ nhận được email xác nhận đơn hàng</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Clock className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Theo dõi đơn hàng</p>
                    <p className="text-sm text-gray-500">Xem trạng thái giao hàng trong "Đơn hàng của tôi"</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Phone className="w-4 h-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">Liên hệ xác nhận</p>
                    <p className="text-sm text-gray-500">Nhân viên sẽ gọi điện xác nhận đơn hàng của bạn</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/my-orders" className="flex-1">
            <Button className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-base font-medium rounded-lg flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              Xem đơn hàng của tôi
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button variant="outline" className="w-full py-6 text-base font-medium rounded-lg flex items-center justify-center gap-2 border-gray-300 hover:bg-gray-50">
              <Home className="w-5 h-5" />
              Tiếp tục mua sắm
            </Button>
          </Link>
        </div>

        <div className="text-center mt-6 py-4">
          <p className="text-gray-500 text-sm">
            Cần hỗ trợ? <button className="text-green-600 font-medium hover:underline">Liên hệ ngay</button>
          </p>
        </div>
      </div>
    </div>
  );
}

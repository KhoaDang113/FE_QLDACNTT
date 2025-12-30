import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Check } from "lucide-react";
import { orderService } from "@/api";
import type { Order } from "@/types/order.type";

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

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang xác nhận thanh toán...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Lỗi</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            to="/my-orders"
            className="inline-block bg-[#007E42] hover:bg-[#006633] text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Quay lại đơn hàng
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Success header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-12 sm:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center animate-bounce">
              <Check className="w-12 h-12 text-green-600" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Thanh toán thành công!
          </h1>
          <p className="text-green-100 text-lg">Cảm ơn bạn đã mua hàng</p>
        </div>

        {/* Order info */}
        <div className="p-6 sm:p-8">
          {order && (
            <>
              {/* Order ID & Status */}
              <div className="bg-green-50 rounded-lg p-4 mb-6 border border-green-200">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Mã đơn hàng
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      #{order.id}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      Trạng thái thanh toán
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                        <Check className="w-4 h-4" />
                        Đã thanh toán
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Amount */}
              <div className="border-t border-b border-gray-200 py-4 mb-6">
                <p className="text-sm text-gray-600 font-medium mb-2">
                  Số tiền thanh toán
                </p>
                <p className="text-3xl font-bold text-green-600">
                  {formatPrice(order.total_amount)}đ
                </p>
              </div>

              {/* Shipping info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Thông tin giao hàng
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p>
                    <span className="font-medium">Người nhận:</span>{" "}
                    {order.customer_name}
                  </p>
                  <p>
                    <span className="font-medium">Điện thoại:</span>{" "}
                    {order.customer_phone}
                  </p>
                  <p>
                    <span className="font-medium">Địa chỉ:</span>{" "}
                    {order.customer_address}
                  </p>
                </div>
              </div>

              {/* Items summary */}
              <div className="mb-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Sản phẩm ({order.items.length})
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-600">
                          {item.quantity}x
                        </span>
                        <span className="text-gray-900">{item.name}</span>
                      </div>
                      <span className="font-medium text-gray-900">
                        {formatPrice(item.price * item.quantity)}đ
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Next steps */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Bước tiếp theo
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Kiểm tra email để nhận xác nhận đơn hàng</li>
                  <li>
                    Theo dõi trạng thái giao hàng trong mục "Đơn hàng của tôi"
                  </li>
                  <li>Nhân viên sẽ liên hệ với bạn để xác nhận</li>
                </ol>
              </div>
            </>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/my-orders"
              className="flex-1 bg-[#007E42] hover:bg-[#006633] text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
            >
              Xem đơn hàng của tôi
            </Link>
            <Link
              to="/"
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors text-center"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 sm:px-8 text-center text-sm text-gray-600 border-t">
          <p>
            Nếu có bất kỳ câu hỏi nào, vui lòng{" "}
            <button className="text-[#007E42] font-medium hover:underline bg-none border-none cursor-pointer">
              liên hệ hỗ trợ
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

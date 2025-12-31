import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { orderService } from "@/api";
import type { Order } from "@/types/order.type";

export default function PaymentFailedPage() {
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
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Đang kiểm tra trạng thái...</p>
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4 py-8">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full overflow-hidden">
        {/* Failed header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-600 px-6 py-12 sm:px-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center">
              <AlertCircle className="w-12 h-12 text-red-600" strokeWidth={2} />
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Thanh toán thất bại
          </h1>
          <p className="text-red-100 text-lg">
            Giao dịch của bạn không thành công
          </p>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Error info */}
          <div className="bg-red-50 rounded-lg p-4 mb-6 border border-red-200">
            <h3 className="font-semibold text-red-900 mb-2">Lý do có thể:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
              <li>Tài khoản ngân hàng không đủ tiền</li>
              <li>Thẻ hết hạn hoặc bị khóa</li>
              <li>Sai thông tin thẻ/OTP</li>
              <li>Lỗi kết nối mạng</li>
              <li>Quá thời gian cho phép</li>
            </ul>
          </div>

          {order && (
            <>
              {/* Order ID & Status */}
              <div className="bg-orange-50 rounded-lg p-4 mb-6 border border-orange-200">
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
                      Số tiền thanh toán
                    </p>
                    <p className="text-lg font-bold text-red-600">
                      {formatPrice(order.total_amount)}đ
                    </p>
                  </div>
                </div>
              </div>

              {/* What to do next */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h4 className="font-semibold text-blue-900 mb-3">
                  Bạn có thể thử:
                </h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                  <li>Kiểm tra số dư tài khoản ngân hàng</li>
                  <li>Đảm bảo thẻ/tài khoản vẫn hoạt động</li>
                  <li>Thử lại với phương thức thanh toán khác</li>
                  <li>Liên hệ ngân hàng để hỏi về giới hạn giao dịch</li>
                </ol>
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
            </>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/my-orders"
              className="flex-1 bg-[#007E42] hover:bg-[#006633] text-white px-6 py-3 rounded-lg font-medium transition-colors text-center"
            >
              Quay lại đơn hàng
            </Link>
            <Link
              to="/"
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 px-6 py-3 rounded-lg font-medium transition-colors text-center"
            >
              Trang chủ
            </Link>
          </div>

          {/* Support note */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center text-sm text-yellow-800">
            <p className="mb-2">Vẫn gặp vấn đề?</p>
            <button className="text-[#007E42] font-medium hover:underline bg-none border-none cursor-pointer">
              Liên hệ bộ phận hỗ trợ
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 sm:px-8 text-center text-sm text-gray-600 border-t">
          <p>
            Đơn hàng của bạn vẫn được lưu. Bạn có thể thử thanh toán lại bất kỳ
            lúc nào.
          </p>
        </div>
      </div>
    </div>
  );
}

// {/* Footer */}
//         <div className="bg-gray-50 px-6 py-4 sm:px-8 text-center text-sm text-gray-600 border-t">
//           <p>
//             Đơn hàng của bạn vẫn được lưu. Bạn có thể thử thanh toán lại bất kỳ
//             lúc nào.
//           </p>
//         </div>
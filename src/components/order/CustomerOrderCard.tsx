import { useState, useMemo, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import type { Order } from "@/types/order.type";
import { useCart } from "@/components/cart/CartContext";
import { PRODUCT_PLACEHOLDER_IMAGE, getProductImage } from "@/lib/constants";
import { OrderRatingDialog } from "./OrderRatingDialog";
import { ViewOrderRatingDialog } from "./ViewOrderRatingDialog";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { toast } from "sonner";

// Constants moved outside component to avoid recreation on each render
const STATUS_CONFIG: Record<Order["status"], { label: string; className: string }> = {
  pending: { label: "Chờ xác nhận", className: "bg-yellow-100 text-yellow-700" },
  confirmed: { label: "Đã xác nhận", className: "bg-blue-100 text-blue-700" },
  assigned: { label: "Tài xế đã nhận hàng", className: "bg-purple-100 text-purple-700" },
  shipped: { label: "Đang giao hàng", className: "bg-cyan-100 text-cyan-700" },
  delivered: { label: "Đã giao hàng", className: "bg-green-100 text-green-700" },
  rejected: { label: "Đã từ chối", className: "bg-red-100 text-red-700" },
  cancelled: { label: "Đã hủy", className: "bg-red-100 text-red-700" },
};

// Helper functions moved outside component
const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}, trước ${date.getHours()}h`;
};

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("vi-VN").format(price);

interface CustomerOrderCardProps {
  order: Order;
  onCancelOrder?: (orderId: string) => void;
  onPayOrder?: (orderId: string) => void;
  onOrderUpdate?: () => void; // Callback to refetch orders after rating
}

function CustomerOrderCardComponent({
  order,
  onCancelOrder,
  onPayOrder,
  onOrderUpdate,
}: CustomerOrderCardProps) {
  const { addToCart } = useCart();
  const [showAllProducts, setShowAllProducts] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
  const [showRatingDialog, setShowRatingDialog] = useState(false);
  const [showViewRatingDialog, setShowViewRatingDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  // Memoize visible products and remaining count
  const { visibleProducts, remainingCount } = useMemo(() => ({
    visibleProducts: showAllProducts ? order.items : order.items.slice(0, 3),
    remainingCount: order.items.length - 3,
  }), [order.items, showAllProducts]);

  // Memoize order status flags
  const { canCancel, canPay } = useMemo(() => {
    const paid = order.paid || order.payment_status === "paid";
    return {
      canCancel: order.status === "pending" && !paid,
      canPay: !paid && order.status !== "cancelled" && order.status !== "rejected",
    };
  }, [order.paid, order.payment_status, order.status]);

  // Handle buy again with useCallback for stable reference
  const handleBuyAgain = useCallback(() => {
    order.items.forEach((item) => {
      addToCart({
        id: item.product_id_string || item.product_id.toString(),
        name: item.name,
        price: item.price,
        image: item.image,
        unit: item.unit,
        stock: 9999,
        quantity: item.quantity,
      });
    });
    toast.success("Đã thêm tất cả sản phẩm vào giỏ hàng!");
  }, [order.items, addToCart]);

  const handleCancel = useCallback(() => setShowCancelDialog(true), []);

  const handleConfirmCancel = useCallback(() => {
    onCancelOrder?.(order.id);
  }, [order.id, onCancelOrder]);

  const handlePay = useCallback(() => {
    onPayOrder?.(order.id) ?? (window.location.href = `/checkout?orderId=${encodeURIComponent(order.id)}`);
  }, [order.id, onPayOrder]);

  const handleImageError = useCallback((itemId: string) => {
    setImageErrors(prev => ({ ...prev, [itemId]: true }));
  }, []);

  // Get current status config
  const currentStatus = STATUS_CONFIG[order.status] ?? { label: order.status, className: "bg-gray-100 text-gray-700" };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b border-gray-200 bg-gray-50 gap-3">
        <div>
          <h3 className="font-semibold text-gray-900">Đơn hàng #{order.id}</h3>
          <p className="text-sm text-gray-600 mt-1">
            Giao lúc: {formatDate(order.created_at)}
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${currentStatus.className}`}>
            {currentStatus.label}
          </span>

          {/* Payment status badge */}
          {order.paid || order.payment_status === "paid" ? (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
              Đã thanh toán
            </span>
          ) : (
            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
              Chưa thanh toán
            </span>
          )}
        </div>
      </div>

      {/* Product Images */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {visibleProducts.map((item) => {
            const imageUrl = imageErrors[item.id]
              ? PRODUCT_PLACEHOLDER_IMAGE
              : getProductImage({
                image_primary: item.image_primary || item.image,
                image_url: item.image_url || item.image,
                images: item.images || (item.image ? [item.image] : undefined),
              });

            return (
              <div key={item.id} className="relative">
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white">
                  <img
                    src={imageUrl}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={() => handleImageError(item.id)}
                  />
                </div>
              </div>
            );
          })}

          {/* +N nếu còn nhiều sản phẩm */}
          {!showAllProducts && remainingCount > 0 && (
            <button
              onClick={() => setShowAllProducts(true)}
              className="w-20 h-20 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <span className="text-gray-600 font-semibold text-lg">
                +{remainingCount}
              </span>
            </button>
          )}
        </div>

        {/* Product list khi expand */}
        {showAllProducts && order.items.length > 3 && (
          <div className="mt-3 space-y-2">
            {order.items.slice(3).map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-2 text-sm text-gray-700"
              >
                <span className="font-medium">{item.quantity}x</span>
                <span>{item.name}</span>
              </div>
            ))}
            <button
              onClick={() => setShowAllProducts(false)}
              className="text-[#007E42] text-sm font-medium hover:underline"
            >
              Thu gọn
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-t border-gray-200 bg-gray-50 gap-4">
        {/* Total Amount - Show first on mobile */}
        <div className="flex items-center justify-between md:justify-start md:order-2 gap-4 w-full md:w-auto">
          <div className="text-left md:text-right w-full md:w-auto flex justify-between md:block items-center">
            <p className="text-sm text-gray-600">Tổng đơn hàng:</p>
            <p className="text-lg font-bold text-gray-900">
              {formatPrice(order.total_amount)}đ
            </p>
          </div>
        </div>

        {/* Actions - Show second on mobile */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:order-1 w-full md:w-auto">
          <div className="flex gap-3 w-full md:w-auto">
            {canCancel && (
              <button
                onClick={handleCancel}
                className="flex-1 md:flex-none px-3 py-2 text-sm font-medium rounded-lg 
                bg-gradient-to-r from-red-500 to-red-600 
                text-white shadow-sm hover:shadow-md 
                hover:brightness-110 active:scale-95
                transition-all whitespace-nowrap"
              >
                Huỷ đơn hàng
              </button>
            )}

            {canPay && (
              <button
                onClick={handlePay}
                className="flex-1 md:flex-none px-3 py-2 text-sm font-semibold rounded-lg
                bg-[#00A559] text-white
                hover:bg-[#008F4C] active:bg-[#007E42]
                shadow-sm hover:shadow-md active:scale-95
                transition-all whitespace-nowrap"
              >
                Thanh toán
              </button>
            )}
          </div>

          <div className="flex gap-3 w-full md:w-auto">
            {/* Rating button - only show for delivered orders */}
            {order.status === "delivered" && (
              <>
                {!order.is_rating ? (
                  <Button
                    onClick={() => setShowRatingDialog(true)}
                    className="flex-1 md:flex-none bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 whitespace-nowrap"
                  >
                    Đánh giá
                  </Button>
                ) : (
                  <Button
                    onClick={() => setShowViewRatingDialog(true)}
                    variant="outline"
                    className="flex-1 md:flex-none border-orange-500 text-orange-500 hover:bg-orange-50 rounded-lg px-6 whitespace-nowrap"
                  >
                    Xem đánh giá
                  </Button>
                )}
              </>
            )}

            <Button
              onClick={handleBuyAgain}
              className="flex-1 md:flex-none bg-[#007E42] hover:bg-[#006633] text-white rounded-lg px-6 whitespace-nowrap"
            >
              Mua lại
            </Button>
          </div>
        </div>
      </div>

      {/* Rating Dialog */}
      <OrderRatingDialog
        open={showRatingDialog}
        onClose={() => setShowRatingDialog(false)}
        orderId={order.id}
        onSuccess={() => {
          // Refetch orders to update is_rating status
          onOrderUpdate?.();
        }}
      />

      {/* View Rating Dialog */}
      <ViewOrderRatingDialog
        open={showViewRatingDialog}
        onClose={() => setShowViewRatingDialog(false)}
        orderId={order.id}
      />

      {/* Cancel Confirmation Dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        onOpenChange={setShowCancelDialog}
        title="Xác nhận hủy đơn hàng"
        description="Bạn có chắc chắn muốn hủy đơn hàng này?"
        confirmText="Hủy đơn"
        cancelText="Không"
        onConfirm={handleConfirmCancel}
        variant="destructive"
      />
    </div>
  );
}

export const CustomerOrderCard = memo(CustomerOrderCardComponent);

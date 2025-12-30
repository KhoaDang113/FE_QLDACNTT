import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { orderRatingService } from "@/api";
import type { OrderRating } from "@/types/order-rating.type";

interface ViewOrderRatingDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
}

export function ViewOrderRatingDialog({
  open,
  onClose,
  orderId,
}: ViewOrderRatingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<OrderRating | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && orderId) {
      fetchRating();
    }
  }, [open, orderId]);

  const fetchRating = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await orderRatingService.getRatingByOrderId(orderId);
      if (data) {
        setRating(data);
      } else {
        setError("Không tìm thấy đánh giá cho đơn hàng này");
      }
    } catch (err: any) {
      console.error("Error fetching rating:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi khi tải đánh giá";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Chi tiết đánh giá
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải đánh giá...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={onClose} variant="outline">
              Đóng
            </Button>
          </div>
        ) : rating ? (
          <div className="space-y-6 py-4">
            {/* Overall Rating */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Đánh giá tổng thể
              </label>
              <StarRating value={rating.rating_overall} readonly size="lg" showValue />
            </div>

            {/* Product Quality */}
            {rating.rating_product_quality && rating.rating_product_quality > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Chất lượng sản phẩm
                </label>
                <StarRating value={rating.rating_product_quality} readonly showValue />
              </div>
            )}

            {/* Packaging */}
            {rating.rating_packaging && rating.rating_packaging > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đóng gói
                </label>
                <StarRating value={rating.rating_packaging} readonly showValue />
              </div>
            )}

            {/* Delivery Time */}
            {rating.rating_delivery_time && rating.rating_delivery_time > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thời gian giao hàng
                </label>
                <StarRating value={rating.rating_delivery_time} readonly showValue />
              </div>
            )}

            {/* Shipper */}
            {rating.rating_shipper && rating.rating_shipper > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dịch vụ giao hàng
                </label>
                <StarRating value={rating.rating_shipper} readonly showValue />
              </div>
            )}

            {/* Comment */}
            {rating.comment && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nhận xét của bạn
                </label>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <p className="text-gray-800 whitespace-pre-wrap">{rating.comment}</p>
                </div>
              </div>
            )}

            {/* Images */}
            {rating.images && rating.images.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh ({rating.images.length})
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {rating.images.map((image, index) => (
                    <div key={index} className="aspect-square">
                      <img
                        src={image}
                        alt={`Ảnh đánh giá ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => window.open(image, '_blank')}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Admin Response */}
            {rating.addmin_respone && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">AD</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-semibold text-gray-900">
                        Phản hồi từ cửa hàng
                      </span>
                      {rating.addmin_respone_time && (
                        <span className="text-xs text-gray-500">
                          {formatDate(rating.addmin_respone_time)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">
                      {rating.addmin_respone}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Timestamp */}
            <div className="pt-4 border-t text-sm text-gray-500">
              Đánh giá vào: {formatDate(rating.createdAt)}
            </div>

            {/* Close Button */}
            <div className="flex justify-end pt-4 border-t">
              <Button onClick={onClose}>Đóng</Button>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

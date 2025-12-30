import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import orderRatingService from "@/api/services/orderRatingService";
import orderService from "@/api/services/orderService";
import type { OrderRating } from "@/types/order-rating.type";
import type { Order } from "@/types/order.type";
import { OrderDetailDialog } from "@/components/admin/order/OrderDetailDialog";
import { Star, Package, User as UserIcon, MessageSquare, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface RatingDetailModalProps {
  ratingId: string;
  isOpen: boolean;
  onClose: () => void;
  onResponseSubmitted?: () => void;
}

export function RatingDetailModal({
  ratingId,
  isOpen,
  onClose,
  onResponseSubmitted,
}: RatingDetailModalProps) {
  const [rating, setRating] = useState<OrderRating | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminResponse, setAdminResponse] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen && ratingId) {
      loadRatingDetail();
    }
  }, [isOpen, ratingId]);

  const loadRatingDetail = async () => {
    try {
      setLoading(true);
      const data = await orderRatingService.getRatingById(ratingId);
      setRating(data);
      setAdminResponse(data.admin_response || "");
    } catch (error) {
      console.error("Error loading rating detail:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitResponse = async () => {
    if (!adminResponse.trim() || !rating) return;

    try {
      setSubmitting(true);
      await orderRatingService.adminResponse(rating._id, adminResponse);
      onResponseSubmitted?.();
      onClose();
    } catch (error) {
      console.error("Error submitting response:", error);
      toast.error("Có lỗi xảy ra khi gửi phản hồi");
    } finally {
      setSubmitting(false);
    }
  };

  const handleViewOrder = async () => {
    if (!rating) return;
    try {
      const orderId = typeof rating.order_id === 'object' ? rating.order_id._id : rating.order_id;
      const fullOrder = await orderService.getOrderById(orderId, true);
      setSelectedOrder(fullOrder);
      setIsOrderModalOpen(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
      toast.error("Không thể tải thông tin đơn hàng");
    }
  };

  const getRatingStars = (value: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${i < value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
        />
      ));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">Đang tải...</div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!rating) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <div className="text-center py-8">Không tìm thấy đánh giá</div>
        </DialogContent>
      </Dialog>
    );
  }

  const order = typeof rating.order_id === 'object' ? rating.order_id : null;
  const user = typeof rating.user_id === 'object' ? rating.user_id : null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Chi Tiết Đánh Giá</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 mt-4">
            {/* Order Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Thông Tin Đơn Hàng
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs"
                  onClick={handleViewOrder}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Xem chi tiết
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Mã đơn:</span>{" "}
                  <span className="font-medium">
                    {order?.order_code
                      ? `#${order.order_code}`
                      : (order?._id ? `#${String(order._id).slice(-6).toUpperCase()}` : 'N/A')}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Ngày đặt:</span>{" "}
                  <span className="font-medium">
                    {order?.created_at ? formatDate(order.created_at) : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Tổng tiền:</span>{" "}
                  <span className="font-medium">
                    {order?.total
                      ? new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                      }).format(order.total)
                      : 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Trạng thái:</span>{" "}
                  <Badge variant={order?.status === 'delivered' ? 'default' : 'secondary'}>
                    {order?.status || 'N/A'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Customer Info */}
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Thông Tin Khách Hàng
              </h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Tên:</span>{" "}
                  <span className="font-medium">{user?.name || 'N/A'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Email:</span>{" "}
                  <span className="font-medium">{user?.email || 'N/A'}</span>
                </div>
                <div className="col-span-2">
                  <span className="text-muted-foreground">Số điện thoại:</span>{" "}
                  <span className="font-medium">
                    {/* @ts-ignore - address_id populated from backend */}
                    {order?.address_id?.phone || order?.customer_phone || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Rating Details */}
            <div>
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4" />
                Chi Tiết Đánh Giá
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Đánh giá chung:</span>
                  <div className="flex items-center gap-2">
                    <div className="flex">{getRatingStars(rating.rating_overall)}</div>
                    <span className="text-sm font-medium">
                      ({rating.rating_overall}/5)
                    </span>
                  </div>
                </div>

                {rating.rating_product_quality && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Chất lượng sản phẩm:
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex">{getRatingStars(rating.rating_product_quality)}</div>
                      <span className="text-sm font-medium">
                        ({rating.rating_product_quality}/5)
                      </span>
                    </div>
                  </div>
                )}

                {rating.rating_packaging && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Đóng gói:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">{getRatingStars(rating.rating_packaging)}</div>
                      <span className="text-sm font-medium">
                        ({rating.rating_packaging}/5)
                      </span>
                    </div>
                  </div>
                )}

                {rating.rating_delivery_time && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Thời gian giao hàng:
                    </span>
                    <div className="flex items-center gap-2">
                      <div className="flex">{getRatingStars(rating.rating_delivery_time)}</div>
                      <span className="text-sm font-medium">
                        ({rating.rating_delivery_time}/5)
                      </span>
                    </div>
                  </div>
                )}

                {rating.rating_shipper && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Shipper:</span>
                    <div className="flex items-center gap-2">
                      <div className="flex">{getRatingStars(rating.rating_shipper)}</div>
                      <span className="text-sm font-medium">
                        ({rating.rating_shipper}/5)
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Customer Comment */}
            {rating.comment && (
              <div>
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Nhận Xét
                </h3>
                <div className="bg-muted/50 p-4 rounded-lg">
                  <p className="text-sm">{rating.comment}</p>
                </div>
              </div>
            )}

            {/* Images */}
            {rating.images && rating.images.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Hình Ảnh</h3>
                <div className="grid grid-cols-3 gap-2">
                  {rating.images.map((img: string, index: number) => (
                    <img
                      key={index}
                      src={img}
                      alt={`Rating image ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition"
                      onClick={() => window.open(img, "_blank")}
                    />
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Admin Response Section */}
            <div>
              <h3 className="font-semibold mb-3">
                {rating.admin_response ? "Phản Hồi Của Admin" : "Gửi Phản Hồi"}
              </h3>
              {rating.admin_response ? (
                <div className="space-y-2">
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-sm">{rating.admin_response}</p>
                  </div>
                  {rating.admin_response_time && (
                    <p className="text-xs text-muted-foreground">
                      Phản hồi lúc: {formatDate(rating.admin_response_time)}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="admin-response">Nội dung phản hồi</Label>
                    <Textarea
                      id="admin-response"
                      placeholder="Nhập phản hồi của bạn cho khách hàng..."
                      rows={4}
                      value={adminResponse}
                      onChange={(e) => setAdminResponse(e.target.value)}
                      className="mt-2"
                    />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={onClose}>
                      Hủy
                    </Button>
                    <Button
                      onClick={handleSubmitResponse}
                      disabled={!adminResponse.trim() || submitting}
                    >
                      {submitting ? "Đang gửi..." : "Gửi Phản Hồi"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </DialogContent>
      </Dialog>

      <OrderDetailDialog
        isOpen={isOrderModalOpen}
        onClose={() => setIsOrderModalOpen(false)}
        order={selectedOrder}
      />
    </>
  );
}

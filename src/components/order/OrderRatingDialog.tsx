import { useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/ui/star-rating";
import { orderRatingService } from "@/api";

interface OrderRatingDialogProps {
  open: boolean;
  onClose: () => void;
  orderId: string;
  onSuccess?: () => void;
}

export function OrderRatingDialog({
  open,
  onClose,
  orderId,
  onSuccess,
}: OrderRatingDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [ratings, setRatings] = useState({
    overall: 0,
    productQuality: 0,
    packaging: 0,
    deliveryTime: 0,
    shipper: 0,
  });
  const [comment, setComment] = useState("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedImages.length > 5) {
      setError("Chỉ được chọn tối đa 5 ảnh");
      return;
    }

    setSelectedImages((prev) => [...prev, ...files]);
    
    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Validation
    if (ratings.overall === 0) {
      setError("Vui lòng chọn đánh giá tổng thể");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("order_id", orderId);
      formData.append("rating_overall", ratings.overall.toString());
      
      if (ratings.productQuality > 0) {
        formData.append("rating_product_quality", ratings.productQuality.toString());
      }
      if (ratings.packaging > 0) {
        formData.append("rating_packaging", ratings.packaging.toString());
      }
      if (ratings.deliveryTime > 0) {
        formData.append("rating_delivery_time", ratings.deliveryTime.toString());
      }
      if (ratings.shipper > 0) {
        formData.append("rating_shipper", ratings.shipper.toString());
      }
      if (comment.trim()) {
        formData.append("comment", comment.trim());
      }

      // Append images
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      await orderRatingService.createRating(formData);
      
      // Success
      toast.success("Đánh giá của bạn đã được gửi thành công!");
      onSuccess?.();
      onClose();
      
      // Reset form
      setRatings({
        overall: 0,
        productQuality: 0,
        packaging: 0,
        deliveryTime: 0,
        shipper: 0,
      });
      setComment("");
      setSelectedImages([]);
      setImagePreviews([]);
    } catch (err: any) {
      console.error("Error submitting rating:", err);
      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
      // Reset form on close
      setRatings({
        overall: 0,
        productQuality: 0,
        packaging: 0,
        deliveryTime: 0,
        shipper: 0,
      });
      setComment("");
      setSelectedImages([]);
      setImagePreviews([]);
      setError(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            Đánh giá đơn hàng
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Overall Rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Đánh giá tổng thể <span className="text-red-500">*</span>
            </label>
            <StarRating
              value={ratings.overall}
              onChange={(value) => setRatings({ ...ratings, overall: value })}
              size="lg"
            />
          </div>

          {/* Product Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chất lượng sản phẩm
            </label>
            <StarRating
              value={ratings.productQuality}
              onChange={(value) => setRatings({ ...ratings, productQuality: value })}
            />
          </div>

          {/* Packaging */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đóng gói
            </label>
            <StarRating
              value={ratings.packaging}
              onChange={(value) => setRatings({ ...ratings, packaging: value })}
            />
          </div>

          {/* Delivery Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Thời gian giao hàng
            </label>
            <StarRating
              value={ratings.deliveryTime}
              onChange={(value) => setRatings({ ...ratings, deliveryTime: value })}
            />
          </div>

          {/* Shipper */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dịch vụ giao hàng
            </label>
            <StarRating
              value={ratings.shipper}
              onChange={(value) => setRatings({ ...ratings, shipper: value })}
            />
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nhận xét của bạn
            </label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Chia sẻ trải nghiệm của bạn về đơn hàng này..."
              rows={4}
              className="resize-none"
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh ({selectedImages.length}/5)
            </label>
            
            {/* Upload Button */}
            <label className="inline-block cursor-pointer">
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageSelect}
                className="hidden"
                disabled={selectedImages.length >= 5}
              />
              <div className={`px-4 py-2 border-2 border-dashed rounded-lg text-center transition-colors ${
                selectedImages.length >= 5
                  ? "border-gray-300 text-gray-400 cursor-not-allowed"
                  : "border-gray-400 text-gray-700 hover:border-green-500 hover:bg-green-50"
              }`}>
                {selectedImages.length >= 5 ? (
                  <span>Đã đủ 5 ảnh</span>
                ) : (
                  <>
                    <span className="font-medium">Chọn ảnh</span>
                    <span className="text-sm text-gray-500 ml-2">
                      (Tối đa 5 ảnh)
                    </span>
                  </>
                )}
              </div>
            </label>

            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-3 grid grid-cols-5 gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group aspect-square">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleClose}
              disabled={loading}
            >
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-[#007E42] hover:bg-[#006633]"
            >
              {loading ? "Đang gửi..." : "Gửi đánh giá"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

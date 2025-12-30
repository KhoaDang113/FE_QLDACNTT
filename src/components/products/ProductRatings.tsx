import { useState, useEffect, useCallback } from "react";
import { Star, X, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import ratingService from "@/api/services/ratingService";
import authService from "@/api/services/authService";
import type { Rating } from "@/api/services/ratingService";

interface ProductRatingsProps {
  productId: string;
}

export default function ProductRatings({ productId }: ProductRatingsProps) {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  
  // Form state
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [ratingContent, setRatingContent] = useState("");
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  // Rating summary
  const [summary, setSummary] = useState({
    average_rating: 0,
    total_ratings: 0,
    rating_distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  // Load ratings
  const loadRatings = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await ratingService.getRatingsByProduct(
        productId,
        page,
        pagination.limit
      );
      
      setRatings(response.ratings || []);
      setPagination(response.pagination);
      
      // Calculate summary
      if (response.summary) {
        setSummary(response.summary);
      } else {
        // Calculate from ratings if backend doesn't provide summary
        const calc = ratingService.calculateRatingDistribution(response.ratings);
        setSummary({
          average_rating: calc.average,
          total_ratings: calc.total,
          rating_distribution: calc.distribution,
        });
      }
    } catch (error) {
      console.error("Error loading ratings:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, pagination.limit]);

  useEffect(() => {
    if (productId) {
      loadRatings();
    }
  }, [productId, loadRatings]);

  // Handle image selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxImages = 5;
    
    if (imageFiles.length + files.length > maxImages) {
      alert(`Chỉ được chọn tối đa ${maxImages} ảnh`);
      return;
    }

    // Create previews
    const newPreviews: string[] = [];
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        if (newPreviews.length === files.length) {
          setImagePreviews([...imagePreviews, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    setImageFiles([...imageFiles, ...files]);
  };

  // Remove image
  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  // Submit rating
  const handleSubmitRating = async () => {
    if (!isAuthenticated) {
      alert("Vui lòng đăng nhập để đánh giá sản phẩm");
      return;
    }

    if (selectedRating === 0) {
      alert("Vui lòng chọn số sao đánh giá");
      return;
    }

    try {
      setSubmitting(true);
      await ratingService.createRating(
        {
          product_id: productId,
          rating: selectedRating,
          content: ratingContent.trim() || undefined,
        },
        imageFiles.length > 0 ? imageFiles : undefined
      );

      // Reset form
      setSelectedRating(0);
      setRatingContent("");
      setImageFiles([]);
      setImagePreviews([]);
      setShowRatingForm(false);

      // Reload ratings
      await loadRatings(1);
      alert("Đánh giá của bạn đã được gửi thành công!");
    } catch (error: Error | unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error creating rating:", error);
      alert(
        err.response?.data?.message || "Không thể gửi đánh giá. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Render stars
  const renderStars = (
    rating: number,
    size: "sm" | "md" | "lg" = "sm",
    interactive: boolean = false,
    onRate?: (star: number) => void,
    onHover?: (star: number) => void
  ) => {
    const sizeClass =
      size === "lg" ? "w-8 h-8" : size === "md" ? "w-6 h-6" : "w-4 h-4";
    const displayRating = interactive ? hoverRating || selectedRating : rating;

    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onRate?.(star)}
            onMouseEnter={() => interactive && onHover?.(star)}
            onMouseLeave={() => interactive && onHover?.(0)}
            className={`${interactive ? "cursor-pointer hover:scale-110 transition-transform" : "cursor-default"}`}
          >
            <Star
              className={`${sizeClass} ${
                star <= displayRating
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  // Calculate percentage for rating distribution
  const getRatingPercentage = (stars: number): number => {
    if (summary.total_ratings === 0) return 0;
    const count = summary.rating_distribution[stars as keyof typeof summary.rating_distribution] || 0;
    return Math.round((count / summary.total_ratings) * 100);
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Hôm nay";
    if (days === 1) return "Hôm qua";
    if (days < 7) return `${days} ngày trước`;
    return date.toLocaleDateString("vi-VN");
  };

  // Get user info
  const getUserInfo = (user: string | { _id?: string; name?: string; avatar?: string; role?: string }) => {
    if (typeof user === "string") return null;
    return user;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-5">
      <h2 className="text-lg font-bold text-gray-900 mb-4">
        Đánh giá sản phẩm
      </h2>

      {/* Rating Summary */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 pb-6 border-b">
        {/* Average Rating */}
        <div className="flex flex-col items-center justify-center md:w-1/3 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-100">
          <div className="text-5xl font-bold text-gray-900 mb-2">
            {summary.average_rating.toFixed(1)}
          </div>
          {renderStars(Math.round(summary.average_rating), "lg")}
          <div className="text-sm text-gray-600 mt-2">
            <span className="text-[#007E42] font-semibold">
              {summary.total_ratings} đánh giá
            </span>
          </div>
        </div>

        {/* Rating Distribution */}
        <div className="flex-1 space-y-2">
          {[5, 4, 3, 2, 1].map((stars) => {
            const percentage = getRatingPercentage(stars);
            return (
              <div key={stars} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-16">
                  <span className="text-sm font-medium text-gray-700">
                    {stars}
                  </span>
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">
                  {percentage}%
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Rating Form */}
      {isAuthenticated ? (
        <div className="mb-6">
          {!showRatingForm ? (
            <Button
              onClick={() => setShowRatingForm(true)}
              className="w-full bg-gradient-to-r from-[#007E42] to-[#00a855] hover:from-[#005a2f] hover:to-[#007E42] text-white"
            >
              ✍️ Viết đánh giá của bạn
            </Button>
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 space-y-4 border-2 border-[#007E42]/20">
              {/* Star Selection */}
              <div className="flex flex-col items-center gap-3 py-4">
                <p className="text-sm font-medium text-gray-700">
                  Đánh giá của bạn về sản phẩm này:
                </p>
                {renderStars(
                  selectedRating,
                  "lg",
                  true,
                  setSelectedRating,
                  setHoverRating
                )}
                {selectedRating > 0 && (
                  <p className="text-sm text-gray-600">
                    {selectedRating === 5 && "Xuất sắc"}
                    {selectedRating === 4 && "Tốt"}
                    {selectedRating === 3 && "Bình thường"}
                    {selectedRating === 2 && "Tạm được"}
                    {selectedRating === 1 && "Không hài lòng"}
                  </p>
                )}
              </div>

              {/* Review Text */}
              <div>
                <textarea
                  value={ratingContent}
                  onChange={(e) => setRatingContent(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm (không bắt buộc)"
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#007E42] focus:border-[#007E42] resize-none transition-all"
                  rows={4}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Thêm hình ảnh (Tối đa 5 ảnh)
                </label>
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                      />
                      <button
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  {imageFiles.length < 5 && (
                    <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-[#007E42] hover:bg-gray-50 transition-colors">
                      <Upload className="w-6 h-6 text-gray-400" />
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button
                  onClick={handleSubmitRating}
                  disabled={selectedRating === 0 || submitting}
                  className="flex-1 bg-[#007E42] hover:bg-[#005a2f] text-white"
                >
                  {submitting ? "Đang gửi..." : "Gửi đánh giá"}
                </Button>
                <Button
                  onClick={() => {
                    setShowRatingForm(false);
                    setSelectedRating(0);
                    setRatingContent("");
                    setImageFiles([]);
                    setImagePreviews([]);
                  }}
                  variant="outline"
                >
                  Hủy
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg text-center text-sm text-gray-600 border border-gray-200">
          Vui lòng{" "}
          <a href="/login" className="text-[#007E42] hover:underline font-medium">
            đăng nhập
          </a>{" "}
          để đánh giá sản phẩm
        </div>
      )}

      {/* Ratings List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Đang tải...</div>
      ) : ratings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá sản phẩm này!
        </div>
      ) : (
        <div className="space-y-6">
          {ratings.map((rating) => {
            const userInfo = getUserInfo(rating.user_id);
            const isOwner =
              currentUser &&
              userInfo &&
              (userInfo._id === currentUser.id ||
                userInfo._id === currentUser._id);

            return (
              <div
                key={rating._id}
                className="border-b pb-6 last:border-b-0 hover:bg-gray-50 rounded-lg p-4 transition-colors"
              >
                {/* User Info & Rating */}
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    {userInfo?.avatar ? (
                      <img
                        src={userInfo.avatar}
                        alt={userInfo.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-green-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {userInfo?.name || "Người dùng"}
                      </h3>
                      {userInfo?.role === "admin" && (
                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                          QTV
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {renderStars(rating.rating)}
                      <span className="text-sm text-gray-500">
                        {formatDate(rating.created_at)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Rating Content */}
                {rating.content && (
                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                    {rating.content}
                  </p>
                )}

                {/* Rating Images */}
                {rating.images && rating.images.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {rating.images.map((image, index) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Rating image ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-gray-200 hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => window.open(image, "_blank")}
                      />
                    ))}
                  </div>
                )}

                {/* Actions */}
                {isOwner && (
                  <div className="flex gap-2">
                    <button className="text-sm text-gray-600 hover:text-red-600 transition-colors">
                      Xóa đánh giá
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6 pt-6 border-t">
          <Button
            onClick={() => loadRatings(pagination.page - 1)}
            disabled={pagination.page === 1 || loading}
            variant="outline"
            size="sm"
          >
            Trước
          </Button>
          <span className="flex items-center px-4 text-sm text-gray-600">
            Trang {pagination.page} / {pagination.totalPages}
          </span>
          <Button
            onClick={() => loadRatings(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages || loading}
            variant="outline"
            size="sm"
          >
            Sau
          </Button>
        </div>
      )}
    </div>
  );
}


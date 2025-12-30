import { useState, useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, MessageSquare } from "lucide-react";
import orderRatingService from "@/api/services/orderRatingService";
import type { OrderRating, RatingListResponse } from "@/types/order-rating.type";
import { RatingDetailModal } from "@/components/admin/ratings/RatingDetailModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function RatingsPage() {
  const [ratings, setRatings] = useState<RatingListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRatingId, setSelectedRatingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadRatings = async (page: number = 1) => {
    try {
      setLoading(true);
      const data = await orderRatingService.getAllRatings({ page, limit: 10 });
      setRatings(data);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error loading ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRatings(1);
  }, []);

  const handleViewDetail = (ratingId: string) => {
    setSelectedRatingId(ratingId);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedRatingId(null);
  };

  const handleResponseSubmitted = () => {
    // Reload current page after response is submitted
    loadRatings(currentPage);
  };

  const getRatingStars = (rating: number) => {
    return "⭐".repeat(rating);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Calculate stats
  const stats = ratings ? {
    total: ratings.total,
    avgRating: ratings.data.length > 0 
      ? (ratings.data.reduce((sum, r) => sum + r.rating_overall, 0) / ratings.data.length).toFixed(1)
      : "0",
    pending: ratings.data.filter(r => !r.admin_response).length,
    responded: ratings.data.filter(r => r.admin_response).length,
  } : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Quản Lý Đánh Giá</h1>
        <p className="text-muted-foreground mt-1">
          Xem và phản hồi đánh giá từ khách hàng
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tổng Đánh Giá
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Trung Bình
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgRating} ⭐</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Chờ Phản Hồi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Đã Phản Hồi
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.responded}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Ratings Table */}
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="text-center py-8">Đang tải...</div>
          ) : !ratings || ratings.data.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Chưa có đánh giá nào
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mã Đơn</TableHead>
                    <TableHead>Khách Hàng</TableHead>
                    <TableHead>Đánh Giá</TableHead>
                    <TableHead>Nhận Xét</TableHead>
                    <TableHead>Ngày Tạo</TableHead>
                    <TableHead>Trạng Thái</TableHead>
                    <TableHead className="text-right">Thao Tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ratings.data.map((rating) => (
                    <TableRow key={rating._id}>
                      <TableCell className="font-medium">
                        {(() => {
                          const orderId = typeof rating.order_id === 'object' && rating.order_id 
                            ? rating.order_id._id 
                            : rating.order_id;
                          return `#${String(orderId).slice(-6).toUpperCase()}`;
                        })()}
                      </TableCell>
                      <TableCell>
                        {typeof rating.user_id === 'object' 
                          ? rating.user_id?.full_name || rating.user_id?.email || 'N/A'
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <span className="text-lg">
                            {getRatingStars(rating.rating_overall)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            ({rating.rating_overall}/5)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {rating.comment || <span className="text-muted-foreground italic">Không có</span>}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(rating.createdAt)}
                      </TableCell>
                      <TableCell>
                        {rating.admin_response ? (
                          <Badge variant="default" className="bg-green-600">
                            Đã phản hồi
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            Chờ phản hồi
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(rating._id)}
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            Chi tiết
                          </Button>
                          {!rating.admin_response && (
                            <Button
                              size="sm"
                              onClick={() => handleViewDetail(rating._id)}
                            >
                              <MessageSquare className="h-4 w-4 mr-1" />
                              Phản hồi
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {ratings.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadRatings(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Trước
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    Trang {currentPage} / {ratings.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => loadRatings(currentPage + 1)}
                    disabled={currentPage === ratings.totalPages}
                  >
                    Sau →
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Rating Detail Modal */}
      {selectedRatingId && (
        <RatingDetailModal
          ratingId={selectedRatingId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onResponseSubmitted={handleResponseSubmitted}
        />
      )}
    </div>
  );
}

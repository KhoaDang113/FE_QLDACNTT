import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Grid3x3, List, MessageCircle } from "lucide-react";
import { CommentFilters } from "@/components/admin/comments/CommentFilters";
import { CommentTable } from "@/components/admin/comments/CommentTable";
import { CommentHierarchicalView } from "@/components/admin/comments/CommentHierarchicalView";
import type { CommentWithProduct } from "@/api/types";
import commentService from "@/api/services/commentService";

type ViewMode = "table" | "hierarchical";

export default function AdminComments() {
    const [viewMode, setViewMode] = useState<ViewMode>("hierarchical");
    const [searchTerm, setSearchTerm] = useState("");
    const [comments, setComments] = useState<CommentWithProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (viewMode === "table") {
            fetchComments();
        }
    }, [viewMode, searchTerm]);

    const fetchComments = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await commentService.getAllCommentsAdmin(
                1,
                1000,
                undefined,
                searchTerm.trim() || undefined
            );
            setComments(response.comments || []);
        } catch (err) {
            console.error("Error fetching comments:", err);
            setError("Không thể tải dữ liệu. Vui lòng thử lại sau.");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        try {
            await commentService.adminDeleteComment(commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
            alert("Xóa bình luận thành công!");
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert("Không thể xóa bình luận. Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl p-6 text-white shadow-lg">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                            <MessageCircle className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold">Quản lý Bình luận</h1>
                            <p className="text-pink-100 mt-1">
                                Quản lý toàn bộ bình luận sản phẩm trong hệ thống
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm">
                        <Button
                            variant={viewMode === "hierarchical" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("hierarchical")}
                            className={`gap-2 rounded-r-none ${viewMode === "hierarchical" ? "bg-white text-pink-600" : "text-white hover:bg-white/20"}`}
                        >
                            <Grid3x3 className="w-4 h-4" />
                            Phân cấp
                        </Button>
                        <Button
                            variant={viewMode === "table" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("table")}
                            className={`gap-2 rounded-l-none ${viewMode === "table" ? "bg-white text-pink-600" : "text-white hover:bg-white/20"}`}
                        >
                            <List className="w-4 h-4" />
                            Bảng
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                {viewMode === "table" && (
                    <>
                        <div className="p-4 md:p-6 border-b bg-gray-50/50">
                            <CommentFilters
                                searchTerm={searchTerm}
                                setSearchTerm={setSearchTerm}
                            />
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-pink-600 mb-4"></div>
                                <p className="text-gray-500">Đang tải dữ liệu...</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
                                    <MessageCircle className="w-10 h-10 text-red-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-1">Có lỗi xảy ra</h3>
                                <p className="text-gray-500 text-center max-w-sm">{error}</p>
                            </div>
                        ) : (
                            <CommentTable
                                comments={comments}
                                onRefresh={fetchComments}
                                onDelete={handleDeleteComment}
                            />
                        )}
                    </>
                )}

                {viewMode === "hierarchical" && <CommentHierarchicalView />}
            </div>
        </div>
    );
}


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Grid3x3, List } from "lucide-react";
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
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">
                        Quản lý Bình luận
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Quản lý toàn bộ bình luận sản phẩm trong hệ thống
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center border rounded-lg">
                        <Button
                            variant={viewMode === "hierarchical" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("hierarchical")}
                            className="gap-2 rounded-r-none"
                        >
                            <Grid3x3 className="w-4 h-4" />
                            Phân cấp
                        </Button>
                        <Button
                            variant={viewMode === "table" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("table")}
                            className="gap-2 rounded-l-none"
                        >
                            <List className="w-4 h-4" />
                            Bảng
                        </Button>
                    </div>
                </div>
            </div>

            {viewMode === "table" && (
                <>
                    <CommentFilters
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                    />

                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-muted-foreground">Đang tải danh sách bình luận...</p>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center h-64">
                            <p className="text-destructive">{error}</p>
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
    );
}

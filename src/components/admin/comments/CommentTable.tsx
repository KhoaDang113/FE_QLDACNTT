import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ExternalLink, Trash2 } from "lucide-react";
import type { CommentWithProduct, Comment } from "@/api/types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Link } from "react-router-dom";
import { ReplyModal } from "./ReplyModal";
import commentService from "@/api/services/commentService";
import { toast } from "sonner";

interface CommentTableProps {
    comments: CommentWithProduct[];
    onRefresh: () => void;
    onDelete?: (commentId: string) => void;
}

export function CommentTable({ comments, onRefresh, onDelete }: CommentTableProps) {
    const [selectedComment, setSelectedComment] = useState<CommentWithProduct | null>(null);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [replies, setReplies] = useState<Record<string, Comment[]>>({});
    const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());

    const handleToggleReplies = async (commentId: string) => {
        const newExpanded = new Set(expandedComments);
        if (newExpanded.has(commentId)) {
            newExpanded.delete(commentId);
            setExpandedComments(newExpanded);
            return;
        }

        newExpanded.add(commentId);
        setExpandedComments(newExpanded);

        if (!replies[commentId]) {
            setLoadingReplies(prev => new Set(prev).add(commentId));
            try {
                const response = await commentService.getReplies(commentId);
                setReplies(prev => ({ ...prev, [commentId]: response.comments }));
            } catch (error) {
                console.error("Error fetching replies:", error);
                toast.error("Không thể tải phản hồi. Vui lòng thử lại sau.");
            } finally {
                setLoadingReplies(prev => {
                    const next = new Set(prev);
                    next.delete(commentId);
                    return next;
                });
            }
        }
    };

    const handleReply = (comment: CommentWithProduct) => {
        setSelectedComment(comment);
        setIsReplyModalOpen(true);
    };

    const handleDelete = async (commentId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
            return;
        }

        if (onDelete) {
            onDelete(commentId);
            return;
        }

        try {
            await commentService.adminDeleteComment(commentId);
            toast.success("Xóa bình luận thành công!");
            onRefresh();
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Không thể xóa bình luận. Vui lòng thử lại sau.");
        }
    };

    const handleDeleteReply = async (replyId: string, parentId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa phản hồi này?")) {
            return;
        }

        try {
            await commentService.adminDeleteComment(replyId);

            // Update local state immediately
            setReplies(prev => ({
                ...prev,
                [parentId]: prev[parentId]?.filter(r => r._id !== replyId) || []
            }));

            toast.success("Xóa phản hồi thành công!");
            // Optional: still refresh to keep counts in sync eventually, but UI is instant
            onRefresh();
        } catch (error) {
            console.error("Error deleting reply:", error);
            toast.error("Không thể xóa phản hồi. Vui lòng thử lại sau.");
        }
    };

    const handleReplySuccess = (newReply?: Comment) => {
        setIsReplyModalOpen(false);

        if (newReply && selectedComment) {
            const parentId = selectedComment._id;
            setReplies(prev => ({
                ...prev,
                [parentId]: [...(prev[parentId] || []), newReply]
            }));

            // Also update the expanded state to show the new reply if not already expanded
            if (!expandedComments.has(parentId)) {
                setExpandedComments(prev => new Set(prev).add(parentId));
            }
        }

        setSelectedComment(null);
        onRefresh(); // Still refresh to update counts on the main list
    };

    return (
        <>
            <Card className="p-6">
                <div className="mb-4">
                    <h3 className="text-lg font-semibold">
                        Danh sách Bình luận ({comments.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="admin-table" style={{ tableLayout: "fixed", width: "100%" }}>
                        <thead>
                            <tr>
                                <th style={{ width: "200px" }}>Người dùng</th>
                                <th style={{ width: "300px" }}>Nội dung</th>
                                <th style={{ width: "200px" }}>Sản phẩm</th>
                                <th style={{ width: "120px" }}>Thời gian</th>
                                <th style={{ width: "80px" }}>Phản hồi</th>
                                <th style={{ width: "180px" }}>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {comments.map((comment) => {
                                const user = typeof comment.user_id === "object" ? comment.user_id : null;
                                const product = typeof comment.product_id === "object" ? comment.product_id : null;

                                return (
                                    <>
                                        <tr key={comment._id}>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {user?.avatar && (
                                                        <img
                                                            src={user.avatar}
                                                            alt={user.name}
                                                            className="w-8 h-8 rounded-full object-cover"
                                                        />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="font-medium truncate">{user?.name || "Unknown"}</p>
                                                        {user?.email && (
                                                            <p className="text-xs text-muted-foreground truncate">
                                                                {user.email}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <p className="line-clamp-2 text-sm">{comment.content}</p>
                                                {(comment.reply_count || 0) > 0 && (
                                                    <button
                                                        onClick={() => handleToggleReplies(comment._id)}
                                                        className="text-xs text-primary hover:underline mt-1 flex items-center gap-1 font-medium"
                                                    >
                                                        {expandedComments.has(comment._id) ? "Ẩn" : `Xem ${comment.reply_count} phản hồi`}
                                                    </button>
                                                )}
                                            </td>
                                            <td>
                                                {product && (
                                                    <div className="flex items-center gap-2">
                                                        {product.image_primary && (
                                                            <img
                                                                src={product.image_primary}
                                                                alt={product.name}
                                                                className="w-10 h-10 rounded object-cover"
                                                            />
                                                        )}
                                                        <p className="line-clamp-2 text-sm flex-1 min-w-0">
                                                            {product.name}
                                                        </p>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="text-sm text-muted-foreground">
                                                {formatDistanceToNow(new Date(comment.created_at), {
                                                    addSuffix: true,
                                                    locale: vi,
                                                })}
                                            </td>
                                            <td className="text-center">
                                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                                                    {comment.reply_count || 0}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {product && (
                                                        <Link
                                                            to={`/products-detail/${product._id}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Button variant="ghost" size="sm" title="Xem sản phẩm">
                                                                <ExternalLink className="w-4 h-4" />
                                                            </Button>
                                                        </Link>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleReply(comment)}
                                                        title="Phản hồi"
                                                    >
                                                        <MessageSquare className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(comment._id)}
                                                        title="Xóa"
                                                        className="text-destructive hover:text-destructive"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                        {
                                            expandedComments.has(comment._id) && (
                                                <tr key={`${comment._id}-replies`}>
                                                    <td colSpan={6} className="bg-muted/30 p-0">
                                                        <div className="pl-12 pr-4 py-4 space-y-4 relative">
                                                            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />
                                                            {loadingReplies.has(comment._id) ? (
                                                                <p className="text-sm text-center text-muted-foreground py-2">Đang tải phản hồi...</p>
                                                            ) : replies[comment._id]?.map((reply) => {
                                                                const replyUser = typeof reply.user_id === "object" ? reply.user_id : null;
                                                                return (
                                                                    <div key={reply._id} className="flex gap-4 relative group">
                                                                        {/* Connection line */}
                                                                        <div className="absolute -left-4 top-4 w-4 h-0.5 bg-border" />

                                                                        {replyUser?.avatar && (
                                                                            <img
                                                                                src={replyUser.avatar}
                                                                                alt={replyUser.name}
                                                                                className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                                            />
                                                                        )}
                                                                        <div className="flex-1 space-y-1">
                                                                            <div className="flex items-center gap-2">
                                                                                <span className="font-medium text-sm">{replyUser?.name || "Unknown"}</span>
                                                                                <span className="text-xs text-muted-foreground">
                                                                                    {formatDistanceToNow(new Date(reply.created_at), {
                                                                                        addSuffix: true,
                                                                                        locale: vi,
                                                                                    })}
                                                                                </span>
                                                                            </div>
                                                                            <p className="text-sm">{reply.content}</p>
                                                                            <div className="flex items-center gap-3 pt-1">
                                                                                <button
                                                                                    onClick={() => handleDeleteReply(reply._id, comment._id)}
                                                                                    className="text-xs text-destructive hover:underline font-medium"
                                                                                >
                                                                                    Xóa
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </td>
                                                </tr>
                                            )
                                        }
                                    </>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {comments.length === 0 && (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">Không có bình luận nào</p>
                    </div>
                )}
            </Card>

            {selectedComment && (
                <ReplyModal
                    isOpen={isReplyModalOpen}
                    onClose={() => {
                        setIsReplyModalOpen(false);
                        setSelectedComment(null);
                    }}
                    comment={selectedComment}
                    onSuccess={handleReplySuccess}
                />
            )}
        </>
    );
}

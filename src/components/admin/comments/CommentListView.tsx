import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MessageSquare, Trash2, ChevronLeft } from "lucide-react";
import type { CommentWithProduct, Comment } from "@/api/types";
import commentService from "@/api/services/commentService";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";

import { ReplyModal } from "./ReplyModal";

interface CommentListViewProps {
    comments: CommentWithProduct[];
    productName: string;
    onBack: () => void;
    onDelete: (commentId: string) => void;
}

export function CommentListView({
    comments,
    productName,
    onBack,
    onDelete,
}: CommentListViewProps) {
    const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
    const [replies, setReplies] = useState<Record<string, Comment[]>>({});
    const [loadingReplies, setLoadingReplies] = useState<Set<string>>(new Set());
    const [selectedComment, setSelectedComment] = useState<CommentWithProduct | null>(null);
    const [isReplyModalOpen, setIsReplyModalOpen] = useState(false);

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

    const handleReplySuccess = (newReply?: Comment) => {
        setIsReplyModalOpen(false);

        if (newReply && selectedComment) {
            const parentId = selectedComment._id;
            setReplies(prev => ({
                ...prev,
                [parentId]: [...(prev[parentId] || []), newReply]
            }));

            if (!expandedComments.has(parentId)) {
                setExpandedComments(prev => new Set(prev).add(parentId));
            }
        }
        setSelectedComment(null);
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
        } catch (error) {
            console.error("Error deleting reply:", error);
            toast.error("Không thể xóa phản hồi. Vui lòng thử lại sau.");
        }
    };

    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex items-center gap-2 mb-4 ">
                <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Quay lại
                </Button>
            </div>

            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold">Bình luận sản phẩm</h3>
                    <p className="text-sm text-muted-foreground">{productName}</p>
                </div>
                <Badge variant="secondary">{comments.length} bình luận</Badge>
            </div>

            <div className="space-y-4">
                {comments.map((comment) => {
                    const user =
                        typeof comment.user_id === "object" ? comment.user_id : null;

                    return (
                        <div
                            key={comment._id}
                            className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                        >
                            <div className="flex items-start gap-3">
                                {user?.avatar && (
                                    <img
                                        src={user.avatar}
                                        alt={user.name}
                                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                                    />
                                )}

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium">
                                            {user?.name || "Unknown"}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                            {formatDistanceToNow(new Date(comment.created_at), {
                                                addSuffix: true,
                                                locale: vi,
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-sm mb-2">{comment.content}</p>
                                    {comment.reply_count && comment.reply_count > 0 && (
                                        <button
                                            onClick={() => handleToggleReplies(comment._id)}
                                            className="text-xs text-primary hover:underline mt-1 flex items-center gap-1 font-medium"
                                        >
                                            {expandedComments.has(comment._id) ? "Ẩn" : `Xem ${comment.reply_count} phản hồi`}
                                        </button>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 flex-shrink-0">
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
                                        onClick={() => onDelete(comment._id)}
                                        title="Xóa"
                                        className="text-destructive hover:text-destructive"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            {/* Replies Section */}
                            {expandedComments.has(comment._id) && (
                                <div className="ml-12 mt-4 space-y-4 relative border-l-2 pl-4">
                                    {loadingReplies.has(comment._id) ? (
                                        <p className="text-sm text-muted-foreground">Đang tải phản hồi...</p>
                                    ) : replies[comment._id]?.map((reply) => {
                                        const replyUser = typeof reply.user_id === "object" ? reply.user_id : null;
                                        return (
                                            <div key={reply._id} className="flex items-start gap-3">
                                                {replyUser?.avatar && (
                                                    <img
                                                        src={replyUser.avatar}
                                                        alt={replyUser.name}
                                                        className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                                                    />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-medium text-sm">
                                                            {replyUser?.name || "Unknown"}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatDistanceToNow(new Date(reply.created_at), {
                                                                addSuffix: true,
                                                                locale: vi,
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm mb-1">{reply.content}</p>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => handleDeleteReply(reply._id, comment._id)}
                                                            className="text-xs text-destructive hover:underline font-medium flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-3 h-3" /> Xóa
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {
                comments.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">Chưa có bình luận nào</p>
                    </div>
                )
            }

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
        </div >
    );
}

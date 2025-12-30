import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Send, Trash2, Edit2, Reply, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import commentService from "@/api/services/commentService";
import authService from "@/api/services/authService";
import type { Comment, CommentUser } from "@/api/types";

interface ProductCommentsProps {
  productId: string;
}

export default function ProductComments({ productId }: ProductCommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set()
  );
  const [replies, setReplies] = useState<Record<string, Comment[]>>({});
  const [loadingReplies, setLoadingReplies] = useState<Record<string, boolean>>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();

  // Load comments
  const loadComments = useCallback(async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await commentService.getCommentsByProduct(
        productId,
        page,
        pagination.limit
      );
      setComments(response.comments);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Error loading comments:", error);
    } finally {
      setLoading(false);
    }
  }, [productId, pagination.limit]);

  // Load replies for a comment
  const loadReplies = async (commentId: string) => {
    try {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: true }));
      const response = await commentService.getReplies(commentId, 1, 50);
      setReplies((prev) => ({
        ...prev,
        [commentId]: response.comments || [],
      }));
    } catch (error) {
      console.error("Error loading replies:", error);
      setReplies((prev) => ({
        ...prev,
        [commentId]: [],
      }));
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [commentId]: false }));
    }
  };

  useEffect(() => {
    if (productId) {
      loadComments();
    }
  }, [productId, loadComments]);

  // Toggle replies visibility
  const toggleReplies = (commentId: string) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
      if (!replies[commentId]) {
        loadReplies(commentId);
      }
    }
    setExpandedReplies(newExpanded);
  };

  // Submit new comment
  const handleSubmitComment = async () => {
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      await commentService.createComment({
        product_id: productId,
        content: newComment.trim(),
      });
      setNewComment("");
      await loadComments(1);
    } catch (error: Error | unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error creating comment:", error);
      alert(err.response?.data?.message || "Không thể đăng bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  // Submit reply
  const handleSubmitReply = async (parentId: string) => {
    if (!replyContent.trim() || !isAuthenticated) return;

    try {
      setSubmitting(true);
      await commentService.createComment({
        product_id: productId,
        content: replyContent.trim(),
        parent_id: parentId,
      });
      setReplyContent("");
      setReplyingTo(null);
      await loadReplies(parentId);
      await loadComments(pagination.page); // Refresh to update reply_count
    } catch (error: Error | unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error creating reply:", error);
      alert(err.response?.data?.message || "Không thể đăng phản hồi");
    } finally {
      setSubmitting(false);
    }
  };

  // Update comment
  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      setSubmitting(true);
      await commentService.updateComment(commentId, {
        content: editContent.trim(),
      });
      setEditingId(null);
      setEditContent("");
      await loadComments(pagination.page);
    } catch (error: Error | unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error updating comment:", error);
      alert(err.response?.data?.message || "Không thể cập nhật bình luận");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete comment
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa bình luận này?")) return;

    try {
      setSubmitting(true);
      await commentService.deleteComment(commentId);
      await loadComments(pagination.page);
      // Remove from replies if it was a reply
      setReplies((prev) => {
        const newReplies = { ...prev };
        Object.keys(newReplies).forEach((parentId) => {
          newReplies[parentId] = newReplies[parentId].filter(
            (r) => r._id !== commentId
          );
        });
        return newReplies;
      });
    } catch (error: Error | unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      console.error("Error deleting comment:", error);
      alert(err.response?.data?.message || "Không thể xóa bình luận");
    } finally {
      setSubmitting(false);
    }
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
  const getUserInfo = (user: CommentUser | string): CommentUser | null => {
    if (typeof user === "string") return null;
    return user;
  };

  // Check if user owns comment
  const isOwner = (comment: Comment): boolean => {
    if (!currentUser) return false;
    const userInfo = getUserInfo(comment.user_id);
    if (!userInfo) return false;
    return userInfo._id === currentUser.id || userInfo._id === currentUser._id;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-5">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-[#007E42]" />
        Bình luận sản phẩm
      </h2>

      {/* Comment Input */}
      {isAuthenticated ? (
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Mời bạn bình luận hoặc đặt câu hỏi..."
            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#007E42] focus:border-[#007E42] resize-none transition-all"
            rows={3}
          />
          <div className="flex justify-end mt-2">
            <Button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || submitting}
              className="bg-gradient-to-r from-[#007E42] to-[#00a855] hover:from-[#005a2f] hover:to-[#007E42] text-white"
            >
              <Send className="w-4 h-4 mr-2" />
              Đăng bình luận
            </Button>
          </div>
        </div>
      ) : (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg text-center text-sm text-gray-600">
          Vui lòng{" "}
          <a href="/login" className="text-[#007E42] hover:underline font-medium">
            đăng nhập
          </a>{" "}
          để bình luận
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-center py-6 text-gray-500">Đang tải...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-6 text-gray-500">
          Chưa có bình luận nào. Hãy là người đầu tiên bình luận!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const userInfo = getUserInfo(comment.user_id);
            const isCommentOwner = isOwner(comment);
            const isExpanded = expandedReplies.has(comment._id);
            const commentReplies = replies[comment._id] || [];

            return (
              <div key={comment._id} className="border-b pb-4 last:border-b-0">
                {/* Comment Header */}
                <div className="flex items-start gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                    {userInfo?.avatar ? (
                      <img
                        src={userInfo.avatar}
                        alt={userInfo.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-green-600" />
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
                      <span className="text-sm text-gray-500">
                        {formatDate(comment.created_at)}
                      </span>
                    </div>

                    {/* Comment Content */}
                    {editingId === comment._id ? (
                      <div className="mt-2">
                        <textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => handleUpdateComment(comment._id)}
                            disabled={!editContent.trim() || submitting}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Lưu
                          </Button>
                          <Button
                            onClick={() => {
                              setEditingId(null);
                              setEditContent("");
                            }}
                            size="sm"
                            variant="outline"
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {comment.content}
                      </p>
                    )}

                    {/* Comment Actions */}
                    {editingId !== comment._id && (
                      <div className="flex items-center gap-4 mt-3">
                        {isAuthenticated && (
                          <button
                            onClick={() => {
                              const userName = userInfo?.name || "Người dùng";
                              if (replyingTo === comment._id) {
                                setReplyingTo(null);
                                setReplyContent("");
                              } else {
                                setReplyingTo(comment._id);
                                setReplyContent(`@${userName} `);
                              }
                            }}
                            className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors"
                          >
                            <Reply className="w-4 h-4" />
                            Trả lời
                          </button>
                        )}
                        {comment.reply_count && comment.reply_count > 0 ? (
                          <button
                            onClick={() => toggleReplies(comment._id)}
                            className="text-sm text-green-600 hover:text-green-700 font-medium"
                          >
                            {isExpanded
                              ? "Ẩn"
                              : `Xem ${comment.reply_count} phản hồi`}
                          </button>
                        ) : null}
                        {isCommentOwner && (
                          <>
                            <button
                              onClick={() => {
                                setEditingId(comment._id);
                                setEditContent(comment.content);
                              }}
                              className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteComment(comment._id)}
                              className="flex items-center gap-1 text-sm text-gray-600 hover:text-red-600 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Xóa
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    {/* Reply Input */}
                    {replyingTo === comment._id && (
                      <div className="mt-4 ml-4 pl-4 border-l-2 border-green-200">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Viết phản hồi..."
                          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                          rows={2}
                        />
                        <div className="flex gap-2 mt-2">
                          <Button
                            onClick={() => handleSubmitReply(comment._id)}
                            disabled={!replyContent.trim() || submitting}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Send className="w-4 h-4 mr-1" />
                            Gửi
                          </Button>
                          <Button
                            onClick={() => {
                              setReplyingTo(null);
                              setReplyContent("");
                            }}
                            size="sm"
                            variant="outline"
                          >
                            Hủy
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Replies List */}
                    {isExpanded && (
                      <div className="mt-4 ml-4 pl-4 border-l-2 border-green-200">
                        {loadingReplies[comment._id] ? (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            Đang tải phản hồi...
                          </div>
                        ) : commentReplies.length > 0 ? (
                          <div className="space-y-4">
                            {commentReplies.map((reply) => {
                              const replyUserInfo = getUserInfo(reply.user_id);
                              const isReplyOwner = isOwner(reply);

                              return (
                                <div key={reply._id} className="flex items-start gap-3">
                                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                    {replyUserInfo?.avatar ? (
                                      <img
                                        src={replyUserInfo.avatar}
                                        alt={replyUserInfo.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <User className="w-4 h-4 text-green-600" />
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-semibold text-gray-900 text-sm">
                                        {replyUserInfo?.name || "Người dùng"}
                                      </h4>
                                      {replyUserInfo?.role === "admin" && (
                                        <span className="px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded">
                                          QTV
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-500">
                                        {formatDate(reply.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm whitespace-pre-wrap">
                                      {reply.content}
                                    </p>
                                    {isReplyOwner && (
                                      <div className="flex gap-3 mt-2">
                                        <button
                                          onClick={() => {
                                            setEditingId(reply._id);
                                            setEditContent(reply.content);
                                          }}
                                          className="text-xs text-gray-600 hover:text-blue-600"
                                        >
                                          Sửa
                                        </button>
                                        <button
                                          onClick={() =>
                                            handleDeleteComment(reply._id)
                                          }
                                          className="text-xs text-gray-600 hover:text-red-600"
                                        >
                                          Xóa
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-gray-500 text-sm">
                            Chưa có phản hồi nào
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            onClick={() => loadComments(pagination.page - 1)}
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
            onClick={() => loadComments(pagination.page + 1)}
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


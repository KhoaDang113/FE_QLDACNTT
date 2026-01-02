import { useState, useEffect, useCallback } from "react";
import { MessageSquare, Send, Trash2, Edit2, Reply, User, ChevronDown, ChevronUp } from "lucide-react";
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
      await loadComments(pagination.page);
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
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return "Vừa xong";
    if (minutes < 60) return `${minutes} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
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
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          Bình luận sản phẩm
          {pagination.total > 0 && (
            <span className="ml-2 px-2.5 py-0.5 bg-white/20 rounded-full text-sm font-medium">
              {pagination.total}
            </span>
          )}
        </h2>
      </div>

      <div className="p-5">
        {/* Comment Input */}
        {isAuthenticated ? (
          <div className="mb-6">
            <div className="flex gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-md">
                {currentUser?.avatar ? (
                  <img
                    src={currentUser.avatar}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Chia sẻ suy nghĩ của bạn về sản phẩm này..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none transition-all duration-200 bg-gray-50 hover:bg-white"
                  rows={3}
                />
                <div className="flex justify-end mt-3">
                  <Button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || submitting}
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md hover:shadow-lg transition-all duration-200 px-6"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Đăng bình luận
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mb-6 p-4 bg-gradient-to-r from-gray-50 to-slate-50 rounded-xl border border-gray-200 text-center">
            <p className="text-gray-600">
              Vui lòng{" "}
              <a href="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold hover:underline">
                đăng nhập
              </a>{" "}
              để bình luận
            </p>
          </div>
        )}

        {/* Comments List */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="w-10 h-10 border-3 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mb-3" />
            <p className="text-gray-500">Đang tải bình luận...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">Chưa có bình luận nào</p>
            <p className="text-gray-400 text-sm mt-1">Hãy là người đầu tiên bình luận!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => {
              const userInfo = getUserInfo(comment.user_id);
              const isCommentOwner = isOwner(comment);
              const isExpanded = expandedReplies.has(comment._id);
              const commentReplies = replies[comment._id] || [];

              return (
                <div
                  key={comment._id}
                  className="bg-gray-50 rounded-xl p-4 hover:bg-gray-100/80 transition-colors duration-200"
                >
                  {/* Comment Header */}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0 shadow-sm">
                      {userInfo?.avatar ? (
                        <img
                          src={userInfo.avatar}
                          alt={userInfo.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-5 h-5 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-gray-900">
                          {userInfo?.name || "Người dùng"}
                        </h3>
                        {userInfo?.role === "admin" && (
                          <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full font-medium shadow-sm">
                            QTV
                          </span>
                        )}
                        {userInfo?.role === "staff" && (
                          <span className="px-2 py-0.5 text-xs bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-medium shadow-sm">
                            NV
                          </span>
                        )}
                        <span className="text-sm text-gray-400">
                          {formatDate(comment.created_at)}
                        </span>
                      </div>

                      {/* Comment Content */}
                      {editingId === comment._id ? (
                        <div className="mt-3">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full p-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none"
                            rows={2}
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              onClick={() => handleUpdateComment(comment._id)}
                              disabled={!editContent.trim() || submitting}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
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
                        <p className="text-gray-700 mt-2 whitespace-pre-wrap leading-relaxed">
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
                              className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-emerald-600 transition-colors font-medium"
                            >
                              <Reply className="w-4 h-4" />
                              Trả lời
                            </button>
                          )}
                          {comment.reply_count && comment.reply_count > 0 ? (
                            <button
                              onClick={() => toggleReplies(comment._id)}
                              className="flex items-center gap-1.5 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                            >
                              {isExpanded ? (
                                <>
                                  <ChevronUp className="w-4 h-4" />
                                  Ẩn phản hồi
                                </>
                              ) : (
                                <>
                                  <ChevronDown className="w-4 h-4" />
                                  Xem {comment.reply_count} phản hồi
                                </>
                              )}
                            </button>
                          ) : null}
                          {isCommentOwner && (
                            <>
                              <button
                                onClick={() => {
                                  setEditingId(comment._id);
                                  setEditContent(comment.content);
                                }}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors font-medium"
                              >
                                <Edit2 className="w-4 h-4" />
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment._id)}
                                className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium"
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
                        <div className="mt-4 pl-4 border-l-3 border-emerald-300">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Viết phản hồi..."
                            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 resize-none bg-white"
                            rows={2}
                          />
                          <div className="flex gap-2 mt-2">
                            <Button
                              onClick={() => handleSubmitReply(comment._id)}
                              disabled={!replyContent.trim() || submitting}
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700"
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
                        <div className="mt-4 pl-4 border-l-3 border-emerald-200 space-y-3">
                          {loadingReplies[comment._id] ? (
                            <div className="flex items-center gap-2 py-4 text-gray-500 text-sm">
                              <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                              Đang tải phản hồi...
                            </div>
                          ) : commentReplies.length > 0 ? (
                            commentReplies.map((reply) => {
                              const replyUserInfo = getUserInfo(reply.user_id);
                              const isReplyOwner = isOwner(reply);

                              return (
                                <div key={reply._id} className="flex items-start gap-3 bg-white rounded-lg p-3">
                                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center flex-shrink-0">
                                    {replyUserInfo?.avatar ? (
                                      <img
                                        src={replyUserInfo.avatar}
                                        alt={replyUserInfo.name}
                                        className="w-8 h-8 rounded-full object-cover"
                                      />
                                    ) : (
                                      <User className="w-4 h-4 text-white" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-semibold text-gray-900 text-sm">
                                        {replyUserInfo?.name || "Người dùng"}
                                      </h4>
                                      {replyUserInfo?.role === "admin" && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-full font-medium">
                                          QTV
                                        </span>
                                      )}
                                      {replyUserInfo?.role === "staff" && (
                                        <span className="px-1.5 py-0.5 text-[10px] bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full font-medium">
                                          NV
                                        </span>
                                      )}
                                      <span className="text-xs text-gray-400">
                                        {formatDate(reply.created_at)}
                                      </span>
                                    </div>
                                    <p className="text-gray-700 text-sm mt-1 whitespace-pre-wrap">
                                      {reply.content}
                                    </p>
                                    {isReplyOwner && (
                                      <div className="flex gap-3 mt-2">
                                        <button
                                          onClick={() => {
                                            setEditingId(reply._id);
                                            setEditContent(reply.content);
                                          }}
                                          className="text-xs text-gray-500 hover:text-blue-600 font-medium"
                                        >
                                          Sửa
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment(reply._id)}
                                          className="text-xs text-gray-500 hover:text-red-600 font-medium"
                                        >
                                          Xóa
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })
                          ) : (
                            <div className="text-center py-4 text-gray-400 text-sm">
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
          <div className="flex justify-center items-center gap-3 mt-6 pt-6 border-t border-gray-200">
            <Button
              onClick={() => loadComments(pagination.page - 1)}
              disabled={pagination.page === 1 || loading}
              variant="outline"
              size="sm"
              className="px-4"
            >
              Trước
            </Button>
            <div className="flex items-center gap-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page =>
                  page === 1 ||
                  page === pagination.totalPages ||
                  Math.abs(page - pagination.page) <= 1
                )
                .map((page, index, array) => (
                  <div key={page} className="flex items-center">
                    {index > 0 && array[index - 1] !== page - 1 && (
                      <span className="text-gray-400 mx-1">...</span>
                    )}
                    <button
                      onClick={() => loadComments(page)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === pagination.page
                          ? "bg-emerald-600 text-white"
                          : "text-gray-600 hover:bg-gray-100"
                        }`}
                    >
                      {page}
                    </button>
                  </div>
                ))}
            </div>
            <Button
              onClick={() => loadComments(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages || loading}
              variant="outline"
              size="sm"
              className="px-4"
            >
              Sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}


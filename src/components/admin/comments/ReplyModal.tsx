import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import type { CommentWithProduct } from "@/api/types";
import commentService from "@/api/services/commentService";
import { toast } from "sonner";

interface ReplyModalProps {
    isOpen: boolean;
    onClose: () => void;
    comment: CommentWithProduct;
    onSuccess: (newReply?: any) => void;
}

export function ReplyModal({
    isOpen,
    onClose,
    comment,
    onSuccess,
}: ReplyModalProps) {
    const [replyContent, setReplyContent] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!replyContent.trim()) {
            toast.error("Vui lòng nhập nội dung phản hồi");
            return;
        }

        setIsSubmitting(true);
        try {
            const productId =
                typeof comment.product_id === "object"
                    ? comment.product_id._id
                    : comment.product_id;
            const newReply = await commentService.adminReplyComment(
                comment._id,
                replyContent,
                productId
            );
            toast.success("Phản hồi thành công!");
            setReplyContent("");
            onSuccess(newReply);
        } catch (error) {
            console.error("Error replying to comment:", error);
            toast.error("Không thể gửi phản hồi. Vui lòng thử lại sau.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const user = typeof comment.user_id === "object" ? comment.user_id : null;
    const product = typeof comment.product_id === "object" ? comment.product_id : null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Phản hồi bình luận</DialogTitle>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Original Comment */}
                    <div className="bg-muted p-4 rounded-lg space-y-3">
                        <div className="flex items-center gap-2">
                            {user?.avatar && (
                                <img
                                    src={user.avatar}
                                    alt={user.name}
                                    className="w-8 h-8 rounded-full object-cover"
                                />
                            )}
                            <div>
                                <p className="font-medium">{user?.name || "Unknown"}</p>
                                {user?.email && (
                                    <p className="text-xs text-muted-foreground">{user.email}</p>
                                )}
                            </div>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                        {product && (
                            <div className="flex items-center gap-2 pt-2 border-t">
                                {product.image_primary && (
                                    <img
                                        src={product.image_primary}
                                        alt={product.name}
                                        className="w-10 h-10 rounded object-cover"
                                    />
                                )}
                                <p className="text-sm text-muted-foreground">{product.name}</p>
                            </div>
                        )}
                    </div>

                    {/* Reply Input */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Nội dung phản hồi</label>
                        <Textarea
                            placeholder="Nhập nội dung phản hồi của bạn..."
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            rows={4}
                            className="resize-none"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Hủy
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Đang gửi..." : "Gửi phản hồi"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

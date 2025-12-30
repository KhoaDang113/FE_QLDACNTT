import type React from "react";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import inventoryService from "@/api/services/inventoryService";
import { toast } from "sonner";

interface AdjustStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  currentQuantity?: number;
  onSuccess?: () => void;
}

export function AdjustStockDialog({
  open,
  onOpenChange,
  productId,
  currentQuantity,
  onSuccess,
}: AdjustStockDialogProps) {
  const [newQuantity, setNewQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [productInfo, setProductInfo] = useState<{
    quantity: number;
  } | null>(null);

  useEffect(() => {
    if (open && productId) {
      fetchProductInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, productId]);

  const fetchProductInfo = async () => {
    try {
      const response = await inventoryService.getProductInventory(productId);
      setProductInfo(response.product);
    } catch (error: unknown) {
      console.error("Error fetching product info:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      await inventoryService.adjustInventory({
        product_id: productId,
        new_quantity: Number(newQuantity),
        note: reason || undefined,
      });

      toast.success("Điều chỉnh tồn kho thành công");

      // Reset form
      setNewQuantity("");
      setReason("");
      onOpenChange(false);

      // Call onSuccess callback to refresh data
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      console.error("Error adjusting stock:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Không thể điều chỉnh tồn kho"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Điều chỉnh tồn kho</DialogTitle>
          <DialogDescription>
            Chỉnh lại số lượng tồn kho dựa trên kiểm kê thực tế
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="newQuantity">Số lượng mới *</Label>
            <Input
              id="newQuantity"
              type="number"
              min="0"
              placeholder="Nhập số lượng mới"
              value={newQuantity}
              onChange={(e) => setNewQuantity(e.target.value)}
              required
              disabled={submitting}
            />
            <p className="text-xs text-muted-foreground">
              Số lượng hiện tại: {productInfo?.quantity || currentQuantity || 0}{" "}
              (sẽ được cập nhật lên số lượng mới)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Lý do điều chỉnh *</Label>
            <Textarea
              id="reason"
              placeholder="Ví dụ: Kiểm kê phát hiện thiếu 5 cái do hỏng hàng..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              className="resize-none"
              disabled={submitting}
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Đang xử lý..." : "Lưu điều chỉnh"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

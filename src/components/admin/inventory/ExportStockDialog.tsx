import type React from "react";
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import inventoryService from "@/api/services/inventoryService";
import { toast } from "sonner";

interface ExportStockDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  onSuccess?: () => void;
}

export function ExportStockDialog({
  open,
  onOpenChange,
  productId,
  onSuccess,
}: ExportStockDialogProps) {
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);

      await inventoryService.exportInventory({
        product_id: productId,
        quantity: Number(quantity),
        note: notes || undefined,
      });

      toast.success("Xuất kho thành công");

      // Reset form
      setQuantity("");
      setNotes("");
      onOpenChange(false);

      // Call onSuccess callback to refresh data
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      console.error("Error exporting stock:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(err.response?.data?.message || "Không thể xuất kho");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Xuất kho</DialogTitle>
          <DialogDescription>Ghi nhận sản phẩm xuất kho (bán hàng, chuyển kho, v.v)</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantity">Số lượng xuất *</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              placeholder="Nhập số lượng"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
              disabled={submitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Ghi chú</Label>
            <Textarea
              id="notes"
              placeholder="Ghi chú thêm (nếu có)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={submitting}
              rows={3}
            />
          </div>

          <div className="flex gap-3 justify-end pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Hủy
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Đang xử lý..." : "Xuất kho"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}


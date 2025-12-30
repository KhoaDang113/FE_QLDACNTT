import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import inventoryService from "@/api/services/inventoryService";
import type { InventoryTransaction } from "@/types/inventory.type";

interface ProductHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  productName: string;
}

export function ProductHistoryDialog({
  open,
  onOpenChange,
  productId,
  productName,
}: ProductHistoryDialogProps) {
  const [history, setHistory] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && productId) {
      fetchHistory();
    }
  }, [open, productId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await inventoryService.getInventoryHistory(productId);
      setHistory(response.history);
    } catch (error) {
      console.error("Error fetching history:", error);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "import":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "export":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "adjustment":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "import":
        return "Nhập kho";
      case "export":
        return "Xuất kho";
      case "adjustment":
        return "Điều chỉnh";
      default:
        return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCreatedByName = (created_by: InventoryTransaction["created_by"]) => {
    if (!created_by) return "N/A";
    if (typeof created_by === "string") return created_by;
    return created_by.name || created_by.email || "N/A";
  };

  const getOrderId = (order_id: InventoryTransaction["order_id"]) => {
    if (!order_id) return null;
    if (typeof order_id === "string") return order_id;
    return order_id._id || null;
  };

  const getOrderInfo = (order_id: InventoryTransaction["order_id"]) => {
    if (!order_id || typeof order_id === "string") return null;
    return {
      id: order_id._id,
      status: order_id.status,
      total: order_id.total,
    };
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[700px]">
        <DialogHeader>
          <DialogTitle>Lịch sử nhập/xuất - {productName}</DialogTitle>
          <DialogDescription>
            Danh sách tất cả hoạt động nhập, xuất, điều chỉnh tồn kho của sản
            phẩm
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : history.length > 0 ? (
            history.map((entry) => (
              <Card key={entry._id} className="p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    {/* Header */}
                    <div className="flex items-center gap-3">
                      <Badge className={getTypeBadgeColor(entry.type)}>
                        {getTypeLabel(entry.type)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(entry.created_at)}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {/* Quantity Change */}
                      <div className="col-span-2 flex items-center gap-2">
                        <span className="text-muted-foreground">Số lượng thay đổi:</span>
                        <span
                          className={`font-bold text-lg ${
                            entry.type === "import"
                              ? "text-green-600 dark:text-green-400"
                              : entry.type === "export"
                              ? "text-red-600 dark:text-red-400"
                              : "text-blue-600 dark:text-blue-400"
                          }`}
                        >
                          {entry.type === "import" ? "+" : entry.type === "export" ? "-" : "±"}
                          {entry.quantity}
                        </span>
                      </div>

                      {/* Before/After */}
                      <div>
                        <span className="text-muted-foreground">Trước: </span>
                        <span className="font-semibold text-foreground">
                          {entry.quantity_before}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Sau: </span>
                        <span className="font-semibold text-foreground">
                          {entry.quantity_after}
                        </span>
                      </div>

                      {/* Created By */}
                      {entry.created_by && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">Người thực hiện: </span>
                          <span className="font-semibold text-foreground">
                            {getCreatedByName(entry.created_by)}
                          </span>
                        </div>
                      )}

                      {/* Order Info */}
                      {getOrderId(entry.order_id) && (
                        <div className="col-span-2">
                          <span className="text-muted-foreground">
                            {entry.type === "export" ? "Đơn hàng: " : "Lý do: "}
                          </span>
                          <span className="font-mono text-sm text-foreground">
                            {entry.type === "export" ? `#${getOrderId(entry.order_id)}` : getOrderId(entry.order_id)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Notes */}
                    {entry.note && (
                      <div className="pt-2 border-t">
                        <span className="text-muted-foreground text-sm font-medium">
                          Ghi chú:{" "}
                        </span>
                        <span className="text-foreground text-sm">{entry.note}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                Chưa có lịch sử hoạt động cho sản phẩm này
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Lịch sử sẽ được ghi lại khi bạn nhập, xuất hoặc điều chỉnh tồn kho
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

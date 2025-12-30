import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

interface AdjustThresholdDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string
  currentThreshold: number
  onConfirm: (newThreshold: number) => void
}

export function AdjustThresholdDialog({
  open,
  onOpenChange,
  productName,
  currentThreshold,
  onConfirm,
}: AdjustThresholdDialogProps) {
  const [newThreshold, setNewThreshold] = useState(currentThreshold.toString())

  const handleConfirm = () => {
    const value = parseInt(newThreshold, 10)
    if (isNaN(value) || value < 0) {
      toast.error("Vui lòng nhập số lượng hợp lệ")
      return
    }
    onConfirm(value)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Điều chỉnh Ngưỡng cảnh báo</DialogTitle>
          <DialogDescription>
            Cập nhật ngưỡng cảnh báo tồn kho thấp cho sản phẩm: <strong>{productName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="current-threshold">Ngưỡng hiện tại</Label>
            <Input
              id="current-threshold"
              type="number"
              value={currentThreshold}
              disabled
              className="bg-muted"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="new-threshold">Ngưỡng mới</Label>
            <Input
              id="new-threshold"
              type="number"
              min="0"
              value={newThreshold}
              onChange={(e) => setNewThreshold(e.target.value)}
              placeholder="Nhập số lượng mới"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button onClick={handleConfirm}>Lưu thay đổi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


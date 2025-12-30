import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ProductStatusProps {
  is_hot: boolean;
  onIsHotChange: (checked: boolean) => void;
}

export function ProductStatus({ is_hot, onIsHotChange }: ProductStatusProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Trạng thái</h3>
      <div className="flex items-center gap-2">
        <Checkbox
          id="is_hot"
          checked={is_hot}
          onCheckedChange={(checked) => onIsHotChange(checked as boolean)}
        />
        <Label htmlFor="is_hot" className="cursor-pointer">
          Đánh dấu sản phẩm nổi bật
        </Label>
      </div>
    </Card>
  );
}


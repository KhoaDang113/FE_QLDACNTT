import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, Star } from "lucide-react";
import type { Product } from "@/types";
import { toast } from "sonner";

interface ProductTableRowProps {
  product: Product;
  onDelete: (id: string) => void;
  onToggleHot: (id: string) => void;
}

export function ProductTableRow({
  product,
  onDelete,
  onToggleHot,
}: ProductTableRowProps) {
  return (
    <tr>
      <td className="font-medium text-foreground text-xs" style={{ width: "120px" }}>
        <div
          className="truncate cursor-pointer hover:text-primary"
          title={`${product._id} (Click để copy)`}
          onClick={() => {
            navigator.clipboard.writeText(product._id);
            toast.success("Đã copy ID: " + product._id);
          }}
        >
          {product._id.substring(0, 10)}...
        </div>
      </td>
      <td style={{ width: "80px" }}>
        <img
          src={
            (Array.isArray(product.image_primary) ? product.image_primary[0] : product.image_primary) ||
            product.image_url ||
            "/placeholder.svg"
          }
          alt={product.name}
          className="w-10 h-10 rounded object-cover"
        />
      </td>
      <td className="text-foreground font-medium" style={{ width: "250px" }}>
        <div className="truncate" title={product.name}>
          {product.name}
        </div>
      </td>
      <td className="text-muted-foreground" style={{ width: "100px" }}>
        <div className="truncate">{product.unit || "-"}</div>
      </td>
      <td className="text-muted-foreground" style={{ width: "120px" }}>
        <div className="truncate">
          ₫ {product.unit_price.toLocaleString()}
        </div>
      </td>
      <td className="text-foreground font-semibold" style={{ width: "120px" }}>
        <div className="truncate">
          ₫ {(product.final_price || 0).toLocaleString()}
        </div>
      </td>
      <td style={{ width: "80px" }}>
        <Badge variant="outline">{product.discount_percent}%</Badge>
      </td>
      <td style={{ width: "80px" }}>
        <Badge
          className={
            (product.quantity || product.stock_quantity || 0) < 10
              ? "bg-red-100 text-red-800"
              : "bg-green-100 text-green-800"
          }
        >
          {product.quantity || product.stock_quantity || 0}
        </Badge>
      </td>
      <td style={{ width: "80px" }}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleHot(product._id)}
          className={
            product.is_hot
              ? "text-yellow-500"
              : "text-muted-foreground"
          }
        >
          <Star
            className="w-4 h-4"
            fill={product.is_hot ? "currentColor" : "none"}
          />
        </Button>
      </td>
      <td style={{ width: "180px" }}>
        <div className="flex gap-2 whitespace-nowrap">
          <Link to={`/admin/products/edit/${product._id}`}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 flex-shrink-0"
            >
              <Edit2 className="w-4 h-4" />
              Sửa
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="gap-1 text-destructive hover:text-destructive flex-shrink-0"
            onClick={() => onDelete(product._id)}
          >
            <Trash2 className="w-4 h-4" />
            Xóa
          </Button>
        </div>
      </td>
    </tr>
  );
}


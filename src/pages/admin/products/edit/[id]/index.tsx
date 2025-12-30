import { useParams } from "react-router-dom";
import { ProductForm } from "@/components/admin/products/ProductForm";

export default function EditProductPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Sửa Sản phẩm</h1>
        <p className="text-muted-foreground mt-1">
          Cập nhật thông tin sản phẩm
        </p>
      </div>

      <ProductForm mode="edit" productId={id} />
    </div>
  );
}


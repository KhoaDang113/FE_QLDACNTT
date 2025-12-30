import { ProductForm } from "@/components/admin/products/ProductForm";

export default function AddProductPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Thêm Sản phẩm</h1>
        <p className="text-muted-foreground mt-1">
          Tạo sản phẩm mới cho hệ thống
        </p>
      </div>

      <ProductForm mode="add" />
    </div>
  );
}





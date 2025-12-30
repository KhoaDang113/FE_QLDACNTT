import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { searchVietnamese } from "@/lib/helpers";
import type { Product } from "@/types";
import productService from "@/api/services/productService";
import { ProductTableRow } from "./ProductTableRow";
import { ProductTablePagination } from "./ProductTablePagination";
import { toast } from "sonner";

interface ProductTableProps {
  searchTerm: string;
  categoryFilter: string;
  brandFilter: string;
  lowStockOnly: boolean;
  products: Product[];
}

export function ProductTable({
  searchTerm,
  categoryFilter,
  brandFilter,
  lowStockOnly,
  products,
}: ProductTableProps) {
  const [localProducts, setLocalProducts] = useState<Product[]>(products);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const filteredProducts = localProducts.filter((product) => {
    const trimmedSearch = searchTerm.trim();
    const matchesSearch =
      !trimmedSearch ||
      searchVietnamese(product.name, trimmedSearch) ||
      product._id.toLowerCase().includes(trimmedSearch.toLowerCase()) ||
      (product.slug &&
        product.slug.toLowerCase().includes(trimmedSearch.toLowerCase()));
    const matchesCategory =
      categoryFilter === "all" || product.category_id === categoryFilter;
    const matchesBrand =
      brandFilter === "all" || product.brand_id === brandFilter;
    const matchesStock =
      !lowStockOnly || (product.quantity || product.stock_quantity || 0) < 10;

    return matchesSearch && matchesCategory && matchesBrand && matchesStock;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    setLocalProducts(products);
  }, [products]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, brandFilter, lowStockOnly]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await productService.deleteProduct(id);
        setLocalProducts(localProducts.filter((product) => product._id !== id));
        toast.success("Xóa sản phẩm thành công!");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
      }
    }
  };

  const handleToggleHot = async (id: string) => {
    const product = localProducts.find((p) => p._id === id);
    if (!product) return;

    try {
      setLocalProducts(
        localProducts.map((p) =>
          p._id === id ? { ...p, is_hot: !p.is_hot } : p
        )
      );
    } catch (error) {
      console.error("Error toggling hot status:", error);
      toast.error("Không thể cập nhật trạng thái nổi bật. Vui lòng thử lại sau.");
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          Danh sách Sản phẩm ({filteredProducts.length})
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table
          className="admin-table"
          style={{ tableLayout: "fixed", width: "100%" }}
        >
          <thead>
            <tr>
              <th style={{ width: "120px" }}>ID</th>
              <th style={{ width: "80px" }}>Ảnh</th>
              <th style={{ width: "250px" }}>Tên sản phẩm</th>
              <th style={{ width: "100px" }}>Đơn vị</th>
              <th style={{ width: "120px" }}>Giá gốc</th>
              <th style={{ width: "120px" }}>Giá bán</th>
              <th style={{ width: "80px" }}>Giảm giá</th>
              <th style={{ width: "80px" }}>Tồn kho</th>
              <th style={{ width: "80px" }}>Nổi bật</th>
              <th style={{ width: "180px" }}>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <ProductTableRow
                key={product._id}
                product={product}
                onDelete={handleDelete}
                onToggleHot={handleToggleHot}
              />
            ))}
          </tbody>
        </table>
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            {searchTerm.trim()
              ? "Không tìm thấy sản phẩm nào phù hợp với từ khóa tìm kiếm"
              : "Không có sản phẩm nào"}
          </p>
        </div>
      )}

      {filteredProducts.length > 0 && (
        <ProductTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </Card>
  );
}

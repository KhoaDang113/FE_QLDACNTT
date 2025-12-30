import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Upload, Settings, History, Loader2 } from "lucide-react";
import type { Product } from "@/types/product.type";
import productService from "@/api/services/productService";
import { toast } from "sonner";
import { ProductTablePagination } from "../products/ProductTablePagination";

const ITEMS_PER_PAGE = 10;

interface InventoryTableProps {
  searchTerm: string;
  categoryFilter: string;
  statusFilter: string;
  onImportClick: (id: string) => void;
  onExportClick: (id: string) => void;
  onAdjustClick: (id: string, quantity: number) => void;
  onHistoryClick: (id: string, name: string) => void;
  refreshTrigger?: number;
}

export function InventoryTable({
  searchTerm,
  categoryFilter,
  statusFilter,
  onImportClick,
  onExportClick,
  onAdjustClick,
  onHistoryClick,
  refreshTrigger,
}: InventoryTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchProducts();
  }, [refreshTrigger]);

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, statusFilter]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await productService.getProductsAdmin(1, 1000);
      setProducts(response.products);
    } catch (error: unknown) {
      console.error("Error fetching products:", error);
      toast.error("Không thể tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = products.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesCategory =
      categoryFilter === "all" ||
      (item.category_id &&
        typeof item.category_id === "object" &&
        "name" in item.category_id &&
        item.category_id.name === categoryFilter);

    const reorderLevel = 10; // Default reorder level
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "low" && (item.quantity || 0) <= reorderLevel) ||
      (statusFilter === "ok" && (item.quantity || 0) > reorderLevel);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Phân trang
  const totalPages = Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Sản phẩm Tồn kho</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Danh sách Sản phẩm Tồn kho ({filteredItems.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên sản phẩm</th>
                <th>Danh mục</th>
                <th>Thương hiệu</th>
                <th>Số lượng hiện tại</th>
                <th>Trạng thái</th>
                <th>Cập nhật lần cuối</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {paginatedItems.map((item) => {
                const reorderLevel = 10;
                const isLowStock = (item.quantity || 0) <= reorderLevel;

                // Extract category name from populated category_id
                const categoryName =
                  item.category_id &&
                    typeof item.category_id === "object" &&
                    "name" in item.category_id
                    ? item.category_id.name
                    : "N/A";

                // Extract brand name from populated brand_id
                const brandName =
                  item.brand_id &&
                    typeof item.brand_id === "object" &&
                    "name" in item.brand_id
                    ? item.brand_id.name
                    : "N/A";

                return (
                  <tr key={item._id}>
                    <td className="text-foreground font-medium">{item.name}</td>
                    <td className="text-muted-foreground">{categoryName}</td>
                    <td className="text-muted-foreground">{brandName}</td>
                    <td className="text-foreground font-semibold">
                      {item.quantity || 0}
                    </td>
                    <td>
                      <Badge
                        className={
                          isLowStock
                            ? "bg-red-100 text-red-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        {isLowStock ? "Tồn kho thấp" : "Bình thường"}
                      </Badge>
                    </td>
                    <td className="text-muted-foreground text-sm">
                      {item.updated_at
                        ? new Date(item.updated_at).toLocaleString("vi-VN", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        : "N/A"}
                    </td>
                    <td>
                      <div className="flex gap-2 flex-shrink-0 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => onImportClick(item._id)}
                          title="Nhập kho"
                        >
                          <Download className="w-4 h-4" />
                          Nhập
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => onExportClick(item._id)}
                          title="Xuất kho"
                        >
                          <Upload className="w-4 h-4" />
                          Xuất
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() =>
                            onAdjustClick(item._id, item.quantity || 0)
                          }
                          title="Điều chỉnh tồn kho"
                        >
                          <Settings className="w-4 h-4" />
                          Điều chỉnh
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1"
                          onClick={() => onHistoryClick(item._id, item.name)}
                          title="Xem lịch sử"
                        >
                          <History className="w-4 h-4" />
                          Lịch sử
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Không tìm thấy sản phẩm nào</p>
          </div>
        )}

        {/* Phân trang */}
        {totalPages > 1 && (
          <ProductTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        )}
      </CardContent>
    </Card>
  );
}

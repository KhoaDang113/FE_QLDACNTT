import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Search, Power } from "lucide-react";
import { BrandForm } from "@/components/admin/brands/BrandForm";
import type { Brand, BrandFormData } from "@/types/brand.type";
import { brandService } from "@/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

export default function BrandsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchKey, setSearchKey] = useState("");
  const limit = 10;

  // Fetch danh sách thương hiệu
  const fetchBrands = useCallback(async () => {
    try {
      setLoading(true);
      const response = await brandService.getBrandsAdmin(
        page,
        limit,
        searchKey || undefined
      );
      setBrands(response.brands);
      setTotal(response.total);
    } catch (error) {
      console.error("Error fetching brands:", error);
      toast.error("Không thể tải danh sách thương hiệu");
    } finally {
      setLoading(false);
    }
  }, [page, searchKey]);

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  const handleAddClick = () => {
    setSelectedBrand(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsFormOpen(true);
  };

  const handleDeleteClick = async (brand: Brand) => {
    if (!confirm(`Bạn có chắc muốn xóa thương hiệu "${brand.name}"?`)) {
      return;
    }

    try {
      await brandService.deleteBrand(brand._id);
      toast.success("Xóa thương hiệu thành công!");
      fetchBrands(); // Reload danh sách
    } catch (error) {
      console.error("Error deleting brand:", error);
      toast.error("Không thể xóa thương hiệu");
    }
  };

  const handleToggleActive = async (brand: Brand) => {
    try {
      await brandService.updateBrand(brand._id, {
        is_active: !brand.is_active,
      });
      toast.success(
        `${brand.is_active ? "Tắt" : "Bật"} thương hiệu thành công!`
      );
      fetchBrands(); // Reload danh sách
    } catch (error) {
      console.error("Error toggling brand status:", error);
      toast.error("Không thể thay đổi trạng thái thương hiệu");
    }
  };

  const handleFormSubmit = async (data: BrandFormData) => {
    try {
      if (selectedBrand) {
        // Cập nhật thương hiệu
        await brandService.updateBrand(
          selectedBrand._id,
          {
            name: data.name,
            slug: data.slug,
            description: data.description,
            is_active: data.isActive,
          },
          data.image
        );
        toast.success("Cập nhật thương hiệu thành công!");
      } else {
        // Tạo thương hiệu mới
        await brandService.createBrand(
          {
            name: data.name,
            slug: data.slug,
            description: data.description,
            is_active: data.isActive,
          },
          data.image
        );
        toast.success("Thêm thương hiệu thành công!");
      }
      setIsFormOpen(false);
      setSelectedBrand(null);
      fetchBrands(); // Reload danh sách sau khi thêm/sửa
    } catch (error: unknown) {
      console.error("Error saving brand:", error);
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || "Có lỗi xảy ra khi lưu thương hiệu";
      toast.error(errorMessage);
    }
  };

  const handleFormCancel = () => {
    setIsFormOpen(false);
    setSelectedBrand(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý Thương hiệu
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý danh sách thương hiệu sản phẩm
          </p>
        </div>
        <Button className="gap-2" onClick={handleAddClick}>
          <Plus className="w-4 h-4" />
          Thêm Thương hiệu
        </Button>
      </div>

      {isFormOpen ? (
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-semibold mb-4">
            {selectedBrand ? "Chỉnh sửa Thương hiệu" : "Thêm Thương hiệu mới"}
          </h2>
          <BrandForm
            brand={selectedBrand}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg border p-6">
          {/* Search */}
          <div className="mb-6 flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm thương hiệu..."
                value={searchKey}
                onChange={(e) => {
                  setSearchKey(e.target.value);
                  setPage(1);
                }}
                className="pl-9"
              />
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Đang tải...</p>
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {searchKey
                  ? "Không tìm thấy thương hiệu nào"
                  : "Chưa có thương hiệu nào"}
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted/50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Hình ảnh
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Tên thương hiệu
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Slug
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Mô tả
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium">
                        Trạng thái
                      </th>
                      <th className="px-4 py-3 text-right text-sm font-medium">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {brands.map((brand) => (
                      <tr key={brand._id} className="hover:bg-muted/30">
                        <td className="px-4 py-3">
                          <img
                            src={brand.image}
                            alt={brand.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        </td>
                        <td className="px-4 py-3 font-medium">{brand.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {brand.slug}
                        </td>
                        <td className="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate">
                          {brand.description || "—"}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              brand.is_active
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {brand.is_active ? "Hoạt động" : "Tắt"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleToggleActive(brand)}
                            className={
                              brand.is_active
                                ? "text-green-600 hover:text-green-700"
                                : "text-gray-400 hover:text-gray-500"
                            }
                            title={brand.is_active ? "Tắt" : "Bật"}
                          >
                            <Power className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(brand)}
                            title="Chỉnh sửa"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(brand)}
                            className="text-red-600 hover:text-red-700"
                            title="Xóa"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > limit && (
                <div className="mt-6 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Hiển thị {(page - 1) * limit + 1} -{" "}
                    {Math.min(page * limit, total)} trong tổng số {total} thương
                    hiệu
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Trước
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * limit >= total}
                    >
                      Sau
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

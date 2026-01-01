import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Search, Power, Package } from "lucide-react";
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
      fetchBrands();
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
      fetchBrands();
    } catch (error) {
      console.error("Error toggling brand status:", error);
      toast.error("Không thể thay đổi trạng thái thương hiệu");
    }
  };

  const handleFormSubmit = async (data: BrandFormData) => {
    try {
      if (selectedBrand) {
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
      fetchBrands();
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

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Package className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Quản lý Thương hiệu</h1>
              <p className="text-blue-100 mt-1">
                Tổng cộng {total} thương hiệu trong hệ thống
              </p>
            </div>
          </div>
          <Button
            className="gap-2 bg-white text-blue-600 hover:bg-blue-50 shadow-md"
            onClick={handleAddClick}
          >
            <Plus className="w-4 h-4" />
            Thêm Thương hiệu
          </Button>
        </div>
      </div>

      {isFormOpen ? (
        <div className="bg-white rounded-xl border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
            {selectedBrand ? "Chỉnh sửa Thương hiệu" : "Thêm Thương hiệu mới"}
          </h2>
          <BrandForm
            brand={selectedBrand}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          {/* Search */}
          <div className="p-4 md:p-6 border-b bg-gray-50/50">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm theo tên thương hiệu..."
                  value={searchKey}
                  onChange={(e) => {
                    setSearchKey(e.target.value);
                    setPage(1);
                  }}
                  className="pl-10 bg-white border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
              {searchKey && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchKey("")}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Xóa bộ lọc
                </Button>
              )}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
              <p className="text-gray-500">Đang tải dữ liệu...</p>
            </div>
          ) : brands.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">
                {searchKey ? "Không tìm thấy kết quả" : "Chưa có thương hiệu"}
              </h3>
              <p className="text-gray-500 text-center max-w-sm">
                {searchKey
                  ? `Không tìm thấy thương hiệu nào với từ khóa "${searchKey}"`
                  : "Bắt đầu thêm thương hiệu mới để quản lý sản phẩm tốt hơn"}
              </p>
              {!searchKey && (
                <Button className="mt-4 gap-2" onClick={handleAddClick}>
                  <Plus className="w-4 h-4" />
                  Thêm thương hiệu đầu tiên
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Hình ảnh
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Tên thương hiệu
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                        Slug
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                        Mô tả
                      </th>
                      <th className="px-4 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Trạng thái
                      </th>
                      <th className="px-4 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Thao tác
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {brands.map((brand) => (
                      <tr
                        key={brand._id}
                        className="hover:bg-blue-50/50 transition-colors"
                      >
                        <td className="px-4 py-4">
                          <div className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
                            <img
                              src={brand.image}
                              alt={brand.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/56?text=No+Image';
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-gray-900">{brand.name}</span>
                        </td>
                        <td className="px-4 py-4 hidden md:table-cell">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                            {brand.slug}
                          </code>
                        </td>
                        <td className="px-4 py-4 hidden lg:table-cell">
                          <p className="text-sm text-gray-500 max-w-xs truncate">
                            {brand.description || "—"}
                          </p>
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${brand.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-600"
                              }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${brand.is_active ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                            {brand.is_active ? "Hoạt động" : "Tắt"}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(brand)}
                              className={`rounded-lg ${brand.is_active
                                  ? "text-green-600 hover:text-green-700 hover:bg-green-50"
                                  : "text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                                }`}
                              title={brand.is_active ? "Tắt thương hiệu" : "Bật thương hiệu"}
                            >
                              <Power className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditClick(brand)}
                              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg"
                              title="Chỉnh sửa"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(brand)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                              title="Xóa"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {total > limit && (
                <div className="px-4 md:px-6 py-4 border-t bg-gray-50/50 flex flex-col md:flex-row items-center justify-between gap-4">
                  <p className="text-sm text-gray-500">
                    Hiển thị <span className="font-medium text-gray-700">{(page - 1) * limit + 1}</span> đến{" "}
                    <span className="font-medium text-gray-700">{Math.min(page * limit, total)}</span> trong tổng số{" "}
                    <span className="font-medium text-gray-700">{total}</span> thương hiệu
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="gap-1"
                    >
                      Trước
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <Button
                            key={pageNum}
                            variant={page === pageNum ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(pageNum)}
                            className="w-9 h-9 p-0"
                          >
                            {pageNum}
                          </Button>
                        );
                      })}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={page * limit >= total}
                      className="gap-1"
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


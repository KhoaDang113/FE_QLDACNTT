import { Card } from "@/components/ui/card";
import { SearchBar } from "@/components/common/SearchBar";
import { Checkbox } from "@/components/ui/checkbox";
import type { Category } from "@/types";

interface ProductFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  brandFilter: string;
  setBrandFilter: (brand: string) => void;
  lowStockOnly: boolean;
  setLowStockOnly: (value: boolean) => void;
  categories: Category[];
  onSearch?: (value: string) => void;
}

export function ProductFilters({
  searchTerm,
  setSearchTerm,
  categoryFilter,
  setCategoryFilter,
  brandFilter,
  setBrandFilter,
  lowStockOnly,
  setLowStockOnly,
  categories,
  onSearch,
}: ProductFiltersProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex gap-4 flex-col md:flex-row">
          <SearchBar
            value={searchTerm}
            onChange={setSearchTerm}
            onSearch={onSearch}
            placeholder="Tìm kiếm theo tên hoặc ID..."
            storageKey="admin_product_search_history"
            className="flex-1"
          />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.parent_id ? '  └─ ' : ''}{cat.name}
              </option>
            ))}
          </select>
          <select
            value={brandFilter}
            onChange={(e) => setBrandFilter(e.target.value)}
            className="w-full md:w-48 px-3 py-2 border border-input bg-background rounded-md text-sm"
          >
            <option value="all">Tất cả thương hiệu</option>
            <option value="brand-a">Brand A</option>
            <option value="brand-b">Brand B</option>
            <option value="brand-c">Brand C</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="low-stock"
            checked={lowStockOnly}
            onCheckedChange={(checked) => setLowStockOnly(checked as boolean)}
          />
          <label htmlFor="low-stock" className="cursor-pointer text-sm">
            Chỉ hiển thị sản phẩm sắp hết hàng (dưới 10 sản phẩm)
          </label>
        </div>
      </div>
    </Card>
  );
}


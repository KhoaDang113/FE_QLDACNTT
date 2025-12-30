import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Search } from "lucide-react"

// const categories = [
//   { value: "all", label: "Tất cả danh mục" },
//   { value: "Rau - Củ", label: "Rau - Củ" },
//   { value: "Trái cây", label: "Trái cây" },
//   { value: "Thịt - Cá", label: "Thịt - Cá" },
//   { value: "Sữa - Sản phẩm sữa", label: "Sữa - Sản phẩm sữa" },
// ]

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "ok", label: "Bình thường" },
  { value: "low", label: "Tồn kho thấp" },
]

interface InventoryFiltersProps {
  searchTerm: string
  onSearchChange: (term: string) => void
  categoryFilter: string
  onCategoryChange: (category: string) => void
  statusFilter: string
  onStatusChange: (status: string) => void
}

export function InventoryFilters({
  searchTerm,
  onSearchChange,
  // categoryFilter,
  // onCategoryChange,
  statusFilter,
  onStatusChange,
}: InventoryFiltersProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Tìm theo tên sản phẩm..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* <Select value={categoryFilter} onValueChange={onCategoryChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select> */}

          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  )
}


import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Search } from "lucide-react"

interface InventoryLog {
  id: string
  productName: string
  sku: string
  action: "import" | "export" | "adjust"
  quantity: number
  oldQuantity: number
  newQuantity: number
  reason: string
  supplier?: string
  date: string
  time: string
  performedBy: string
}

const mockLogs: InventoryLog[] = [
  {
    id: "LOG001",
    productName: "Cà chua tươi",
    sku: "VEG001",
    action: "import",
    quantity: 100,
    oldQuantity: 50,
    newQuantity: 150,
    reason: "Nhập hàng từ nhà cung cấp",
    supplier: "Nông sản Việt",
    date: "2024-11-10",
    time: "10:30",
    performedBy: "Nguyễn Văn A",
  },
  {
    id: "LOG002",
    productName: "Dưa hấu",
    sku: "FRU001",
    action: "export",
    quantity: 20,
    oldQuantity: 25,
    newQuantity: 5,
    reason: "Bán hàng",
    date: "2024-11-10",
    time: "14:45",
    performedBy: "Trần Thị B",
  },
  {
    id: "LOG003",
    productName: "Thịt lợn nạc",
    sku: "MEAT001",
    action: "adjust",
    quantity: 0,
    oldQuantity: 10,
    newQuantity: 8,
    reason: "Kiểm kê phát hiện 2 cái hỏng hàng",
    date: "2024-11-09",
    time: "09:15",
    performedBy: "Lê Văn C",
  },
  {
    id: "LOG004",
    productName: "Sữa tươi",
    sku: "DAIRY001",
    action: "import",
    quantity: 150,
    oldQuantity: 50,
    newQuantity: 200,
    reason: "Nhập hàng từ nhà cung cấp",
    supplier: "Vinamilk",
    date: "2024-11-08",
    time: "11:20",
    performedBy: "Phạm Thị D",
  },
  {
    id: "LOG005",
    productName: "Cà rốt",
    sku: "VEG002",
    action: "export",
    quantity: 30,
    oldQuantity: 33,
    newQuantity: 3,
    reason: "Bán hàng",
    date: "2024-11-07",
    time: "16:00",
    performedBy: "Hoàng Văn E",
  },
]

export default function InventoryHistoryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [actionFilter, setActionFilter] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const filteredLogs = mockLogs.filter((log) => {
    const matchesSearch =
      log.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.sku.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesAction = actionFilter === "all" || log.action === actionFilter
    const matchesDateFrom = !dateFrom || log.date >= dateFrom
    const matchesDateTo = !dateTo || log.date <= dateTo

    return matchesSearch && matchesAction && matchesDateFrom && matchesDateTo
  })

  const getActionBadge = (action: string) => {
    switch (action) {
      case "import":
        return <Badge className="bg-blue-100 text-blue-800">Nhập kho</Badge>
      case "export":
        return <Badge className="bg-orange-100 text-orange-800">Xuất kho</Badge>
      case "adjust":
        return <Badge className="bg-purple-100 text-purple-800">Điều chỉnh</Badge>
      default:
        return null
    }
  }

  const handleExport = () => {
    console.log("[v0] Export inventory history")
    // TODO: Implement CSV/PDF export
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Lịch sử Kho</h1>
          <p className="text-muted-foreground mt-1">Lịch sử tất cả hoạt động nhập/xuất/điều chỉnh kho</p>
        </div>
        <Button onClick={handleExport} variant="outline" className="gap-2 bg-transparent">
          <Download className="w-4 h-4" />
          Xuất báo cáo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Tìm theo tên sản phẩm hoặc SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả hoạt động</SelectItem>
                <SelectItem value="import">Nhập kho</SelectItem>
                <SelectItem value="export">Xuất kho</SelectItem>
                <SelectItem value="adjust">Điều chỉnh</SelectItem>
              </SelectContent>
            </Select>

            <Input type="date" placeholder="Từ ngày" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />

            <Input type="date" placeholder="Đến ngày" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Hoạt động ({filteredLogs.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID Log</th>
                  <th>Sản phẩm</th>
                  <th>SKU</th>
                  <th>Hoạt động</th>
                  <th>Số lượng</th>
                  <th>Trước / Sau</th>
                  <th>Lý do</th>
                  <th>Thời gian</th>
                  <th>Người thực hiện</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id}>
                    <td className="font-medium text-foreground text-sm">{log.id}</td>
                    <td className="text-foreground font-medium">{log.productName}</td>
                    <td className="text-muted-foreground text-sm">{log.sku}</td>
                    <td>{getActionBadge(log.action)}</td>
                    <td className="text-foreground font-semibold">
                      {log.action === "adjust" ? (
                        <span className="text-red-600">
                          {log.newQuantity > log.oldQuantity ? "+" : "-"}
                          {Math.abs(log.newQuantity - log.oldQuantity)}
                        </span>
                      ) : (
                        <span>{log.quantity}</span>
                      )}
                    </td>
                    <td className="text-muted-foreground text-sm">
                      {log.oldQuantity} → {log.newQuantity}
                    </td>
                    <td className="text-muted-foreground text-sm max-w-xs truncate" title={log.reason}>
                      {log.reason}
                    </td>
                    <td className="text-muted-foreground text-sm">
                      {log.date} {log.time}
                    </td>
                    <td className="text-muted-foreground text-sm">{log.performedBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Không tìm thấy hoạt động nào</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}


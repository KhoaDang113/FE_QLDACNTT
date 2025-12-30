import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Grid3x3, List } from "lucide-react";
import { InventoryTable } from "@/components/admin/inventory/InventoryTable";
import { InventoryFilters } from "@/components/admin/inventory/InventoryFilters";
import { InventoryHierarchicalView } from "@/components/admin/inventory/InventoryHierarchicalView";
import { AdjustStockDialog } from "@/components/admin/inventory/AdjustStockDialog";
import { ImportStockDialog } from "@/components/admin/inventory/ImportStockDialog";
import { ExportStockDialog } from "@/components/admin/inventory/ExportStockDialog";
import { ProductHistoryDialog } from "@/components/admin/inventory/ProductHistoryDialog";
import { getSocket } from "@/lib/socket";

type ViewMode = "table" | "hierarchical";

export default function InventoryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("hierarchical");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Dialog states
  const [importOpen, setImportOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);

  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");

  useEffect(() => {
    const socket = getSocket();

    const onInventoryUpdate = (data: any) => {
      console.log("Received inventory update:", data);
      handleRefresh();
    };

    socket.on("inventory:updated", onInventoryUpdate);

    return () => {
      socket.off("inventory:updated", onInventoryUpdate);
    };
  }, []);

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleImportClick = (id: string) => {
    setSelectedProductId(id);
    setImportOpen(true);
  };

  const handleExportClick = (id: string) => {
    setSelectedProductId(id);
    setExportOpen(true);
  };

  const handleAdjustClick = (id: string, _quantity?: number) => {
    setSelectedProductId(id);
    setAdjustOpen(true);
  };

  const handleHistoryClick = (id: string, name: string) => {
    setSelectedProductId(id);
    setSelectedProductName(name);
    setHistoryOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Quản lý Kho</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý tồn kho, nhập/xuất sản phẩm
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center border rounded-lg">
            <Button
              variant={viewMode === "hierarchical" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("hierarchical")}
              className="gap-2 rounded-r-none"
            >
              <Grid3x3 className="w-4 h-4" />
              Menu phân cấp
            </Button>
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className="gap-2 rounded-l-none"
            >
              <List className="w-4 h-4" />
              Bảng
            </Button>
          </div>
          {/* <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Kiểm kê Kho
          </Button> */}
        </div>
      </div>

      {viewMode === "table" && (
        <>
          <InventoryFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            categoryFilter={categoryFilter}
            onCategoryChange={setCategoryFilter}
            statusFilter={statusFilter}
            onStatusChange={setStatusFilter}
          />

          <InventoryTable
            searchTerm={searchTerm}
            categoryFilter={categoryFilter}
            statusFilter={statusFilter}
            onImportClick={handleImportClick}
            onExportClick={handleExportClick}
            onAdjustClick={handleAdjustClick}
            onHistoryClick={handleHistoryClick}
            refreshTrigger={refreshTrigger}
          />
        </>
      )}

      {viewMode === "hierarchical" && (
        <InventoryHierarchicalView
          onImportClick={handleImportClick}
          onExportClick={handleExportClick}
          onAdjustClick={handleAdjustClick}
          onHistoryClick={handleHistoryClick}
          refreshTrigger={refreshTrigger}
        />
      )}

      {/* Dialogs */}
      <ImportStockDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        productId={selectedProductId}
        onSuccess={handleRefresh}
      />

      <ExportStockDialog
        open={exportOpen}
        onOpenChange={setExportOpen}
        productId={selectedProductId}
        onSuccess={handleRefresh}
      />

      <AdjustStockDialog
        open={adjustOpen}
        onOpenChange={setAdjustOpen}
        productId={selectedProductId}
        onSuccess={handleRefresh}
      />

      <ProductHistoryDialog
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        productId={selectedProductId}
        productName={selectedProductName}
      />
    </div>
  );
}


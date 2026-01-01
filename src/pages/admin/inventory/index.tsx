import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Grid3x3, List, Warehouse } from "lucide-react";
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
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-600 to-teal-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Warehouse className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Quản lý Kho</h1>
              <p className="text-cyan-100 mt-1">
                Quản lý tồn kho, nhập/xuất sản phẩm
              </p>
            </div>
          </div>
          <div className="flex items-center border border-white/30 rounded-lg bg-white/10 backdrop-blur-sm">
            <Button
              variant={viewMode === "hierarchical" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("hierarchical")}
              className={`gap-2 rounded-r-none ${viewMode === "hierarchical" ? "bg-white text-cyan-600" : "text-white hover:bg-white/20"}`}
            >
              <Grid3x3 className="w-4 h-4" />
              Menu phân cấp
            </Button>
            <Button
              variant={viewMode === "table" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("table")}
              className={`gap-2 rounded-l-none ${viewMode === "table" ? "bg-white text-cyan-600" : "text-white hover:bg-white/20"}`}
            >
              <List className="w-4 h-4" />
              Bảng
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        {viewMode === "table" ? (
          <>
            <div className="p-4 md:p-6 border-b bg-gray-50/50">
              <InventoryFilters
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                categoryFilter={categoryFilter}
                onCategoryChange={setCategoryFilter}
                statusFilter={statusFilter}
                onStatusChange={setStatusFilter}
              />
            </div>
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
        ) : (
          <InventoryHierarchicalView
            onImportClick={handleImportClick}
            onExportClick={handleExportClick}
            onAdjustClick={handleAdjustClick}
            onHistoryClick={handleHistoryClick}
            refreshTrigger={refreshTrigger}
          />
        )}
      </div>

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


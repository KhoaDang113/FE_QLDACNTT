import { ComboHierarchicalView } from "@/components/admin/combos/ComboHierarchicalView";
import { TypeComboFormModal } from "@/components/admin/combos/TypeComboFormModal";
import { Button } from "@/components/ui/button";
import { Plus, FolderPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function AdminCombos() {
  const [isTypeComboModalOpen, setIsTypeComboModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTypeComboSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Combo</h1>
          <p className="text-muted-foreground">
            Quản lý các món ăn và combo theo danh mục
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => setIsTypeComboModalOpen(true)}
          >
            <FolderPlus className="w-4 h-4" />
            Thêm loại món ăn
          </Button>
          <Link to="/admin/combos/add">
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Thêm Combo
            </Button>
          </Link>
        </div>
      </div>

      <ComboHierarchicalView key={refreshKey} />

      <TypeComboFormModal
        open={isTypeComboModalOpen}
        onOpenChange={setIsTypeComboModalOpen}
        typeCombo={null}
        onSuccess={handleTypeComboSuccess}
      />
    </div>
  );
}

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import type { MenuCombo } from "@/types/menu.type";
import type { TypeCombo } from "@/types/typeCombo.type";
import { comboService, typeComboService } from "@/api";
import { ComboTypeGridView } from "./ComboTypeGridView";
import { ComboGridView } from "./ComboGridView";
import { TypeComboFormModal } from "./TypeComboFormModal";
import {
  HierarchicalBreadcrumb,
  type BreadcrumbItem,
} from "../products/HierarchicalBreadcrumb";
import { toast } from "sonner";

type ViewLevel = "root" | "combos";

export function ComboHierarchicalView() {
  const [currentLevel, setCurrentLevel] = useState<ViewLevel>("root");
  const [typeCombos, setTypeCombos] = useState<TypeCombo[]>([]);
  const [combos, setCombos] = useState<MenuCombo[]>([]);
  const [selectedTypeCombo, setSelectedTypeCombo] = useState<TypeCombo | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTypeCombo, setEditingTypeCombo] = useState<TypeCombo | null>(null);

  useEffect(() => {
    fetchTypeCombos();
  }, []);

  const fetchTypeCombos = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await typeComboService.getTypeCombosAdmin(1, 100);
      setTypeCombos(data.typeCombos);
      setCurrentLevel("root");
      setBreadcrumbs([]);
    } catch (err) {
      console.error("Error fetching type combos:", err);
      setError("Không thể tải danh mục món ăn");
    } finally {
      setLoading(false);
    }
  };

  const handleTypeClick = async (typeCombo: TypeCombo) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch combos filtered by type_combo_id từ admin API
      const data = await comboService.getCombosAdmin(1, 100, undefined, typeCombo._id);
      setCombos(data.combos);
      setSelectedTypeCombo(typeCombo);
      setCurrentLevel("combos");
      setBreadcrumbs([
        {
          id: typeCombo._id,
          name: typeCombo.name,
          level: "root",
        },
      ]);
    } catch (err) {
      console.error("Error fetching combos:", err);
      setError("Không thể tải món ăn");
    } finally {
      setLoading(false);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentLevel("root");
      setBreadcrumbs([]);
      return;
    }
  };

  const handleEditType = (typeCombo: TypeCombo) => {
    setEditingTypeCombo(typeCombo);
    setIsModalOpen(true);
  };

  const handleDeleteType = async (typeCombo: TypeCombo) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa loại "${typeCombo.name}"?\n\nCác combo thuộc loại này sẽ không bị xóa.`)) {
      return;
    }

    try {
      await typeComboService.deleteTypeCombo(typeCombo._id);
      toast.success("Xóa loại món ăn thành công");
      fetchTypeCombos();
    } catch (error) {
      console.error("Error deleting type combo:", error);
      toast.error("Không thể xóa loại món ăn");
    }
  };

  const handleModalSuccess = () => {
    fetchTypeCombos();
    setEditingTypeCombo(null);
  };

  const handleDeleteCombo = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa món ăn này?")) {
      try {
        await comboService.deleteCombo(id);
        setCombos(combos.filter((c) => c._id !== id));
        toast.success("Xóa món ăn thành công");
      } catch (error) {
        console.error("Error deleting combo:", error);
        toast.error("Không thể xóa món ăn");
      }
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="h-6 bg-muted rounded animate-pulse w-48"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-muted rounded-lg animate-pulse"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
                    <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="flex flex-col items-center justify-center h-64 space-y-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Package className="w-8 h-8 text-destructive" />
          </div>
          <div className="text-center space-y-2">
            <p className="text-destructive font-medium">{error}</p>
            <Button variant="outline" onClick={fetchTypeCombos}>
              Thử lại
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <HierarchicalBreadcrumb
        breadcrumbs={breadcrumbs}
        onBreadcrumbClick={handleBreadcrumbClick}
      />

      {currentLevel === "root" && (
        <ComboTypeGridView
          typeCombos={typeCombos}
          onTypeClick={handleTypeClick}
          onEditType={handleEditType}
          onDeleteType={handleDeleteType}
        />
      )}

      <TypeComboFormModal
        open={isModalOpen}
        onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) setEditingTypeCombo(null);
        }}
        typeCombo={editingTypeCombo}
        onSuccess={handleModalSuccess}
      />

      {currentLevel === "combos" && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Món ăn</h3>
            <Badge variant="secondary">{combos.length} món</Badge>
          </div>
          <ComboGridView
            combos={combos}
            onDeleteCombo={handleDeleteCombo}
          />
        </div>
      )}
    </Card>
  );
}

import { ComboForm } from "@/components/admin/combos/ComboForm";

export default function AddComboPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Thêm Combo mới</h1>
        <p className="text-muted-foreground">
          Tạo món ăn hoặc combo mới
        </p>
      </div>
      <ComboForm mode="add" />
    </div>
  );
}

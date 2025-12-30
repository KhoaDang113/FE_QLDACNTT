import { ComboForm } from "@/components/admin/combos/ComboForm";
import { useParams } from "react-router-dom";

export default function EditComboPage() {
  const { id } = useParams();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa Combo</h1>
        <p className="text-muted-foreground">
          Cập nhật thông tin món ăn hoặc combo
        </p>
      </div>
      <ComboForm mode="edit" comboId={id} />
    </div>
  );
}

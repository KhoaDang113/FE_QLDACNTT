import { useParams } from "react-router-dom";
import { BannerForm } from "@/components/admin/banners/BannerForm";

export default function EditBannerPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Chỉnh sửa Banner</h1>
        <p className="text-muted-foreground mt-1">
          Cập nhật thông tin banner
        </p>
      </div>

      <BannerForm mode="edit" bannerId={id} />
    </div>
  );
}

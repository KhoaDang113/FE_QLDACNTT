import { BannerForm } from "@/components/admin/banners/BannerForm";

export default function AddBannerPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Thêm Banner Mới</h1>
        <p className="text-muted-foreground mt-1">
          Tạo banner mới để hiển thị trên website
        </p>
      </div>

      <BannerForm mode="create" />
    </div>
  );
}

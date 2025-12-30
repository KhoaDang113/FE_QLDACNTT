import { Link } from "react-router-dom";
import { BannerHierarchicalView } from "@/components/admin/banners/BannerHierarchicalView";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function BannersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Quản lý Banner
          </h1>
          <p className="text-muted-foreground mt-1">
            Quản lý banner hiển thị trên website theo từng danh mục
          </p>
        </div>
        <Link to="/admin/banners/add">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Thêm Banner
          </Button>
        </Link>
      </div>

      <BannerHierarchicalView />
    </div>
  );
}

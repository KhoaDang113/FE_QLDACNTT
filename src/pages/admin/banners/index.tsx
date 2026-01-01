import { Link } from "react-router-dom";
import { BannerHierarchicalView } from "@/components/admin/banners/BannerHierarchicalView";
import { Button } from "@/components/ui/button";
import { Plus, Image } from "lucide-react";

export default function BannersPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-6 text-white shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <Image className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Quản lý Banner</h1>
              <p className="text-orange-100 mt-1">
                Quản lý banner hiển thị trên website theo từng danh mục
              </p>
            </div>
          </div>
          <Link to="/admin/banners/add">
            <Button className="gap-2 bg-white text-orange-600 hover:bg-orange-50 shadow-md">
              <Plus className="w-4 h-4" />
              Thêm Banner
            </Button>
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <BannerHierarchicalView />
      </div>
    </div>
  );
}


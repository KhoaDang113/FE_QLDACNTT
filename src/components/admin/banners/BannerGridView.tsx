import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Image, Edit, Trash2 } from "lucide-react";
import type { Banner } from "@/types";
import { Link } from "react-router-dom";

interface BannerGridViewProps {
  banners: Banner[];
  onDeleteBanner: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

export function BannerGridView({
  banners,
  onDeleteBanner,
  onToggleActive,
}: BannerGridViewProps) {
  if (banners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Image className="w-8 h-8 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <p className="text-muted-foreground font-medium">
            Không có banner nào
          </p>
          <p className="text-sm text-muted-foreground">
            Thêm banner mới để bắt đầu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-300">
      <div className="space-y-4">
        {banners.map((banner, index) => {
          const imageUrl = banner.image || banner.image_url;
          const bannerId = banner._id || banner.id;

          return (
            <div
              key={bannerId}
              style={{ animationDelay: `${index * 50}ms` }}
              className="group border rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 bg-card flex flex-col md:flex-row"
            >
              {/* Banner Image - Left side, full height */}
              <div className="relative w-full md:w-3/4 aspect-[3/1] md:aspect-auto bg-muted overflow-hidden">
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Banner"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Image className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* Actions & Status - Right side */}
              <div className="w-full md:w-1/4 p-4 flex flex-col justify-between border-t md:border-t-0 md:border-l bg-card">
                <div className="space-y-4">
                  {/* Active Status Switch */}
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`active-${bannerId}`} className="cursor-pointer">
                      Trạng thái
                    </Label>
                    <Switch
                      id={`active-${bannerId}`}
                      checked={banner.is_active}
                      onCheckedChange={(checked) => 
                        bannerId && onToggleActive(String(bannerId), checked)
                      }
                    />
                  </div>

                  {/* Status Badge Text */}
                  <div className="flex justify-end">
                    <Badge
                      variant={banner.is_active ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {banner.is_active ? "Đang hiện" : "Đã ẩn"}
                    </Badge>
                  </div>
                </div>

                {/* Action Buttons - Bottom */}
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Link
                    to={`/admin/banners/edit/${bannerId}`}
                    className="flex-1"
                  >
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full gap-2"
                    >
                      <Edit className="w-3 h-3" />
                      Sửa
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() =>
                      bannerId && onDeleteBanner(String(bannerId))
                    }
                  >
                    <Trash2 className="w-3 h-3" />
                    Xóa
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

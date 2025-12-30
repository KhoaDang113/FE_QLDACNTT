import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import type { Category, Banner } from "@/types";
import categoryService from "@/api/services/catalogService";
import bannerService from "@/api/services/bannerService";
import { CategoryGridView } from "../products/CategoryGridView";
import { BannerGridView } from "@/components/admin/banners/BannerGridView";
import {
  HierarchicalBreadcrumb,
  type BreadcrumbItem,
} from "../products/HierarchicalBreadcrumb";
import { toast } from "sonner";

type ViewLevel = "root" | "subcategory" | "banners";

export function BannerHierarchicalView() {
  const [currentLevel, setCurrentLevel] = useState<ViewLevel>("root");
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentCategorySlug, setCurrentCategorySlug] = useState<string>("");

  useEffect(() => {
    fetchAllCategories();
  }, []);

  const fetchAllCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const categories = await categoryService.getAllCategories();
      setAllCategories(categories);
      setRootCategories(categories);
      setCurrentLevel("root");
      setBreadcrumbs([]);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError("Không thể tải danh mục");
    } finally {
      setLoading(false);
    }
  };

  const handleRootCategoryClick = async (category: Category) => {
    try {
      setLoading(true);
      setError(null);

      const children = category.subCategories || category.children || [];

      if (children && children.length > 0) {
        setSubCategories(children);
        setCurrentLevel("subcategory");
        setBreadcrumbs([
          {
            id: category._id,
            name: category.name,
            level: "root",
          },
        ]);
        setCurrentCategorySlug(category.slug);
        setLoading(false);
      } else {
        // Nếu không có subcategory, load banners trực tiếp
        const bannersData = await bannerService.getBanners(category.slug);
        setBanners(bannersData);
        setCurrentLevel("banners");
        setBreadcrumbs([
          {
            id: category._id,
            name: category.name,
            level: "root",
          },
        ]);
        setCurrentCategorySlug(category.slug);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError("Không thể tải banners");
      setLoading(false);
    }
  };

  const handleSubCategoryClick = async (category: Category) => {
    try {
      setLoading(true);
      setError(null);

      const bannersData = await bannerService.getBanners(category.slug);
      setBanners(bannersData);
      setCurrentLevel("banners");
      setBreadcrumbs([
        ...breadcrumbs,
        {
          id: category._id,
          name: category.name,
          level: "subcategory",
        },
      ]);
      setCurrentCategorySlug(category.slug);
    } catch (err) {
      console.error("Error fetching banners:", err);
      setError("Không thể tải banners");
    } finally {
      setLoading(false);
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    if (index === -1) {
      setCurrentLevel("root");
      setBreadcrumbs([]);
      setCurrentCategorySlug("");
      return;
    }

    const item = breadcrumbs[index];

    if (item.level === "root") {
      const category = allCategories.find((cat) => cat._id === item.id);
      if (category) {
        const children = category.subCategories || category.children || [];
        setSubCategories(children);
        setCurrentLevel("subcategory");
        setBreadcrumbs([
          {
            id: category._id,
            name: category.name,
            level: "root",
          },
        ]);
        setCurrentCategorySlug(category.slug);
      }
    }
  };

  const handleDeleteBanner = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa banner này?")) {
      try {
        await bannerService.deleteBanner(id);
        setBanners(banners.filter((banner) => banner._id !== id));
        toast.success("Xóa banner thành công!");
      } catch (error) {
        console.error("Error deleting banner:", error);
        toast.error("Không thể xóa banner. Vui lòng thử lại sau.");
      }
    }
  };

  const handleRefreshBanners = async () => {
    if (currentCategorySlug) {
      try {
        setLoading(true);
        const bannersData = await bannerService.getBanners(currentCategorySlug);
        setBanners(bannersData);
      } catch (err) {
        console.error("Error refreshing banners:", err);
        setError("Không thể tải banners");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      const formData = new FormData();
      formData.append("is_active", String(isActive));

      // Optimistic update
      setBanners(banners.map(b =>
        (b._id === id || b.id === id) ? { ...b, is_active: isActive } : b
      ));

      await bannerService.updateBanner(id, formData);
    } catch (error) {
      console.error("Error updating banner status:", error);
      // Revert if error
      handleRefreshBanners();
      toast.error("Không thể cập nhật trạng thái banner");
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
            <Button variant="outline" onClick={fetchAllCategories}>
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
        <CategoryGridView
          categories={rootCategories}
          level="root"
          onCategoryClick={handleRootCategoryClick}
        />
      )}

      {currentLevel === "subcategory" && (
        <CategoryGridView
          categories={subCategories}
          level="subcategory"
          onCategoryClick={handleSubCategoryClick}
        />
      )}

      {currentLevel === "banners" && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Banners</h3>
            <Badge variant="secondary">{banners.length} banners</Badge>
          </div>
          <BannerGridView
            banners={banners}
            onDeleteBanner={handleDeleteBanner}
            onToggleActive={handleToggleActive}
          />
        </div>
      )}
    </Card>
  );
}

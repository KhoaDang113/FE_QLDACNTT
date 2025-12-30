import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import type { Category, Product } from "@/types";
import categoryService from "@/api/services/catalogService";
import productService from "@/api/services/productService";
import { CategoryGridView } from "./CategoryGridView";
import { ProductGridView } from "./ProductGridView";
import {
  HierarchicalBreadcrumb,
  type BreadcrumbItem,
} from "./HierarchicalBreadcrumb";
import { toast } from "sonner";

type ViewLevel = "root" | "subcategory" | "products";

export function ProductHierarchicalView() {
  const [currentLevel, setCurrentLevel] = useState<ViewLevel>("root");
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

      const children = category.subCategories || category.subCategories || [];

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
        setLoading(false);
      } else {
        const productsData = await productService.getProducts(category.slug);
        setProducts(productsData);
        setCurrentLevel("products");
        setBreadcrumbs([
          {
            id: category._id,
            name: category.name,
            level: "root",
          },
        ]);
        setLoading(false);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Không thể tải sản phẩm");
      setLoading(false);
    }
  };

  const handleSubCategoryClick = async (category: Category) => {
    try {
      setLoading(true);
      setError(null);

      const productsData = await productService.getProducts(category.slug);
      setProducts(productsData);
      setCurrentLevel("products");
      setBreadcrumbs([
        ...breadcrumbs,
        {
          id: category._id,
          name: category.name,
          level: "subcategory",
        },
      ]);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Không thể tải sản phẩm");
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

    const item = breadcrumbs[index];

    if (item.level === "root") {
      const category = allCategories.find((cat) => cat._id === item.id);
      if (category) {
        const children = category.subCategories || category.subCategories || [];
        setSubCategories(children);
        setCurrentLevel("subcategory");
        setBreadcrumbs([
          {
            id: category._id,
            name: category.name,
            level: "root",
          },
        ]);
      }
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      try {
        await productService.deleteProduct(id);
        setProducts(products.filter((product) => product._id !== id));
        toast.success("Xóa sản phẩm thành công!");
      } catch (error) {
        console.error("Error deleting product:", error);
        toast.error("Không thể xóa sản phẩm. Vui lòng thử lại sau.");
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

      {currentLevel === "products" && (
        <div className="animate-in fade-in duration-300">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Sản phẩm</h3>
            <Badge variant="secondary">{products.length} sản phẩm</Badge>
          </div>
          <ProductGridView
            products={products}
            onDeleteProduct={handleDeleteProduct}
          />
        </div>
      )}
    </Card>
  );
}

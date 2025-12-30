import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";
import type { Category, Product } from "@/types";
import categoryService from "@/api/services/catalogService";
import productService from "@/api/services/productService";
import { CategoryGridView } from "../products/CategoryGridView";
import { InventoryProductGridView } from "./InventoryProductGridView";
import {
    HierarchicalBreadcrumb,
    type BreadcrumbItem,
} from "../products/HierarchicalBreadcrumb";

type ViewLevel = "root" | "subcategory" | "products";

interface InventoryHierarchicalViewProps {
    onImportClick: (id: string) => void;
    onExportClick: (id: string) => void;
    onAdjustClick: (id: string, quantity: number) => void;
    onHistoryClick: (id: string, name: string) => void;
    refreshTrigger?: number;
}

export function InventoryHierarchicalView({
    onImportClick,
    onExportClick,
    onAdjustClick,
    onHistoryClick,
    refreshTrigger,
}: InventoryHierarchicalViewProps) {
    const [currentLevel, setCurrentLevel] = useState<ViewLevel>("root");
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [rootCategories, setRootCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentCategorySlug, setCurrentCategorySlug] = useState<string | null>(null);

    useEffect(() => {
        fetchAllCategories();
    }, []);

    // Re-fetch products when refreshTrigger changes (after import/export)
    useEffect(() => {
        if (refreshTrigger && currentLevel === "products" && currentCategorySlug) {
            const refetchProducts = async () => {
                try {
                    const productsData = await productService.getProducts(currentCategorySlug);
                    setProducts(productsData);
                } catch (err) {
                    console.error("Error refreshing products:", err);
                }
            };
            refetchProducts();
        }
    }, [refreshTrigger, currentLevel, currentCategorySlug]);

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

            const children = category.subCategories || [];

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
                setCurrentCategorySlug(category.slug);
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
            setCurrentCategorySlug(category.slug);
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
                const children = category.subCategories || [];
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

    // Calculate inventory statistics
    const getInventoryStats = () => {
        const total = products.length;
        const lowStock = products.filter((p) => (p.quantity || 0) <= 10).length;
        const outOfStock = products.filter((p) => (p.quantity || 0) === 0).length;
        return { total, lowStock, outOfStock };
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
                        <button
                            onClick={fetchAllCategories}
                            className="text-primary underline hover:no-underline"
                        >
                            Thử lại
                        </button>
                    </div>
                </div>
            </Card>
        );
    }

    const stats = getInventoryStats();

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
                        <h3 className="text-lg font-semibold">Tồn kho sản phẩm</h3>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">{stats.total} sản phẩm</Badge>
                            {stats.lowStock > 0 && (
                                <Badge className="bg-orange-100 text-orange-800">
                                    {stats.lowStock} tồn kho thấp
                                </Badge>
                            )}
                            {stats.outOfStock > 0 && (
                                <Badge className="bg-red-100 text-red-800">
                                    {stats.outOfStock} hết hàng
                                </Badge>
                            )}
                        </div>
                    </div>
                    <InventoryProductGridView
                        products={products}
                        onImportClick={onImportClick}
                        onExportClick={onExportClick}
                        onAdjustClick={onAdjustClick}
                        onHistoryClick={onHistoryClick}
                    />
                </div>
            )}
        </Card>
    );
}

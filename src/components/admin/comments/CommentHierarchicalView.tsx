import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import type { Category } from "@/types";
import type {
    ProductCommentsGroup,
    CommentWithProduct,
} from "@/api/types";
import categoryService from "@/api/services/catalogService";
import commentService from "@/api/services/commentService";
import { CategoryGridView } from "@/components/admin/products/CategoryGridView";
import { ProductCommentGridView } from "./ProductCommentGridView";
import { CommentListView } from "./CommentListView";
import {
    HierarchicalBreadcrumb,
    type BreadcrumbItem,
} from "@/components/admin/products/HierarchicalBreadcrumb";
import { toast } from "sonner";

type ViewLevel = "root" | "subcategory" | "products" | "comments";

export function CommentHierarchicalView() {
    const [currentLevel, setCurrentLevel] = useState<ViewLevel>("root");
    const [allCategories, setAllCategories] = useState<Category[]>([]);
    const [rootCategories, setRootCategories] = useState<Category[]>([]);
    const [subCategories, setSubCategories] = useState<Category[]>([]);
    const [products, setProducts] = useState<ProductCommentsGroup[]>([]);
    const [comments, setComments] = useState<CommentWithProduct[]>([]);
    const [selectedProduct, setSelectedProduct] =
        useState<ProductCommentsGroup | null>(null);
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

            const children = category.subCategories || [];

            if (children && children.length > 0) {
                // Có danh mục con → hiển thị danh mục con
                setSubCategories(children);
                setCurrentLevel("subcategory");
                setBreadcrumbs([
                    {
                        id: category._id,
                        name: category.name,
                        level: "root",
                    },
                ]);
            } else {
                // Không có danh mục con → hiển thị products có bình luận
                const response = await commentService.getProductsWithCommentsByCategory(
                    category.slug
                );
                setProducts(response.products || []);
                setCurrentLevel("products");
                setBreadcrumbs([
                    {
                        id: category._id,
                        name: category.name,
                        level: "root",
                    },
                ]);
            }
        } catch (err) {
            console.error("Error:", err);
            setError("Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const handleSubCategoryClick = async (category: Category) => {
        try {
            setLoading(true);
            setError(null);

            const response = await commentService.getProductsWithCommentsByCategory(
                category.slug
            );
            setProducts(response.products || []);
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
            console.error("Error:", err);
            setError("Không thể tải sản phẩm");
        } finally {
            setLoading(false);
        }
    };

    const handleProductClick = async (product: ProductCommentsGroup) => {
        try {
            setLoading(true);
            setSelectedProduct(product);
            const response = await commentService.getAllCommentsAdmin(
                1,
                100,
                product._id
            );
            setComments(response.comments || []);
            setCurrentLevel("comments");
        } catch (error) {
            console.error("Error fetching comments:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleBreadcrumbClick = (index: number) => {
        if (index === -1) {
            // Quay về root
            setCurrentLevel("root");
            setBreadcrumbs([]);
            return;
        }

        const item = breadcrumbs[index];

        if (item.level === "root") {
            const category = allCategories.find((cat) => cat._id === item.id);
            if (category) {
                const children = category.subCategories || [];
                if (children.length > 0) {
                    setSubCategories(children);
                    setCurrentLevel("subcategory");
                } else {
                    commentService
                        .getProductsWithCommentsByCategory(category.slug)
                        .then((response) => {
                            setProducts(response.products || []);
                            setCurrentLevel("products");
                        });
                }
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

    const handleBackFromComments = () => {
        setCurrentLevel("products");
        setSelectedProduct(null);
        setComments([]);
    };

    const handleDelete = async (commentId: string) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa bình luận này?")) {
            return;
        }

        try {
            await commentService.adminDeleteComment(commentId);
            setComments((prev) => prev.filter((c) => c._id !== commentId));
            toast.success("Xóa bình luận thành công!");
        } catch (error) {
            console.error("Error deleting comment:", error);
            toast.error("Không thể xóa bình luận. Vui lòng thử lại sau.");
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
                <div className="text-center py-12">
                    <p className="text-destructive">{error}</p>
                </div>
            </Card>
        );
    }

    return (
        <Card className="p-6">
            <HierarchicalBreadcrumb
                breadcrumbs={breadcrumbs}
                onBreadcrumbClick={handleBreadcrumbClick}
                className="mb-2"
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
                <ProductCommentGridView
                    products={products}
                    onProductClick={handleProductClick}
                />
            )}

            {currentLevel === "comments" && selectedProduct && (
                <CommentListView
                    comments={comments}
                    productName={selectedProduct.product.name}
                    onBack={handleBackFromComments}
                    onDelete={handleDelete}
                />
            )}
        </Card>
    );
}

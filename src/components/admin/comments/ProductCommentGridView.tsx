import { Badge } from "@/components/ui/badge";
import { ChevronRight, Package } from "lucide-react";
import type { ProductCommentsGroup } from "@/api/types";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

interface ProductCommentGridViewProps {
    products: ProductCommentsGroup[];
    onProductClick: (product: ProductCommentsGroup) => void;
}

export function ProductCommentGridView({
    products,
    onProductClick,
}: ProductCommentGridViewProps) {
    return (
        <div className="animate-in fade-in duration-300">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Sản phẩm có bình luận</h3>
                <Badge variant="secondary">{products.length} sản phẩm</Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((item, index) => (
                    <button
                        key={item._id}
                        onClick={() => onProductClick(item)}
                        style={{ animationDelay: `${index * 50}ms` }}
                        className="group flex items-center gap-3 p-4 border rounded-lg hover:bg-accent hover:border-primary hover:shadow-md transition-all duration-200 text-left animate-in fade-in slide-in-from-bottom-4"
                    >
                        <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center flex-shrink-0 transition-colors overflow-hidden">
                            {item.product.image_primary ? (
                                <img
                                    src={item.product.image_primary}
                                    alt={item.product.name}
                                    className="w-full h-full object-cover rounded-lg"
                                />
                            ) : (
                                <Package className="w-6 h-6 text-primary" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                {item.product.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                {item.commentCount} bình luận •{" "}
                                {formatDistanceToNow(new Date(item.latestComment), {
                                    addSuffix: true,
                                    locale: vi,
                                })}
                            </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </button>
                ))}
            </div>

            {products.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                        <Package className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground">Chưa có bình luận nào</p>
                </div>
            )}
        </div>
    );
}

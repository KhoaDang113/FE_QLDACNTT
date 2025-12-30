import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Upload, Settings, History, Package } from "lucide-react";
import type { Product } from "@/types";

interface InventoryProductGridViewProps {
    products: Product[];
    onImportClick: (id: string) => void;
    onExportClick: (id: string) => void;
    onAdjustClick: (id: string, quantity: number) => void;
    onHistoryClick: (id: string, name: string) => void;
}

export function InventoryProductGridView({
    products,
    onImportClick,
    onExportClick,
    onAdjustClick,
    onHistoryClick,
}: InventoryProductGridViewProps) {
    const reorderLevel = 10;

    if (products.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
                    <Package className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">
                    Chưa có sản phẩm nào trong danh mục này
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                    Hãy thêm sản phẩm mới vào danh mục này
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {products.map((product, index) => {
                const quantity = product.quantity || 0;
                const isLowStock = quantity <= reorderLevel;
                const isOutOfStock = quantity === 0;

                return (
                    <div
                        key={product._id}
                        style={{ animationDelay: `${index * 30}ms` }}
                        className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:border-green-300 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-2"
                    >
                        {/* Stock Status Badge */}
                        <div className="absolute left-2 top-2 z-10">
                            <Badge
                                className={
                                    isOutOfStock
                                        ? "bg-red-500 text-white"
                                        : isLowStock
                                            ? "bg-orange-500 text-white"
                                            : "bg-green-500 text-white"
                                }
                            >
                                {isOutOfStock
                                    ? "Hết hàng"
                                    : isLowStock
                                        ? "Tồn kho thấp"
                                        : "Bình thường"}
                            </Badge>
                        </div>

                        {/* Product Image */}
                        <div className="relative overflow-hidden h-40 flex-shrink-0">
                            <img
                                src={
                                    (Array.isArray(product.image_primary)
                                        ? product.image_primary[0]
                                        : product.image_primary) ||
                                    product.image_url ||
                                    "/placeholder.svg"
                                }
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {isOutOfStock && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                    <span className="rounded-lg bg-red-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg">
                                        Hết hàng
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Product Info */}
                        <div className="flex flex-col flex-1 p-3">
                            {/* Product Name */}
                            <h3 className="mb-2 text-sm font-semibold leading-snug text-gray-800 line-clamp-2 min-h-[2.5rem]">
                                {product.name}
                            </h3>

                            {/* Stock Info */}
                            <div className="mb-3 space-y-1">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-muted-foreground">
                                        Số lượng:
                                    </span>
                                    <span
                                        className={`text-lg font-bold ${isOutOfStock
                                            ? "text-red-600"
                                            : isLowStock
                                                ? "text-orange-600"
                                                : "text-green-600"
                                            }`}
                                    >
                                        {quantity}
                                    </span>
                                </div>
                                {product.unit && (
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-muted-foreground">
                                            Đơn vị:
                                        </span>
                                        <span className="text-sm font-medium">{product.unit}</span>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs border-green-300 text-green-700 hover:bg-green-50 hover:border-green-400"
                                    onClick={() => onImportClick(product._id)}
                                    title="Nhập kho"
                                >
                                    <Download className="w-3.5 h-3.5" />
                                    Nhập
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs border-blue-300 text-blue-700 hover:bg-blue-50 hover:border-blue-400"
                                    onClick={() => onExportClick(product._id)}
                                    title="Xuất kho"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    Xuất
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs border-orange-300 text-orange-700 hover:bg-orange-50 hover:border-orange-400"
                                    onClick={() => onAdjustClick(product._id, quantity)}
                                    title="Điều chỉnh"
                                >
                                    <Settings className="w-3.5 h-3.5" />
                                    Điều chỉnh
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-1 text-xs border-purple-300 text-purple-700 hover:bg-purple-50 hover:border-purple-400"
                                    onClick={() => onHistoryClick(product._id, product.name)}
                                    title="Lịch sử"
                                >
                                    <History className="w-3.5 h-3.5" />
                                    Lịch sử
                                </Button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

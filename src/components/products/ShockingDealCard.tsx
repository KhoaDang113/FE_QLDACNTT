import type { Product } from "@/types/product.type";
import { getProductImage, getProductId } from "@/lib/constants";
import { Link } from "react-router-dom";

interface ShockingDealCardProps {
    product: Product;
    onBuyClick?: (product: Product) => void;
}

export default function ShockingDealCard({
    product,
    onBuyClick,
}: ShockingDealCardProps) {
    // Calculate discount percentage
    const discount =
        product.discount_percent ||
        (product.unit_price && product.final_price
            ? Math.round(
                ((product.unit_price - product.final_price) / product.unit_price) *
                100
            )
            : 0);

    const handleBuyClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation(); // Prevent navigation when clicking buy button
        if (onBuyClick) {
            onBuyClick(product);
        }
    };

    const productId = getProductId(product);

    return (
        <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-300 h-full relative group border border-transparent hover:border-green-200 flex flex-row gap-4 items-center">
            <Link to={`/products-detail/${productId}`} className="flex flex-row gap-4 items-center w-full h-full">
                {/* Product Image - Left Side */}
                <div className="relative w-1/3 aspect-square flex-shrink-0">
                    <img
                        src={getProductImage(product)}
                        alt={product.name}
                        className="object-contain w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* Product Info - Right Side */}
                <div className="flex flex-col flex-grow justify-between h-full w-2/3">

                    {/* Name */}
                    <h3 className="text-sm font-semibold leading-snug text-gray-800 line-clamp-2 h-10 mb-2" title={product.name}>
                        {product.name}
                    </h3>

                    {/* Price Section */}
                    <div className="flex flex-col gap-1 mb-2">
                        {/* Current Price with Unit */}
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg font-bold text-red-600">
                                {product.final_price?.toLocaleString("vi-VN")}₫
                            </span>
                            {product.unit && (
                                <span className="text-xs font-medium text-gray-500">
                                    /{product.unit}
                                </span>
                            )}
                        </div>

                        {/* Original Price with Discount Badge */}
                        {discount > 0 && product.unit_price && (
                            <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 line-through">
                                    {product.unit_price.toLocaleString("vi-VN")}₫
                                    {product.unit && (
                                        <span className="text-xs">/{product.unit}</span>
                                    )}
                                </span>
                                <div className="rounded bg-red-600 px-1.5 py-0.5 text-xs font-bold text-white">
                                    -{discount}%
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Buy Button */}
                    <button
                        onClick={handleBuyClick}
                        className="w-full bg-[#e5f9ed] text-[#008848] font-bold py-2 rounded-md hover:bg-[#d0f5dd] transition-colors uppercase text-xs tracking-wide mt-auto"
                    >
                        MUA
                    </button>
                </div>
            </Link>
        </div>
    );
}

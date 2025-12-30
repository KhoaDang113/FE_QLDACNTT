import { useState, useRef } from "react";
import type { Product } from "@/types/product.type";
import ShockingDealCard from "./ShockingDealCard";
import { ProductModal } from "./ProductModal";
import ScrollButton from "@/components/scroll/ScrollButton";

interface ShockingDealProps {
    products: Product[];
    onAddToCart: (product: Product, quantity?: number) => void;
}

export default function ShockingDeal({
    products,
    onAddToCart,
}: ShockingDealProps) {
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [startIndex, setStartIndex] = useState(0);

    // Mobile pagination state
    const [mobileActiveIndex, setMobileActiveIndex] = useState(0);
    const mobileScrollRef = useRef<HTMLDivElement>(null);

    if (!products || products.length === 0) return null;

    const ITEMS_PER_PAGE = 3;

    const handleBuyClick = (product: Product) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handleAddToCartFromModal = (product: Product, quantity: number) => {
        onAddToCart(product, quantity);
    };

    const nextSlide = () => {
        if (startIndex + ITEMS_PER_PAGE < products.length) {
            setStartIndex(startIndex + ITEMS_PER_PAGE);
        }
    };

    const prevSlide = () => {
        if (startIndex - ITEMS_PER_PAGE >= 0) {
            setStartIndex(startIndex - ITEMS_PER_PAGE);
        }
    };

    const handleMobileScroll = () => {
        if (mobileScrollRef.current) {
            const { scrollLeft, clientWidth } = mobileScrollRef.current;
            const index = Math.round(scrollLeft / clientWidth);
            setMobileActiveIndex(index);
        }
    };

    const scrollToMobileIndex = (index: number) => {
        if (mobileScrollRef.current) {
            const clientWidth = mobileScrollRef.current.clientWidth;
            mobileScrollRef.current.scrollTo({
                left: index * clientWidth,
                behavior: 'smooth'
            });
            setMobileActiveIndex(index);
        }
    };

    const visibleProducts = products.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    const isFirstPage = startIndex === 0;
    const isLastPage = startIndex + ITEMS_PER_PAGE >= products.length;

    return (
        <>
            <div className="w-full bg-gradient-to-b from-[#7EE689] to-[#5BCB74] rounded-xl overflow-hidden shadow-sm mb-6 border border-green-100 relative group">
                <div className="p-3 relative">
                    <h2 className="p-3 text-white font-bold text-lg uppercase tracking-wide drop-shadow-sm">
                        Khuyến Mãi Sốc
                    </h2>
                    {/* Navigation Buttons - Desktop Only */}
                    <div className="hidden md:block">
                        {!isFirstPage && (
                            <ScrollButton
                                direction="left"
                                onClick={prevSlide}
                                color="bg-white hover:bg-gray-100 shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                        )}

                        {!isLastPage && (
                            <ScrollButton
                                direction="right"
                                onClick={nextSlide}
                                color="bg-white hover:bg-gray-100 shadow-md border border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                            />
                        )}
                    </div>

                    {/* Mobile View: Horizontal Scroll */}
                    <div
                        ref={mobileScrollRef}
                        onScroll={handleMobileScroll}
                        className="md:hidden flex overflow-x-auto snap-x snap-mandatory gap-3 scrollbar-hide pb-2 -mx-3 px-3"
                    >
                        {products.map((product) => (
                            <div key={product._id || product.id} className="min-w-full snap-center">
                                <ShockingDealCard
                                    product={product}
                                    onBuyClick={handleBuyClick}
                                />
                            </div>
                        ))}
                    </div>

                    {/* Pagination Dots - Mobile Only */}
                    <div className="md:hidden flex justify-center items-center gap-2 mt-2 pb-1">
                        {products.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => scrollToMobileIndex(index)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${mobileActiveIndex === index
                                    ? "bg-white w-6"
                                    : "bg-white/50 hover:bg-white/80"
                                    }`}
                                aria-label={`Go to product ${index + 1}`}
                            />
                        ))}
                    </div>

                    {/* Desktop View: Grid showing exactly 3 items */}
                    <div className="hidden md:grid md:grid-cols-3 gap-3 mb-2">
                        {visibleProducts.map((product) => (
                            <ShockingDealCard
                                key={product._id || product.id}
                                product={product}
                                onBuyClick={handleBuyClick}
                            />
                        ))}
                    </div>

                    {/* Pagination Dots - Desktop Only */}
                    <div className="hidden md:flex justify-center items-center gap-2 mt-2 pb-1">
                        {Array.from({ length: Math.ceil(products.length / ITEMS_PER_PAGE) }).map((_, index) => (
                            <button
                                key={index}
                                onClick={() => setStartIndex(index * ITEMS_PER_PAGE)}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${Math.floor(startIndex / ITEMS_PER_PAGE) === index
                                    ? "bg-white w-6"
                                    : "bg-white/50 hover:bg-white/80"
                                    }`}
                                aria-label={`Go to page ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* Product Modal */}
            {selectedProduct && (
                <ProductModal
                    product={selectedProduct}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onAddToCart={handleAddToCartFromModal}
                />
            )}
        </>
    );
}

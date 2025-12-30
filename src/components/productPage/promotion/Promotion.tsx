import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/types/product.type";
import { ProductCard } from "@/components/products/ProductCard";
import { HoriztionPromotion } from "@/components/productPage/promotion/PromotionCard";

interface PromotionProps {
  products: Product[];
  onAddToCart: (product: Product) => void;
}

export default function Promotion({ products, onAddToCart }: PromotionProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const itemsPerSlide = isMobile ? 2 : 3; // Mobile: 2, Desktop: 3
  const totalSlides = Math.ceil(products.length / itemsPerSlide);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Detect screen size để chọn component phù hợp
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768); // md breakpoint
    };

    // Initial call
    checkScreenSize();

    // Listen for resize events
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Reset current slide khi isMobile thay đổi
  useEffect(() => {
    setCurrentSlide(0);
  }, [isMobile]);

  if (!products || products.length === 0) {
    return <></>;
  }

  return (
    <div className="bg-gradient-to-r from-green-400 to-emerald-400 p-6 rounded-lg">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white drop-shadow-lg">
          KHUYẾN MÃI SỐC
        </h2>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Navigation Arrows */}
        {totalSlides > 1 && (
          <>
            <Button
              variant="outline"
              size="sm"
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white/90 hover:bg-white shadow-lg"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white/90 hover:bg-white shadow-lg"
              onClick={nextSlide}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}

        {/* Products Grid */}
        <div className="overflow-hidden relative z-0">
          <div
            className="flex transition-transform duration-300 ease-in-out"
            style={{
              transform: `translateX(-${currentSlide * 100}%)`,
            }}
          >
            {Array.from({ length: totalSlides }).map((_, slideIndex) => (
              <div
                key={slideIndex}
                className={`w-full flex-shrink-0 grid gap-4 ${
                  isMobile
                    ? "grid-cols-2"
                    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
                }`}
              >
                {products
                  .slice(
                    slideIndex * itemsPerSlide,
                    (slideIndex + 1) * itemsPerSlide
                  )
                  .map((product, index) => (
                    <div key={`${slideIndex}-${index}`}>
                      {isMobile ? (
                        <ProductCard
                          product={product}
                          onAddToCart={onAddToCart}
                        />
                      ) : (
                        <HoriztionPromotion
                          product={product}
                          onAddToCart={onAddToCart}
                        />
                      )}
                    </div>
                  ))}
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        {totalSlides > 1 && (
          <div className="flex justify-center mt-6 space-x-2">
            {Array.from({ length: totalSlides }).map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                  index === currentSlide
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/70"
                }`}
                onClick={() => goToSlide(index)}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

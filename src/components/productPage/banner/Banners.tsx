"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import type { Banner } from "@/types/banner.type";
import BannerComponent from "@/components/productPage/banner/Banner";
import ScrollButton from "@/components/scroll/ScrollButton";

export default function Banners({ banners }: { banners: Banner[] }) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const autoScrollIntervalRef = useRef<number | null>(null);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      setShowLeftButton(scrollLeft > 1);
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 1;
      setShowRightButton(!isAtEnd);
    }
  };

  const scroll = useCallback((direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      // Scroll một banner đầy đủ (100% container width + gap)
      const containerWidth = scrollContainerRef.current.clientWidth;
      const scrollAmount =
        direction === "left" ? -(containerWidth + 16) : containerWidth + 16;

      setIsAutoScrolling(true);
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: "smooth",
      });

      // Reset auto scrolling flag after animation
      setTimeout(() => setIsAutoScrolling(false), 500);
    }
  }, []);

  const autoScroll = useCallback(() => {
    if (scrollContainerRef.current && !isUserInteracting) {
      const container = scrollContainerRef.current;
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const isAtEnd = scrollLeft >= scrollWidth - clientWidth - 1;

      if (isAtEnd) {
        // Reset to beginning
        container.scrollTo({
          left: 0,
          behavior: "smooth",
        });
      } else {
        scroll("right");
      }
    }
  }, [isUserInteracting, scroll]);

  const startAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
    }
    autoScrollIntervalRef.current = window.setInterval(autoScroll, 4000); // Auto scroll every 4 seconds
  }, [autoScroll]);

  const stopAutoScroll = useCallback(() => {
    if (autoScrollIntervalRef.current) {
      clearInterval(autoScrollIntervalRef.current);
      autoScrollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScroll();
    window.addEventListener("resize", checkScroll);
    container.addEventListener("scroll", checkScroll);

    // Touch event handlers for mobile
    const handleTouchStart = () => {
      setIsUserInteracting(true);
      stopAutoScroll();
    };

    const handleTouchEnd = () => {
      setIsUserInteracting(false);
      // Restart auto scroll after user interaction ends
      setTimeout(() => {
        if (!isUserInteracting && window.innerWidth < 768) {
          startAutoScroll();
        }
      }, 2000);
    };

    const handleScrollEnd = () => {
      if (!isAutoScrolling) {
        // Snap to nearest banner
        const containerWidth = container.clientWidth;
        const scrollLeft = container.scrollLeft;
        const snapPosition =
          Math.round(scrollLeft / (containerWidth + 16)) *
          (containerWidth + 16);

        container.scrollTo({
          left: snapPosition,
          behavior: "smooth",
        });
      }
    };

    container.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    container.addEventListener("touchend", handleTouchEnd, { passive: true });
    container.addEventListener("scrollend", handleScrollEnd);

    // Start auto scroll on mobile
    if (window.innerWidth < 768) {
      startAutoScroll();
    }

    return () => {
      window.removeEventListener("resize", checkScroll);
      container.removeEventListener("scroll", checkScroll);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchend", handleTouchEnd);
      container.removeEventListener("scrollend", handleScrollEnd);
      stopAutoScroll();
    };
  }, [isAutoScrolling, isUserInteracting, startAutoScroll, stopAutoScroll]);

  return (
    <div className="relative group/container">
      {/* Scroll buttons */}
      <div className="opacity-0 group-hover/container:opacity-100 transition-opacity">
        {showLeftButton && (
          <ScrollButton direction="left" onClick={() => scroll("left")} />
        )}
        {showRightButton && (
          <ScrollButton direction="right" onClick={() => scroll("right")} />
        )}
      </div>

      <div
        ref={scrollContainerRef}
        className="w-full max-w-full overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] md:rounded-lg snap-x snap-mandatory"
      >
        <div className="flex flex-row gap-4">
          {banners.map((banner: Banner) => (
            <div
              key={banner.id}
              className="flex-shrink-0 w-full max-w-full snap-center snap-always"
            >
              <BannerComponent banner={banner} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

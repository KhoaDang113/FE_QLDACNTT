"use client";

import { useState, useEffect } from "react";
import { ProductCard } from "@/components/products/ProductCard";
import Banner from "../productPage/banner/Banner";
import type { Product } from "@/types/product.type";
import type { Banner as BannerType } from "@/types/banner.type";

interface ProductGridWithBannersProps {
  products: Product[];
  banners: BannerType[];
  onAddToCart: (product: Product) => void;
  rowsPerBanner?: number;
}

export default function ProductGridWithBanners({
  products,
  banners,
  onAddToCart,
  rowsPerBanner = 2, // Cứ 2 hàng thì có 1 banner
}: ProductGridWithBannersProps) {
  const [currentProductsPerRow, setCurrentProductsPerRow] = useState(5);

  // Detect current screen size và update products per row
  useEffect(() => {
    const updateProductsPerRow = () => {
      const width = window.innerWidth;
      if (width >= 1280) {
        setCurrentProductsPerRow(5); // xl: 5 columns
      } else if (width >= 1024) {
        setCurrentProductsPerRow(4); // lg: 4 columns
      } else if (width >= 640) {
        setCurrentProductsPerRow(2); // sm: 2 columns
      } else {
        setCurrentProductsPerRow(2); // mobile: 2 columns
      }
    };

    // Initial call
    updateProductsPerRow();

    // Listen for resize events
    window.addEventListener("resize", updateProductsPerRow);

    return () => window.removeEventListener("resize", updateProductsPerRow);
  }, []);

  // Tạo grid items với banner xen kẽ
  const createGridItems = () => {
    const items: React.ReactNode[] = [];
    const totalProducts = products.length;

    // Tính số hàng dựa trên số cột hiện tại
    const totalRows = Math.ceil(totalProducts / currentProductsPerRow);

    let currentBannerIndex = 0;
    let currentProductIndex = 0;

    for (let row = 0; row < totalRows; row++) {
      // Thêm sản phẩm cho hàng hiện tại
      const productsInThisRow = Math.min(
        currentProductsPerRow,
        totalProducts - currentProductIndex
      );

      for (let col = 0; col < productsInThisRow; col++) {
        if (currentProductIndex < totalProducts) {
          const product = products[currentProductIndex];
          items.push(
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={onAddToCart}
            />
          );
          currentProductIndex++;
        }
      }

      // Thêm banner sau mỗi rowsPerBanner hàng
      if (
        (row + 1) % rowsPerBanner === 0 &&
        currentBannerIndex < banners.length
      ) {
        const banner = banners[currentBannerIndex % banners.length];
        items.push(
          <div key={`banner-${currentBannerIndex}`} className="col-span-full">
            <Banner banner={banner} />
          </div>
        );
        currentBannerIndex++;
      }
    }

    return items;
  };

  if (products.length === 0) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <p className="col-span-full text-center text-gray-500 py-8">
          Chưa có sản phẩm nào trong danh mục này
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {createGridItems()}
    </div>
  );
}

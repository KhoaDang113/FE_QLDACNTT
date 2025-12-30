import { useState, useEffect, useRef } from "react";
import type {
  MenuCombo,
  MenuComboWithIngredients,
  Ingredient,
} from "@/types/menu.type";
import type { Product } from "@/types";
import {
  getSuggestedDishesForProduct,
  getIngredientsForDish,
  getSpicesForDish,
} from "@/lib/geminiService";
import { useCart } from "@/components/cart/CartContext";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";

interface SuggestedDishesProps {
  productName: string;
}

export default function SuggestedDishes({ productName }: SuggestedDishesProps) {
  const { addToCart } = useCart();
  const [suggestedDishes, setSuggestedDishes] = useState<MenuCombo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCombo, setSelectedCombo] =
    useState<MenuComboWithIngredients | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoadingIngredients, setIsLoadingIngredients] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State cho gia vị
  const [dishSpices, setDishSpices] = useState<(Product & { spice_type?: string })[]>([]);
  const [isLoadingSpices, setIsLoadingSpices] = useState(false);
  const [selectedSpiceTab, setSelectedSpiceTab] = useState<string>("all");

  const spicesScrollRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  // Danh sách các tab gia vị
  const spiceTabs = [
    { id: "all", name: "Tất cả", type: null },
    { id: "oil", name: "Dầu ăn", type: "oil" },
    { id: "sauce", name: "Nước chấm", type: "sauce" },
    { id: "dry_spice", name: "Gia vị khô", type: "dry_spice" },
    { id: "other", name: "Khác", type: "other" },
  ];

  // Load suggested dishes khi component mount hoặc productName thay đổi
  useEffect(() => {
    const loadSuggestedDishes = async () => {
      if (!productName) return;

      setIsLoading(true);
      try {
        const dishes = await getSuggestedDishesForProduct(productName);
        setSuggestedDishes(dishes);
      } catch (error) {
        console.error("Error loading suggested dishes:", error);
        setSuggestedDishes([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadSuggestedDishes();
  }, [productName]);

  const handleBuyIngredients = async (combo: MenuCombo) => {
    setSelectedCombo({ ...combo, ingredients: [] });
    setIsModalOpen(true);
    setIsLoadingIngredients(true);
    setIsLoadingSpices(true);
    setError(null);
    setIngredients([]);
    setDishSpices([]);
    setSelectedSpiceTab("all");

    try {
      // Fetch ingredients and spices in parallel
      // Truyền productName (sản phẩm gốc) để đảm bảo nó được ưu tiên trong danh sách nguyên liệu
      const [ingredientsList, spicesList] = await Promise.all([
        getIngredientsForDish(combo.name, productName),
        getSpicesForDish(combo.name),
      ]);

      setIngredients(ingredientsList);
      setDishSpices(spicesList);
      setSelectedCombo({ ...combo, ingredients: ingredientsList });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
      console.error("Error loading data:", err);
    } finally {
      setIsLoadingIngredients(false);
      setIsLoadingSpices(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCombo(null);
    setIngredients([]);
    setDishSpices([]);
    setError(null);
    setSelectedSpiceTab("all");
  };

  // Convert Ingredient to Product for ProductCard
  const ingredientToProduct = (ingredient: Ingredient): Product => {
    return {
      _id: ingredient.product_id || ingredient.id.toString(),
      id: ingredient.product_id || ingredient.id.toString(),
      name: ingredient.name,
      slug: ingredient.name.toLowerCase().replace(/\s+/g, "-"),
      unit: ingredient.unit,
      unit_price: ingredient.unit_price || ingredient.price,
      discount_percent: ingredient.discount_percent || 0,
      final_price: ingredient.price,
      image_primary: ingredient.image_url,
      image_url: ingredient.image_url,
      quantity: ingredient.stock_quantity || 0,
      stock_quantity: ingredient.stock_quantity || 0,
      stock_status: ingredient.available ? "in_stock" : "out_of_stock",
      is_active: true,
      is_deleted: false,
    };
  };

  const handleAddToCart = (
    product: Product & { selectedQuantity?: number }
  ) => {
    const productId = typeof product.id === "string" ? product.id : product._id;
    const imageUrl = product.image_url ||
      (Array.isArray(product.image_primary)
        ? product.image_primary[0]
        : product.image_primary) || "";

    addToCart({
      id: productId || product._id,
      name: product.name,
      price: product.final_price || product.unit_price,
      image: imageUrl,
      unit: product.unit || "1 sản phẩm",
      stock: product.quantity || product.stock_quantity || 0,
      quantity: product.selectedQuantity || 1,
    });
  };

  const checkScrollButtons = () => {
    if (spicesScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = spicesScrollRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };



  useEffect(() => {
    checkScrollButtons();
    const scrollContainer = spicesScrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", checkScrollButtons);
      window.addEventListener("resize", checkScrollButtons);
    }
    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", checkScrollButtons);
      }
      window.removeEventListener("resize", checkScrollButtons);
    };
  }, [dishSpices]);

  const scrollSpices = (direction: "left" | "right") => {
    if (spicesScrollRef.current) {
      const scrollAmount = 300;
      const newScrollLeft =
        spicesScrollRef.current.scrollLeft +
        (direction === "left" ? -scrollAmount : scrollAmount);
      spicesScrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    }
  };



  // Nếu không có món ăn gợi ý, không hiển thị gì
  if (!isLoading && suggestedDishes.length === 0) {
    return null;
  }

  return (
    <>
      <div className="mt-4 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 p-5">
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Nguyên liệu nấu cùng {productName}
        </h2>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {suggestedDishes.map((combo) => (
              <div
                key={combo._id}
                className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-gray-200 flex flex-col h-full"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-gray-100 flex items-center justify-center p-2 flex-shrink-0">
                  <img
                    src={combo.image || combo.image_url}
                    alt={combo.name}
                    className="max-w-full max-h-full w-auto h-auto object-contain hover:scale-105 transition-transform duration-300"
                  />
                </div>

                {/* Content */}
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-semibold text-sm sm:text-base text-gray-800 mb-1 line-clamp-2 flex-1">
                    {combo.name}
                  </h3>

                  {/* Button - Always at bottom */}
                  <button
                    onClick={() => handleBuyIngredients(combo)}
                    className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm font-medium py-2 rounded-md transition-colors"
                  >
                    MUA NGUYÊN LIỆU
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Ingredients */}
      {isModalOpen && selectedCombo && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={closeModal}
        >
          <div
            className="duration-400 overflow-hidden max-w-[640px] no-scrollbar max-h-[80vh] transition-all ease-in-out bg-white rounded-lg shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-green-600 text-white p-3 flex justify-between items-center flex-shrink-0">
              <div>
                <h3 className="text-base sm:text-lg font-bold">
                  Nguyên liệu món {selectedCombo.name}
                </h3>
                <p className="text-xs opacity-90">
                  Lựa chọn loại nguyên liệu chính
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-white hover:text-gray-200 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/20 transition-colors flex-shrink-0"
              >
                &times;
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-3 overflow-y-auto flex-1">
              {isLoadingIngredients ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
                  <p className="text-gray-600">
                    Đang tải danh sách nguyên liệu...
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => handleBuyIngredients(selectedCombo)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-md"
                  >
                    Thử lại
                  </button>
                </div>
              ) : ingredients.length > 0 ? (
                <>
                  {/* Main Ingredients Section */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold px-2 text-gray-800 mb-3">
                      Lựa chọn loại nguyên liệu chính
                    </h4>

                    {/* Grid with ProductCard - 2 columns on mobile, 3 on larger screens */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 px-2">
                      {ingredients.map((ingredient) => (
                        <ProductCard
                          key={ingredient.id}
                          product={ingredientToProduct(ingredient)}
                          onAddToCart={handleAddToCart}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Spices Section */}
                  <div className="mt-6 border-t pt-4">
                    <h4 className="text-sm font-semibold px-2 text-gray-800 mb-3">
                      Mua thêm gia vị
                    </h4>

                    {/* Spice Tabs */}
                    <div className="flex gap-2 overflow-x-auto pb-3 px-2 no-scrollbar">
                      {spiceTabs.map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setSelectedSpiceTab(tab.id)}
                          className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-medium transition-colors ${selectedSpiceTab === tab.id
                            ? "bg-green-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                          {tab.name}
                        </button>
                      ))}
                    </div>

                    {isLoadingSpices ? (
                      <div className="flex items-center justify-center w-full py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    ) : (() => {
                      // Filter spices based on selected tab
                      const filteredSpices = selectedSpiceTab === "all"
                        ? dishSpices
                        : dishSpices.filter((spice) => spice.spice_type === selectedSpiceTab);

                      return filteredSpices.length > 0 ? (
                        <div className="relative">
                          {/* Left Arrow */}
                          {showLeftArrow && (
                            <button
                              onClick={() => scrollSpices("left")}
                              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full p-1.5 transition-all"
                            >
                              <ChevronLeft className="w-4 h-4 text-gray-700" />
                            </button>
                          )}

                          {/* Scroll Container with ProductCard */}
                          <div
                            ref={spicesScrollRef}
                            className="overflow-x-auto no-scrollbar scroll-smooth"
                            style={{
                              paddingLeft: showLeftArrow ? "40px" : "8px",
                              paddingRight: showRightArrow ? "40px" : "8px",
                            }}
                          >
                            <div className="flex gap-3 pb-2">
                              {filteredSpices.map((spice) => (
                                <div
                                  key={spice.id}
                                  className="flex-shrink-0 w-[180px]"
                                >
                                  <ProductCard
                                    product={spice}
                                    onAddToCart={handleAddToCart}
                                  />
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Right Arrow */}
                          {showRightArrow && (
                            <button
                              onClick={() => scrollSpices("right")}
                              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/95 hover:bg-white shadow-lg rounded-full p-1.5 transition-all"
                            >
                              <ChevronRight className="w-4 h-4 text-gray-700" />
                            </button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center justify-center w-full py-8">
                          <p className="text-gray-500 text-sm">
                            {selectedSpiceTab === "all"
                              ? "Không có gia vị nào cho món này"
                              : `Không có gia vị loại "${spiceTabs.find(t => t.id === selectedSpiceTab)?.name}" cho món này`
                            }
                          </p>
                        </div>
                      );
                    })()}
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600">
                    Không tìm thấy nguyên liệu phù hợp
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {!isLoadingIngredients && !error && ingredients.length > 0 && (
              <div className="border-t bg-white p-3 flex justify-end items-center flex-shrink-0">
                <button
                  onClick={closeModal}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors shadow-lg text-sm"
                >
                  ĐÓNG
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

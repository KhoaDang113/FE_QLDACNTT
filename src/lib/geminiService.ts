import { GoogleGenAI } from "@google/genai";
import type { Ingredient, MenuCombo } from "@/types/menu.type";
import type { Product } from "@/types";
import productService from "@/api/services/productService";
import categoryService from "@/api/services/catalogService";
import comboService from "@/api/services/comboService";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_API_GEMINI,
});

const GEMINI_MODEL = "gemini-2.5-flash-lite";

function parseGeminiJsonResponse<T>(responseText: string): T | null {
  if (!responseText) return null;

  let jsonText = responseText.trim();

  // Loại bỏ markdown code blocks nếu có
  if (jsonText.startsWith("```json")) {
    jsonText = jsonText.replace(/```json\n?/g, "").replace(/```\n?$/g, "");
  } else if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/```\n?/g, "").replace(/```\n?$/g, "");
  }

  // Tìm JSON array/object trong response nếu có văn bản lẫn
  if (!jsonText.startsWith("[") && !jsonText.startsWith("{")) {
    const jsonArrayMatch = jsonText.match(/\[[\s\S]*\]/);
    const jsonObjectMatch = jsonText.match(/\{[\s\S]*\}/);
    if (jsonArrayMatch) {
      jsonText = jsonArrayMatch[0];
    } else if (jsonObjectMatch) {
      jsonText = jsonObjectMatch[0];
    } else {
      console.error("Response không chứa JSON hợp lệ:", responseText);
      return null;
    }
  }

  try {
    return JSON.parse(jsonText) as T;
  } catch (parseError) {
    console.error("Lỗi parse JSON:", parseError, "Response:", responseText);
    return null;
  }
}

/**
 * Helper function để gọi Gemini API với prompt
 * @param prompt - Prompt text
 * @returns Promise<string> - Raw response text
 */
async function callGeminiAPI(prompt: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    config: { responseMimeType: "application/json" },
  });

  return response.text || "";
}

/**
 * Lấy tất cả sản phẩm có sẵn trong kho từ database
 */
async function getAllAvailableProducts(): Promise<Product[]> {
  try {
    // Lấy danh sách tất cả categories
    const categories = await categoryService.getRootCategories();
    const allProducts: Product[] = [];

    // Lấy sản phẩm từ từng category
    for (const category of categories) {
      try {
        const products = await productService.getProducts(category.slug);
        allProducts.push(...products);
      } catch (error) {
        console.error(
          `Error fetching products for category ${category.slug}:`,
          error
        );
      }
    }

    // Lọc sản phẩm còn hàng và active
    return allProducts.filter(
      (p) =>
        p.is_active !== false &&
        p.stock_status === "in_stock" &&
        ((p.stock_quantity && p.stock_quantity > 0) || p.quantity > 0)
    );
  } catch (error) {
    console.error("Error fetching all available products:", error);
    return [];
  }
}

/**
 * Gọi Gemini API để lấy danh sách nguyên liệu cho món ăn
 * @param dishName - Tên món ăn
 * @param originalProductName - Tên sản phẩm gốc mà người dùng đang xem (để ưu tiên)
 * @returns Promise<Ingredient[]> - Danh sách nguyên liệu
 */
// Danh sách từ khóa để loại bỏ khỏi nguyên liệu chính (gia vị, đồ uống, combo...)
const EXCLUDED_KEYWORDS = [
  // Dầu ăn
  "dầu", "dầu ăn", "dầu nành", "dầu hào", "dầu mè", "dầu oliu",
  // Nước mắm, mắm các loại
  "nước mắm", "mắm ruốc", "mắm tôm", "mắm cá", "mắm nêm", "mắm",
  // Nước tương, tương các loại
  "nước tương", "tương ớt", "tương cà", "tương", "xì dầu",
  // Gia vị cơ bản
  "muối", "đường", "tiêu", "bột ngọt", "hạt nêm", "bột canh",
  // Gia vị khác
  "giấm", "mì chính", "bột chiên", "bột năng", "bột mì",
  "sa tế", "sốt", "mayonnaise", "ketchup", "chao",
  // Đồ uống
  "nước ép", "nước uống", "nước ngọt", "nước suối", "sữa", "trà", "cà phê",
  "coca", "pepsi", "sting", "redbull", "bia", "rượu",
  // Combo/Set (thường là sản phẩm kết hợp, không phải nguyên liệu riêng)
  "combo nước", "combo ép",
  // Bánh kẹo, snack
  "bánh", "kẹo", "snack", "mứt"
];

/**
 * Kiểm tra xem sản phẩm có phải là gia vị/đồ uống/không phải nguyên liệu không
 */
function isExcludedProduct(productName: string): boolean {
  const lowerName = productName.toLowerCase();
  return EXCLUDED_KEYWORDS.some(keyword => lowerName.includes(keyword));
}

export async function getIngredientsForDish(
  dishName: string,
  originalProductName?: string
): Promise<Ingredient[]> {
  try {
    const availableProducts = await getAllAvailableProducts();

    // Lọc bỏ các sản phẩm không phải nguyên liệu (gia vị, đồ uống, combo...)
    const mainIngredientProducts = availableProducts.filter(
      (p) => !isExcludedProduct(p.name)
    );

    // Tạo danh sách sản phẩm có sẵn để gửi cho Gemini
    const productList = mainIngredientProducts
      .map(
        (p) =>
          `- ${p.name} (${p.unit || p.quantity || "N/A"}) - Giá: ${p.final_price || p.unit_price
          }đ`
      )
      .join("\n");

    // Thêm thông tin về sản phẩm gốc vào prompt nếu có
    const originalProductHint = originalProductName
      ? `\n\nSẢN PHẨM KHÁCH ĐANG XEM: "${originalProductName}" - Nếu phù hợp với món ăn, BẮT BUỘC đưa vào danh sách.`
      : '';

    const prompt = `Bạn là chuyên gia ẩm thực Việt Nam. Chọn nguyên liệu CHÍNH để nấu món "${dishName}".

DANH SÁCH SẢN PHẨM CÓ SẴN (CHỈ chọn từ đây, tên CHÍNH XÁC):
${productList}
${originalProductHint}

QUY TẮC QUAN TRỌNG:
1. PHÂN TÍCH TÊN MÓN để xác định TẤT CẢ nguyên liệu chính:
   - "Nui giò heo" → nui + giò heo + rau củ (cà rốt, hành tây...)
   - "Bún bò" → bún + thịt bò + rau thơm
   - "Phở gà" → phở + gà + giá đỗ/hành
   - "Canh cải" → rau cải + (thịt nếu có)
   - "Thịt xào" → thịt + rau củ xào cùng

2. THÊM RAU CỦ PHÙ HỢP với món:
   - Món nấu/hầm: cà rốt, khoai tây, hành tây, củ cải
   - Món xào: hành tây, ớt chuông, cà rốt, nấm
   - Món canh: rau xanh, cà chua, nấm
   - Món nướng/chiên: có thể không cần rau

3. KHÔNG chọn gia vị (dầu, nước mắm, mắm, tương, muối, đường, tiêu, hạt nêm...)

4. Chọn loại thịt PHÙ HỢP:
   - "Thịt kho" → thịt ba chỉ/thịt heo, KHÔNG chọn chân giò
   - "Giò heo" → chân giò heo
   - "Sườn" → sườn non/sườn que

5. Tối đa 5-7 nguyên liệu cho 2-3 người

6. Nếu không tìm thấy nguyên liệu, trả về []

JSON: [{"name": "tên chính xác", "quantity": "số lượng", "note": "ghi chú"}]`;

    const responseText = await callGeminiAPI(prompt);
    const suggestedIngredients = parseGeminiJsonResponse<Array<{ name: string; quantity: string; note: string }>>(responseText);

    if (!suggestedIngredients) return [];

    // Map với sản phẩm thực tế trong kho
    const ingredients: Ingredient[] = [];
    let ingredientId = 1;
    const addedProductIds = new Set<string>();

    // Helper function để thêm sản phẩm vào danh sách ingredients
    const addIngredient = (product: Product, quantity?: string) => {
      const productId = String(product._id || product.id || '');
      if (!productId || addedProductIds.has(productId)) return; // Tránh trùng lặp

      addedProductIds.add(productId);
      ingredients.push({
        id: ingredientId++,
        name: product.name,
        quantity:
          quantity ||
          product.unit ||
          String(product.quantity) ||
          "1",
        unit: product.unit || "",
        price: product.final_price || product.unit_price,
        image_url:
          (Array.isArray(product.image_url)
            ? product.image_url[0]
            : product.image_url) ||
          (Array.isArray(product.image_primary)
            ? product.image_primary[0]
            : product.image_primary) ||
          "",
        available: true,
        product_id: productId,
        discount_percent: product.discount_percent || 0,
        unit_price: product.unit_price,
        stock_quantity:
          product.stock_quantity || product.quantity,
      });
    };

    // Ưu tiên thêm sản phẩm gốc đầu tiên nếu có (và không phải gia vị/đồ uống)
    if (originalProductName && !isExcludedProduct(originalProductName)) {
      const originalProduct = mainIngredientProducts.find(
        (p) =>
          p.name.toLowerCase().includes(originalProductName.toLowerCase()) ||
          originalProductName.toLowerCase().includes(p.name.toLowerCase())
      );
      if (originalProduct) {
        addIngredient(originalProduct);
      }
    }

    // Thêm các nguyên liệu từ AI (chỉ từ mainIngredientProducts, không bao gồm gia vị)
    for (const suggestion of suggestedIngredients) {
      // Tìm sản phẩm khớp tên trong danh sách nguyên liệu chính
      const matchedProduct = mainIngredientProducts.find(
        (p) =>
          p.name.toLowerCase().includes(suggestion.name.toLowerCase()) ||
          suggestion.name.toLowerCase().includes(p.name.toLowerCase())
      );

      if (matchedProduct) {
        addIngredient(matchedProduct, suggestion.quantity);
      }
    }

    return ingredients;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error(
      "Không thể lấy danh sách nguyên liệu. Vui lòng thử lại sau."
    );
  }
}

/**
 * Gọi Gemini API để lấy danh sách gia vị phù hợp cho món ăn
 * @param dishName - Tên món ăn
 * @returns Promise<Product[]> - Danh sách gia vị với phân loại type
 */
export async function getSpicesForDish(
  dishName: string
): Promise<(Product & { spice_type?: string })[]> {
  try {
    // Lấy sản phẩm từ category gia vị
    const spiceProducts = await productService.getProducts(
      "dau-an-nuoc-cham-gia-vi"
    );

    if (!spiceProducts || spiceProducts.length === 0) {
      return [];
    }

    // Tạo danh sách gia vị có sẵn
    const spiceList = spiceProducts
      .filter((p) => p.is_active !== false && p.stock_status === "in_stock")
      .map(
        (p) =>
          `- ${p.name} (${p.unit || "N/A"}) - Giá: ${p.final_price || p.unit_price
          }đ`
      )
      .join("\n");

    const prompt = `Liệt kê gia vị THIẾT YẾU (tối đa 8-10) để nấu món "${dishName}".

GIA VỊ CÓ SẴN:
${spiceList}

PHÂN LOẠI GIA VỊ (QUAN TRỌNG - phải phân loại ĐÚNG):
- oil: DẦU ĂN các loại (dầu nành, dầu hào, dầu mè, dầu oliu...)
- sauce: NƯỚC CHẤM dùng để chấm/ướp (nước mắm, nước tương, xì dầu, tương ớt...)
- dry_spice: GIA VỊ KHÔ (muối, đường, tiêu, bột ngọt, hạt nêm, bột canh, ớt bột, nghệ...)
- other: KHÁC (giấm, tương cà/ketchup, mayonnaise, sa tế, chao, mắm ruốc, mắm tôm...)

VÍ DỤ PHÂN LOẠI:
- "Dầu đậu nành Simply" → oil
- "Nước mắm Nam Ngư" → sauce
- "Hạt nêm Knorr" → dry_spice
- "Giấm ăn" → other (KHÔNG phải sauce)
- "Tương cà Cholimex" → sauce

JSON: [{"name": "tên chính xác", "type": "oil|sauce|dry_spice|other", "note": "ghi chú"}]`;

    const responseText = await callGeminiAPI(prompt);
    const suggestedSpices = parseGeminiJsonResponse<Array<{ name: string; type: string; note: string }>>(responseText);

    if (!suggestedSpices) return [];

    // Map với sản phẩm thực tế trong kho
    const spices: (Product & { spice_type?: string })[] = [];

    for (const suggestion of suggestedSpices) {
      // Tìm sản phẩm khớp tên
      const matchedProduct = spiceProducts.find(
        (p) =>
          p.name.toLowerCase().includes(suggestion.name.toLowerCase()) ||
          suggestion.name.toLowerCase().includes(p.name.toLowerCase())
      );

      if (matchedProduct) {
        spices.push({
          ...matchedProduct,
          spice_type: suggestion.type || "other",
        });
      }
    }

    return spices;
  } catch (error) {
    console.error("Error calling Gemini API for spices:", error);
    // Không throw error, chỉ return empty array
    return [];
  }
}

/**
 * Kiểm tra xem sản phẩm có phải là nguyên liệu nấu ăn (thịt, trứng, cá, rau củ) hay không
 * @param productName - Tên sản phẩm
 * @returns boolean - true nếu là nguyên liệu nấu ăn, false nếu không
 */
export function isCookingIngredient(productName: string): boolean {
  const lowerName = productName.toLowerCase().trim();

  // Danh sách từ khóa của nguyên liệu nấu ăn
  const cookingKeywords = [
    // Thịt
    "thịt",
    "ba chỉ",
    "ba rọi",
    "sườn",
    "nạc",
    "vai",
    "đùi",
    "gà",
    "vịt",
    "bò",
    "heo",
    "lợn",
    "dê",
    "cừu",
    "ngan",
    "chim",
    "ức gà",
    "cánh gà",
    "móng giò",
    "giò heo",
    "thăn",
    "xương",
    "gân",
    "sụn",

    // Cá và hải sản
    "cá",
    "tôm",
    "mực",
    "bạch tuộc",
    "nghêu",
    "sò",
    "hào",
    "cua",
    "ghẹ",
    "ốc",
    "hến",
    "ngao",

    // Trứng
    "trứng",

    // Rau củ
    "rau",
    "cải",
    "xà lách",
    "cải thảo",
    "bắp cải",
    "su hào",
    "củ",
    "khoai",
    "cà rót",
    "cà chua",
    "cà tím",
    "ớt",
    "hành",
    "tỏi",
    "gừng",
    "sả",
    "củ cải",
    "cà rốt",
    "bí",
    "bầu",
    "mướp",
    "đậu",
    "măng",
    "nấm",
    "súp lơ",
    "súp lơ xanh",
    "bông cải",
    "cần",
    "rau muống",
    "rau dền",
    "mồng tơi",
    "ngọn bí",
    "lá",
    "rau má",
    "rau răm",
    "húng",
    "ngò",
    "mùi",
    "kinh giới",
    "tía tô",
  ];

  // Danh sách từ khóa KHÔNG phải nguyên liệu nấu ăn (để loại trừ)
  const nonCookingKeywords = [
    // Hoa quả
    "táo",
    "chuối",
    "cam",
    "quýt",
    "bưởi",
    "xoài",
    "dưa",
    "dừa",
    "ổi",
    "mít",
    "sầu riêng",
    "chôm chôm",
    "nhãn",
    "vải",
    "thanh long",
    "măng cụt",
    "mận",
    "lê",
    "nho",
    "dâu",
    "kiwi",
    "bơ",

    // Gia vị đóng gói / sẵn
    "nước mắm",
    "tương",
    "dầu ăn",
    "nước tương",
    "mì chính",
    "bột",
    "hạt nêm",
    "dầu",
    "giấm",
    "đường",
    "muối",
    "tiêu",

    // Đồ uống
    "nước",
    "coca",
    "pepsi",
    "sting",
    "trà",
    "cà phê",
    "sữa",
    "yogurt",
    "bia",
    "rượu",

    // Đồ ăn vặt / Snack
    "kẹo",
    "bánh",
    "snack",
    "mứt",
  ];

  // Kiểm tra có từ khóa KHÔNG phải nguyên liệu nấu ăn
  const hasNonCookingKeyword = nonCookingKeywords.some((keyword) =>
    lowerName.includes(keyword)
  );
  if (hasNonCookingKeyword) {
    return false;
  }

  // Kiểm tra có từ khóa nguyên liệu nấu ăn
  const hasCookingKeyword = cookingKeywords.some((keyword) =>
    lowerName.includes(keyword)
  );

  return hasCookingKeyword;
}

/**
 * Gọi Gemini API để lấy danh sách món ăn gợi ý dựa trên tên sản phẩm
 * @param productName - Tên sản phẩm (ví dụ: "Thịt ba chỉ", "Ức gà", "Cánh gà")
 * @returns Promise<MenuCombo[]> - Danh sách món ăn gợi ý từ database
 */
export async function getSuggestedDishesForProduct(
  productName: string
): Promise<MenuCombo[]> {
  try {
    // Kiểm tra xem sản phẩm có phải là nguyên liệu nấu ăn không
    if (!isCookingIngredient(productName)) {
      return [];
    }

    // Lấy tất cả combos từ database
    const allCombos = await comboService.getCombos();

    if (!allCombos || allCombos.length === 0) {
      return [];
    }

    // Tạo danh sách tên món ăn có trong database
    const comboNames = allCombos.map((c) => c.name).join("\n");

    const prompt = `Tìm những món ăn mà "${productName}" là NGUYÊN LIỆU CHÍNH (chiếm phần lớn hoặc là thành phần cốt lõi của món).

DANH SÁCH MÓN ĂN CÓ SẴN:
${comboNames}

QUY TẮC NGHIÊM NGẶT:
- CHỈ chọn từ danh sách trên, tên CHÍNH XÁC
- CHỈ chọn món mà "${productName}" là NGUYÊN LIỆU CHÍNH, KHÔNG chọn món chỉ dùng làm phụ gia hoặc có thể thay thế bằng nguyên liệu khác
- Ví dụ: "Sườn cốt lết" → chỉ chọn "Thịt cốt lết chiên", KHÔNG chọn "Sườn nướng" (vì sườn nướng dùng sườn que)
- Ví dụ: "Thịt ba chỉ" → chọn "Thịt kho tàu", "Thịt luộc", KHÔNG chọn "Canh rau"
- Nếu không có món nào phù hợp, trả về mảng rỗng []

JSON format: ["Tên món 1", "Tên món 2", ...]`;

    const responseText = await callGeminiAPI(prompt);
    const suggestedDishNames = parseGeminiJsonResponse<string[]>(responseText);

    if (!suggestedDishNames) return [];

    // Tìm combo khớp với tên món ăn gợi ý
    const suggestedCombos: MenuCombo[] = [];

    for (const dishName of suggestedDishNames) {
      const matchedCombo = allCombos.find(
        (combo) =>
          combo.name.toLowerCase().trim() === dishName.toLowerCase().trim() ||
          combo.name.toLowerCase().includes(dishName.toLowerCase()) ||
          dishName.toLowerCase().includes(combo.name.toLowerCase())
      );

      if (
        matchedCombo &&
        !suggestedCombos.find((c) => c._id === matchedCombo._id)
      ) {
        suggestedCombos.push(matchedCombo);
      }
    }

    return suggestedCombos; // Trả về tất cả món ăn phù hợp
  } catch (error) {
    console.error("Error calling Gemini API for dish suggestions:", error);
    // Không throw error, chỉ return empty array để không làm gián đoạn UX
    return [];
  }
}

import { GoogleGenAI } from "@google/genai";

// Khởi tạo Gemini AI
const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_API_GEMINI,
});

/**
 * Gọi Gemini API để chat với AI
 * @param message - Tin nhắn từ người dùng
 * @param imageBase64 - Ảnh dạng base64 (optional)
 * @param conversationHistory - Lịch sử hội thoại (optional)
 * @returns Promise<string> - Phản hồi từ AI
 */
export async function chatWithAI(
  message: string,
  imageBase64?: string,
  conversationHistory?: Array<{
    role: "user" | "model";
    parts: Array<{ text: string }>;
  }>
): Promise<string> {
  try {
    const model = "gemini-2.0-flash-exp";

    // Tạo context cho AI
    const systemPrompt = `
Bạn là một trợ lý AI thông minh và thân thiện của siêu thị trực tuyến. 
Nhiệm vụ của bạn là hỗ trợ khách hàng với các câu hỏi về:
- Sản phẩm và giá cả
- Đơn hàng và giao hàng
- Khuyến mãi và ưu đãi
- Hướng dẫn sử dụng website
- Giải đáp thắc mắc chung

Hãy trả lời một cách:
- Lịch sự, thân thiện
- Rõ ràng, súc tích
- Chính xác và hữu ích
- Bằng tiếng Việt
`;

    // Xây dựng contents
    const contents: Array<{
      role: "user" | "model";
      parts: Array<{
        text?: string;
        inlineData?: { mimeType: string; data: string };
      }>;
    }> = [];

    // Thêm system prompt
    contents.push({
      role: "user",
      parts: [{ text: systemPrompt }],
    });

    contents.push({
      role: "model",
      parts: [
        {
          text: "Xin chào! Tôi là trợ lý AI của siêu thị. Tôi sẵn sàng giúp bạn!",
        },
      ],
    });

    // Thêm lịch sử hội thoại nếu có
    if (conversationHistory && conversationHistory.length > 0) {
      contents.push(...conversationHistory);
    }

    // Thêm tin nhắn hiện tại
    const userParts: Array<{
      text?: string;
      inlineData?: { mimeType: string; data: string };
    }> = [];

    if (imageBase64) {
      // Xử lý ảnh nếu có
      const base64Data = imageBase64.split(",")[1] || imageBase64;
      const mimeType = imageBase64.match(/data:(.*?);/)?.[1] || "image/jpeg";

      userParts.push({
        inlineData: {
          mimeType,
          data: base64Data,
        },
      });

      // Thêm text kèm theo
      if (message.trim()) {
        userParts.push({ text: message });
      } else {
        userParts.push({
          text: "Hãy phân tích ảnh này và cho tôi biết thông tin chi tiết.",
        });
      }
    } else {
      userParts.push({ text: message });
    }

    contents.push({
      role: "user",
      parts: userParts,
    });

    // Gọi API
    const response = await ai.models.generateContent({
      model,
      contents,
    });

    // Lấy text từ response
    let responseText = "";
    if (response.text) {
      responseText = response.text.trim();
    }

    return (
      responseText ||
      "Xin lỗi, tôi không thể xử lý yêu cầu này. Vui lòng thử lại."
    );
  } catch (error) {
    console.error("Error calling Gemini API for chat:", error);
    throw new Error("Không thể kết nối với AI. Vui lòng thử lại sau.");
  }
}

/**
 * Tạo conversation ID mới
 */
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

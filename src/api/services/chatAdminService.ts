import api from "../axiosConfig";

interface CreateConversationResponse {
  conversation_id: string;
  is_new: boolean;
  state: string;
}

export interface CreateMessageResponse {
  _id: string;
  conversation_id: string;
  sender_type: "USER" | "STAFF" | "SYSTEM";
  sender_id?: string;
  text?: string;
  is_read: boolean;
  createdAt: string;
  updatedAt: string;
}

class ChatService {
  private readonly basePath = "/conversations";

  async createConversation(userId?: string) {
    const response = await api.post<CreateConversationResponse>(this.basePath, {
      userId,
    });
    return response.data;
  }

  async sendMessage(conversationId: string, text: string, files?: File[]) {
    const formData = new FormData();
    if (text) {
      formData.append("text", text);
    }
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await api.post<CreateMessageResponse>(
      `${this.basePath}/${conversationId}/messages`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  async sendStaffMessage(conversationId: string, text: string, files?: File[]) {
    const formData = new FormData();
    if (text) {
      formData.append("text", text);
    }
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    const response = await api.post<CreateMessageResponse>(
      `${this.basePath}/${conversationId}/messages/staff`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }
}

export default new ChatService();

// async sendStaffMessage(conversationId: string, text: string, files?: File[]): Promise<CreateMessageResponse> {
//     const formData = new FormData();
//     if (text) {
//       formData.append("text", text);
//     }
//     if (files && files.length > 0) {
//       files.forEach((file) => {
//         formData.append("files", file);
//       });
//     }

//     const response = await api.post<CreateMessageResponse>(
//       `${this.basePath}/${conversationId}/messages/staff`,
//       formData,
//       {
//         headers: {
//           "Content-Type": "multipart/form-data",
//         },
//       }
//     );
//     return response.data;
//   }

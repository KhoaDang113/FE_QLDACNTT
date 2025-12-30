import api from "../axiosConfig";
import { type CreateMessageResponse } from "./chatAdminService";
export type SenderType = "user" | "staff" | "admin";
export type SenderType2 = "USER" | "STAFF" | "ADMIN";

export interface StaffConversation {
  id?: string;
  _id?: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  sender_type: SenderType2;
  last_message: string;
  last_message_at: string;
  created_at: string;
  is_active: boolean;
  unread_count: number;
}

export interface StaffMessage {
  id: string;
  conversation_id: string;
  sender_type: SenderType;
  sender_name: string;
  content: string;
  created_at: string; // ISO string
  is_read: boolean;
}

type PresenceStatus = "ONLINE" | "AWAY" | "OFFLINE";
type PresenceResponse = { ok: boolean };

class StaffService {
  private readonly basePath = "/staff";

  async setOnline(max?: number): Promise<PresenceResponse> {
    const body: { status: PresenceStatus; max?: number } = {
      status: "ONLINE",
    };

    if (max !== undefined) {
      body.max = max;
    }

    const response = await api.post<PresenceResponse>(
      `${this.basePath}/presence`,
      body
    );

    return response.data;
  }

  async setOffline(): Promise<PresenceResponse> {
    const response = await api.post<PresenceResponse>(
      `${this.basePath}/presence`,
      {
        status: "OFFLINE",
      }
    );

    return response.data;
  }

  async getConversations(
    state?: string,
    limit?: number,
    skip?: number,
    search?: string
  ) {
    const response = await api.get(`${this.basePath}/conversations`, {
      params: { state, limit, skip, search },
      withCredentials: true,
    });
    return response.data.conversations as StaffConversation[];
  }

  async getConversationDetail(conversationId: string) {
    const response = await api.get(
      `${this.basePath}/conversations/${conversationId}`,
      { withCredentials: true }
    );
    return response.data;
  }

  async getConversationMessages(
    conversationId: string
  ): Promise<StaffMessage[]> {
    const response = await api.get(
      `${this.basePath}/conversations/${conversationId}/messages`,
      {
        withCredentials: true,
      }
    );
    return response.data;
  }

  async sendStaffMessage(conversationId: string, text: string) {
    const response = await api.post<CreateMessageResponse>(
      `${this.basePath}/${conversationId}/messages/staff`,
      { text }
    );
    return response.data;
  }

  async markAsRead(conversationId: string) {
    const response = await api.patch(
      `${this.basePath}/conversations/${conversationId}/read`,
      {},
      { withCredentials: true }
    );
    return response.data;
  }

  async getStats() {
    const response = await api.get(`${this.basePath}/stats`, {
      withCredentials: true,
    });
    return response.data;
  }
}

export default new StaffService();

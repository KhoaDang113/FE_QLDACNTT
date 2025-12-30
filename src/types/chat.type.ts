// Types cho Chat theo database schema

export interface ChatConversation {
  id: number;
  user_id: number;
  conversation_id: string;
  last_message_at: string; // timestamp
  created_at: string; // datetime
  is_active: boolean;
}

export interface ChatMessage {
  id: number;
  message_id: number;
  conversation_id: string;
  sender_type: "user" | "ai" | "admin";
  content: string;
  created_at: string; // datetime
  image?: string; // Optional field for image data
}

// Type cho UI component
export interface Message {
  id: string;
  text: string;
  sender_type: "USER" | "AI" | "STAFF";
  image?: string;
  timestamp?: string;
}

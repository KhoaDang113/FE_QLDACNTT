"use client";

import { useState } from "react";
import { MessageCircle, X } from "lucide-react";
import chatService from "@/api/services/chatAdminService";
import { AdminChat } from "./AdminChat";

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const openAdminChat = async () => {
    if (!isOpen) {
      let convId = localStorage.getItem("conversation_id");
      if (!convId) {
        const res = await chatService.createConversation();
        convId = res.conversation_id as string;
        localStorage.setItem("conversation_id", convId);
      }
      setConversationId(convId);
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={openAdminChat}
        className="fixed bottom-20 right-6 w-14 h-14 bg-slate-800 hover:bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg transition-all duration-200 hover:scale-110 z-40"
        aria-label="Open chat with admin"
      >
        {isOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <MessageCircle className="w-6 h-6" />
        )}
      </button>

      {/* Admin Chat */}
      {isOpen && conversationId && (
        <div className="fixed inset-0 md:inset-auto md:bottom-40 md:right-8 z-50 flex items-end md:items-start justify-center md:block">
          <AdminChat
            conversationId={conversationId}
            onBack={() => setIsOpen(false)}
          />
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageList } from "@/components/messages/MessageList";
import { ReplyForm } from "@/components/messages/ReplyForm";
import { ArrowLeft, Mail, Phone } from "lucide-react";
import StaffService from "@/api/services/staffService";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";

// Mock conversation data
interface ConversationType {
  id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  current_agent_id?: {
    _id: string;
    name: string;
    avatar?: string;
  };
  created_at?: Date;
  // is_active: boolean;
}

export default function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [conversation, setConversation] = useState<ConversationType>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const data = await StaffService.getConversationDetail(id as string);
        setConversation(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [id]);

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-[600px] bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200/60">
      {/* Header */}
      {loading ? (
        <div className="p-6 bg-gradient-to-r from-emerald-500 to-teal-600">
          <div className="flex items-center gap-4 animate-pulse">
            <div className="w-14 h-14 rounded-full bg-white/20" />
            <div className="flex-1">
              <div className="h-5 w-32 bg-white/20 rounded mb-2" />
              <div className="h-4 w-48 bg-white/20 rounded" />
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 p-4 flex-shrink-0 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Back button */}
              <Link to="/staff/messages">
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-10 h-10 p-0 text-white hover:bg-white/20 rounded-xl transition-all duration-200 hover:scale-105"
                >
                  <ArrowLeft className="w-5 h-5" />
                </Button>
              </Link>

              {/* User info */}
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={conversation?.user_id.avatar || DEFAULT_AVATAR_URL}
                    alt="avatar"
                    className="w-14 h-14 rounded-full object-cover ring-3 ring-white/30 shadow-lg"
                  />
                  {/* Online indicator */}
                  <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white drop-shadow-sm">
                    {conversation?.user_id.name}
                  </h2>
                  <div className="flex items-center gap-2 text-white/80 text-sm">
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[150px] md:max-w-[200px]">
                      {conversation?.user_id.email}
                    </span>
                    {conversation?.user_id.phone && (
                      <>
                        <span className="text-white/50">•</span>
                        <Phone className="w-3.5 h-3.5" />
                        <span>{conversation?.user_id.phone}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <MessageList />

      {/* Reply Form - Fixed at bottom */}
      <ReplyForm />
    </div>
  );
}

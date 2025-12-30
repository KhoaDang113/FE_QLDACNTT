import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageList } from "@/components/messages/MessageList";
import { ReplyForm } from "@/components/messages/ReplyForm";
import { ArrowLeft, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  // const [isActive, setIsActive] = useState();
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

  const handleEndConversation = () => {
    // setIsActive(false);
  };

  const handleDeleteConversation = () => {
    // Handle delete logic
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] lg:h-[500px] bg-background rounded-2xl">
      {/* Header */}
      {loading ? (
        <div className="px-6 py-12 text-center text-muted-foreground">
          Đang tải tên người dùng...
        </div>
      ) : (
        <div className="border-b border-border p-4 flex items-center justify-between bg-card flex-shrink-0">
          <div className="flex items-center gap-4">
            <Link to="/staff/messages">
              <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div className="flex items-center gap-3">
              <img
                src={conversation?.user_id.avatar || DEFAULT_AVATAR_URL}
                alt="avatar"
                className="w-12 h-12 rounded-full object-cover p-1 border border-gray-300 mb-2"
              />
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  {conversation?.user_id.name}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {conversation?.user_id.email} • {conversation?.user_id.phone}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="w-10 h-10 p-0">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleEndConversation}>
                  Kết thúc hội thoại
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={handleDeleteConversation}
                >
                  Xóa hội thoại
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      )}

      <MessageList />

      {/* Reply Form - Fixed at bottom */}
      <ReplyForm />
    </div>
  );
}

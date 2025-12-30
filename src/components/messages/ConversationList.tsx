import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { Button } from "@/components/ui/button";
// import { Badge } from "@/components/ui/badge";
import { MessageSquare } from "lucide-react";
import StaffService, {
  type StaffConversation,
} from "@/api/services/staffService";
import { useEffect, useState } from "react";
import { getSocket } from "@/lib/socket";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";

interface ConversationListProps {
  search: string;
}

export function ConversationList({ search }: ConversationListProps) {
  const [conversations, setConversations] = useState<StaffConversation[]>([]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    const fetchConversations = async () => {
      setLoading(true);
      try {
        const data = await StaffService.getConversations(
          undefined,
          50,
          0,
          search
        );
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, [search]);

  useEffect(() => {
    const socket = getSocket();
    const handleNewAssignment = async (data: { conversation_id: string }) => {
      try {
        const conv = await StaffService.getConversationDetail(
          data.conversation_id
        );
        if (
          search &&
          !conv.user_id.name.toLowerCase().includes(search.toLowerCase()) &&
          !conv.user_id.email.toLowerCase().includes(search.toLowerCase())
        ) {
          return;
        }

        setConversations((prev) => {
          const exists = prev.some((c) => {
            const id = (c as any).id ?? (c as any)._id;
            return id === data.conversation_id;
          });

          if (exists) return prev;

          return [conv, ...prev];
        });
      } catch (err) {
        console.error("Error fetching new assigned conversation:", err);
      }
    };

    const handleConversationClosed = (data: { conversation_id: string }) => {
      setConversations((prev) => {
        const next = prev.filter((c) => {
          const id = (c as any).id ?? (c as any)._id;
          return id !== data.conversation_id;
        });
        return next;
      });
    };

    socket.on("assignment.new_conversation", handleNewAssignment);
    socket.on("conversation.closed", handleConversationClosed);
    return () => {
      socket.off("assignment.new_conversation", handleNewAssignment);
      socket.off("conversation.closed", handleConversationClosed);
    };
  }, [search]);

  return (
    <div className="bg-card rounded-lg border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-muted/50 px-6 py-3 border-b border-border">
        <div className="grid grid-cols-12 gap-4 text-sm font-semibold text-foreground">
          <div className="col-span-3">Khách hàng</div>
          <div className="col-span-4">Tin nhắn gần nhất</div>
          <div className="col-span-2">Thời gian</div>
          <div className="col-span-1">Hành động</div>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
        {loading ? (
          <div className="px-6 py-12 text-center text-muted-foreground">
            Đang tải danh sách hội thoại...
          </div>
        ) : conversations.length > 0 ? (
          conversations.map((conv) => (
            <div
              key={conv.user_id._id}
              className="px-6 py-4 hover:bg-muted/30 transition-colors"
            >
              <div className="grid grid-cols-12 gap-4 items-center">
                {/* Customer Info */}
                <div className="col-span-3 flex flex-row justify-start items-center gap-3">
                  <img
                    src={conv.user_id.avatar || DEFAULT_AVATAR_URL}
                    alt="avatar"
                    className="w-7 h-7 rounded-full hidden md:block"
                  />
                  <div>
                    <p className="font-medium text-foreground truncate line-clamp-1 w-[30px] lg:w-[120px]">
                      {conv.user_id.name}
                    </p>
                    <p className="text-sm text-muted-foreground truncate line-clamp-1 w-[30px] lg:w-[120px]">
                      {conv.user_id.email}
                    </p>
                  </div>
                </div>

                {/* Last Message */}
                <div className="col-span-4">
                  <div className="flex items-center gap-2">
                    {/*{conv.unread_count > 0 && (
                      <Badge
                        variant="default"
                        className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center p-0"
                      >
                        {conv.unread_count}
                      </Badge>
                    )}*/}
                    <p className="text-sm text-foreground truncate">
                      {conv.sender_type === "STAFF"
                        ? `Bạn: ${conv.last_message}`
                        : conv.last_message}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(conv?.last_message_at, {
                      addSuffix: true,
                      locale: vi,
                    })}
                  </p>
                </div>

                {/* Action */}
                <div className="col-span-1 flex-shrink-0">
                  <Link to={`/staff/messages/${conv._id}`}>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="w-10 h-10 p-0 item-center justify-center"
                    >
                      <span className="text-sm">Chat</span>
                      {/* <ChevronRight className="w-4 h-4 " /> */}
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="px-6 py-12 text-center">
            <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Không tìm thấy cuộc hội thoại nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

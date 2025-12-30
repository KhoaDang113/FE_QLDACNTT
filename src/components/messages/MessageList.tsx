import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getSocket } from "@/lib/socket";
import { useParams } from "react-router-dom";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";
import { FileIcon, Download } from "lucide-react";

// ===== Types từ server =====
interface ServerSender {
  _id: string;
  name?: string;
  avatar?: string;
}

interface ServerMessage {
  _id: string;
  conversation_id: string;
  sender_type: "USER" | "STAFF" | "SYSTEM";
  sender_id?: ServerSender | null;
  text?: string;
  is_read?: boolean;
  createdAt?: string | Date;
  created_at?: string | Date;
}

// ===== Types dùng trong FE =====
interface Attachment {
  url: string;
  type: "image" | "file";
  name?: string;
  size?: number;
  mimetype?: string;
}

interface Message {
  id: string;
  conversation_id: string;
  sender_type: "USER" | "STAFF" | "SYSTEM";
  sender_name: string;
  avatar?: string | null;
  text: string;
  created_at?: string | Date;
  createdAt?: string | Date;
  is_read?: boolean;
  attachments?: Attachment[];
}

interface AdminMessage extends Message {
  file?: { name: string; type: string };
}

// Helper: ép kiểu Date cho an toàn
function getValidDate(input: unknown): Date | null {
  if (!input) return null;

  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input;
  }

  if (typeof input === "string" || typeof input === "number") {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

// Helper: map từ server → FE
function mapServerToAdminMessage(m: ServerMessage): AdminMessage {
  const sender = m.sender_id;
  const fallbackName =
    m.sender_type === "STAFF"
      ? "Nhân viên"
      : m.sender_type === "SYSTEM"
      ? "Hệ thống"
      : "Người dùng";

  return {
    id: m._id,
    conversation_id: m.conversation_id,
    sender_type: m.sender_type,
    sender_name: sender?.name ?? fallbackName,
    avatar: sender?.avatar ?? null,
    text: m.text ?? "",
    created_at: m.created_at ?? m.createdAt,
    createdAt: m.createdAt ?? m.created_at,
    is_read: m.is_read,
    attachments: (m as any).attachments || [],
  };
}

export function MessageList() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<AdminMessage[]>([]);

  const { id } = useParams<{ id: string }>();
  const conversationId = id || "";

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [conversationId, messages]);

  // Socket: join room + nhận history + tin nhắn mới
  useEffect(() => {
    if (!conversationId) return;

    const socket = getSocket();

    socket.emit("join_conversation", { conversation_id: conversationId });

    const onHistory = (history: ServerMessage[]) => {
      const normalized = history.map(mapServerToAdminMessage);
      setMessages(normalized);
    };

    const onNewMessage = (msg: ServerMessage) => {
      if (msg.conversation_id !== conversationId) return;

      setMessages((prev) => [...prev, mapServerToAdminMessage(msg)]);
    };

    socket.on("history.messages", onHistory);
    socket.on("message.new", onNewMessage);

    return () => {
      socket.off("history.messages", onHistory);
      socket.off("message.new", onNewMessage);
    };
  }, [conversationId]);

  return (
    <div
      className="flex-1 overflow-y-auto overflow-x-hidden p-6 space-y-4 bg-muted/30"
      ref={scrollContainerRef}
    >
      {messages.map((message, index) => {
        const displayName = message.sender_name;

        const rawCreated = message.created_at ?? message.createdAt;
        const createdDate = getValidDate(rawCreated);

        let timeLabel = "Vừa xong";
        if (createdDate) {
          try {
            timeLabel = formatDistanceToNow(createdDate, {
              addSuffix: true,
              locale: vi,
            });
          } catch (e) {
            console.error("Error formatting date:", rawCreated, e);
          }
        }

        const isRight =
          message.sender_type === "STAFF" || message.sender_type === "SYSTEM";

        return (
          <div
            key={message.id ?? index.toString()}
            className={cn("flex gap-3", isRight && "flex-row-reverse")}
          >
            {/* Avatar */}
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-semibold text-white",
                message.sender_type === "STAFF"
                  ? "bg-blue-600"
                  : message.sender_type === "SYSTEM"
                  ? "bg-gray-600"
                  : "bg-green-600"
              )}
            >
              {message.avatar ? (
                <img
                  src={message.avatar}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <img
                  src={DEFAULT_AVATAR_URL}
                  alt={displayName}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
            </div>

            {/* Message content */}
            <div className={cn("flex flex-col gap-1 max-w-md justify-start")}>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-foreground">
                  {displayName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {timeLabel}
                </span>
              </div>

              {/* Text message */}
              {message.text && (
                <div
                  className={cn(
                    "px-4 py-2 rounded-lg break-words",
                    message.sender_type === "STAFF"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : message.sender_type === "SYSTEM"
                      ? "bg-gray-100 border border-border rounded-bl-none"
                      : "bg-card border border-border rounded-bl-none"
                  )}
                >
                  <p className="text-sm">{message.text}</p>
                </div>
              )}

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-col gap-2 mt-1">
                  {message.attachments.map((attachment, idx) => (
                    <div key={idx}>
                      {attachment.type === "image" ? (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block"
                        >
                          <img
                            src={attachment.url}
                            alt={attachment.name || "Image"}
                            className="max-w-xs rounded-lg border border-border hover:opacity-90 transition-opacity cursor-pointer"
                          />
                        </a>
                      ) : (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center gap-2 px-3 py-2 rounded-lg border hover:bg-muted/50 transition-colors",
                            message.sender_type === "STAFF"
                              ? "bg-blue-500 text-white border-blue-400"
                              : "bg-card border-border"
                          )}
                        >
                          <FileIcon className="w-5 h-5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {attachment.name || "File"}
                            </p>
                            {attachment.size && (
                              <p className="text-xs opacity-75">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </p>
                            )}
                          </div>
                          <Download className="w-4 h-4 flex-shrink-0" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

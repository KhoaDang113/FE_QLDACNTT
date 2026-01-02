import { useEffect, useRef, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { getSocket } from "@/lib/socket";
import { useParams } from "react-router-dom";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";
import { FileIcon, Download, CheckCheck } from "lucide-react";

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
      className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 space-y-6"
      style={{
        background: "linear-gradient(180deg, rgba(248,250,252,0.8) 0%, rgba(241,245,249,0.9) 100%)",
      }}
      ref={scrollContainerRef}
    >
      {messages.length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-center py-12">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center mb-4 shadow-lg">
            <svg className="w-10 h-10 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-slate-500 font-medium">Chưa có tin nhắn nào</p>
          <p className="text-slate-400 text-sm mt-1">Bắt đầu cuộc trò chuyện ngay!</p>
        </div>
      )}

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

        const isStaff = message.sender_type === "STAFF";
        const isSystem = message.sender_type === "SYSTEM";
        const isRight = isStaff || isSystem;

        // Check if we should show the avatar (first message or different sender from previous)
        const prevMessage = index > 0 ? messages[index - 1] : null;
        const showAvatar = !prevMessage || prevMessage.sender_type !== message.sender_type;

        return (
          <div
            key={message.id ?? index.toString()}
            className={cn(
              "flex gap-3 animate-in slide-in-from-bottom-2 duration-300",
              isRight ? "flex-row-reverse" : "flex-row"
            )}
            style={{ animationDelay: `${Math.min(index * 50, 300)}ms` }}
          >
            {/* Avatar */}
            <div
              className={cn(
                "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-md ring-2 ring-white transition-all duration-200 hover:scale-105",
                showAvatar ? "opacity-100" : "opacity-0"
              )}
            >
              <img
                src={message.avatar || DEFAULT_AVATAR_URL}
                alt={displayName}
                className="w-10 h-10 rounded-full object-cover"
              />
            </div>

            {/* Message content */}
            <div className={cn(
              "flex flex-col gap-1.5 max-w-[75%] md:max-w-md",
              isRight ? "items-end" : "items-start"
            )}>
              {/* Sender info */}
              {showAvatar && (
                <div className={cn(
                  "flex items-center gap-2 px-1",
                  isRight ? "flex-row-reverse" : "flex-row"
                )}>
                  <span className={cn(
                    "text-xs font-semibold",
                    isStaff ? "text-emerald-600" : isSystem ? "text-slate-500" : "text-slate-700"
                  )}>
                    {displayName}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {timeLabel}
                  </span>
                </div>
              )}

              {/* Text message bubble */}
              {message.text && (
                <div
                  className={cn(
                    "px-4 py-2.5 rounded-2xl break-words shadow-sm transition-all duration-200 hover:shadow-md relative group",
                    isStaff
                      ? "bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-tr-md"
                      : isSystem
                        ? "bg-gradient-to-br from-slate-100 to-slate-200 text-slate-700 rounded-tl-md border border-slate-200/50"
                        : "bg-white text-slate-800 rounded-tl-md border border-slate-200/50 shadow-sm"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>

                  {/* Time tooltip on hover */}
                  {!showAvatar && (
                    <div className={cn(
                      "absolute -bottom-5 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-slate-400 whitespace-nowrap",
                      isRight ? "right-0" : "left-0"
                    )}>
                      {timeLabel}
                    </div>
                  )}

                  {/* Read indicator for staff messages */}
                  {isStaff && message.is_read && (
                    <div className="absolute -bottom-4 right-1 flex items-center gap-0.5">
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                  )}
                </div>
              )}

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-col gap-2 mt-1">
                  {message.attachments.map((attachment, idx) => (
                    <div key={idx} className="animate-in fade-in duration-300">
                      {attachment.type === "image" ? (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block group"
                        >
                          <div className="relative overflow-hidden rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                            <img
                              src={attachment.url}
                              alt={attachment.name || "Image"}
                              className="max-w-xs rounded-xl object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 rounded-xl" />
                          </div>
                        </a>
                      ) : (
                        <a
                          href={attachment.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={cn(
                            "flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 hover:scale-[1.02] hover:shadow-md",
                            isStaff
                              ? "bg-gradient-to-r from-emerald-500/90 to-teal-500/90 text-white border-emerald-400/30"
                              : "bg-white border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/30"
                          )}
                        >
                          <div className={cn(
                            "w-10 h-10 rounded-lg flex items-center justify-center",
                            isStaff ? "bg-white/20" : "bg-emerald-100"
                          )}>
                            <FileIcon className={cn(
                              "w-5 h-5",
                              isStaff ? "text-white" : "text-emerald-600"
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm font-medium truncate",
                              isStaff ? "text-white" : "text-slate-700"
                            )}>
                              {attachment.name || "File"}
                            </p>
                            {attachment.size && (
                              <p className={cn(
                                "text-xs",
                                isStaff ? "text-white/75" : "text-slate-400"
                              )}>
                                {(attachment.size / 1024).toFixed(1)} KB
                              </p>
                            )}
                          </div>
                          <Download className={cn(
                            "w-4 h-4 flex-shrink-0",
                            isStaff ? "text-white/80" : "text-emerald-500"
                          )} />
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

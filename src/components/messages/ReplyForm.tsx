import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Smile, X, FileIcon, Send } from "lucide-react";
import chatAdminService from "@/api/services/chatAdminService";
import { useParams } from "react-router-dom";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";

export function ReplyForm() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const { id } = useParams<{ id: string }>();
  const conversationId = id || "";

  const handleSendMessage = async () => {
    if (!message.trim() && selectedFiles.length === 0) return;

    setIsLoading(true);
    try {
      await chatAdminService.sendStaffMessage(
        conversationId,
        message.trim(),
        selectedFiles.length > 0 ? selectedFiles : undefined
      );
      setMessage("");
      setSelectedFiles([]);
      setShowEmojiPicker(false);
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Nhấn Enter để gửi, Shift+Enter để xuống dòng
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Limit to 5 files
      const newFiles = [...selectedFiles, ...filesArray].slice(0, 5);
      setSelectedFiles(newFiles);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  const isImage = (file: File) => file.type.startsWith("image/");

  return (
    <div className="border-t border-slate-200/80 bg-white/80 backdrop-blur-sm flex-shrink-0 relative">
      {/* File preview */}
      {selectedFiles.length > 0 && (
        <div className="px-4 pt-3 pb-2 border-b border-slate-100">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="relative group animate-in slide-in-from-bottom-2 duration-200 flex-shrink-0"
              >
                {isImage(file) ? (
                  <div className="relative">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-20 h-20 object-cover rounded-xl border-2 border-slate-100 shadow-sm"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <div className="relative bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-3 flex items-center gap-2 min-w-[160px] border border-slate-200 shadow-sm">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileIcon className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-700 truncate">
                        {file.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 hover:scale-110"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {selectedFiles.length}/5 tệp đã chọn
          </p>
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="absolute bottom-full left-4 mb-2 z-50 animate-in slide-in-from-bottom-2 duration-200 shadow-xl rounded-xl overflow-hidden"
        >
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            width={320}
            height={400}
          />
        </div>
      )}

      {/* Input area */}
      <div className="p-4">
        <div className="flex items-end gap-2 bg-slate-50/80 rounded-2xl p-2 border border-slate-200/60 shadow-sm transition-all duration-200 focus-within:border-emerald-300 focus-within:shadow-md focus-within:bg-white">
          {/* File attachment button */}
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.csv,.zip,.rar"
            onChange={handleFileSelect}
            className="hidden"
          />

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 h-9 w-9 p-0 flex-shrink-0 rounded-xl transition-all duration-200",
                selectedFiles.length >= 5 && "opacity-50 cursor-not-allowed"
              )}
              title="Đính kèm file"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading || selectedFiles.length >= 5}
            >
              <Paperclip className="w-5 h-5" />
            </Button>

            {/* Emoji button */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                "text-slate-400 hover:text-amber-500 hover:bg-amber-50 h-9 w-9 p-0 flex-shrink-0 rounded-xl transition-all duration-200",
                showEmojiPicker && "bg-amber-50 text-amber-500"
              )}
              title="Chọn emoji"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              disabled={isLoading}
            >
              <Smile className="w-5 h-5" />
            </Button>
          </div>

          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <Textarea
              placeholder="Nhập tin nhắn..."
              className="resize-none min-h-[38px] max-h-32 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-sm placeholder:text-slate-400 p-2"
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>

          {/* Send button */}
          <Button
            className={cn(
              "h-10 w-10 p-0 rounded-xl shadow-md transition-all duration-300 flex-shrink-0",
              message.trim() || selectedFiles.length > 0
                ? "bg-gradient-to-br from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:scale-105"
                : "bg-slate-200 hover:bg-slate-300 shadow-none"
            )}
            onClick={handleSendMessage}
            disabled={
              isLoading || (!message.trim() && selectedFiles.length === 0)
            }
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send className={cn(
                "w-5 h-5 transition-colors",
                message.trim() || selectedFiles.length > 0 ? "text-white" : "text-slate-400"
              )} />
            )}
          </Button>
        </div>

        {/* Quick tips */}
        <div className="flex items-center justify-between mt-2 px-1">
          <p className="text-[10px] text-slate-400">
            <span className="hidden sm:inline">Nhấn </span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-mono">Enter</kbd>
            <span className="hidden sm:inline"> để gửi, </span>
            <span className="sm:hidden"> gửi • </span>
            <kbd className="px-1.5 py-0.5 bg-slate-100 rounded text-[9px] font-mono">Shift + Enter</kbd>
            <span className="hidden sm:inline"> để xuống dòng</span>
          </p>
        </div>
      </div>
    </div>
  );
}

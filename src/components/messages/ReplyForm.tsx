import React, { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Paperclip, Smile, X, FileIcon, Send } from "lucide-react";
import chatAdminService from "@/api/services/chatAdminService";
import { useParams } from "react-router-dom";
import EmojiPicker, { type EmojiClickData } from "emoji-picker-react";
import { Input } from "../ui/input";

export function ReplyForm() {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
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

  return (
    <div className="border-t border-border bg-card flex-shrink-0">
      {/* File preview */}
      {selectedFiles.length > 0 && (
        <div className="p-3 border-b border-border flex gap-2 flex-wrap">
          {selectedFiles.map((file, index) => (
            <div
              key={index}
              className="relative group bg-muted rounded-lg p-2 flex items-center gap-2 max-w-[200px]"
            >
              {file.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt={file.name}
                  className="w-12 h-12 object-cover rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <FileIcon className="w-6 h-6 text-gray-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-50">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}

      {/* Input area */}
      <div className="p-4">
        <div className="flex items-end gap-2">
          {/* File attachment button */}
          <Input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.ppt,.pptx,.csv,.zip,.rar"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground h-10 w-10 p-0 flex-shrink-0"
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
            className="text-muted-foreground hover:text-foreground h-10 w-10 p-0 flex-shrink-0"
            title="Chọn emoji"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={isLoading}
          >
            <Smile className="w-5 h-5" />
          </Button>

          {/* Textarea */}
          <div className="flex-1">
            <Textarea
              placeholder="Nhập tin nhắn..."
              className="resize-none min-h-[40px] max-h-32"
              rows={1}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
            />
          </div>

          {/* Send button */}
          <Button
            className="bg-green-600 hover:bg-green-700 h-10 w-10 p-0"
            onClick={handleSendMessage}
            disabled={
              isLoading || (!message.trim() && selectedFiles.length === 0)
            }
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

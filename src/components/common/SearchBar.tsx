import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search, X, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  storageKey?: string; // Key để lưu lịch sử tìm kiếm
  onSearch?: (value: string) => void; // Callback khi nhấn Enter
  showRecentSearches?: boolean;
}

export function SearchBar({
  value,
  onChange,
  placeholder = "Tìm kiếm...",
  className,
  storageKey = "search_history",
  onSearch,
  showRecentSearches = true,
}: SearchBarProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load lịch sử tìm kiếm từ localStorage
  useEffect(() => {
    if (showRecentSearches) {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setRecentSearches(Array.isArray(parsed) ? parsed : []);
        } catch {
          setRecentSearches([]);
        }
      }
    }
  }, [storageKey, showRecentSearches]);

  // Lưu từ khóa tìm kiếm vào lịch sử
  const saveToHistory = (searchTerm: string) => {
    if (!showRecentSearches || !searchTerm.trim()) return;

    const trimmed = searchTerm.trim();
    const updated = [
      trimmed,
      ...recentSearches.filter((s) => s !== trimmed),
    ].slice(0, 5); // Giữ tối đa 5 từ khóa gần nhất

    setRecentSearches(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // Xử lý thay đổi input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
  };

  // Xử lý khi nhấn Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      const trimmed = value.trim();
      if (trimmed) {
        saveToHistory(trimmed);
        if (onSearch) {
          onSearch(trimmed);
        }
      }
      setIsFocused(false);
      inputRef.current?.blur();
    } else if (e.key === "Escape") {
      setIsFocused(false);
      inputRef.current?.blur();
    }
  };

  // Xử lý click vào từ khóa gợi ý
  const handleRecentClick = (searchTerm: string) => {
    onChange(searchTerm);
    if (onSearch) {
      onSearch(searchTerm);
    }
    setIsFocused(false);
  };

  // Xóa một từ khóa khỏi lịch sử
  const removeFromHistory = (searchTerm: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = recentSearches.filter((s) => s !== searchTerm);
    setRecentSearches(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  // Xóa toàn bộ lịch sử
  const clearHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches([]);
    localStorage.removeItem(storageKey);
  };

  // Xóa nội dung input
  const clearInput = () => {
    onChange("");
    inputRef.current?.focus();
  };

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const showDropdown =
    isFocused && showRecentSearches && recentSearches.length > 0 && !value;

  return (
    <div className={cn("relative", className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          className="pl-10 pr-10"
        />
        {value && (
          <button
            onClick={clearInput}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown gợi ý tìm kiếm gần đây */}
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
        >
          <div className="p-2">
            <div className="flex items-center justify-between px-2 py-1 mb-1">
              <span className="text-xs text-muted-foreground font-medium">
                Tìm kiếm gần đây
              </span>
              <button
                onClick={clearHistory}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                type="button"
              >
                Xóa tất cả
              </button>
            </div>
            <div className="space-y-1">
              {recentSearches.map((searchTerm, index) => (
                <div
                  key={index}
                  onClick={() => handleRecentClick(searchTerm)}
                  className="flex items-center justify-between px-2 py-2 hover:bg-accent rounded-md cursor-pointer group"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Clock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-sm truncate">{searchTerm}</span>
                  </div>
                  <button
                    onClick={(e) => removeFromHistory(searchTerm, e)}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-foreground transition-all flex-shrink-0 ml-2"
                    type="button"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}


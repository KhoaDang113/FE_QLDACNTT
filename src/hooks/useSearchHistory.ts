import { useState, useEffect, useCallback } from "react";

const SEARCH_HISTORY_KEY = "search_history";
const MAX_HISTORY_ITEMS = 5;

export function useSearchHistory() {
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Load lịch sử từ localStorage khi component mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSearchHistory(parsed);
      }
    } catch (error) {
      console.error("Error loading search history:", error);
    }
  }, []);

  // Thêm từ khóa vào lịch sử
  const addToHistory = useCallback((searchTerm: string) => {
    const trimmed = searchTerm.trim();
    if (!trimmed) return;

    setSearchHistory((prev) => {
      // Loại bỏ từ khóa nếu đã tồn tại
      const filtered = prev.filter((item) => item !== trimmed);
      // Thêm từ khóa mới lên đầu
      const newHistory = [trimmed, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      
      // Lưu vào localStorage
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error("Error saving search history:", error);
      }
      
      return newHistory;
    });
  }, []);

  // Xóa một từ khóa khỏi lịch sử
  const removeFromHistory = useCallback((searchTerm: string) => {
    setSearchHistory((prev) => {
      const newHistory = prev.filter((item) => item !== searchTerm);
      
      try {
        localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(newHistory));
      } catch (error) {
        console.error("Error saving search history:", error);
      }
      
      return newHistory;
    });
  }, []);

  // Xóa toàn bộ lịch sử
  const clearHistory = useCallback(() => {
    setSearchHistory([]);
    try {
      localStorage.removeItem(SEARCH_HISTORY_KEY);
    } catch (error) {
      console.error("Error clearing search history:", error);
    }
  }, []);

  return {
    searchHistory,
    addToHistory,
    removeFromHistory,
    clearHistory,
  };
}


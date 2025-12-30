"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Article } from "@/types/article.type";

interface ArticleProps {
  article: Article;
  variant?: "default" | "compact" | "expanded";
  maxExcerptLength?: number;
}

export default function Article({
  article,
  variant = "default",
  maxExcerptLength = 200,
}: ArticleProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Tạo excerpt từ content
  const displayExcerpt =
    article.content.length > maxExcerptLength
      ? article.content.substring(0, maxExcerptLength) + "..."
      : article.content;

  const getContainerStyles = () => {
    switch (variant) {
      case "compact":
        return "p-4 bg-white rounded-lg shadow-sm border";
      case "expanded":
        return "p-6 bg-white rounded-xl shadow-lg border";
      case "default":
      default:
        return "p-5 bg-white rounded-lg shadow-sm border";
    }
  };

  const getTitleStyles = () => {
    switch (variant) {
      case "compact":
        return "text-lg font-bold text-gray-800 mb-3";
      case "expanded":
        return "text-2xl font-bold text-gray-800 mb-4";
      case "default":
      default:
        return "text-xl font-bold text-gray-800 mb-3";
    }
  };

  const getContentStyles = () => {
    switch (variant) {
      case "compact":
        return "text-sm text-gray-600 leading-relaxed";
      case "expanded":
        return "text-base text-gray-600 leading-relaxed";
      case "default":
      default:
        return "text-sm text-gray-600 leading-relaxed";
    }
  };

  return (
    <article className={getContainerStyles()}>
      {/* Header */}
      <header>
        <h2 className={getTitleStyles()}>{article.title}</h2>
      </header>

      {/* Content */}
      <div className={getContentStyles()}>
        {isExpanded ? article.content : displayExcerpt}
      </div>

      {/* Expand/Collapse Button */}
      {article.content.length > maxExcerptLength && (
        <footer className="mt-4 flex justify-center">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-gray-600 hover:text-green-600 transition-colors duration-200"
          >
            <span>{isExpanded ? "Thu gọn" : "Xem thêm"}</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${
                isExpanded ? "rotate-180" : ""
              }`}
            />
          </button>
        </footer>
      )}
    </article>
  );
}

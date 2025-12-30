import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ScrollButtonProps } from "@/types/component.type";

const ScrollButton: React.FC<ScrollButtonProps> = ({
  direction,
  onClick,
  color = "bg-white hover:bg-gray-100 shadow-md border border-gray-200",
  size = "p-1",
  shape = "rounded-xl",
}) => {
  const edgePositionClass = direction === "right" ? "right-2" : "left-2";
  const Icon = direction === "right" ? ChevronRight : ChevronLeft;

  return (
    <button
      onClick={onClick}
      aria-label={`Scroll ${direction}`}
      className={`
        absolute top-1/2 -translate-y-1/2 z-20
        flex items-center justify-center
        cursor-pointer select-none
        transition-all duration-200
        ${edgePositionClass}
        ${color}
        ${size}
        ${shape}
        focus:outline-none focus:ring-0
        active:scale-95
      `}
    >
      <Icon className="w-4 h-4 text-gray-700" strokeWidth={3} />
    </button>
  );
};

export default ScrollButton;

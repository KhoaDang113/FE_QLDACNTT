import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  id: string;
  name: string;
  level: "root" | "subcategory";
}

import { cn } from "@/lib/utils";

interface HierarchicalBreadcrumbProps {
  breadcrumbs: BreadcrumbItem[];
  onBreadcrumbClick: (index: number) => void;
  className?: string;
}

export function HierarchicalBreadcrumb({
  breadcrumbs,
  onBreadcrumbClick,
  className,
}: HierarchicalBreadcrumbProps) {
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <div className={cn("mb-6 pb-4 border-b flex items-center gap-2 text-sm", className)}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onBreadcrumbClick(-1)}
        className="gap-1 hover:bg-primary/10 transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        Danh mục gốc
      </Button>
      {breadcrumbs.map((item, index) => (
        <div key={item.id} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onBreadcrumbClick(index)}
            className="font-medium hover:bg-primary/10 transition-colors"
          >
            {item.name}
          </Button>
        </div>
      ))}
    </div>
  );
}


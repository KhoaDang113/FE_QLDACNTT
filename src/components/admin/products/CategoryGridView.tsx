import { Badge } from "@/components/ui/badge";
import { ChevronRight, FolderOpen, Package } from "lucide-react";
import type { Category } from "@/types";

interface CategoryGridViewProps {
  categories: Category[];
  level: "root" | "subcategory";
  onCategoryClick: (category: Category) => void;
}

export function CategoryGridView({
  categories,
  level,
  onCategoryClick,
}: CategoryGridViewProps) {
  const title = level === "root" ? "Danh mục gốc" : "Danh mục con";
  const Icon = level === "root" ? FolderOpen : Package;

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <Badge variant="secondary">{categories.length} danh mục</Badge>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category, index) => (
          <button
            key={category._id}
            onClick={() => onCategoryClick(category)}
            style={{ animationDelay: `${index * 50}ms` }}
            className="group flex items-center gap-3 p-4 border rounded-lg hover:bg-accent hover:border-primary hover:shadow-md transition-all duration-200 text-left animate-in fade-in slide-in-from-bottom-4"
          >
            <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center flex-shrink-0 transition-colors">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <Icon className="w-6 h-6 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                {category.name}
              </h4>
              {category.description && (
                <p className="text-sm text-muted-foreground truncate">
                  {category.description}
                </p>
              )}
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
}


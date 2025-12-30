import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronRight, FolderOpen, Edit2, Trash2 } from "lucide-react";
import type { TypeCombo } from "@/types/typeCombo.type";

interface ComboTypeGridViewProps {
  typeCombos: TypeCombo[];
  onTypeClick: (typeCombo: TypeCombo) => void;
  onEditType: (typeCombo: TypeCombo) => void;
  onDeleteType: (typeCombo: TypeCombo) => void;
}

export function ComboTypeGridView({
  typeCombos,
  onTypeClick,
  onEditType,
  onDeleteType,
}: ComboTypeGridViewProps) {
  // Sắp xếp theo order_index
  const sortedTypeCombos = [...typeCombos].sort((a, b) => a.order_index - b.order_index);

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Danh mục món ăn</h3>
        <Badge variant="secondary">{typeCombos.length} loại</Badge>
      </div>

      {typeCombos.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/10">
          <p className="text-muted-foreground">Chưa có loại món ăn nào.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Hãy thêm loại món ăn mới để quản lý combo.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTypeCombos.map((typeCombo, index) => (
            <div
              key={typeCombo._id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="group relative flex items-center gap-3 p-4 border rounded-lg hover:bg-accent hover:border-primary hover:shadow-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-4"
            >
              {/* Main clickable area */}
              <button
                onClick={() => onTypeClick(typeCombo)}
                className="absolute inset-0 z-0"
                aria-label={`Xem combo của ${typeCombo.name}`}
              />

              {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center flex-shrink-0 transition-colors relative z-10 pointer-events-none">
                <FolderOpen className="w-6 h-6 text-primary" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 relative z-10 pointer-events-none">
                <h4 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                  {typeCombo.name}
                </h4>
                {typeCombo.description && (
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {typeCombo.description}
                  </p>
                )}
              </div>

              {/* Action buttons - visible on hover */}
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity relative z-20">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEditType(typeCombo);
                  }}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteType(typeCombo);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Chevron icon */}
              <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0 relative z-10 pointer-events-none" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

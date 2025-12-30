import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2, Package } from "lucide-react";
import type { MenuCombo } from "@/types/menu.type";

interface ComboGridViewProps {
  combos: MenuCombo[];
  onDeleteCombo: (id: string) => void;
}

export function ComboGridView({ combos, onDeleteCombo }: ComboGridViewProps) {
  if (combos.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center mb-4">
          <Package className="w-8 h-8 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">
          Chưa có món ăn nào trong loại này
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          Hãy thêm món ăn mới vào loại này
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {combos.map((combo, index) => {
        return (
          <div
            key={combo._id}
            style={{ animationDelay: `${index * 30}ms` }}
            className="group relative flex h-full flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg transition-all duration-300 hover:border-green-300 hover:shadow-2xl animate-in fade-in slide-in-from-bottom-2"
          >
            {/* Image */}
            <div className="relative overflow-hidden h-48 flex-shrink-0">
              <img
                src={combo.image || "/placeholder.svg"}
                alt={combo.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              {!combo.is_active && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                  <span className="rounded-lg bg-gray-600 px-6 py-2.5 text-sm font-bold text-white shadow-lg">
                    Ngừng bán
                  </span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1 p-2.5 sm:p-3">
              <h3 className="mb-2 text-sm font-semibold leading-snug text-gray-800 line-clamp-2 min-h-[2.5rem] transition-colors">
                {combo.name}
              </h3>
              
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {combo.description}
              </p>

              {/* Actions */}
              <div className="flex gap-2 mt-auto">
                <Link
                  to={`/admin/combos/edit/${combo._id}`}
                  className="flex-1"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1 border-gray-300 hover:bg-primary hover:text-white hover:border-primary transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Sửa
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-300 text-destructive hover:bg-destructive hover:text-white hover:border-destructive transition-colors"
                  onClick={() => onDeleteCombo(combo._id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Package,
  FolderOpen,
  LogOut,
  Boxes,
  Store,
  Image,
  Utensils,
  Star,
  MessageSquare,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { authService } from "@/api";
import { toast } from "sonner";

const menuItems = [
  {
    label: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    label: "Quản lý User",
    href: "/admin/users",
    icon: Users,
  },
  {
    label: "Quản lý Sản phẩm",
    href: "/admin/products",
    icon: Package,
  },
  {
    label: "Quản lý Combo",
    href: "/admin/combos",
    icon: Utensils,
  },
  {
    label: "Quản lý Danh mục",
    href: "/admin/categories",
    icon: FolderOpen,
  },
  {
    label: "Quản lý Banner",
    href: "/admin/banners",
    icon: Image,
  },
  {
    label: "Quản lý Kho",
    href: "/admin/inventory",
    icon: Boxes,
  },
  {
    label: "Quản lý Thương hiệu",
    href: "/admin/brands",
    icon: Store,
  },
  {
    label: "Quản lý Đánh giá",
    href: "/admin/ratings",
    icon: Star,
  },
  {
    label: "Quản lý Bình luận",
    href: "/admin/comments",
    icon: MessageSquare,
  },

];

export function AdminSidebar() {
  const location = useLocation();
  const pathname = location.pathname;


  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Đăng xuất thành công!");
      // Redirect về trang chủ
      window.location.href = "http://localhost:5173";
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn xóa token và redirect dù có lỗi
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      window.location.href = "http://localhost:5173";
    }
  };

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-2xl font-bold text-sidebar-primary">Admin</h1>
        <p className="text-sm text-sidebar-foreground/60">Bách Hóa Xanh</p>
      </div>

      {/* Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/admin"
              ? pathname === "/admin"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </div>
    </aside>
  );
}

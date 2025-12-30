"use client"

import { User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import authService from "@/api/services/authService";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect } from "react";
import { DEFAULT_AVATAR_URL } from "@/lib/constants";
import { NotificationDrawer } from "@/components/notification/NotificationDrawer";

export function StaffNavbar() {
  const navigate = useNavigate();
  const { user, setUser, logout: clearAuth } = useAuthStore();

  // Lấy thông tin user nếu chưa có
  useEffect(() => {
    const loadUser = async () => {
      if (!user && authService.isAuthenticated()) {
        try {
          const userData = await authService.getMe();
          setUser(userData);
        } catch (error) {
          console.error("Failed to load user:", error);
        }
      }
    };
    loadUser();
  }, [user, setUser]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      clearAuth();
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      // Vẫn xóa dữ liệu local nếu có lỗi
      authService.clearAuthData();
      clearAuth();
      navigate("/login");
    }
  };

  // Lấy tên hiển thị
  const displayName = user?.name || "Nhân viên";

  return (
    <header className="sticky top-0 z-50 w-full bg-[#007E42] shadow-lg">
      <div className="mx-auto max-w-7xl px-4 py-4 md:py-5">
        <div className="flex gap-4 items-center justify-between">
          {/* Logo */}
          <Link to="/staff/orders" className="flex items-center gap-3">
            <img
              src="https://media.istockphoto.com/id/2222830929/vi/anh/imge-c%E1%BB%A7a-nh%E1%BB%AFng-qu%E1%BA%A3-anh-%C4%91%C3%A0o-%C4%91%E1%BB%8F-t%C6%B0%C6%A1i-v%E1%BB%9Bi-th%C3%A2n-tr%C3%AAn-n%E1%BB%81n-%C4%91en-tr%C6%B0ng-b%C3%A0y-tr%C3%A1i-c%C3%A2y-m%C3%B9a-h%C3%A8-ngon-ng%E1%BB%8Dt.jpg?s=1024x1024&w=is&k=20&c=mDQ4JJkQ_20VVdKyoAYxLJWZJWjZcldWrpjCP2DpOXU="
              alt=""
              className="w-12 h-12 rounded-2xl object-cover shadow-md"
            />
            <div className="flex flex-col justify-center">
              <span className="text-white font-semibold text-lg">
                Bách Hóa Không Xanh
              </span>
            </div>
          </Link>

          {/* Staff Title */}
          <div className="flex-1 text-center">
            <h1 className="text-white text-xl font-bold">
              Quản Lý Đơn Hàng
            </h1>
          </div>

          {/* User Menu & Notifications */}
          <div className="flex items-center gap-2">
            {/* Notification Bell */}
            {user && (
              <NotificationDrawer
                // Chỉ hiển thị thông báo liên quan tới đơn hàng cho staff
                filter={(n) => n.title?.toLowerCase().includes("đơn hàng")}
              />
            )}

            {/* User Menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-full bg-[#008236] px-4 py-2 text-white cursor-pointer hover:bg-green-900 transition-colors">
                    <span className="whitespace-nowrap text-white">
                      {displayName}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-semibold">{displayName}</p>
                    {user.email && (
                      <p className="text-xs text-gray-500">{user.email}</p>
                    )}
                  </div>
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Đăng xuất</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 rounded-full bg-[#008236] px-4 py-2 text-white cursor-pointer hover:bg-green-900 transition-colors"
              >
                <User className="w-5 h-5 text-white" />
                <span className="whitespace-nowrap text-white">Đăng nhập</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { Footer } from "@/components/navbar-and-footer/user/Footer";
import { ScrollToTop } from "@/components/scroll/ScrollToTop";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { StaffNavbar } from "@/components/navbar-and-footer/staff/Navbar";
import { useOrders } from "@/hooks/useOrders";
import { useNotification } from "@/hooks/useNotification";
import { useEffect, useRef } from "react";
import authService from "@/api/services/authService";
import { useAuthStore } from "@/stores/authStore";

export default function StaffLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orders } = useOrders();
  const { showNotification } = useNotification();
  const previousOrdersRef = useRef<string[]>([]);
  const { user } = useAuthStore();

  // Chặn staff truy cập các trang ngoài /staff/*
  useEffect(() => {
    const checkAccess = () => {
      if (!authService.isAuthenticated()) {
        navigate("/login", { replace: true });
        return;
      }

      const currentUser = user || authService.getCurrentUser();

      if (currentUser?.role === "staff") {
        if (!location.pathname.startsWith("/staff")) {
          navigate("/staff/orders", { replace: true });
        }
      } else if (currentUser?.role !== "admin") {
        navigate("/", { replace: true });
      }
    };

    checkAccess();
  }, [location.pathname, navigate, user]);

  // Thông báo đơn hàng mới
  useEffect(() => {
    const currentOrderIds = orders.map((order) => order.id);

    if (previousOrdersRef.current.length > 0) {
      const newOrders = orders.filter(
        (order) =>
          !previousOrdersRef.current.includes(order.id) &&
          order.status === "pending"
      );

      newOrders.forEach((order) => {
        showNotification({
          type: "info",
          title: "Đơn hàng mới",
          message: `Đơn hàng ${order.id} từ ${order.customer_name
            } - ${order.total_amount.toLocaleString("vi-VN")}đ`,
          duration: 6000,
        });
      });
    }

    previousOrdersRef.current = currentOrderIds;
  }, [orders, showNotification]);

  const isOrdersPage = location.pathname.startsWith("/staff/orders");
  const isMessagesPage = location.pathname.startsWith("/staff/messages");

  const handleGoOrders = () => navigate("/staff/orders");
  const handleGoMessages = () => navigate("/staff/messages");

  return (
    <div className="staff-layout w-full bg-[#e9edf0] pb-4 min-h-screen">
      <ScrollToTop />
      <StaffNavbar />

      <main className="flex flex-col w-full mx-auto px-3 overflow-hidden gap-5 mt-2 max-w-7xl">
        {/* Thanh nút chuyển giữa Đơn hàng / Tin nhắn */}
        <div className="w-full">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-1 flex gap-2">
            <button
              onClick={handleGoOrders}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors
                ${isOrdersPage
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
                }`}
            >
              Đơn hàng
            </button>
            <button
              onClick={handleGoMessages}
              className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg transition-colors
                ${isMessagesPage
                  ? "bg-green-600 text-white shadow-sm"
                  : "bg-transparent text-gray-700 hover:bg-gray-100"
                }`}
            >
              Tin nhắn
            </button>
          </div>
        </div>

        <div className="w-full">
          <Outlet />
        </div>

        <Footer />
      </main>
    </div>
  );
}

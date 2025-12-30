import { useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import authService from "@/api/services/authService";
import { ScrollToTop } from "@/components/scroll/ScrollToTop";

export default function ShipperLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Chặn shipper truy cập các trang ngoài /shipper/*
  useEffect(() => {
    const checkAccess = () => {
      if (!authService.isAuthenticated()) {
        navigate("/login", { replace: true });
        return;
      }
    };

    checkAccess();
  }, [location.pathname, navigate, user]);

  return (
    <div className="shipper-layout w-full min-h-screen">
      <ScrollToTop />
      
      <main className="w-full h-full">
        <Outlet />
      </main>
    </div>
  );
}

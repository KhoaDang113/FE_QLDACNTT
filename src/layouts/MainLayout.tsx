import { useEffect } from "react";
import { CategorySidebar } from "@/components/category/CategorySideBar";
import { Footer } from "@/components/navbar-and-footer/user/Footer";
import { Navbar } from "@/components/navbar-and-footer/user/Navbar";
import { ScrollToTop } from "@/components/scroll/ScrollToTop";
import { ChatWidget } from "@/components/chat/ChatWidget";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";
import { useOrderNotifications } from "@/hooks/useOrderNotifications";

export default function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthStore();

  // Listen for order notifications (centralized to avoid duplicates)
  useOrderNotifications();

  useEffect(() => {
    const role = user?.role?.toLowerCase?.();
    
    // Redirect staff to staff page
    if (role === "staff" && !location.pathname.startsWith("/staff")) {
      navigate("/staff/orders", { replace: true });
    }
    
    // Redirect shipper to shipper page
    if (role === "shipper" && !location.pathname.startsWith("/shipper")) {
      navigate("/shipper", { replace: true });
    }
    
    // Redirect admin to admin page
    if (role === "admin" && !location.pathname.startsWith("/admin")) {
      navigate("/admin", { replace: true });
    }
  }, [user, navigate, location.pathname]);

  return (
    <div className="main-layout w-full bg-[#e9edf0] pb-4">
      <ScrollToTop />
      <Navbar />
      <div className="flex flex-row">
        <CategorySidebar />
        <main className={`flex flex-col w-full mx-auto sm:px-3 lg:ml-62 2xl:ml-95 2xl:mr-31 gap-5 mt-2 pb-20 md:pb-0 overflow-hidden`}>
          <Outlet />
          <Footer />
        </main>
      </div>
      {/* Chat Widget - Fixed position at bottom right */}
      <ChatWidget />
    </div>
  );
}

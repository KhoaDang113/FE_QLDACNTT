import "./App.css";
import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import routes from "@/routes/index";
import { CartProvider } from "@/components/cart/CartContext";
import { AddressProvider } from "@/components/address/AddressContext";
import { NotificationProvider } from "@/components/notification/NotificationContext";
import { NotificationPopup } from "@/components/notification/NotificationPopup";
import { useAuthStore } from "@/stores/authStore";
import { Toaster } from "sonner";

function App() {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <AddressProvider>
      <NotificationProvider>
        <CartProvider>
          <RouterProvider router={routes} />
          <NotificationPopup />
          <Toaster position="top-right" richColors />
        </CartProvider>
      </NotificationProvider>
    </AddressProvider>
  );
}

export default App;

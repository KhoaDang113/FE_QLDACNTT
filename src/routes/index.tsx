import { createBrowserRouter, type RouteObject } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AdminDashboard from "@/pages/admin";
import AdminUsers from "@/pages/admin/users";
import AdminProducts from "@/pages/admin/products";
import AdminCategories from "@/pages/admin/categories";
import AddProductPage from "@/pages/admin/products/add";
import EditProductPage from "@/pages/admin/products/edit/[id]";
import AdminBanners from "@/pages/admin/banners";
import AddBannerPage from "@/pages/admin/banners/add";
import EditBannerPage from "@/pages/admin/banners/edit/[id]";
import AdminCombos from "@/pages/admin/combos";
import AddComboPage from "@/pages/admin/combos/add";
import EditComboPage from "@/pages/admin/combos/edit/[id]";
import AdminRatings from "@/pages/admin/ratings";
import AdminComments from "@/pages/admin/comments";

import StaffMessage from "@/pages/messages";
import ConversationDetailPage from "@/pages/messages/detail";
import AdminInventory from "@/pages/admin/inventory";
import AdminInventoryHistory from "@/pages/admin/inventory/history";
import AdminBrands from "@/pages/admin/brands";
import StaffLayout from "@/layouts/StaffLayout";
import HomePage from "@/pages/home/index";
import ProductsPage from "@/pages/products";
import ShoppingCart from "@/pages/cart";
import ProductDetail from "@/pages/products-detail";
import LoginPage from "@/pages/login";
import SignUpPage from "@/pages/sign_up";
import VerifyEmailPage from "@/pages/verify-email";
import ForgotPasswordPage from "@/pages/forgot-password";
import AuthCallbackPage from "@/pages/auth-callback";
import OrdersPage from "@/pages/order-management";
import OrderDetailPage from "@/components/order/OrderDetailView";
import CustomerOrdersPage from "@/pages/customer-orders";
import KhuyenMaiPage from "@/pages/sale";
import AccountPage from "@/pages/account";
import SearchPage from "@/pages/search";
import PaymentSuccessPage from "@/pages/payments/success";
import PaymentFailedPage from "@/pages/payments/failed";
import {
  ProtectedRoute,
  PublicRoute,
  AdminRoute,
  StaffRoute,
} from "@/components/auth/ProtectedRoute";

const router: RouteObject[] = [
  // User
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "/search",
        element: <SearchPage />,
      },
      {
        path: "/products",
        element: <ProductsPage />,
      },
      {
        path: "/cart",
        element: (
          <ProtectedRoute>
            <ShoppingCart />
          </ProtectedRoute>
        ),
      },
      {
        path: "/products-detail/:id",
        element: <ProductDetail />,
      },
      {
        path: "/login",
        element: (
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        ),
      },
      {
        path: "/sign_up",
        element: (
          <PublicRoute>
            <SignUpPage />
          </PublicRoute>
        ),
      },
      {
        path: "/verify-email",
        element: <VerifyEmailPage />,
      },
      {
        path: "/forgot-password",
        element: (
          <PublicRoute>
            <ForgotPasswordPage />
          </PublicRoute>
        ),
      },
      {
        path: "/auth-callback",
        element: <AuthCallbackPage />,
      },
      {
        path: "/my-orders",
        element: (
          <ProtectedRoute>
            <CustomerOrdersPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/khuyen-mai",
        element: <KhuyenMaiPage />,
      },
      {
        path: "/account",
        element: (
          <ProtectedRoute>
            <AccountPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/payments/success",
        element: <PaymentSuccessPage />,
      },
      {
        path: "/payments/failed",
        element: <PaymentFailedPage />,
      },
    ],
  },

  // Admin
  {
    path: "/admin",
    element: (
      <AdminRoute>
        <AdminLayout />
      </AdminRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "/admin/users",
        element: <AdminUsers />,
      },
      {
        path: "/admin/products",
        element: <AdminProducts />,
      },
      {
        path: "/admin/products/add",
        element: <AddProductPage />,
      },
      {
        path: "/admin/products/edit/:id",
        element: <EditProductPage />,
      },
      {
        path: "/admin/categories",
        element: <AdminCategories />,
      },

      {
        path: "/admin/inventory",
        element: <AdminInventory />,
      },
      {
        path: "/admin/inventory/history",
        element: <AdminInventoryHistory />,
      },
      {
        path: "/admin/brands",
        element: <AdminBrands />,
      },
      {
        path: "/admin/banners",
        element: <AdminBanners />,
      },
      {
        path: "/admin/banners/add",
        element: <AddBannerPage />,
      },
      {
        path: "/admin/banners/edit/:id",
        element: <EditBannerPage />,
      },
      {
        path: "/admin/combos",
        element: <AdminCombos />,
      },
      {
        path: "/admin/combos/add",
        element: <AddComboPage />,
      },
      {
        path: "/admin/combos/edit/:id",
        element: <EditComboPage />,
      },
      {
        path: "/admin/ratings",
        element: <AdminRatings />,
      },
      {
        path: "/admin/comments",
        element: <AdminComments />,
      },
    ],
  },

  // Staff
  {
    path: "/staff",
    element: (
      <StaffRoute>
        <StaffLayout />
      </StaffRoute>
    ),
    children: [
      {
        path: "/staff/orders",
        element: <OrdersPage />,
      },
      {
        path: "/staff/orders/order/:id",
        element: <OrderDetailPage />,
      },
      {
        path: "/staff/messages",
        element: <StaffMessage />,
      },
      {
        path: "/staff/messages/:id",
        element: <ConversationDetailPage />,
      },
    ],
  },

];

const routerBroswer = createBrowserRouter(router, {
  future: {
    v7_startTransition: true,
  },
});

// Disable browser's default scroll restoration
if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual';
}

export default routerBroswer;

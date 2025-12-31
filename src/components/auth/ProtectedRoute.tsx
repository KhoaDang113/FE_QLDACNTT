import { Navigate, useLocation } from "react-router-dom";
import authService from "@/api/services/authService";

interface ProtectedRouteProps {
  children: React.ReactElement;
}

/**
 * Component bảo vệ routes - yêu cầu đăng nhập
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuth = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  if (!isAuth) {
    // Redirect đến login, lưu lại trang hiện tại để redirect sau khi login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Redirect staff về trang staff
  if (currentUser?.role === "staff") {
    return <Navigate to="/staff/orders" replace />;
  }

  // Redirect shipper về trang shipper
  // else if (currentUser?.role === "shipper") {
  //   return <Navigate to="/shipper" replace />;
  // }

  return children;
}

/**
 * Component cho public routes - redirect nếu đã đăng nhập
 */
export function PublicRoute({ children }: ProtectedRouteProps) {
  const isAuth = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  if (isAuth) {
    // Nếu đã login, redirect về home
    const destination = currentUser?.role === "staff" ? "/staff/orders" : "/";
    return <Navigate to={destination} replace />;
  }

  return children;
}

/**
 * Component bảo vệ admin routes
 */
export function AdminRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuth = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role admin
  if (currentUser?.role !== "admin") {
    // Không có quyền, redirect về home
    return <Navigate to="/" replace />;
  }

  return children;
}

/**
 * Component bảo vệ staff routes
 */
export function StaffRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuth = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  if (!isAuth) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role staff hoặc admin
  if (currentUser?.role !== "staff" && currentUser?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "@/api/services/authService";
import { useAuthStore } from "@/stores/authStore";

export default function AuthCallback() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [, setMessage] = useState('Đang xử lý đăng nhập...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Kiểm tra xem có accessToken trong cookies không
        const cookies = document.cookie.split(';');
        const accessTokenCookie = cookies.find(cookie => 
          cookie.trim().startsWith('accessToken=')
        );
        
        if (!accessTokenCookie) {
          throw new Error('Không tìm thấy token đăng nhập');
        }

        // Lấy token từ cookie
        const accessToken = accessTokenCookie.split('=')[1];
        
        if (!accessToken) {
          throw new Error('Token không hợp lệ');
        }

        // Lưu token vào localStorage
        localStorage.setItem('accessToken', accessToken);

        // Xóa cart cũ trước khi login user mới
        const oldUserStr = localStorage.getItem("user");
        if (oldUserStr) {
          try {
            const oldUser = JSON.parse(oldUserStr) as { id?: string };
            if (oldUser?.id) {
              localStorage.removeItem(`cart_${oldUser.id}`);
            }
          } catch {
            // Ignore parse error
          }
        }
        localStorage.removeItem("cart_guest");

        // Lấy thông tin user từ API
        const user = await authService.getMe();
        
        // Lưu user vào localStorage (vẫn giữ để tương thích với code cũ)
        localStorage.setItem('user', JSON.stringify(user));

        // Cập nhật Zustand store
        setUser(user);

        // Đợi một chút để đảm bảo store được persist vào localStorage
        await new Promise(resolve => setTimeout(resolve, 100));

        // Dispatch custom event để notify Navbar và các components khác
        window.dispatchEvent(new Event('auth-changed'));

        // Redirect theo role
        const userRole = user.role;
        if (userRole === "staff") {
          navigate("/staff/orders", { replace: true });
        } else if (userRole === "admin") {
          navigate("/admin", { replace: true });
        } else {
          // User thường - chuyển về trang chủ
          navigate('/', { replace: true });
        }

      } catch (error: Error | unknown) {
        const err = error as { message?: string };
        console.error('Auth callback error:', error);
        setMessage(err.message || 'Đăng nhập thất bại');
        
        // Chuyển về trang login sau 3 giây
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, setUser]);

  // Chỉ hiển thị loading đơn giản
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Đang xử lý đăng nhập...</p>
      </div>
    </div>
  );
}

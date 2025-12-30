import type React from "react";
import { useState } from "react";
import { Eye, EyeOff, User, Lock, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import authService from "@/api/services/authService";
import { useAuthStore } from "@/stores/authStore";

export default function SignUp() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
  }>({});

  const validateEmail = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  };

  const validatePassword = (value: string) => {
    const hasMinLength = value.length >= 8;
    const hasLetters = /[a-zA-Z]/.test(value);
    const hasNumbers = /[0-9]/.test(value);
    return hasMinLength && hasLetters && hasNumbers;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    // Validation
    if (!name.trim()) {
      newErrors.name = "Vui lòng nhập họ và tên";
    }

    if (!validateEmail(email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!validatePassword(password)) {
      newErrors.password = "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ và số";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0 && agreeToTerms) {
      setIsLoading(true);
      
      try {
        const response = await authService.registerEmail(email, password, name);
        
        if (response.success) {
          // Nếu có token và user trong response (tự động đăng nhập sau đăng ký)
          if (response.accessToken && response.user) {
            // Cập nhật Zustand store
            setUser(response.user);
            
            // Đợi một chút để đảm bảo store được persist
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Dispatch custom event để notify Navbar và các components khác
            window.dispatchEvent(new Event('auth-changed'));
          }
          
          // Chuyển đến trang verify email
          navigate(`/verify-email?email=${encodeURIComponent(email)}`);
        } else {
          setErrors({ email: response.message || "Đăng ký thất bại" });
        }
      } catch (err: Error | unknown) {
        console.error("Register error:", err);
        let errorMessage = "Có lỗi xảy ra, vui lòng thử lại";
        if (err && typeof err === "object" && "response" in err) {
          const response = (err as { response?: { data?: { message?: string } } }).response;
          if (response?.data?.message) {
            errorMessage = response.data.message;
          }
        }
        setErrors({ email: errorMessage });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleGoogleSignUp = () => {
    // Redirect đến Google OAuth
    authService.loginWithGoogle();
  };

  const isFormValid =
    name.trim() &&
    email &&
    password.length >= 8 &&
    confirmPassword &&
    password === confirmPassword &&
    agreeToTerms;


  return (
    <div className="min-h-[600px] flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header với gradient */}
          <div className="bg-gradient-to-r from-[#007E42] to-[#00A854] p-5 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-2xl blur-lg"></div>
                <img
                  src="https://media.istockphoto.com/id/2222830929/vi/anh/imge-c%E1%BB%A7a-nh%E1%BB%AFng-qu%E1%BA%A3-anh-%C4%91%C3%A0o-%C4%91%E1%BB%8F-t%C6%B0%C6%A1i-v%E1%BB%9Bi-th%C3%A2n-tr%C3%AAn-n%E1%BB%81n-%C4%91en-tr%C6%B0ng-b%C3%A0y-tr%C3%A1i-c%C3%A2y-m%C3%B9a-h%C3%A8-ngon-ng%E1%BB%8Dt.jpg?s=1024x1024&w=is&k=20&c=mDQ4JJkQ_20VVdKyoAYxLJWZJWjZcldWrpjCP2DpOXU="
                  alt="Chào Mừng Đến Với Cửa Hàng"
                  className="relative w-14 h-14 rounded-2xl object-cover shadow-lg border-3 border-white/50"
                />
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-white mb-0.5">Tạo Tài Khoản Mới</h1>
                <p className="text-white/80 text-xs">Tham gia cùng chúng tôi hôm nay</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Họ và tên
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    placeholder="Nhập họ và tên của bạn"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setErrors({ ...errors, name: undefined });
                    }}
                    className="h-12 w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    aria-invalid={errors.name ? "true" : "false"}
                    required
                  />
                </div>
                {errors.name && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded-lg animate-in slide-in-from-top" role="alert">
                    <p className="text-sm text-red-700 font-medium">{errors.name}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrors({ ...errors, email: undefined });
                    }}
                    className="h-12 w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    aria-invalid={errors.email ? "true" : "false"}
                    required
                  />
                </div>
                {errors.email && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded-lg animate-in slide-in-from-top" role="alert">
                    <p className="text-sm text-red-700 font-medium">{errors.email}</p>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mật khẩu
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors({ ...errors, password: undefined });
                    }}
                    className="h-12 w-full pl-10 pr-12 py-2 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    aria-invalid={errors.password ? "true" : "false"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 border-none text-gray-400 hover:text-green-600 transition-colors p-1 rounded-lg hover:bg-green-50"
                    aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                    aria-pressed={showPassword}
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded-lg animate-in slide-in-from-top" role="alert">
                    <p className="text-sm text-red-700 font-medium">{errors.password}</p>
                  </div>
                )}
                {!errors.password && password && (
                  <p className="text-xs text-gray-600 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3 text-green-500" />
                    Ít nhất 8 ký tự, bao gồm chữ và số
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Xác nhận mật khẩu
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <ShieldCheck className="h-5 w-5 text-gray-400 group-focus-within:text-green-500 transition-colors" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Nhập lại mật khẩu"
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setErrors({ ...errors, confirmPassword: undefined });
                    }}
                    className="h-12 w-full pl-10 pr-12 py-2 border-2 border-gray-200 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all duration-200"
                    aria-invalid={errors.confirmPassword ? "true" : "false"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 border-none text-gray-400 hover:text-green-600 transition-colors p-1 rounded-lg hover:bg-green-50"
                    aria-label={
                      showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                    }
                    aria-pressed={showConfirmPassword}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-2 rounded-lg animate-in slide-in-from-top" role="alert">
                    <p className="text-sm text-red-700 font-medium">{errors.confirmPassword}</p>
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-lg">
                <input
                  id="terms"
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-gray-700 cursor-pointer leading-relaxed select-none"
                >
                  Tôi đồng ý với{" "}
                  <a href="https://www.bachhoaxanh.com/quy-che-hoat-dong" className="text-green-600 hover:text-green-700 font-medium hover:underline">
                    Điều khoản
                  </a>{" "}
                  &{" "}
                  <a href="https://www.bachhoaxanh.com/quy-che-hoat-dong" className="text-green-600 hover:text-green-700 font-medium hover:underline">
                    Chính sách
                  </a>
                </label>
              </div>

              {isLoading && (
                <div className="flex items-center gap-2 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
                  <span>Đang xử lý...</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full h-12 text-base bg-gradient-to-r from-[#007E42] to-[#00A854] hover:from-[#006B38] hover:to-[#008F48] text-white font-semibold py-2 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5 transform"
                disabled={!isFormValid || isLoading}
              >
                {isLoading ? "Đang đăng ký..." : "Đăng ký"}
              </button>

              <div className="text-center text-sm">
                <span className="text-gray-600">Đã có tài khoản? </span>
                <Link
                  to="/login"
                  className="text-green-600 hover:text-green-700 font-semibold hover:underline transition-colors"
                >
                  Đăng nhập
                </Link>
              </div>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500 font-medium">
                    Hoặc đăng ký với
                  </span>
                </div>
              </div>

              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={handleGoogleSignUp}
                  className="group flex h-12 w-12 items-center justify-center rounded-full bg-white border-2 border-gray-200 hover:border-green-500 hover:bg-green-50 transition-all duration-200 p-0 shadow-md hover:shadow-lg hover:-translate-y-0.5 transform"
                  aria-label="Đăng ký với Google"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 48 48"
                    className="h-6 w-6 group-hover:scale-110 transition-transform"
                  >
                    <path
                      fill="#EA4335"
                      d="M24 9.5c3.54 0 6.7 1.22 9.2 3.6l6.85-6.85C35.6 2.35 30.2 0 24 0 14.64 0 6.4 5.5 2.45 13.5l7.98 6.19C12.33 13.35 17.7 9.5 24 9.5z"
                    />
                    <path
                      fill="#34A853"
                      d="M46.1 24.5c0-1.57-.14-3.07-.4-4.5H24v9h12.45c-.54 2.9-2.15 5.36-4.55 7.05l7.02 5.44C43.58 37.17 46.1 31.3 46.1 24.5z"
                    />
                    <path
                      fill="#4A90E2"
                      d="M10.43 28.31a14.44 14.44 0 010-8.62l-7.98-6.19A23.93 23.93 0 000 24c0 3.88.93 7.55 2.45 10.5l7.98-6.19z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M24 48c6.2 0 11.4-2.05 15.2-5.61l-7.02-5.44C29.4 38.08 26.8 39 24 39c-6.3 0-11.67-3.85-13.57-9.69l-7.98 6.19C6.4 42.5 14.64 48 24 48z"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


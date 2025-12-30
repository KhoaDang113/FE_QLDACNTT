import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Mail, ArrowLeft } from "lucide-react";
import authService from "@/api/services/authService";
import { useAuthStore } from "@/stores/authStore";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const email = searchParams.get("email") || "";
  const codeFromUrl = searchParams.get("code") || "";
  const formRef = useRef<HTMLFormElement>(null);
  const hasAutoSubmitted = useRef(false);
  const [code, setCode] = useState(codeFromUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, [email, navigate]);

  useEffect(() => {
    // Tự động điền code từ URL nếu có
    if (codeFromUrl && codeFromUrl.length === 6 && !hasAutoSubmitted.current) {
      setCode(codeFromUrl);
      // Tự động submit form sau khi điền code (đợi một chút để đảm bảo state đã cập nhật)
      const timer = setTimeout(() => {
        if (
          formRef.current &&
          codeFromUrl.length === 6 &&
          email &&
          !isLoading
        ) {
          hasAutoSubmitted.current = true;
          formRef.current.requestSubmit();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [codeFromUrl, email, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Mã OTP phải có 6 số");
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyEmail(email, code);

      // Verify thành công
      // Kiểm tra xem có token trong localStorage không (từ lúc đăng ký)
      if (authService.isAuthenticated()) {
        try {
          // Lấy thông tin user từ API
          const user = await authService.getMe();

          // Cập nhật Zustand store
          setUser(user);

          // Đợi một chút để đảm bảo store được persist
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Dispatch custom event để notify Navbar và các components khác
          window.dispatchEvent(new Event("auth-changed"));

          // Nếu có token và user, tự động đăng nhập thành công
          // Redirect theo role
          const userRole = user.role;
          if (userRole === "staff") {
            navigate("/staff/orders", { replace: true });
            return;
          } else if (userRole === "admin") {
            navigate("/admin", { replace: true });
            return;
          }

          // Chuyển đến trang home cho user thường
          navigate("/", { replace: true });
          return;
        } catch (err) {
          console.error("Failed to get user info after verify:", err);
          // Nếu không lấy được user, vẫn chuyển đến login
        }
      }

      // Nếu không có token, chuyển đến login
      navigate("/login", {
        state: { message: "Xác thực email thành công! Vui lòng đăng nhập." },
      });
    } catch (err: Error | unknown) {
      console.error("Verify error:", err);
      let errorMessage = "Mã OTP không đúng hoặc đã hết hạn";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setError("");
    setResendSuccess(false);

    try {
      await authService.resendEmailVerification(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
    } catch (err: Error | unknown) {
      console.error("Resend error:", err);
      let errorMessage = "Không thể gửi lại OTP. Vui lòng thử lại sau.";
      if (err && typeof err === "object" && "response" in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        if (response?.data?.message) {
          errorMessage = response.data.message;
        }
      }
      setError(errorMessage);
    } finally {
      setResending(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 6);
    setCode(value);
    setError("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-emerald-50 py-8 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#007E42] to-[#00A854] p-6 text-center relative">
            <Link
              to="/login"
              className="absolute left-4 top-6 text-white/80 hover:text-white transition-colors"
              aria-label="Quay lại"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="absolute inset-0 bg-white/30 rounded-full blur-lg"></div>
                <div className="relative bg-white/20 p-4 rounded-full">
                  <Mail className="w-10 h-10 text-white" />
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-white mb-1">
                  Xác thực Email
                </h1>
                <p className="text-white/80 text-sm">
                  Nhập mã OTP để xác nhận tài khoản
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-gray-600 mb-6 text-center">
              Chúng tôi đã gửi mã OTP (6 số) đến email:
              <br />
              <strong className="text-gray-800">{email}</strong>
            </p>

            <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="code"
                  className="block text-sm font-medium text-gray-700 mb-2 text-center"
                >
                  Nhập mã OTP
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  value={code}
                  onChange={handleCodeChange}
                  placeholder="000000"
                  className="w-full h-16 px-4 border-2 border-gray-200 rounded-xl text-center text-3xl tracking-[0.5em] font-semibold focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                  maxLength={6}
                  required
                  autoFocus
                />
                <p className="text-xs text-gray-500 text-center mt-2">
                  Mã OTP có hiệu lực trong 10 phút
                </p>
              </div>

              {error && (
                <div
                  className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg"
                  role="alert"
                >
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              )}

              {resendSuccess && (
                <div
                  className="bg-green-50 border-l-4 border-green-500 p-3 rounded-lg"
                  role="alert"
                >
                  <p className="text-sm text-green-700 font-medium">
                    Đã gửi lại mã OTP. Vui lòng kiểm tra email!
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={code.length !== 6 || isLoading}
                className="w-full h-12 bg-gradient-to-r from-[#007E42] to-[#00A854] hover:from-[#006B38] hover:to-[#008F48] text-white font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:-translate-y-0.5 transform"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Đang xác thực...
                  </span>
                ) : (
                  "Xác thực"
                )}
              </button>
            </form>

            <div className="mt-6 text-center space-y-3">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-4 text-gray-500">
                    Không nhận được mã?
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="text-green-600 hover:text-green-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:underline transition-colors"
              >
                {resending ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-3 w-3 animate-spin rounded-full border-2 border-green-600 border-t-transparent" />
                    Đang gửi...
                  </span>
                ) : (
                  "Gửi lại mã OTP"
                )}
              </button>

              <p className="text-xs text-gray-500 mt-4">
                Vui lòng kiểm tra cả thư mục spam/junk nếu không thấy email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

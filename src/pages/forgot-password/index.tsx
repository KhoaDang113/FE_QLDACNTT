import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { Mail, Key, CheckCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import authService from "@/api/services/authService";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get("email") || "";
  const codeFromUrl = searchParams.get("code") || "";

  // Form states
  const [email, setEmail] = useState(emailFromUrl);
  const [code, setCode] = useState(codeFromUrl);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [step, setStep] = useState<1 | 2 | 3>(
    emailFromUrl && codeFromUrl ? 2 : 1
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    // Tự động điền email và code từ URL nếu có
    if (emailFromUrl) {
      setEmail(emailFromUrl);
    }
    if (codeFromUrl && codeFromUrl.length === 6) {
      setCode(codeFromUrl);
      if (emailFromUrl) {
        setStep(2);
      }
    }
  }, [emailFromUrl, codeFromUrl]);

  // Step 1: Send OTP to email
  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Email không hợp lệ");
      return;
    }

    setIsLoading(true);
    try {
      await authService.forgotPassword(email);
      setStep(2);
    } catch (err: Error | unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Forgot password error:", err);
      setError(
        error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (code.length !== 6) {
      setError("Mã OTP phải có 6 số");
      return;
    }

    setIsLoading(true);
    try {
      await authService.verifyResetPasswordOTP(email, code);
      setStep(3);
    } catch (err: Error | unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Verify OTP error:", err);
      setError(
        error.response?.data?.message || "Mã OTP không đúng hoặc đã hết hạn"
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Step 3: Reset password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword.length < 8) {
      setError("Mật khẩu phải có ít nhất 8 ký tự");
      return;
    }

    if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
      setError("Mật khẩu phải bao gồm cả chữ và số");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(email, newPassword);
      navigate("/login", {
        state: { message: "Đặt lại mật khẩu thành công! Vui lòng đăng nhập." },
      });
    } catch (err: Error | unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error("Reset password error:", err);
      setError(
        error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại."
      );
    } finally {
      setIsLoading(false);
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
                  {step === 1 && <Mail className="w-10 h-10 text-white" />}
                  {step === 2 && <Key className="w-10 h-10 text-white" />}
                  {step === 3 && (
                    <CheckCircle className="w-10 h-10 text-white" />
                  )}
                </div>
              </div>
              <div className="text-center">
                <h1 className="text-xl font-bold text-white mb-1">
                  Quên mật khẩu
                </h1>
                <p className="text-white/80 text-sm">
                  {step === 1 && "Nhập email để nhận mã xác thực"}
                  {step === 2 && "Xác thực mã OTP"}
                  {step === 3 && "Đặt mật khẩu mới"}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center justify-center gap-2 px-8 py-4 bg-gray-50/50">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step >= s
                      ? "bg-green-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-12 h-1 mx-1 transition-all ${
                      step > s ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Step 1: Email */}
            {step === 1 && (
              <form onSubmit={handleSendOTP} className="space-y-6">
                <p className="text-gray-600 text-center mb-4">
                  Nhập email của bạn để nhận mã OTP đặt lại mật khẩu.
                </p>

                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="example@gmail.com"
                    className="w-full h-12 px-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                    required
                    autoFocus
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#007E42] to-[#00A854] hover:from-[#006B38] hover:to-[#008F48] text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                >
                  {isLoading ? "Đang gửi..." : "Gửi mã OTP"}
                </button>
              </form>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <form onSubmit={handleVerifyOTP} className="space-y-6">
                <p className="text-gray-600 text-center mb-4">
                  Nhập mã OTP (6 số) đã được gửi đến:
                  <br />
                  <strong className="text-gray-800">{email}</strong>
                </p>

                <div>
                  <label
                    htmlFor="code"
                    className="block text-sm font-medium text-gray-700 mb-2 text-center"
                  >
                    Mã OTP
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
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={code.length !== 6 || isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#007E42] to-[#00A854] hover:from-[#006B38] hover:to-[#008F48] text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                >
                  {isLoading ? "Đang xác thực..." : "Xác thực"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full text-green-600 hover:text-green-700 font-medium text-sm hover:underline transition-colors"
                >
                  Thay đổi email
                </button>
              </form>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <form onSubmit={handleResetPassword} className="space-y-5">
                <p className="text-gray-600 text-center mb-4">
                  Đặt mật khẩu mới cho tài khoản của bạn.
                </p>

                <div>
                  <label
                    htmlFor="newPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Nhập mật khẩu mới"
                      className="w-full h-12 px-4 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      required
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Ít nhất 8 ký tự, bao gồm chữ và số
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError("");
                      }}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full h-12 px-4 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/20 focus:border-green-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded-lg">
                    <p className="text-sm text-red-700 font-medium">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full h-12 bg-gradient-to-r from-[#007E42] to-[#00A854] hover:from-[#006B38] hover:to-[#008F48] text-white font-semibold rounded-xl transition-all disabled:opacity-50 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform"
                >
                  {isLoading ? "Đang đặt lại..." : "Đặt lại mật khẩu"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

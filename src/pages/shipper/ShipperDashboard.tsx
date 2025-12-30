import { useShipperOrders } from "@/hooks/useShipperOrders";
import { ShipperOrderCard } from "@/components/shipper/ShipperOrderCard";
import { OrderNotificationModal } from "@/components/shipper/OrderNotificationModal";
import { useAuthStore } from "@/stores/authStore";
import { Package, CheckCircle, Clock, Wallet, Bell, LogOut, User, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function ShipperDashboard() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const {
    orders,
    loading,
    isOnline,
    pendingOrder,
    toggleOnlineStatus,
    startDelivery,
    completeDelivery,
    assignOrder,
    dismissPendingOrder,
  } = useShipperOrders();

  const [activeTab, setActiveTab] = useState<"processing" | "completed">("processing");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Filter orders by status
  const processingOrders = orders.filter(
    (order) => order.status === "assigned" || order.status === "confirmed" || order.status === "shipped"
  );
  const completedOrders = orders.filter((order) => order.status === "delivered");

  const stats = {
    totalOrders: orders.length,
    completed: completedOrders.length,
    pending: processingOrders.length,
    earnings: completedOrders.reduce((sum, order) => sum + (order.total_amount * 0.1), 0), // Assuming 10% commission
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN").format(amount) + " đ";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 border-b border-gray-700 sticky top-0 z-10 backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* User Info with Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-4 hover:bg-gray-700/50 rounded-xl p-2 -m-2 transition-colors"
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center overflow-hidden">
                  {user?.avatar ? (
                    <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-white font-bold text-lg">
                      {user?.name?.charAt(0).toUpperCase() || "S"}
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-sm text-gray-400">Xin chào,</p>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl font-bold text-white">{user?.name || "Shipper"}</h1>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                  </div>
                </div>
              </button>

              {/* Dropdown Menu */}
              {showUserMenu && (
                <div className="absolute top-full left-0 mt-2 w-64 bg-gray-800 rounded-xl shadow-2xl border border-gray-700 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-gray-700">
                    <p className="text-white font-semibold">{user?.name}</p>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/shipper/profile");
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                      <User className="w-5 h-5" />
                      <span>Thông tin cá nhân</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Online Toggle */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-gray-400 hover:text-white transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-gray-900"></span>
              </button>
              <button
                onClick={toggleOnlineStatus}
                className={`flex items-center gap-3 px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                  isOnline
                    ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/50"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
              >
                <div
                  className={`w-3 h-3 rounded-full ${
                    isOnline ? "bg-white animate-pulse" : "bg-gray-500"
                  }`}
                ></div>
                <span>{isOnline ? "Online" : "Offline"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-6 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                <Package className="w-5 h-5 text-blue-400" />
              </div>
              <p className="text-sm text-blue-300 font-semibold">Tổng đơn</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.totalOrders}</p>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-6 border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-green-500/30 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
              <p className="text-sm text-green-300 font-semibold">Hoàn thành</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.completed}</p>
          </div>

          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-6 border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/30 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-400" />
              </div>
              <p className="text-sm text-yellow-300 font-semibold">Chờ xử lý</p>
            </div>
            <p className="text-3xl font-bold text-white">{stats.pending}</p>
          </div>

          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-purple-400" />
              </div>
              <p className="text-sm text-purple-300 font-semibold">Thu nhập</p>
            </div>
            <p className="text-2xl font-bold text-white">{formatCurrency(stats.earnings)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("processing")}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === "processing"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              <span>Đang xử lý ({processingOrders.length})</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab("completed")}
            className={`flex-1 py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
              activeTab === "completed"
                ? "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30"
                : "bg-gray-800 text-gray-400 hover:bg-gray-700"
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <CheckCircle className="w-5 h-5" />
              <span>Hoàn thành ({completedOrders.length})</span>
            </div>
          </button>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {activeTab === "processing" ? (
            processingOrders.length > 0 ? (
              processingOrders.map((order) => (
                <ShipperOrderCard
                  key={order.id}
                  order={order}
                  onStartDelivery={startDelivery}
                  onComplete={completeDelivery}
                />
              ))
            ) : (
              <div className="text-center py-20">
                <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Không có đơn hàng đang xử lý</p>
                <p className="text-gray-500 text-sm mt-2">
                  {isOnline ? "Đơn hàng mới sẽ xuất hiện ở đây" : "Bật chế độ online để nhận đơn"}
                </p>
              </div>
            )
          ) : (
            completedOrders.length > 0 ? (
              completedOrders.map((order) => (
                <ShipperOrderCard key={order.id} order={order} />
              ))
            ) : (
              <div className="text-center py-20">
                <CheckCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400 text-lg">Chưa có đơn hàng hoàn thành</p>
              </div>
            )
          )}
        </div>
      </div>

      {/* Order Notification Modal */}
      {pendingOrder && (
        <OrderNotificationModal
          order={pendingOrder}
          onAccept={() => assignOrder(pendingOrder.id, 'assigned')}
          onReject={() => assignOrder(pendingOrder.id, 'cancel')}
          onClose={dismissPendingOrder}
        />
      )}
    </div>
  );
}

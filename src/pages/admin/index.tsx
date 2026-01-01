import { useEffect, useState } from "react";
import { DashboardOverview } from "@/components/admin/dashboard/DashboardOverview";
import { RevenueChart } from "@/components/admin/dashboard/RevenueChart";
import { RecentOrders } from "@/components/admin/dashboard/RecentOrders";
import { TopProducts } from "@/components/admin/dashboard/TopProducts";
import { LowStockAlert } from "@/components/admin/dashboard/LowStockAlert";
import dashboardService, { type DashboardStats } from "@/api/services/dashboardService";
import { LayoutDashboard, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardStats = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await dashboardService.getStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      setError("Không thể tải dữ liệu dashboard. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const currentDate = new Date().toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-xl p-6 text-white shadow-lg relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2"></div>

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
              <LayoutDashboard className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
              <p className="text-slate-300 mt-1 flex items-center gap-2">
                <span>{currentDate}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Alert */}
      {
        error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchDashboardStats()}
              className="ml-auto text-red-700 border-red-300 hover:bg-red-100"
            >
              Thử lại
            </Button>
          </div>
        )
      }

      {/* KPI Cards */}
      <DashboardOverview stats={stats} loading={loading} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <RevenueChart data={stats?.weeklyRevenue} loading={loading} />
        </div>
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <TopProducts data={stats?.topProducts} loading={loading} />
        </div>
      </div>

      {/* Alerts and Recent Orders Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <LowStockAlert data={stats?.lowStockProducts} loading={loading} />
        </div>
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <RecentOrders data={stats?.recentOrders} loading={loading} />
        </div>
      </div>
    </div >
  );
}


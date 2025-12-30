import { Card } from "@/components/ui/card";
import { Users, Package, ShoppingCart, TrendingUp, Loader2 } from "lucide-react";
import type { DashboardStats } from "@/api/services/dashboardService";

interface StatItem {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toLocaleString("vi-VN");
}

function formatCurrency(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + "K";
  }
  return num.toLocaleString("vi-VN");
}

interface DashboardOverviewProps {
  stats?: DashboardStats | null;
  loading?: boolean;
}

export function DashboardOverview({ stats, loading }: DashboardOverviewProps) {
  const statItems: StatItem[] = [
    {
      title: "Tổng User",
      value: loading ? "..." : formatNumber(stats?.totalUsers || 0),
      icon: Users,
      color: "bg-blue-100 text-blue-600",
    },
    {
      title: "Tổng Sản phẩm",
      value: loading ? "..." : formatNumber(stats?.totalProducts || 0),
      icon: Package,
      color: "bg-green-100 text-green-600",
    },
    {
      title: "Đơn hàng hôm nay",
      value: loading ? "..." : formatNumber(stats?.todayDeliveredOrders || 0),
      icon: ShoppingCart,
      color: "bg-purple-100 text-purple-600",
    },
    {
      title: "Doanh thu tháng",
      value: loading ? "..." : formatCurrency(stats?.monthlyRevenue || 0) + "₫",
      icon: TrendingUp,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statItems.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </h3>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Icon className="w-4 h-4" />
                )}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {stat.value}
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

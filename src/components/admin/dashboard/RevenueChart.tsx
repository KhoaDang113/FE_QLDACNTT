import { Card } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface WeeklyRevenueItem {
  date: string;
  revenue: number;
  orders: number;
}

interface RevenueChartProps {
  data?: WeeklyRevenueItem[];
  loading?: boolean;
}

function formatDayName(dateStr: string): string {
  const date = new Date(dateStr);
  const dayOfWeek = date.getDay();
  const dayNames = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];
  return dayNames[dayOfWeek];
}

function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + "M";
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0) + "K";
  }
  return value.toString();
}

export function RevenueChart({ data = [], loading }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    name: formatDayName(item.date),
    doanhthu: item.revenue,
    donhang: item.orders,
  }));

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Doanh thu theo tuần</h3>
        <p className="text-sm text-muted-foreground">
          Biểu đồ doanh thu 7 ngày gần nhất
        </p>
      </div>
      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Chưa có dữ liệu doanh thu
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis tickFormatter={formatCurrency} />
            <Tooltip
              formatter={(value: number, name: string) => [
                name === "Doanh thu"
                  ? value.toLocaleString("vi-VN") + "₫"
                  : value + " đơn",
                name === "Doanh thu" ? "Doanh thu" : "Đơn hàng"
              ]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="doanhthu"
              stroke="#3b82f6"
              name="Doanh thu"
            />
            <Line
              type="monotone"
              dataKey="donhang"
              stroke="#10b981"
              name="Đơn hàng"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

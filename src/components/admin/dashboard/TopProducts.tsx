import { Card } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface TopProduct {
  productId: string;
  name: string;
  quantity: number;
}

interface TopProductsProps {
  data?: TopProduct[];
  loading?: boolean;
}

export function TopProducts({ data = [], loading }: TopProductsProps) {
  const chartData = data.map((item) => ({
    name: item.name.length > 15 ? item.name.slice(0, 15) + "..." : item.name,
    soluong: item.quantity,
    fullName: item.name,
  }));

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">Sản phẩm bán chạy</h3>
        <p className="text-sm text-muted-foreground">
          Top 5 sản phẩm bán chạy nhất
        </p>
      </div>
      {loading ? (
        <div className="h-[300px] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-[300px] flex items-center justify-center text-muted-foreground">
          Chưa có dữ liệu sản phẩm bán chạy
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-2 border rounded shadow">
                      <p className="font-medium">{data.fullName}</p>
                      <p className="text-sm text-muted-foreground">
                        Số lượng bán: {data.soluong}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="soluong" fill="#8b5cf6" name="Số lượng bán" />
          </BarChart>
        </ResponsiveContainer>
      )}
    </Card>
  );
}

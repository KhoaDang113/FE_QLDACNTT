import api from "../axiosConfig";

export interface DashboardStats {
    totalUsers: number;
    totalProducts: number;
    todayDeliveredOrders: number;
    monthlyRevenue: number;
    weeklyRevenue: Array<{ date: string; revenue: number; orders: number }>;
    topProducts: Array<{ productId: string; name: string; quantity: number }>;
    lowStockProducts: Array<{ id: string; name: string; quantity: number; unit: string }>;
    recentOrders: Array<{
        id: string;
        customer: string;
        total: number;
        status: string;
        createdAt: string;
    }>;
}

class DashboardService {
    private readonly basePath = "/orders/admin/dashboard";

    async getStats(): Promise<DashboardStats> {
        try {
            const response = await api.get<DashboardStats>(this.basePath);
            return response.data;
        } catch (error) {
            console.error("[DashboardService] Error fetching dashboard stats:", error);
            throw error;
        }
    }
}

export default new DashboardService();

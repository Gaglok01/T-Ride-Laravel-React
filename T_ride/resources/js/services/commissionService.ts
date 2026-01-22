import axiosInstance from '@/lib/axios';

// ==================== TYPES ====================

export interface CommissionRule {
    id: number;
    type: 'ride' | 'delivery' | 'courier' | 'vendor';
    name: string;
    base_rate: number;
    min_commission: number | null;
    max_commission: number | null;
    surge_multiplier: string | null;
    attributes: {
        featured_rate?: number;
        new_vendor_rate?: number;
        promo_period?: string;
        vendors_count?: number;
        monthly_revenue?: number;
    } | null;
    city_id: number | null;
    city?: {
        id: number;
        name: string;
    };
    status: 'active' | 'inactive';
    created_at: string;
    updated_at: string;
}

export interface CommissionTier {
    id: number;
    type: 'driver' | 'vendor';
    name: string;
    min_threshold: number;
    max_threshold: number | null;
    rate: number;
    description: string | null;
    created_at: string;
    updated_at: string;
}

export interface CommissionEarning {
    id: number;
    period: string;
    period_date: string;
    rides_revenue: number;
    delivery_revenue: number;
    courier_revenue: number;
    total_revenue: number;
    commission_earned: number;
    avg_rate: number;
    growth_percentage: number;
    created_at: string;
    updated_at: string;
}

export interface DashboardStats {
    total_earned: number;
    total_earned_trend: number;
    avg_commission: number;
    avg_commission_trend: number;
    driver_commission: number;
    driver_commission_trend: number;
    vendor_commission: number;
    vendor_commission_trend: number;
    courier_commission: number;
    courier_commission_trend: number;
    revenue_breakdown: {
        rides: number;
        rides_percent: number;
        delivery: number;
        delivery_percent: number;
        courier: number;
        courier_percent: number;
        total: number;
    };
    service_stats: {
        standard_rides: { rate: number; volume: number; earned: number };
        premium_rides: { rate: number; volume: number; earned: number };
        food_delivery: { rate: number; volume: number; earned: number };
        courier_services: { rate: number; volume: number; earned: number };
    };
}

// ==================== API METHODS ====================

const commissionService = {
    // Dashboard Stats
    getDashboardStats: async (): Promise<DashboardStats> => {
        const response = await axiosInstance.get('/admin/commissions/stats');
        return response.data;
    },

    // Calculate Projections
    calculateProjections: async (data: { growth_rate: number; months: number; rate_adjustment?: number }): Promise<{
        current: { monthly_revenue: number; monthly_commission: number; base_rate: number };
        projected: { total_revenue: number; total_commission: number; new_rate: number };
        growth: { revenue_growth_percent: number; commission_growth_percent: number };
        monthly_breakdown: { month: number; projected_revenue: number; projected_commission: number }[];
    }> => {
        const response = await axiosInstance.post('/admin/commissions/projections', data);
        return response.data;
    },

    // Commission Rules
    getRules: async (type?: string): Promise<CommissionRule[]> => {
        const params = type ? { type } : {};
        const response = await axiosInstance.get('/admin/commission-rules', { params });
        return response.data;
    },

    createRule: async (data: Partial<CommissionRule>): Promise<CommissionRule> => {
        const response = await axiosInstance.post('/admin/commission-rules', data);
        return response.data;
    },

    getRule: async (id: number): Promise<CommissionRule> => {
        const response = await axiosInstance.get(`/admin/commission-rules/${id}`);
        return response.data;
    },

    updateRule: async (id: number, data: Partial<CommissionRule>): Promise<CommissionRule> => {
        const response = await axiosInstance.put(`/admin/commission-rules/${id}`, data);
        return response.data;
    },

    updateRuleStatus: async (id: number, status: 'active' | 'inactive'): Promise<CommissionRule> => {
        const response = await axiosInstance.patch(`/admin/commission-rules/${id}/status`, { status });
        return response.data;
    },

    deleteRule: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/admin/commission-rules/${id}`);
    },

    // Commission Tiers
    getTiers: async (type?: string): Promise<CommissionTier[]> => {
        const params = type ? { type } : {};
        const response = await axiosInstance.get('/admin/commission-tiers', { params });
        return response.data;
    },

    createTier: async (data: Partial<CommissionTier>): Promise<CommissionTier> => {
        const response = await axiosInstance.post('/admin/commission-tiers', data);
        return response.data;
    },

    getTier: async (id: number): Promise<CommissionTier> => {
        const response = await axiosInstance.get(`/admin/commission-tiers/${id}`);
        return response.data;
    },

    updateTier: async (id: number, data: Partial<CommissionTier>): Promise<CommissionTier> => {
        const response = await axiosInstance.put(`/admin/commission-tiers/${id}`, data);
        return response.data;
    },

    deleteTier: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/admin/commission-tiers/${id}`);
    },

    // Earnings History
    getEarnings: async (): Promise<CommissionEarning[]> => {
        const response = await axiosInstance.get('/admin/commission-earnings');
        return response.data;
    },

    createEarning: async (data: Partial<CommissionEarning>): Promise<CommissionEarning> => {
        const response = await axiosInstance.post('/admin/commission-earnings', data);
        return response.data;
    },

    deleteEarning: async (id: number): Promise<void> => {
        await axiosInstance.delete(`/admin/commission-earnings/${id}`);
    },
};

export default commissionService;

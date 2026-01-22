import axiosInstance from '@/lib/axios';

// ==================== TYPES ====================

export interface City {
    id: number;
    name: string;
    country: string;
    timezone?: string;
    currency?: string;
    services?: string[];
    status: 'active' | 'inactive';
    service_zones_count?: number;
    transportation_hubs_count?: number;
    restricted_areas_count?: number;
    service_zones?: ServiceZone[];
    transportation_hubs?: TransportationHub[];
    restricted_areas?: RestrictedArea[];
    created_at?: string;
    updated_at?: string;
}

export interface ServiceZone {
    id: number;
    city_id: number;
    name: string;
    description?: string;
    boundaries?: any;
    price_multiplier: number;
    status: 'active' | 'inactive';
    city?: City;
    created_at?: string;
    updated_at?: string;
}

export interface TransportationHub {
    id: number;
    city_id: number;
    name: string;
    type: 'airport' | 'hub' | 'station';
    pickup_fee: number;
    queue_capacity: number;
    coordinates?: { lat: number; lng: number };
    status: 'active' | 'inactive';
    city?: City;
    created_at?: string;
    updated_at?: string;
}

export interface RestrictedArea {
    id: number;
    city_id: number;
    name: string;
    restriction_type: 'no_entry' | 'time_based' | 'pickup_only' | 'dropoff_only';
    reason?: string;
    effective_period?: string;
    boundaries?: any;
    status: 'active' | 'inactive';
    city?: City;
    created_at?: string;
    updated_at?: string;
}

export interface ExpansionPlan {
    id: number;
    city_name: string;
    country: string;
    stage: 'research' | 'partnerships' | 'licensing' | 'launch_prep' | 'launched';
    progress: number;
    target_launch_date?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
}

export interface DashboardStats {
    active_cities: number;
    total_zones: number;
    total_countries: number;
    total_hubs: number;
    restricted_areas: number;
    expansion_pipeline: number;
}

export interface CitiesResponse {
    status: boolean;
    stats: {
        total_cities: number;
        active_cities: number;
        total_zones: number;
        total_countries: number;
    };
    data: City[];
}

// ==================== CITY SERVICE ====================

class CityZoneService {
    // Dashboard Stats
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await axiosInstance.get('/admin/cities-zones/stats');
        return response.data.data;
    }

    // ==================== CITIES ====================
    
    async getCities(params?: any): Promise<CitiesResponse> {
        const response = await axiosInstance.get('/admin/cities', { params });
        return response.data;
    }

    async getCity(id: number): Promise<City> {
        const response = await axiosInstance.get(`/admin/cities/${id}`);
        return response.data.data;
    }

    async createCity(data: Partial<City>): Promise<City> {
        const response = await axiosInstance.post('/admin/cities', data);
        return response.data.data;
    }

    async updateCity(id: number, data: Partial<City>): Promise<City> {
        const response = await axiosInstance.put(`/admin/cities/${id}`, data);
        return response.data.data;
    }

    async updateCityStatus(id: number, status: 'active' | 'inactive'): Promise<void> {
        await axiosInstance.patch(`/admin/cities/${id}/status`, { status });
    }

    async deleteCity(id: number): Promise<void> {
        await axiosInstance.delete(`/admin/cities/${id}`);
    }

    // ==================== SERVICE ZONES ====================

    async getServiceZones(params?: any): Promise<ServiceZone[]> {
        const response = await axiosInstance.get('/admin/service-zones', { params });
        return response.data.data;
    }

    async getServiceZone(id: number): Promise<ServiceZone> {
        const response = await axiosInstance.get(`/admin/service-zones/${id}`);
        return response.data.data;
    }

    async createServiceZone(data: Partial<ServiceZone>): Promise<ServiceZone> {
        const response = await axiosInstance.post('/admin/service-zones', data);
        return response.data.data;
    }

    async updateServiceZone(id: number, data: Partial<ServiceZone>): Promise<ServiceZone> {
        const response = await axiosInstance.put(`/admin/service-zones/${id}`, data);
        return response.data.data;
    }

    async updateServiceZoneStatus(id: number, status: 'active' | 'inactive'): Promise<void> {
        await axiosInstance.patch(`/admin/service-zones/${id}/status`, { status });
    }

    async deleteServiceZone(id: number): Promise<void> {
        await axiosInstance.delete(`/admin/service-zones/${id}`);
    }

    // ==================== TRANSPORTATION HUBS ====================

    async getTransportationHubs(params?: any): Promise<TransportationHub[]> {
        const response = await axiosInstance.get('/admin/transportation-hubs', { params });
        return response.data.data;
    }

    async getTransportationHub(id: number): Promise<TransportationHub> {
        const response = await axiosInstance.get(`/admin/transportation-hubs/${id}`);
        return response.data.data;
    }

    async createTransportationHub(data: Partial<TransportationHub>): Promise<TransportationHub> {
        const response = await axiosInstance.post('/admin/transportation-hubs', data);
        return response.data.data;
    }

    async updateTransportationHub(id: number, data: Partial<TransportationHub>): Promise<TransportationHub> {
        const response = await axiosInstance.put(`/admin/transportation-hubs/${id}`, data);
        return response.data.data;
    }

    async updateTransportationHubStatus(id: number, status: 'active' | 'inactive'): Promise<void> {
        await axiosInstance.patch(`/admin/transportation-hubs/${id}/status`, { status });
    }

    async deleteTransportationHub(id: number): Promise<void> {
        await axiosInstance.delete(`/admin/transportation-hubs/${id}`);
    }

    // ==================== RESTRICTED AREAS ====================

    async getRestrictedAreas(params?: any): Promise<RestrictedArea[]> {
        const response = await axiosInstance.get('/admin/restricted-areas', { params });
        return response.data.data;
    }

    async getRestrictedArea(id: number): Promise<RestrictedArea> {
        const response = await axiosInstance.get(`/admin/restricted-areas/${id}`);
        return response.data.data;
    }

    async createRestrictedArea(data: Partial<RestrictedArea>): Promise<RestrictedArea> {
        const response = await axiosInstance.post('/admin/restricted-areas', data);
        return response.data.data;
    }

    async updateRestrictedArea(id: number, data: Partial<RestrictedArea>): Promise<RestrictedArea> {
        const response = await axiosInstance.put(`/admin/restricted-areas/${id}`, data);
        return response.data.data;
    }

    async updateRestrictedAreaStatus(id: number, status: 'active' | 'inactive'): Promise<void> {
        await axiosInstance.patch(`/admin/restricted-areas/${id}/status`, { status });
    }

    async deleteRestrictedArea(id: number): Promise<void> {
        await axiosInstance.delete(`/admin/restricted-areas/${id}`);
    }

    // ==================== EXPANSION PLANS ====================

    async getExpansionPlans(params?: any): Promise<ExpansionPlan[]> {
        const response = await axiosInstance.get('/admin/expansion-plans', { params });
        return response.data.data;
    }

    async getExpansionPlan(id: number): Promise<ExpansionPlan> {
        const response = await axiosInstance.get(`/admin/expansion-plans/${id}`);
        return response.data.data;
    }

    async createExpansionPlan(data: Partial<ExpansionPlan>): Promise<ExpansionPlan> {
        const response = await axiosInstance.post('/admin/expansion-plans', data);
        return response.data.data;
    }

    async updateExpansionPlan(id: number, data: Partial<ExpansionPlan>): Promise<ExpansionPlan> {
        const response = await axiosInstance.put(`/admin/expansion-plans/${id}`, data);
        return response.data.data;
    }

    async deleteExpansionPlan(id: number): Promise<void> {
        await axiosInstance.delete(`/admin/expansion-plans/${id}`);
    }
}

export default new CityZoneService();

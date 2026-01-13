import axiosInstance from '@/lib/axios';

export interface Order {
    id: number;
    order_id: string; // e.g. PKG-20001
    sender: string;
    recipient: string;
    package_type: string;
    courier: string;
    fee: number | string;
    status: 'In Transit' | 'Delivered' | 'Pending' | string;
    created_at?: string;
    updated_at?: string;
}

export interface CreateOrderRequest {
    sender: string;
    recipient: string;
    package_type: string;
    courier: string;
    fee: number | string;
    status: string;
}

export interface UpdateOrderRequest extends Partial<CreateOrderRequest> {
    
}

export interface OrderResponse {
    success: boolean;
    data: Order[] | Order;
    message?: string;
}

class OrderService {
    /**
     * Get all orders
     */
    async getAll(): Promise<Order[]> {
        const response = await axiosInstance.get('/admin/orders');
        return response.data.data; 
    }

    /**
     * Create a new order
     */
    async create(data: CreateOrderRequest): Promise<Order> {
        const response = await axiosInstance.post('/admin/orders', data);
        return response.data.data;
    }

    /**
     * Get an order by ID
     */
    async get(id: number): Promise<Order> {
        const response = await axiosInstance.get(`/admin/orders/${id}`);
        return response.data.data;
    }

    /**
     * Update an order
     */
    async update(id: number, data: UpdateOrderRequest): Promise<Order> {
        const response = await axiosInstance.put(`/admin/orders/${id}`, data);
        return response.data.data;
    }

    /**
     * Delete an order
     */
    async delete(id: number): Promise<void> {
        await axiosInstance.delete(`/admin/orders/${id}`);
    }
}

export default new OrderService();

import axiosInstance from '@/lib/axios';

export interface LoginRequest {
    identifier: string;
    password?: string;
}

export interface VerifyOtpRequest {
    identifier: string;
    otp: string;
}

export interface AuthResponse {
    success: boolean;
    message: string;
    data?: {
        token?: string;
        user?: {
            id: number;
            name: string;
            email: string;
            phone_number: string;
        };
    };
}

export interface BaseResponse {
    success: boolean;
    message: string;
}

export interface RegisterRequest {
    name: string;
    email: string;
    phone_number: string;
    password: string;
    role?: string;
}

class AuthService {
    /**
     * Register a new user
     */
    async register(data: RegisterRequest): Promise<AuthResponse> {
        const response = await axiosInstance.post<AuthResponse>('/register', data);
        return response.data;
    }

    /**
     * Send OTP to user's email or phone
     */
    async login(data: LoginRequest): Promise<BaseResponse> {
        const response = await axiosInstance.post<BaseResponse>('/login', data);
        return response.data;
    }

    /**
     * Verify OTP and authenticate user
     */
    async verifyOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
        const response = await axiosInstance.post<AuthResponse>('/verify-otp', data);
        
        // Store token and user data if authentication is successful
        if (response.data.success && response.data.data?.token) {
            localStorage.setItem('auth_token', response.data.data.token);
        }
        if (response.data.success && response.data.data?.user) {
            localStorage.setItem('user', JSON.stringify(response.data.data.user));
        }
        
        return response.data;
    }

    /**
     * Logout user and clear stored data
     */
    async logout(): Promise<void> {
        try {
            await axiosInstance.post('/logout');
        } finally {
            // Clear local storage regardless of API response
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            sessionStorage.removeItem('adminEmail');
        }
    }

    /**
     * Get current authenticated user from localStorage
     */
    getUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return !!localStorage.getItem('auth_token');
    }

    /**
     * Send password reset link
     */
    async forgotPassword(data: { email: string }): Promise<BaseResponse> {
        const response = await axiosInstance.post<BaseResponse>('/forgot-password', data);
        return response.data;
    }

    /**
     * Reset password with OTP
     */
    async resetPassword(data: { email: string, otp: string, password: string, password_confirmation: string }): Promise<BaseResponse> {
        const response = await axiosInstance.post<BaseResponse>('/reset-password', data);
        return response.data;
    }
}

export default new AuthService();

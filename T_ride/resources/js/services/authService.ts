import axiosInstance from '@/lib/axios';

export interface LoginRequest {
    identifier: string;
}

export interface VerifyOtpRequest {
    identifier: string;
    otp: string;
}

export interface AuthResponse {
    message: string;
    token?: string;
    user?: {
        id: number;
        name: string;
        email: string;
        phone_number: string;
    };
}

export interface OtpResponse {
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
        
        // Store token and user data if registration is successful (auto-login usually)
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response.data;
    }

    /**
     * Send OTP to user's email or phone
     */
    async login(data: LoginRequest): Promise<OtpResponse> {
        const response = await axiosInstance.post<OtpResponse>('/login', data);
        return response.data;
    }

    /**
     * Verify OTP and authenticate user
     */
    async verifyOtp(data: VerifyOtpRequest): Promise<AuthResponse> {
        const response = await axiosInstance.post<AuthResponse>('/verify-otp', data);
        
        // Store token and user data if authentication is successful
        if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
        }
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
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
}

export default new AuthService();

import axios, { AxiosInstance } from 'axios';
import { getToken } from '../utils/secureStore';

const API_BASE_URL = 'http://10.0.1.32:5267';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await getToken();
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export interface SignUpRequest {
    username: string;
    password: string;
    confirmPassword: string;
    fullname: string;
    email: string;
    phone?: string;
    branchCode?: string;
}

export interface SignInRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    accessToken: string;
    refreshToken?: string;
    user: {
        id: string;
        username: string;
        email: string;
        fullname?: string;
        phone?: string;
        position?: string;
        positionTitle?: string;
        department?: string;
        departmentName?: string;
        role?: 'admin' | 'manager' | 'employee';
        roleName?: string;
        roleId?: number;
    };
}

export const authService = {
    async signUp(data: SignUpRequest): Promise<AuthResponse> {
        try {
            const response = await axiosInstance.post<AuthResponse>('/api/auth/register', data);
            // Token sẽ được lưu bởi AuthContext sau khi signUp
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async signIn(data: SignInRequest): Promise<AuthResponse> {
        try {
            const response = await axiosInstance.post<any>('/api/auth/login', data);

            // Backend trả về format khác: { success, message, user, token }
            const backendData = response.data;
            const token = backendData.token || backendData.accessToken;

            // Token sẽ được lưu bởi AuthContext sau khi signIn
            // Chuyển đổi sang format chuẩn
            return {
                accessToken: token,
                user: backendData.user,
            };
        } catch (error) {
            throw error;
        }
    },

    async me(): Promise<AuthResponse['user']> {
        try {
            const response = await axiosInstance.get<AuthResponse['user']>('/api/auth/me');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    async logout(): Promise<void> {
        // Token sẽ được xóa bởi AuthContext
        // Không cần làm gì ở đây
    },

    async getAuthToken(): Promise<string | null> {
        return await getToken();
    },
};

export default axiosInstance;

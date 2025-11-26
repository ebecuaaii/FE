import AsyncStorage from '@react-native-async-storage/async-storage';
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = 'http://192.168.1.13:5267';

const axiosInstance: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add token to requests
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('authToken');
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
        department?: string;
        role?: 'admin' | 'manager' | 'employee';
    };
}

export const authService = {
    async signUp(data: SignUpRequest): Promise<AuthResponse> {
        try {
            const response = await axiosInstance.post<AuthResponse>('/api/auth/register', data);
            if (response.data.accessToken) {
                await AsyncStorage.setItem('authToken', response.data.accessToken);
            }
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

            if (token) {
                await AsyncStorage.setItem('authToken', token);
            }

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
        await AsyncStorage.removeItem('authToken');
    },

    async getAuthToken(): Promise<string | null> {
        return await AsyncStorage.getItem('authToken');
    },
};

export default axiosInstance;

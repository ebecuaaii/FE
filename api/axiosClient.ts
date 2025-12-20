import axios from "axios";
import { getToken, saveToken, removeToken } from "../utils/secureStore";

const api = axios.create({
    baseURL: 'http://10.0.1.32:5267',
    headers: {
        'Content-Type': 'application/json',
    },
});

// 👉 Thêm token vào request
api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// 👉 Tự refresh token nếu 401, xử lý 403
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

        // Xử lý 401 Unauthorized - thử refresh token
        if (error?.response?.status === 401 && !original._retry) {
            original._retry = true;

            try {
                const refresh = await api.post("/auth/refresh");
                const newToken = refresh.data.accessToken;

                await saveToken(newToken);

                original.headers.Authorization = `Bearer ${newToken}`;
                return api(original);
            } catch (err) {
                await removeToken();
            }
        }

        // Xử lý 403 Forbidden
        if (error?.response?.status === 403) {
            console.error("403 Forbidden:", original?.url, error?.response?.data?.message || "Access denied");
        }

        return Promise.reject(error);
    }
);

export default api;

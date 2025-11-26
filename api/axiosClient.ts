import axios from "axios";
import { getToken, saveToken, removeToken } from "../utils/secureStore";

const api = axios.create({
    baseURL: 'http://192.168.1.13:5267',
});

// 👉 Thêm token vào request
api.interceptors.request.use(async (config) => {
    const token = await getToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// 👉 Tự refresh token nếu 401
api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config;

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

        return Promise.reject(error);
    }
);

export default api;

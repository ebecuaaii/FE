import { createContext, useState, useEffect } from "react";
import { saveToken, getToken, removeToken, saveUserData, getUserData, removeUserData } from "../utils/secureStore";
import { authService, AuthResponse } from "../services/authService";

type User = AuthResponse['user'];

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user từ storage khi app start
    useEffect(() => {
        (async () => {
            try {
                const token = await getToken();
                if (token) {
                    // Thử load user data từ storage trước
                    const storedUserData = await getUserData();
                    if (storedUserData) {
                        setUser(storedUserData);
                        setLoading(false);
                        return;
                    }

                    // Nếu không có trong storage, thử gọi API (nếu endpoint có)
                    try {
                        const userData = await authService.me();
                        setUser(userData);
                        await saveUserData(userData);
                    } catch (error: any) {
                        // Nếu endpoint không tồn tại (404), dựa vào user data từ login response đã lưu
                        if (error?.response?.status !== 404) {
                            // Lỗi khác (401, 500, etc.) - xóa token
                            await removeToken();
                            await removeUserData();
                        }
                    }
                }
            } catch (error) {
                console.error("Error loading user:", error);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const login = async (username: string, password: string) => {
        const res = await authService.signIn({ username, password });

        await saveToken(res.accessToken);
        if (res.user) {
            await saveUserData(res.user); // Lưu user data vào storage
            setUser(res.user);
        }
    };

    const logout = async () => {
        await removeToken();
        await removeUserData();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
}

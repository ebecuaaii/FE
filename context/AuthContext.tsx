import { createContext, useState, useEffect } from "react";
import { saveToken, getToken, removeToken } from "../utils/secureStore";
import { authService, AuthResponse } from "../services/authService";

type User = AuthResponse['user'];

export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: any) {
    const [user, setUser] = useState<User | null>(null);

    // Load user nếu đã có token
    useEffect(() => {
        // TODO: Backend chưa có endpoint /api/auth/me
        // Tạm thời comment để tránh lỗi 404
        // Khi backend có endpoint này, uncomment code dưới

        /*
        (async () => {
            const token = await getToken();
            if (token) {
                try {
                    const userData = await authService.me();
                    setUser(userData);
                } catch (error) {
                    await removeToken();
                }
            }
        })();
        */
    }, []);

    const login = async (username: string, password: string) => {
        const res = await authService.signIn({ username, password });

        await saveToken(res.accessToken);
        setUser(res.user);
    };

    const logout = async () => {
        await removeToken();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

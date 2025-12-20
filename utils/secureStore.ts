import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const isWeb = Platform.OS === 'web';

export async function saveToken(token: string) {
    if (isWeb) {
        localStorage.setItem("accessToken", token);
    } else {
        await SecureStore.setItemAsync("accessToken", token);
    }
}

export async function getToken(): Promise<string | null> {
    if (isWeb) {
        return localStorage.getItem("accessToken");
    } else {
        return await SecureStore.getItemAsync("accessToken");
    }
}

export async function removeToken() {
    if (isWeb) {
        localStorage.removeItem("accessToken");
    } else {
        await SecureStore.deleteItemAsync("accessToken");
    }
}

// User data storage functions
export async function saveUserData(user: any) {
    const userData = JSON.stringify(user);
    if (isWeb) {
        localStorage.setItem("userData", userData);
    } else {
        await SecureStore.setItemAsync("userData", userData);
    }
}

export async function getUserData(): Promise<any | null> {
    try {
        let userData: string | null;
        if (isWeb) {
            userData = localStorage.getItem("userData");
        } else {
            userData = await SecureStore.getItemAsync("userData");
        }

        if (userData) {
            return JSON.parse(userData);
        }
        return null;
    } catch (error) {
        console.error("Error getting user data:", error);
        return null;
    }
}

export async function removeUserData() {
    if (isWeb) {
        localStorage.removeItem("userData");
    } else {
        await SecureStore.deleteItemAsync("userData");
    }
}

export async function getUserId(): Promise<string | null> {
    const userData = await getUserData();
    return userData?.id || userData?.userId || null;
}
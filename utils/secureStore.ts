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

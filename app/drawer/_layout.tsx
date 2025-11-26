import { Drawer } from "expo-router/drawer";
import { Home, CheckSquare, Bell, User } from "lucide-react-native";

export default function DrawerLayout() {
    return (
        <Drawer
            screenOptions={{
                headerShown: false,
                drawerActiveTintColor: "#0d9488",
                drawerInactiveTintColor: "#555",
                drawerLabelStyle: { fontSize: 16 },
                drawerStyle: { backgroundColor: "#fff", width: 260 },
            }}
        >
            <Drawer.Screen
                name="index"
                options={{
                    drawerLabel: "Trang chủ",
                    drawerIcon: ({ color, size }: { color: string, size: number }) => <Home color={color} size={size} />,
                }}
            />

            <Drawer.Screen
                name="(tabs)/home"
                options={{
                    drawerLabel: "Trang chủ",
                    drawerIcon: ({ color, size }: { color: string, size: number }) => <Home color={color} size={size} />,
                    drawerItemStyle: { display: 'none' },
                }}
            />

            <Drawer.Screen
                name="(tabs)/task"
                options={{
                    drawerLabel: "Tác vụ",
                    drawerIcon: ({ color, size }: { color: string, size: number }) => (
                        <CheckSquare color={color} size={size} />
                    ),
                }}
            />

            <Drawer.Screen
                name="(tabs)/notification"
                options={{
                    drawerLabel: "Thông báo",
                    drawerIcon: ({ color, size }: { color: string, size: number }) => (
                        <Bell color={color} size={size} />
                    ),
                }}
            />

            <Drawer.Screen
                name="(tabs)/account"
                options={{
                    drawerLabel: "Tài khoản",
                    drawerIcon: ({ color, size }: { color: string, size: number }) => (
                        <User color={color} size={size} />
                    ),
                }}
            />
        </Drawer>
    );
}

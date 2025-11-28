import { MaterialCommunityIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import AccountScreen from './account';
import AdminHomeScreen from './admin-home';
import HomeScreen from './home';
import NotificationScreen from './notification';
import TaskScreen from './task';
import AdminTaskScreen from './admin-task';

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
    const { user } = useContext(AuthContext);

    // Kiểm tra role từ nhiều nguồn (hỗ trợ cả uppercase và lowercase)
    const userRole = user?.role || user?.userRole || user?.Role || user?.roleName;
    const userRoleLower = userRole?.toLowerCase();
    const isAdminOrManager = 
        userRoleLower === 'admin' || 
        userRoleLower === 'manager' ||
        userRole === 'Admin' ||
        userRole === 'Manager' ||
        user?.username === 'admin' || 
        user?.username === 'manager';

    // Chọn component dựa trên role
    const HomeComponent = isAdminOrManager ? AdminHomeScreen : HomeScreen;
    const TaskComponent = isAdminOrManager ? AdminTaskScreen : TaskScreen;
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarActiveTintColor: '#0d9488',   // đổi màu tab đang chọn
                tabBarInactiveTintColor: 'gray',
                tabBarIcon: ({ color, size }) => {
                    let iconName: any = '';
                    if (route.name === 'home') {
                        iconName = 'home-outline';
                    } else if (route.name === 'account') {
                        iconName = 'account-outline';
                    } else if (route.name === 'notification') {
                        iconName = 'bell-outline';
                    } else if (route.name === 'task') {
                        iconName = 'clipboard-outline';
                    }
                    return <MaterialCommunityIcons name={iconName} size={size} color={color} />;

                },
            })}
        >
            <Tab.Screen
                name="home"
                component={HomeComponent}
                options={{ title: 'Home' }}
            />
            <Tab.Screen
                name="task"
                component={TaskComponent}
                options={{ title: 'Tasks' }}
            />
            <Tab.Screen
                name="notification"
                component={NotificationScreen}
                options={{ title: 'Notifications' }}
            />
            <Tab.Screen
                name="account"
                component={AccountScreen}
                options={{ title: 'Account' }}
            />
        </Tab.Navigator>

    );
}


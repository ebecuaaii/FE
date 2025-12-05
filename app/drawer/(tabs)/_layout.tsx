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
import ManagerHomeScreen from './manager-home';
import ManagerTaskScreen from './manager-task';

const Tab = createBottomTabNavigator();

export default function TabsLayout() {
    const { user } = useContext(AuthContext);

    // Xác định role của user
    const roleIdRaw = user?.roleId || (user as any)?.RoleId || (user as any)?.role_id;
    const roleId = typeof roleIdRaw === 'string' ? parseInt(roleIdRaw) : roleIdRaw;
    const userRole = (user?.roleName || user?.role || '')?.toLowerCase();
    const userPosition = (
        user?.positionTitle ||
        user?.position ||
        (user as any)?.PositionName ||
        ''
    )?.toLowerCase();
    const userDepartment = (
        user?.departmentName ||
        user?.department ||
        (user as any)?.DepartmentName ||
        ''
    )?.toLowerCase();

    // Phân quyền theo roleId hoặc roleName
    const isAdmin = roleId === 1 || userRole === 'admin';
    const isManager = roleId === 2 ||
        (!isAdmin && (
            userRole === 'manager' ||
            userPosition?.includes('manager') ||
            userPosition?.includes('quản lý') ||
            userPosition?.includes('quản lý chi nhánh') ||
            userDepartment?.includes('manager') ||
            userDepartment?.includes('quản lý')
        ));

    // Chọn component dựa trên role
    let HomeComponent = HomeScreen;
    let TaskComponent = TaskScreen;

    if (isAdmin) {
        HomeComponent = AdminHomeScreen;
        TaskComponent = AdminTaskScreen;
    } else if (isManager) {
        HomeComponent = ManagerHomeScreen;
        TaskComponent = ManagerTaskScreen;
    }
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


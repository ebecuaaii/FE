import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Easing, TouchableWithoutFeedback } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Menu, Home, CheckSquare, Bell, User } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { AuthContext } from '../context/AuthContext';

type MenuKey = 'home' | 'task' | 'notification' | 'account';
type MenuRoute = string;

type Props = {
  title: string;
  activeKey: MenuKey;
  children: React.ReactNode;
};

type MenuItem = {
  key: MenuKey;
  label: string;
  icon: React.ComponentType<{ color?: string; size?: number }>;
  route: MenuRoute;
};

const SidebarLayout: React.FC<Props> = ({ title, activeKey, children }) => {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const sidebarWidth = 270;
  const slideAnim = useRef(new Animated.Value(-sidebarWidth)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const [selectedKey, setSelectedKey] = useState<MenuKey>(activeKey);

  useEffect(() => {
    setSelectedKey(activeKey);
  }, [activeKey]);

  // Xác định role của user
  const getUserRole = () => {
    const user = authContext?.user;
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

    // Phân quyền theo roleId:
    // roleId = 1 → Admin
    // roleId = 2 → Manager
    // roleId = 3 hoặc khác → Employee
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

    if (isAdmin) return 'admin';
    if (isManager) return 'manager';
    return 'employee';
  };

  const userRole = getUserRole();

  const menuItems = useMemo<MenuItem[]>(
    () => {
      if (userRole === 'admin') {
        return [
          { key: 'home', label: 'Trang chủ', icon: Home, route: '/drawer/(tabs)/admin-home' },
          { key: 'task', label: 'Tác vụ', icon: CheckSquare, route: '/drawer/(tabs)/admin-task' },
          { key: 'notification', label: 'Thông báo', icon: Bell, route: '/drawer/(tabs)/notification' },
          { key: 'account', label: 'Tài khoản', icon: User, route: '/drawer/(tabs)/account' },
        ];
      } else if (userRole === 'manager') {
        return [
          { key: 'home', label: 'Trang chủ', icon: Home, route: '/drawer/(tabs)/manager-home' },
          { key: 'task', label: 'Tác vụ', icon: CheckSquare, route: '/drawer/(tabs)/manager-task' },
          { key: 'notification', label: 'Thông báo', icon: Bell, route: '/drawer/(tabs)/notification' },
          { key: 'account', label: 'Tài khoản', icon: User, route: '/drawer/(tabs)/account' },
        ];
      } else {
        return [
          { key: 'home', label: 'Trang chủ', icon: Home, route: '/drawer/(tabs)/home' },
          { key: 'task', label: 'Tác vụ', icon: CheckSquare, route: '/drawer/(tabs)/task' },
          { key: 'notification', label: 'Thông báo', icon: Bell, route: '/drawer/(tabs)/notification' },
          { key: 'account', label: 'Tài khoản', icon: User, route: '/drawer/(tabs)/account' },
        ];
      }
    },
    [userRole]
  );

  const openSidebar = () => {
    setSidebarVisible(true);
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 280,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeSidebar = (onFinished?: () => void) => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -sidebarWidth,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(overlayAnim, {
        toValue: 0,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSidebarVisible(false);
      onFinished?.();
    });
  };

  const handleMenuSelect = (route: MenuRoute, key: MenuKey) => {
    setSelectedKey(key);
    closeSidebar(() => {
      router.push(route as any);
    });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.menuButton} onPress={openSidebar}>
          <Menu size={22} color="#0d9488" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{title}</Text>
      </View>

      <View style={styles.contentWrapper}>
        <View style={styles.content}>{children}</View>

        {isSidebarVisible && (
          <>
            <TouchableWithoutFeedback onPress={() => closeSidebar()}>
              <Animated.View style={[styles.overlay, { opacity: overlayAnim }]} />
            </TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.sidebar,
                {
                  transform: [{ translateX: slideAnim }],
                  width: sidebarWidth,
                },
              ]}
            >
              <Text style={styles.sidebarTitle}>Menu</Text>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = selectedKey === item.key;
                const content = (
                  <>
                    <Icon color={isActive ? '#fff' : '#0d9488'} size={20} />
                    <Text style={[styles.menuLabel, isActive && styles.menuLabelActive]}>{item.label}</Text>
                  </>
                );
                return (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.9}
                    onPress={() => handleMenuSelect(item.route, item.key)}
                    style={{ marginBottom: 12 }}
                  >
                    {isActive ? (
                      <LinearGradient
                        colors={['#0fd8c9', '#0aa190']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.menuItemGradient}
                      >
                        <View style={styles.menuInner}>{content}</View>
                      </LinearGradient>
                    ) : (
                      <View style={styles.menuItem}>
                        <View style={styles.menuInner}>{content}</View>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#F4F9F7',
    paddingTop: 40, // Đẩy toàn bộ layout xuống 
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 8,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e2e8f0',
  },
  topBarTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0f172a',
    marginLeft: 12,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#bde6df',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f2fffd',
  },
  content: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#fff',
    paddingTop: 24,
    paddingHorizontal: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 24,
  },
  menuItem: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#d2f4ef',
    padding: 14,
    backgroundColor: '#f8fffe',
  },
  menuItemGradient: {
    borderRadius: 18,
    padding: 14,
    transform: [{ scale: 1.02 }],
  },
  menuInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuLabel: {
    fontSize: 16,
    color: '#0f172a',
    fontWeight: '500',
  },
  menuLabelActive: {
    color: '#fff',
  },
});

export default SidebarLayout;


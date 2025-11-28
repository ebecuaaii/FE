import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../../context/AuthContext';
import SidebarLayout from '../../../components/SidebarLayout';

const AdminHomeScreen = () => {
    const authContext = useContext(AuthContext);
    const router = useRouter();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        setGreeting(getGreeting());
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    const user = authContext?.user;
    const userName = user?.fullname || user?.username || 'Admin';
    const userRoleValue = user?.role || user?.userRole || user?.Role || user?.roleName;
    const userRoleLower = userRoleValue?.toLowerCase();
    const userRole = userRoleLower === 'admin' ? 'Quản trị viên' : 'Quản lý';

    const adminActions = [
        { id: '1', title: 'Quản lý nhân viên', color: '#0d9488' },
        { id: '2', title: 'Báo cáo/Thống kê', color: '#0ea5e9' },
        { id: '3', title: 'Lương/Thưởng', color: '#f59e0b' },
        { id: '4', title: 'Tạo lịch làm việc', color: '#2563eb' },
        { id: '5', title: 'Quản lý ca làm', color: '#14b8a6' },
        { id: '6', title: 'Cài đặt hệ thống', color: '#ec4899' },
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <LinearGradient
                colors={['#7c3aed', '#a855f7', '#c084fc']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerWrapper}
            >
                <View style={styles.headerGradient}>
                    <View style={styles.headerCard}>
                        <View style={styles.headerContent}>
                            <View style={styles.headerLeft}>
                                <Text style={styles.greetingText}>{greeting}</Text>
                                <View style={styles.userInfo}>
                                    <Text style={styles.userName}>{userName}</Text>
                                    <View style={styles.badge}>
                                        <Text style={styles.badgeText}>{userRole}</Text>
                                    </View>
                                </View>
                                <Text style={styles.motivationText}>Bảng điều khiển quản trị</Text>
                            </View>
                            <View style={styles.headerRight}>
                                <View style={styles.avatarContainer}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {userName.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Admin Actions */}
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Chức năng quản trị</Text>
                <View style={styles.actionsGrid}>
                    {adminActions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.actionCard}
                            onPress={() => alert(`Chức năng ${action.title} đang phát triển`)}
                        >
                            <LinearGradient
                                colors={[action.color, action.color + 'dd']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                                style={styles.actionGradient}
                            >
                                <Text style={styles.actionTitle}>{action.title}</Text>

                            </LinearGradient>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Stats */}
                <Text style={styles.sectionTitle}>Thống kê nhanh</Text>
                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>15</Text>
                        <Text style={styles.statLabel}>Nhân viên</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>12</Text>
                        <Text style={styles.statLabel}>Đơn chờ duyệt</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Text style={styles.statNumber}>98%</Text>
                        <Text style={styles.statLabel}>Tỷ lệ chấm công</Text>
                    </View>
                </View>
            </View>
        </ScrollView>

    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    headerWrapper: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    headerGradient: {
        justifyContent: 'center',
    },
    headerCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
    },
    greetingText: {
        fontSize: 16,
        color: '#ffffff',
        opacity: 0.9,
        marginBottom: 8,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginRight: 10,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    motivationText: {
        fontSize: 14,
        color: '#ffffff',
        opacity: 0.9,
    },
    headerRight: {
        alignItems: 'center',
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.5)',
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#7c3aed',
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
        marginTop: 8,
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 24,
    },
    actionCard: {
        width: '48%',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
    },
    actionGradient: {
        padding: 20,
        minHeight: 80,
        justifyContent: 'center',
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#ffffff',
        opacity: 0.9,
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#7c3aed',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
    },
});

export default AdminHomeScreen;

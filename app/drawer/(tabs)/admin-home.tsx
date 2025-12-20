import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AuthContext } from '../../../context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import employeeService from '../../../services/employeeService';
import leaveRequestService from '../../../services/leaveRequestService';
import lateRequestService from '../../../services/lateRequestService';
import shiftRequestService from '../../../services/shiftRequestService';

const AdminHomeScreen = () => {
    const authContext = useContext(AuthContext);
    const router = useRouter();
    const [greeting, setGreeting] = useState('');
    const [totalEmployees, setTotalEmployees] = useState(0);
    const [totalRequests, setTotalRequests] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setGreeting(getGreeting());
        fetchEmployeeData();
        fetchTotalRequests();
    }, []);

    const fetchEmployeeData = async () => {
        try {
            setLoading(true);
            const employees = await employeeService.getEmployees();
            setTotalEmployees(employees.length);
        } catch (error) {
            console.error('Error fetching employees:', error);
            setTotalEmployees(0);
        } finally {
            setLoading(false);
        }
    };

    const fetchTotalRequests = async () => {
        try {
            const [leaveReqs, lateReqs, shiftReqs] = await Promise.all([
                leaveRequestService.getAll(),
                lateRequestService.getAll(),
                shiftRequestService.getAll(),
            ]);

            const totalAll = leaveReqs.length + lateReqs.length + shiftReqs.length;
            setTotalRequests(totalAll);
        } catch (error) {
            console.error('Error fetching total requests:', error);
            setTotalRequests(0);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    const user = authContext?.user;
    const userName = user?.fullname || user?.username || 'Admin';

    const handleStatCardPress = (statId: string) => {
        switch (statId) {
            case '1': // Tổng nhân viên
                router.push('/adminfunction/employee-list');
                break;
            case '2': // Duyệt đơn phiếu
                router.push('/adminfunction/request-approval');
                break;
            case '3': // Đi muộn hôm nay
                router.push('/adminfunction/late-arrivals');
                break;
            case '4': // Nghỉ phép
                router.push('/adminfunction/leave-management');
                break;
            default:
                alert('Chức năng đang phát triển');
                break;
        }
    };

    const adminActions = [
        {
            id: '1',
            title: 'Quản lý nhân viên',
            icon: 'people-outline',
            color: '#14b8a6'
        },
        {
            id: '2',
            title: 'Báo cáo/Thống kê',
            icon: 'document-text-outline',
            color: '#06b6d4'
        },
        {
            id: '3',
            title: 'Lương/Thưởng',
            icon: 'card-outline',
            color: '#f59e0b'
        },
        {
            id: '4',
            title: 'Tạo lịch làm việc',
            icon: 'calendar-outline',
            color: '#3b82f6'
        },
        {
            id: '5',
            title: 'Quản lý ca làm',
            icon: 'layers-outline',
            color: '#14b8a6'
        },
        {
            id: '6',
            title: 'Cài đặt hệ thống',
            icon: 'settings-outline',
            color: '#ec4899'
        },
    ];

    const statsData = [
        {
            id: '1',
            title: 'Tổng nhân viên',
            value: loading ? '...' : totalEmployees.toString(),
            change: '+15',
            changeType: 'positive',
            icon: 'people-outline',
            iconColor: '#14b8a6'
        },
        {
            id: '2',
            title: 'Duyệt đơn phiếu',
            value: loading ? '...' : totalRequests.toString(),
            change: '+3',
            changeType: 'positive',
            icon: 'list',
            iconColor: '#3b82f6'
        },
        {
            id: '3',
            title: 'Đi muộn hôm nay',
            value: '0',
            change: '0',
            changeType: 'negative',
            icon: 'time-outline',
            iconColor: '#f59e0b'
        },
        {
            id: '4',
            title: 'Nghỉ phép',
            value: '12',
            change: '+2',
            changeType: 'positive',
            icon: 'calendar-outline',
            iconColor: '#8b5cf6'
        },
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <LinearGradient
                colors={['#14b8a6', '#0d9488']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerWrapper}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.greetingText}>{greeting}</Text>
                        <Text style={styles.userName}>{userName}</Text>
                        <Text style={styles.motivationText}>Bảng điều khiển quản trị</Text>
                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>Quản trị viên</Text>
                        </View>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {userName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Stats Section */}
            <View style={styles.content}>
                <Text style={styles.sectionTitle}>Thống kê tổng quan</Text>
                <View style={styles.statsGrid}>
                    {statsData.map((stat) => (
                        <TouchableOpacity
                            key={stat.id}
                            style={styles.statCard}
                            onPress={() => handleStatCardPress(stat.id)}
                            activeOpacity={0.7}
                        >
                            <View style={styles.statHeader}>
                                <View style={[styles.statIconContainer, { backgroundColor: stat.iconColor + '20' }]}>
                                    <Ionicons name={stat.icon as any} size={20} color={stat.iconColor} />
                                </View>
                                <View style={[styles.changeContainer, {
                                    backgroundColor: stat.changeType === 'positive' ? '#dcfce7' : '#fef2f2'
                                }]}>
                                    <Text style={[styles.changeText, {
                                        color: stat.changeType === 'positive' ? '#16a34a' : '#dc2626'
                                    }]}>
                                        {stat.change}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.statTitle}>{stat.title}</Text>
                            <Text style={styles.statValue}>{stat.value}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Admin Actions */}
                <Text style={styles.sectionTitle}>Chức năng quản trị</Text>
                <View style={styles.actionsGrid}>
                    {adminActions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.actionCard}
                            onPress={() => {
                                if (action.id === '1') {
                                    router.push('/adminfunction/employee-list');
                                } else if (action.id === '2') {
                                    router.push('/adminfunction/reports-statistics');
                                } else if (action.id === '3') {
                                    router.push('/adminfunction/salary-bonus-management');
                                } else if (action.id === '4') {
                                    router.push('/function/weekly-schedule');
                                } else if (action.id === '5') {
                                    router.push('/function/shift-schedule');
                                } else if (action.id === '6') {
                                    router.push('/adminfunction/system-settings');
                                } else {
                                    alert(`Chức năng ${action.title} đang phát triển`);
                                }
                            }}
                        >
                            <View style={[styles.actionIconContainer, { backgroundColor: action.color + '20' }]}>
                                <Ionicons name={action.icon as any} size={32} color={action.color} />
                            </View>
                            <Text style={styles.actionTitle}>{action.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Salary Overview */}
                <Text style={styles.sectionTitle}>Tổng quan lương thưởng 12/2024</Text>
                <View style={styles.salaryOverview}>
                    <View style={[styles.salaryCard, { backgroundColor: '#e0f2fe' }]}>
                        <Text style={styles.salaryLabel}>Tổng lương phải trả</Text>
                        <Text style={[styles.salaryValue, { color: '#0277bd' }]}>4.2 tỷ</Text>
                        <Text style={styles.salaryChange}>+5.2% so với tháng trước</Text>
                    </View>

                    <View style={[styles.salaryCard, { backgroundColor: '#e8f5e8' }]}>
                        <Text style={styles.salaryLabel}>Đã thanh toán</Text>
                        <Text style={[styles.salaryValue, { color: '#2e7d32' }]}>3.8 tỷ</Text>
                        <Text style={styles.salaryChange}>90% hoàn thành</Text>
                    </View>

                    <View style={[styles.salaryCard, { backgroundColor: '#fff3e0' }]}>
                        <Text style={styles.salaryLabel}>Chưa thanh toán</Text>
                        <Text style={[styles.salaryValue, { color: '#f57c00' }]}>420 triệu</Text>
                        <Text style={styles.salaryChange}>25 nhân viên</Text>
                    </View>

                    <View style={[styles.salaryCard, { backgroundColor: '#f3e5f5' }]}>
                        <Text style={styles.salaryLabel}>Thưởng & phụ cấp</Text>
                        <Text style={[styles.salaryValue, { color: '#7b1fa2' }]}>680 triệu</Text>
                        <Text style={styles.salaryChange}>Đã duyệt</Text>
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
    userName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    motivationText: {
        fontSize: 14,
        color: '#ffffff',
        opacity: 0.9,
        marginBottom: 12,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        alignSelf: 'flex-start',
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    headerRight: {
        alignItems: 'center',
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
        color: '#14b8a6',
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    changeContainer: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    changeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statTitle: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    actionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    actionCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 16,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIconContainer: {
        width: 60,
        height: 60,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
        textAlign: 'center',
    },
    salaryOverview: {
        gap: 12,
    },
    salaryCard: {
        padding: 20,
        borderRadius: 12,
        marginBottom: 12,
    },
    salaryLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        opacity: 0.8,
    },
    salaryValue: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    salaryChange: {
        fontSize: 13,
        opacity: 0.7,
    },
});

export default AdminHomeScreen;

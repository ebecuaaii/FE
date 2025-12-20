import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import employeeService from '../../services/employeeService';

const SalaryBonusManagementScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [totalEmployees, setTotalEmployees] = useState(0);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const employees = await employeeService.getEmployees();
            setTotalEmployees(employees.length);
        } catch (error) {
            console.error('Error fetching data:', error);
            Alert.alert('Lỗi', 'Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchData();
        setRefreshing(false);
    };

    const salaryOverview = [
        {
            id: '1',
            title: 'Tổng lương phải trả',
            value: '4.2 tỷ',
            change: '+5.2%',
            changeType: 'positive',
            icon: 'wallet-outline',
            color: '#0277bd',
            backgroundColor: '#e0f2fe'
        },
        {
            id: '2',
            title: 'Đã thanh toán',
            value: '3.8 tỷ',
            change: '90%',
            changeType: 'positive',
            icon: 'checkmark-circle-outline',
            color: '#2e7d32',
            backgroundColor: '#e8f5e8'
        },
        {
            id: '3',
            title: 'Chưa thanh toán',
            value: '420 triệu',
            change: '25 NV',
            changeType: 'warning',
            icon: 'time-outline',
            color: '#f57c00',
            backgroundColor: '#fff3e0'
        },
        {
            id: '4',
            title: 'Thưởng & phụ cấp',
            value: '680 triệu',
            change: 'Đã duyệt',
            changeType: 'positive',
            icon: 'gift-outline',
            color: '#7b1fa2',
            backgroundColor: '#f3e5f5'
        },
    ];

    const salaryActions = [
        {
            id: '1',
            title: 'Bảng lương tháng',
            description: 'Xem và quản lý bảng lương hàng tháng',
            icon: 'calendar-outline',
            color: '#3b82f6',
            route: '/function/monthly-salary'
        },
        {
            id: '2',
            title: 'Lương theo ngày',
            description: 'Tính lương theo ngày công',
            icon: 'today-outline',
            color: '#10b981',
            route: '/function/daily-salary'
        },
        {
            id: '3',
            title: 'Phiếu lương',
            description: 'Tạo và in phiếu lương nhân viên',
            icon: 'document-text-outline',
            color: '#8b5cf6',
            route: '/function/payslip'
        },
        {
            id: '4',
            title: 'Hiệu suất làm việc',
            description: 'Đánh giá hiệu suất và tính thưởng',
            icon: 'trending-up-outline',
            color: '#f59e0b',
            route: '/function/work-performance'
        },
        {
            id: '5',
            title: 'Quản lý thưởng phạt',
            description: 'Tạo và quản lý thưởng phạt',
            icon: 'medal-outline',
            color: '#ef4444',
            route: '/adminfunction/reward-penalty-manage'
        },
        {
            id: '6',
            title: 'Lịch sử thưởng phạt',
            description: 'Xem lịch sử thưởng phạt nhân viên',
            icon: 'list-outline',
            color: '#06b6d4',
            route: '/function/reward-penalty-history'
        },
    ];

    const quickStats = [
        {
            title: 'Lương trung bình',
            value: '12.5 triệu',
            icon: 'bar-chart-outline',
            color: '#3b82f6'
        },
        {
            title: 'Tổng thưởng tháng',
            value: '180 triệu',
            icon: 'trophy-outline',
            color: '#f59e0b'
        },
        {
            title: 'Tổng phạt tháng',
            value: '25 triệu',
            icon: 'warning-outline',
            color: '#ef4444'
        },
        {
            title: 'Phụ cấp',
            value: '320 triệu',
            icon: 'add-circle-outline',
            color: '#10b981'
        },
    ];

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#f59e0b" />
                <Text style={styles.loadingText}>Đang tải dữ liệu lương thưởng...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#f59e0b']}
                />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý Lương & Thưởng</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                        <Ionicons name="refresh" size={20} color="#f59e0b" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                {/* Salary Overview */}
                <Text style={styles.sectionTitle}>Tổng quan lương thưởng tháng 12/2024</Text>
                <View style={styles.overviewGrid}>
                    {salaryOverview.map((item) => (
                        <View key={item.id} style={[styles.overviewCard, { backgroundColor: item.backgroundColor }]}>
                            <View style={styles.overviewHeader}>
                                <Ionicons name={item.icon as any} size={24} color={item.color} />
                                <View style={[styles.changeIndicator, {
                                    backgroundColor: item.changeType === 'positive' ? '#dcfce7' :
                                        item.changeType === 'warning' ? '#fef3c7' : '#fecaca'
                                }]}>
                                    <Text style={[styles.changeText, {
                                        color: item.changeType === 'positive' ? '#16a34a' :
                                            item.changeType === 'warning' ? '#d97706' : '#dc2626'
                                    }]}>
                                        {item.change}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.overviewTitle}>{item.title}</Text>
                            <Text style={[styles.overviewValue, { color: item.color }]}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                {/* Quick Statistics */}
                <Text style={styles.sectionTitle}>Thống kê nhanh</Text>
                <View style={styles.quickStatsGrid}>
                    {quickStats.map((stat, index) => (
                        <View key={index} style={styles.quickStatCard}>
                            <View style={[styles.quickStatIcon, { backgroundColor: stat.color + '20' }]}>
                                <Ionicons name={stat.icon as any} size={20} color={stat.color} />
                            </View>
                            <Text style={styles.quickStatValue}>{stat.value}</Text>
                            <Text style={styles.quickStatTitle}>{stat.title}</Text>
                        </View>
                    ))}
                </View>

                {/* Salary Management Actions */}
                <Text style={styles.sectionTitle}>Chức năng quản lý</Text>
                <View style={styles.actionsGrid}>
                    {salaryActions.map((action) => (
                        <TouchableOpacity
                            key={action.id}
                            style={styles.actionCard}
                            onPress={() => router.push(action.route as any)}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: action.color + '20' }]}>
                                <Ionicons name={action.icon as any} size={28} color={action.color} />
                            </View>
                            <View style={styles.actionContent}>
                                <Text style={styles.actionTitle}>{action.title}</Text>
                                <Text style={styles.actionDescription}>{action.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Monthly Summary */}
                <Text style={styles.sectionTitle}>Tóm tắt tháng 12/2024</Text>
                <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                        <Ionicons name="analytics-outline" size={24} color="#3b82f6" />
                        <Text style={styles.summaryTitle}>Báo cáo tổng kết</Text>
                    </View>
                    <View style={styles.summaryContent}>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tổng nhân viên:</Text>
                            <Text style={styles.summaryValue}>{totalEmployees} người</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Đã thanh toán lương:</Text>
                            <Text style={[styles.summaryValue, { color: '#16a34a' }]}>90%</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>Tổng chi phí:</Text>
                            <Text style={styles.summaryValue}>4.88 tỷ VNĐ</Text>
                        </View>
                        <View style={styles.summaryRow}>
                            <Text style={styles.summaryLabel}>So với tháng trước:</Text>
                            <Text style={[styles.summaryValue, { color: '#16a34a' }]}>+5.2%</Text>
                        </View>
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
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    headerRight: {
        width: 40,
        alignItems: 'flex-end',
    },
    refreshButton: {
        padding: 8,
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
    overviewGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    overviewCard: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
    },
    overviewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    changeIndicator: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    changeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    overviewTitle: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
        fontWeight: '600',
    },
    overviewValue: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    quickStatsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    quickStatCard: {
        width: '48%',
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    quickStatIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    quickStatValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    quickStatTitle: {
        fontSize: 12,
        color: '#6b7280',
        textAlign: 'center',
    },
    actionsGrid: {
        gap: 12,
        marginBottom: 32,
    },
    actionCard: {
        backgroundColor: '#ffffff',
        padding: 16,
        borderRadius: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    actionIcon: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionContent: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    actionDescription: {
        fontSize: 14,
        color: '#6b7280',
    },
    summaryCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    summaryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginLeft: 12,
    },
    summaryContent: {
        gap: 12,
    },
    summaryRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    summaryValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
});

export default SalaryBonusManagementScreen;
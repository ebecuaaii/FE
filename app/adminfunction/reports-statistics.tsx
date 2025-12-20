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
import leaveRequestService from '../../services/leaveRequestService';
import lateRequestService from '../../services/lateRequestService';
import shiftRequestService from '../../services/shiftRequestService';

const ReportsStatisticsScreen = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [stats, setStats] = useState({
        totalEmployees: 0,
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
        rejectedRequests: 0,
        leaveRequests: 0,
        lateRequests: 0,
        shiftRequests: 0,
    });

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        try {
            setLoading(true);

            const [employees, leaveReqs, lateReqs, shiftReqs] = await Promise.all([
                employeeService.getEmployees(),
                leaveRequestService.getAll(),
                lateRequestService.getAll(),
                shiftRequestService.getAll(),
            ]);

            const allRequests = [...leaveReqs, ...lateReqs, ...shiftReqs];

            setStats({
                totalEmployees: employees.length,
                totalRequests: allRequests.length,
                pendingRequests: allRequests.filter(req => req.status === 'Pending').length,
                approvedRequests: allRequests.filter(req => req.status === 'Approved').length,
                rejectedRequests: allRequests.filter(req => req.status === 'Rejected').length,
                leaveRequests: leaveReqs.length,
                lateRequests: lateReqs.length,
                shiftRequests: shiftReqs.length,
            });
        } catch (error) {
            console.error('Error fetching statistics:', error);
            Alert.alert('Lỗi', 'Không thể tải thống kê');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStatistics();
        setRefreshing(false);
    };

    const formatPercentage = (value: number, total: number) => {
        if (total === 0) return '0%';
        return `${Math.round((value / total) * 100)}%`;
    };

    const reportCategories = [
        {
            id: '1',
            title: 'Báo cáo nhân viên',
            description: 'Thống kê chi tiết về nhân viên',
            icon: 'people-outline',
            color: '#14b8a6',
            route: '/adminfunction/employee-list'
        },
        {
            id: '2',
            title: 'Báo cáo chấm công',
            description: 'Thống kê chấm công và đi muộn',
            icon: 'time-outline',
            color: '#f59e0b',
            route: '/adminfunction/late-arrivals'
        },
        {
            id: '3',
            title: 'Báo cáo nghỉ phép',
            description: 'Thống kê nghỉ phép và đơn từ',
            icon: 'calendar-outline',
            color: '#8b5cf6',
            route: '/adminfunction/leave-management'
        },
        {
            id: '4',
            title: 'Báo cáo đơn phiếu',
            description: 'Tổng hợp tất cả đơn phiếu',
            icon: 'document-text-outline',
            color: '#3b82f6',
            route: '/adminfunction/request-approval'
        },
    ];

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#06b6d4" />
                <Text style={styles.loadingText}>Đang tải báo cáo thống kê...</Text>
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
                    colors={['#06b6d4']}
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
                <Text style={styles.headerTitle}>Báo cáo & Thống kê</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                        <Ionicons name="refresh" size={20} color="#06b6d4" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                {/* Overview Statistics */}
                <Text style={styles.sectionTitle}>Tổng quan hệ thống</Text>
                <View style={styles.overviewGrid}>
                    <View style={[styles.overviewCard, { borderLeftColor: '#14b8a6' }]}>
                        <View style={styles.overviewHeader}>
                            <Ionicons name="people" size={24} color="#14b8a6" />
                            <Text style={styles.overviewValue}>{stats.totalEmployees}</Text>
                        </View>
                        <Text style={styles.overviewLabel}>Tổng nhân viên</Text>
                    </View>

                    <View style={[styles.overviewCard, { borderLeftColor: '#3b82f6' }]}>
                        <View style={styles.overviewHeader}>
                            <Ionicons name="document-text" size={24} color="#3b82f6" />
                            <Text style={styles.overviewValue}>{stats.totalRequests}</Text>
                        </View>
                        <Text style={styles.overviewLabel}>Tổng đơn phiếu</Text>
                    </View>
                </View>

                {/* Request Statistics */}
                <Text style={styles.sectionTitle}>Thống kê đơn phiếu</Text>
                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: '#fef3c7' }]}>
                        <View style={styles.statHeader}>
                            <Ionicons name="hourglass-outline" size={20} color="#f59e0b" />
                            <Text style={styles.statValue}>{stats.pendingRequests}</Text>
                        </View>
                        <Text style={styles.statLabel}>Chờ duyệt</Text>
                        <Text style={styles.statPercentage}>
                            {formatPercentage(stats.pendingRequests, stats.totalRequests)}
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: '#dcfce7' }]}>
                        <View style={styles.statHeader}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#16a34a" />
                            <Text style={styles.statValue}>{stats.approvedRequests}</Text>
                        </View>
                        <Text style={styles.statLabel}>Đã duyệt</Text>
                        <Text style={styles.statPercentage}>
                            {formatPercentage(stats.approvedRequests, stats.totalRequests)}
                        </Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: '#fecaca' }]}>
                        <View style={styles.statHeader}>
                            <Ionicons name="close-circle-outline" size={20} color="#dc2626" />
                            <Text style={styles.statValue}>{stats.rejectedRequests}</Text>
                        </View>
                        <Text style={styles.statLabel}>Từ chối</Text>
                        <Text style={styles.statPercentage}>
                            {formatPercentage(stats.rejectedRequests, stats.totalRequests)}
                        </Text>
                    </View>
                </View>

                {/* Request Types */}
                <Text style={styles.sectionTitle}>Phân loại đơn phiếu</Text>
                <View style={styles.typeGrid}>
                    <View style={styles.typeCard}>
                        <View style={styles.typeHeader}>
                            <View style={[styles.typeIcon, { backgroundColor: '#8b5cf6' + '20' }]}>
                                <Ionicons name="calendar-outline" size={24} color="#8b5cf6" />
                            </View>
                            <Text style={styles.typeValue}>{stats.leaveRequests}</Text>
                        </View>
                        <Text style={styles.typeLabel}>Đơn nghỉ phép</Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${(stats.leaveRequests / stats.totalRequests) * 100}%`,
                                        backgroundColor: '#8b5cf6'
                                    }
                                ]}
                            />
                        </View>
                    </View>

                    <View style={styles.typeCard}>
                        <View style={styles.typeHeader}>
                            <View style={[styles.typeIcon, { backgroundColor: '#f59e0b' + '20' }]}>
                                <Ionicons name="time-outline" size={24} color="#f59e0b" />
                            </View>
                            <Text style={styles.typeValue}>{stats.lateRequests}</Text>
                        </View>
                        <Text style={styles.typeLabel}>Đơn đi trễ</Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${(stats.lateRequests / stats.totalRequests) * 100}%`,
                                        backgroundColor: '#f59e0b'
                                    }
                                ]}
                            />
                        </View>
                    </View>

                    <View style={styles.typeCard}>
                        <View style={styles.typeHeader}>
                            <View style={[styles.typeIcon, { backgroundColor: '#14b8a6' + '20' }]}>
                                <Ionicons name="swap-horizontal-outline" size={24} color="#14b8a6" />
                            </View>
                            <Text style={styles.typeValue}>{stats.shiftRequests}</Text>
                        </View>
                        <Text style={styles.typeLabel}>Đơn đổi ca</Text>
                        <View style={styles.progressBar}>
                            <View
                                style={[
                                    styles.progressFill,
                                    {
                                        width: `${(stats.shiftRequests / stats.totalRequests) * 100}%`,
                                        backgroundColor: '#14b8a6'
                                    }
                                ]}
                            />
                        </View>
                    </View>
                </View>

                {/* Report Categories */}
                <Text style={styles.sectionTitle}>Báo cáo chi tiết</Text>
                <View style={styles.reportGrid}>
                    {reportCategories.map((category) => (
                        <TouchableOpacity
                            key={category.id}
                            style={styles.reportCard}
                            onPress={() => router.push(category.route as any)}
                        >
                            <View style={[styles.reportIcon, { backgroundColor: category.color + '20' }]}>
                                <Ionicons name={category.icon as any} size={28} color={category.color} />
                            </View>
                            <View style={styles.reportContent}>
                                <Text style={styles.reportTitle}>{category.title}</Text>
                                <Text style={styles.reportDescription}>{category.description}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                        </TouchableOpacity>
                    ))}
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
        gap: 12,
        marginBottom: 32,
    },
    overviewCard: {
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        borderLeftWidth: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    overviewHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    overviewValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    overviewLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '600',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 32,
    },
    statCard: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    statHeader: {
        alignItems: 'center',
        marginBottom: 8,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        fontWeight: '600',
        marginBottom: 4,
    },
    statPercentage: {
        fontSize: 11,
        color: '#9ca3af',
    },
    typeGrid: {
        gap: 16,
        marginBottom: 32,
    },
    typeCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    typeHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    typeIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    typeValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    typeLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
    },
    progressBar: {
        height: 6,
        backgroundColor: '#f3f4f6',
        borderRadius: 3,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 3,
    },
    reportGrid: {
        gap: 12,
    },
    reportCard: {
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
    reportIcon: {
        width: 56,
        height: 56,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    reportContent: {
        flex: 1,
    },
    reportTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    reportDescription: {
        fontSize: 14,
        color: '#6b7280',
    },
});

export default ReportsStatisticsScreen;
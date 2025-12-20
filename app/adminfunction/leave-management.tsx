import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import leaveRequestService, { LeaveRequest } from '../../services/leaveRequestService';

const LeaveManagementScreen = () => {
    const router = useRouter();
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTab, setSelectedTab] = useState<'current' | 'all'>('current');

    useEffect(() => {
        fetchLeaveRequests();
    }, [selectedTab]);

    const fetchLeaveRequests = async () => {
        try {
            setLoading(true);
            const requests = await leaveRequestService.getAll();

            if (selectedTab === 'current') {
                // Filter for current/upcoming approved leave requests
                const today = new Date();
                const currentLeaves = requests.filter(request => {
                    const startDate = new Date(request.startDate);
                    const endDate = new Date(request.endDate);
                    return request.status === 'Approved' &&
                        (startDate <= today && endDate >= today) || startDate > today;
                });
                setLeaveRequests(currentLeaves);
            } else {
                setLeaveRequests(requests);
            }
        } catch (error) {
            console.error('Error fetching leave requests:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách nghỉ phép');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLeaveRequests();
        setRefreshing(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return '#f59e0b';
            case 'Approved': return '#10b981';
            case 'Rejected': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'Pending': return 'Chờ duyệt';
            case 'Approved': return 'Đã duyệt';
            case 'Rejected': return 'Từ chối';
            default: return status;
        }
    };

    const getLeaveTypeColor = (leaveType: string) => {
        if (!leaveType) return '#6b7280';
        switch (leaveType.toLowerCase()) {
            case 'sick': return '#ef4444';
            case 'annual': return '#3b82f6';
            case 'personal': return '#0d9488';
            case 'maternity': return '#ec4899';
            default: return '#6b7280';
        }
    };

    const calculateLeaveDays = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    const isCurrentLeave = (startDate: string, endDate: string) => {
        const today = new Date();
        const start = new Date(startDate);
        const end = new Date(endDate);
        return start <= today && end >= today;
    };

    const renderLeaveRequest = ({ item }: { item: LeaveRequest }) => (
        <View style={[
            styles.requestCard,
            isCurrentLeave(item.startDate, item.endDate) && styles.currentLeaveCard
        ]}>
            <View style={styles.requestHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                            {item.userName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{item.userName}</Text>
                        <View style={styles.badgeContainer}>
                            <View style={[styles.leaveTypeBadge, {
                                backgroundColor: getLeaveTypeColor(item.leaveType) + '20'
                            }]}>
                                <Text style={[styles.leaveTypeText, {
                                    color: getLeaveTypeColor(item.leaveType)
                                }]}>
                                    {item.leaveType}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={[styles.statusBadge, {
                    backgroundColor: getStatusColor(item.status) + '20'
                }]}>
                    <Text style={[styles.statusText, {
                        color: getStatusColor(item.status)
                    }]}>
                        {getStatusLabel(item.status)}
                    </Text>
                </View>
            </View>

            <View style={styles.requestBody}>
                <View style={styles.dateInfo}>
                    <View style={styles.dateItem}>
                        <Ionicons name="calendar-outline" size={16} color="#0d9488" />
                        <Text style={styles.dateLabel}>Từ:</Text>
                        <Text style={styles.dateValue}>{formatDate(item.startDate)}</Text>
                    </View>
                    <View style={styles.dateItem}>
                        <Ionicons name="calendar-outline" size={16} color="#0d9488" />
                        <Text style={styles.dateLabel}>Đến:</Text>
                        <Text style={styles.dateValue}>{formatDate(item.endDate)}</Text>
                    </View>
                    <View style={styles.durationContainer}>
                        <Text style={styles.durationText}>
                            {calculateLeaveDays(item.startDate, item.endDate)} ngày
                        </Text>
                    </View>
                </View>

                <View style={styles.reasonContainer}>
                    <Text style={styles.reasonLabel}>Lý do:</Text>
                    <Text style={styles.reasonText}>{item.reason}</Text>
                </View>

                {item.reviewNote && (
                    <View style={styles.reviewNoteContainer}>
                        <Text style={styles.reviewNoteLabel}>Ghi chú duyệt:</Text>
                        <Text style={styles.reviewNoteText}>{item.reviewNote}</Text>
                    </View>
                )}

                {isCurrentLeave(item.startDate, item.endDate) && (
                    <View style={styles.currentLeaveIndicator}>
                        <Ionicons name="checkmark-circle" size={16} color="#10b981" />
                        <Text style={styles.currentLeaveText}>Đang nghỉ phép</Text>
                    </View>
                )}
            </View>
        </View>
    );

    const currentLeaveCount = leaveRequests.filter(req =>
        isCurrentLeave(req.startDate, req.endDate)
    ).length;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0d9488" />
                <Text style={styles.loadingText}>Đang tải danh sách nghỉ phép...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Quản lý nghỉ phép</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.countText}>
                        {selectedTab === 'current' ? `${currentLeaveCount} đang nghỉ` : `${leaveRequests.length} đơn`}
                    </Text>
                </View>
            </View>

            {/* Tabs */}
            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'current' && styles.activeTab]}
                    onPress={() => setSelectedTab('current')}
                >
                    <Text style={[styles.tabText, selectedTab === 'current' && styles.activeTabText]}>
                        Hiện tại ({currentLeaveCount})
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, selectedTab === 'all' && styles.activeTab]}
                    onPress={() => setSelectedTab('all')}
                >
                    <Text style={[styles.tabText, selectedTab === 'all' && styles.activeTabText]}>
                        Tất cả ({leaveRequests.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Leave Requests List */}
            <FlatList
                data={leaveRequests}
                renderItem={renderLeaveRequest}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#0d9488']}
                    />
                }
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="calendar-outline" size={64} color="#9ca3af" />
                        <Text style={styles.emptyText}>
                            {selectedTab === 'current' ? 'Không có ai đang nghỉ phép' : 'Không có đơn nghỉ phép nào'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
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
        alignItems: 'flex-end',
    },
    countText: {
        fontSize: 14,
        color: '#0d9488',
        fontWeight: '600',
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    tab: {
        flex: 1,
        paddingVertical: 16,
        alignItems: 'center',
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#0d9488',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#6b7280',
    },
    activeTabText: {
        color: '#0d9488',
    },
    listContainer: {
        padding: 20,
    },
    requestCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
        borderLeftWidth: 4,
        borderLeftColor: '#0d9488',
    },
    currentLeaveCard: {
        borderLeftColor: '#10b981',
        backgroundColor: '#f0fdf4',
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#0d9488',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    userAvatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    userDetails: {
        flex: 1,
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    badgeContainer: {
        flexDirection: 'row',
    },
    leaveTypeBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    leaveTypeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    requestBody: {
        gap: 12,
    },
    dateInfo: {
        backgroundColor: '#f8fafc',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    dateItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    dateLabel: {
        fontSize: 14,
        color: '#6b7280',
        fontWeight: '500',
        minWidth: 30,
    },
    dateValue: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '600',
    },
    durationContainer: {
        alignItems: 'flex-end',
    },
    durationText: {
        fontSize: 14,
        color: '#0d9488',
        fontWeight: 'bold',
    },
    reasonContainer: {
        gap: 4,
    },
    reasonLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
    },
    reasonText: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
    },
    reviewNoteContainer: {
        backgroundColor: '#f3f4f6',
        padding: 12,
        borderRadius: 8,
    },
    reviewNoteLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 4,
    },
    reviewNoteText: {
        fontSize: 14,
        color: '#4b5563',
    },
    currentLeaveIndicator: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: '#dcfce7',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    currentLeaveText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#16a34a',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
        marginTop: 16,
        textAlign: 'center',
    },
});

export default LeaveManagementScreen;
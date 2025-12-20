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
import lateRequestService, { LateRequest } from '../../services/lateRequestService';

const LateArrivalsScreen = () => {
    const router = useRouter();
    const [lateRequests, setLateRequests] = useState<LateRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchLateRequests();
    }, []);

    const fetchLateRequests = async () => {
        try {
            setLoading(true);
            const requests = await lateRequestService.getAll();

            // Filter for today's late requests
            const today = new Date().toISOString().split('T')[0];
            const todayLateRequests = requests.filter(request =>
                request.date && request.date.startsWith(today) && request.status === 'Approved'
            );

            setLateRequests(todayLateRequests);
        } catch (error) {
            console.error('Error fetching late requests:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách đi muộn');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLateRequests();
        setRefreshing(false);
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return 'N/A';
        return timeString.substring(0, 5); // Get HH:MM format
    };

    const renderLateRequest = ({ item }: { item: LateRequest }) => (
        <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
                <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                            {item.userName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <View style={styles.userDetails}>
                        <Text style={styles.userName}>{item.userName}</Text>
                        <Text style={styles.requestDate}>{formatDate(item.date)}</Text>
                    </View>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={styles.statusText}>Đã duyệt</Text>
                </View>
            </View>

            <View style={styles.requestBody}>
                <View style={styles.timeInfo}>
                    <View style={styles.timeItem}>
                        <Ionicons name="time-outline" size={16} color="#0d9488" />
                        <Text style={styles.timeLabel}>Giờ đến dự kiến:</Text>
                        <Text style={styles.timeValue}>{formatTime(item.expectedArrivalTime)}</Text>
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
            </View>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0d9488" />
                <Text style={styles.loadingText}>Đang tải danh sách đi muộn...</Text>
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
                <Text style={styles.headerTitle}>Đi muộn hôm nay</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.countText}>
                        {lateRequests.length} người
                    </Text>
                </View>
            </View>

            {/* Late Requests List */}
            <FlatList
                data={lateRequests}
                renderItem={renderLateRequest}
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
                        <Ionicons name="time-outline" size={64} color="#9ca3af" />
                        <Text style={styles.emptyText}>Không có ai đi muộn hôm nay</Text>
                        <Text style={styles.emptySubText}>Tất cả nhân viên đều đến đúng giờ!</Text>
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
        marginBottom: 2,
    },
    requestDate: {
        fontSize: 12,
        color: '#6b7280',
    },
    statusBadge: {
        backgroundColor: '#dcfce7',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#16a34a',
    },
    requestBody: {
        gap: 12,
    },
    timeInfo: {
        backgroundColor: '#fef3c7',
        padding: 12,
        borderRadius: 8,
    },
    timeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    timeLabel: {
        fontSize: 14,
        color: '#92400e',
        fontWeight: '500',
    },
    timeValue: {
        fontSize: 14,
        color: '#92400e',
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
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4b5563',
        marginTop: 16,
        textAlign: 'center',
    },
    emptySubText: {
        fontSize: 14,
        color: '#9ca3af',
        marginTop: 8,
        textAlign: 'center',
    },
});

export default LateArrivalsScreen;
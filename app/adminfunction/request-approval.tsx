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
    Modal,
    TextInput,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import leaveRequestService, { LeaveRequest } from '../../services/leaveRequestService';
import lateRequestService, { LateRequest } from '../../services/lateRequestService';
import shiftRequestService, { ShiftRequest } from '../../services/shiftRequestService';

type RequestType = 'leave' | 'late' | 'shift';
type CombinedRequest = (LeaveRequest | LateRequest | ShiftRequest) & { requestType: RequestType };

const RequestApprovalScreen = () => {
    const router = useRouter();
    const [requests, setRequests] = useState<CombinedRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<CombinedRequest | null>(null);
    const [reviewNote, setReviewNote] = useState('');
    const [reviewAction, setReviewAction] = useState<'Approved' | 'Rejected'>('Approved');

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);

            const [leaveReqs, lateReqs, shiftReqs] = await Promise.all([
                leaveRequestService.getAll(),
                lateRequestService.getAll(),
                shiftRequestService.getAll(),
            ]);

            const combined: CombinedRequest[] = [
                ...leaveReqs.map(r => ({ ...r, requestType: 'leave' as RequestType })),
                ...lateReqs.map(r => ({ ...r, requestType: 'late' as RequestType })),
                ...shiftReqs.map(r => ({ ...r, requestType: 'shift' as RequestType })),
            ];

            // Sort by creation date (newest first)
            combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            setRequests(combined);
        } catch (error) {
            console.error('Error fetching requests:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách đơn phiếu');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchRequests();
        setRefreshing(false);
    };

    const handleReviewPress = (request: CombinedRequest, action: 'Approved' | 'Rejected') => {
        setSelectedRequest(request);
        setReviewAction(action);
        setReviewNote('');
        setModalVisible(true);
    };

    const handleSubmitReview = async () => {
        if (!selectedRequest) return;

        try {
            const reviewData = {
                status: reviewAction,
                reviewNote: reviewNote || undefined,
            };

            switch (selectedRequest.requestType) {
                case 'leave':
                    await leaveRequestService.review(selectedRequest.id, reviewData);
                    break;
                case 'late':
                    await lateRequestService.review(selectedRequest.id, reviewData);
                    break;
                case 'shift':
                    await shiftRequestService.review(selectedRequest.id, reviewData);
                    break;
            }

            Alert.alert(
                'Thành công',
                `Đã ${reviewAction === 'Approved' ? 'phê duyệt' : 'từ chối'} đơn phiếu`,
                [{
                    text: 'OK', onPress: () => {
                        setModalVisible(false);
                        fetchRequests();
                    }
                }]
            );
        } catch (error) {
            console.error('Error reviewing request:', error);
            Alert.alert('Lỗi', 'Không thể xử lý đơn phiếu');
        }
    };

    const getRequestTypeLabel = (type: RequestType) => {
        switch (type) {
            case 'leave': return 'Xin nghỉ phép';
            case 'late': return 'Xin đi trễ';
            case 'shift': return 'Xin đổi ca';
        }
    };

    const getRequestTypeColor = (type: RequestType) => {
        switch (type) {
            case 'leave': return '#3b82f6';
            case 'late': return '#f59e0b';
            case 'shift': return '#8b5cf6';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Pending': return '#f59e0b';
            case 'Approved': return '#0d9488';
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const renderRequestDetails = (request: CombinedRequest) => {
        switch (request.requestType) {
            case 'leave':
                const leaveReq = request as LeaveRequest;
                return (
                    <>
                        <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Loại nghỉ: </Text>
                            {leaveReq.leaveType}
                        </Text>
                        <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Từ: </Text>
                            {formatDate(leaveReq.startDate)} - {formatDate(leaveReq.endDate)}
                        </Text>
                    </>
                );
            case 'late':
                const lateReq = request as LateRequest;
                return (
                    <>
                        <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Ngày: </Text>
                            {formatDate(lateReq.date)}
                        </Text>
                        <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Giờ đến dự kiến: </Text>
                            {lateReq.expectedArrivalTime}
                        </Text>
                    </>
                );
            case 'shift':
                const shiftReq = request as ShiftRequest;
                return (
                    <>
                        <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Ca hiện tại: </Text>
                            {shiftReq.currentShiftName} ({formatDate(shiftReq.currentShiftDate)})
                        </Text>
                        <Text style={styles.detailText}>
                            <Text style={styles.detailLabel}>Ca muốn đổi: </Text>
                            {shiftReq.requestedShiftName} ({formatDate(shiftReq.requestedShiftDate)})
                        </Text>
                    </>
                );
        }
    };

    const renderRequest = ({ item }: { item: CombinedRequest }) => (
        <View style={styles.requestCard}>
            <View style={styles.requestHeader}>
                <View style={styles.requestHeaderLeft}>
                    <View style={[styles.typeBadge, { backgroundColor: getRequestTypeColor(item.requestType) + '20' }]}>
                        <Text style={[styles.typeBadgeText, { color: getRequestTypeColor(item.requestType) }]}>
                            {getRequestTypeLabel(item.requestType)}
                        </Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                        <Text style={[styles.statusBadgeText, { color: getStatusColor(item.status) }]}>
                            {getStatusLabel(item.status)}
                        </Text>
                    </View>
                </View>
                <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            </View>

            <View style={styles.requestBody}>
                <View style={styles.userInfo}>
                    <View style={styles.userAvatar}>
                        <Text style={styles.userAvatarText}>
                            {item.userName.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                    <Text style={styles.userName}>{item.userName}</Text>
                </View>

                <View style={styles.requestDetails}>
                    {renderRequestDetails(item)}
                    <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Lý do: </Text>
                        {item.reason}
                    </Text>
                </View>

                {item.reviewNote && (
                    <View style={styles.reviewNoteContainer}>
                        <Text style={styles.reviewNoteLabel}>Ghi chú duyệt:</Text>
                        <Text style={styles.reviewNoteText}>{item.reviewNote}</Text>
                    </View>
                )}
            </View>

            {item.status === 'Pending' && (
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleReviewPress(item, 'Rejected')}
                    >
                        <Ionicons name="close-circle" size={20} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Từ chối</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleReviewPress(item, 'Approved')}
                    >
                        <Ionicons name="checkmark-circle" size={20} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Phê duyệt</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    const pendingCount = requests.filter(r => r.status === 'Pending').length;

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#14b8a6" />
                <Text style={styles.loadingText}>Đang tải danh sách đơn phiếu...</Text>
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
                <Text style={styles.headerTitle}>Duyệt đơn phiếu</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.requestCount}>
                        {requests.length} đơn
                    </Text>
                </View>
            </View>

            {/* Request List */}
            <FlatList
                data={requests}
                renderItem={renderRequest}
                keyExtractor={(item) => `${item.requestType}-${item.id}`}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#14b8a6']}
                    />
                }
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
                        <Text style={styles.emptyText}>Không có đơn phiếu nào</Text>
                    </View>
                }
            />

            {/* Review Modal */}
            <Modal
                visible={modalVisible}
                transparent
                animationType="slide"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {reviewAction === 'Approved' ? 'Phê duyệt đơn' : 'Từ chối đơn'}
                        </Text>

                        <TextInput
                            style={styles.modalInput}
                            placeholder="Ghi chú (không bắt buộc)"
                            value={reviewNote}
                            onChangeText={setReviewNote}
                            multiline
                            numberOfLines={4}
                            textAlignVertical="top"
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalCancelButton]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.modalCancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, reviewAction === 'Approved' ? styles.modalApproveButton : styles.modalRejectButton]}
                                onPress={handleSubmitReview}
                            >
                                <Text style={styles.modalConfirmButtonText}>Xác nhận</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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
        width: 60,
        alignItems: 'flex-end',
    },
    requestCount: {
        fontSize: 14,
        color: '#14b8a6',
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
    },
    requestHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    requestHeaderLeft: {
        flexDirection: 'row',
        gap: 8,
    },
    typeBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    typeBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusBadgeText: {
        fontSize: 12,
        fontWeight: '600',
    },
    dateText: {
        fontSize: 12,
        color: '#6b7280',
    },
    requestBody: {
        gap: 12,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#14b8a6',
        justifyContent: 'center',
        alignItems: 'center',
    },
    userAvatarText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    requestDetails: {
        gap: 6,
    },
    detailText: {
        fontSize: 14,
        color: '#4b5563',
        lineHeight: 20,
    },
    detailLabel: {
        fontWeight: '600',
        color: '#1f2937',
    },
    reviewNoteContainer: {
        backgroundColor: '#f3f4f6',
        padding: 12,
        borderRadius: 8,
        marginTop: 4,
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
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
        marginTop: 16,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 12,
        borderRadius: 8,
    },
    approveButton: {
        backgroundColor: '#10b981',
    },
    rejectButton: {
        backgroundColor: '#ef4444',
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
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
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: '#ffffff',
        borderRadius: 16,
        padding: 24,
        width: '100%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
        textAlign: 'center',
    },
    modalInput: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        color: '#1f2937',
        minHeight: 100,
        marginBottom: 20,
    },
    modalButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    modalCancelButton: {
        backgroundColor: '#f3f4f6',
    },
    modalApproveButton: {
        backgroundColor: '#10b981',
    },
    modalRejectButton: {
        backgroundColor: '#ef4444',
    },
    modalCancelButtonText: {
        color: '#6b7280',
        fontSize: 14,
        fontWeight: '600',
    },
    modalConfirmButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default RequestApprovalScreen;

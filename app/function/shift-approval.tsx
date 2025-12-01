import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    Modal,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import {
    AlertTriangle,
    CalendarDays,
    Check,
    Clock,
    RefreshCcw,
    ShieldAlert,
    X,
    XCircle,
} from "lucide-react-native";

import SidebarLayout from "../../components/SidebarLayout";
import { shiftRegistrationService, ShiftRegistration } from "../../services/shiftRegistrationService";
import { AuthContext } from "../../context/AuthContext";
import { showAlert, showConfirmDestructive } from "../../utils/alertUtils";

type TabType = "pending" | "all";

const ShiftApprovalScreen = () => {
    const router = useRouter();
    const authContext = useContext(AuthContext);
    const user = authContext?.user;

    const { width: screenWidth } = Dimensions.get('window');
    const isMobile = screenWidth < 768;

    const [activeTab, setActiveTab] = useState<TabType>("pending");
    const [registrations, setRegistrations] = useState<ShiftRegistration[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [selectedRegistration, setSelectedRegistration] = useState<ShiftRegistration | null>(null);
    const [reviewNote, setReviewNote] = useState("");
    const [reviewAction, setReviewAction] = useState<"approved" | "rejected">("approved");

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            let data: ShiftRegistration[];
            if (activeTab === "pending") {
                data = await shiftRegistrationService.getPendingRegistrations();
            } else {
                data = await shiftRegistrationService.getAllRegistrations();
            }

            setRegistrations(data);
        } catch (err: any) {
            let message = err?.response?.data?.message || err?.message || "Không thể tải dữ liệu";
            console.error("Error fetching registrations:", err);
            console.error("Error response:", err?.response);
            console.error("Error status:", err?.response?.status);
            setError(message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [activeTab]);

    // Kiểm tra quyền truy cập
    const userRole = user?.role || user?.userRole || user?.Role || user?.roleName;
    const userRoleLower = userRole?.toLowerCase();
    const isAdminOrManager =
        userRoleLower === 'admin' ||
        userRoleLower === 'manager' ||
        userRole === 'Admin' ||
        userRole === 'Manager';

    const isLoading = authContext?.loading === true;

    if (isLoading || (!user && authContext?.loading === false)) {
        return (
            <SidebarLayout title="Xem yêu cầu đăng ký lịch làm việc" activeKey="task">
                <View style={styles.unauthorizedContainer}>
                    <ActivityIndicator size="large" color="#0d9488" />
                    <Text style={styles.unauthorizedMessage}>Đang kiểm tra quyền truy cập...</Text>
                </View>
            </SidebarLayout>
        );
    }

    if (!isAdminOrManager) {
        return (
            <SidebarLayout title="Phê duyệt yêu cầu bổ sung chấm công/ ca làm" activeKey="task">
                <View style={styles.unauthorizedContainer}>
                    <ShieldAlert size={64} color="#dc2626" />
                    <Text style={styles.unauthorizedTitle}>Không có quyền truy cập</Text>
                    <Text style={styles.unauthorizedMessage}>
                        Chỉ Admin và Manager mới có quyền phê duyệt lịch làm việc.
                    </Text>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => router.back()}
                    >
                        <Text style={styles.backButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </SidebarLayout>
        );
    }

    const formatTime = (time: string) => {
        if (!time) return "";
        return time.substring(0, 5);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "pending": return "#f59e0b";
            case "approved": return "#10b981";
            case "rejected": return "#ef4444";
            default: return "#64748b";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "pending": return "Chờ duyệt";
            case "approved": return "Đã duyệt";
            case "rejected": return "Từ chối";
            default: return status;
        }
    };

    const openReviewModal = (registration: ShiftRegistration, action: "approved" | "rejected") => {
        setSelectedRegistration(registration);
        setReviewAction(action);
        setReviewNote("");
        setShowReviewModal(true);
    };

    const handleReview = async () => {
        if (!selectedRegistration) return;

        try {
            await shiftRegistrationService.reviewRegistration({
                registrationId: selectedRegistration.id,
                status: reviewAction,
                reviewNote: reviewNote || undefined,
            });

            setShowReviewModal(false);
            setSelectedRegistration(null);
            setReviewNote("");

            await fetchData();

            const actionText = reviewAction === "approved" ? "duyệt" : "từ chối";
            showAlert("Thành công", `Đã ${actionText} yêu cầu thành công`);
        } catch (err: any) {
            let message = err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
            showAlert("Lỗi", message);
        }
    };

    const renderTabs = () => (
        <View style={styles.tabs}>
            <TouchableOpacity
                style={[styles.tab, activeTab === "pending" && styles.tabActive]}
                onPress={() => setActiveTab("pending")}
            >
                <Text style={[styles.tabText, activeTab === "pending" && styles.tabTextActive]}>
                    Chờ duyệt
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === "all" && styles.tabActive]}
                onPress={() => setActiveTab("all")}
            >
                <Text style={[styles.tabText, activeTab === "all" && styles.tabTextActive]}>
                    Tất cả
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderRegistrations = () => {
        if (loading && !refreshing) {
            return (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color="#0d9488" />
                    <Text style={styles.stateText}>Đang tải...</Text>
                </View>
            );
        }

        if (registrations.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <CalendarDays size={48} color="#94a3b8" />
                    <Text style={styles.emptyTitle}>Chưa có yêu cầu</Text>
                    <Text style={styles.emptyDesc}>
                        {activeTab === "pending"
                            ? "Không có yêu cầu nào đang chờ duyệt"
                            : "Chưa có yêu cầu đăng ký ca nào"
                        }
                    </Text>
                </View>
            );
        }

        return (
            <ScrollView
                style={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
                }
            >
                {registrations.map((registration) => (
                    <View key={registration.id} style={styles.registrationCard}>
                        <View style={styles.cardHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.employeeName}>
                                    {registration.fullName || registration.userName || `User ${registration.userId}`}
                                </Text>
                                <Text style={styles.shiftName}>{registration.shiftName}</Text>
                                <View style={styles.timeRow}>
                                    <Clock size={14} color="#0d9488" />
                                    <Text style={styles.timeText}>
                                        {formatTime(registration.shiftStartTime || "")} - {formatTime(registration.shiftEndTime || "")}
                                    </Text>
                                </View>
                                <Text style={styles.dateText}>{formatDate(registration.requestedDate)}</Text>
                            </View>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(registration.status) + "20" }]}>
                                <Text style={[styles.statusText, { color: getStatusColor(registration.status) }]}>
                                    {getStatusText(registration.status)}
                                </Text>
                            </View>
                        </View>

                        {registration.reason && (
                            <View style={styles.reasonBox}>
                                <Text style={styles.reasonLabel}>Lý do:</Text>
                                <Text style={styles.reasonText}>{registration.reason}</Text>
                            </View>
                        )}

                        {registration.status === "pending" && (
                            <View style={styles.cardActionRow}>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.approveButton]}
                                    onPress={() => openReviewModal(registration, "approved")}
                                >
                                    <Check size={16} color="#fff" />
                                    <Text style={styles.actionButtonText}>Duyệt</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.rejectButton]}
                                    onPress={() => openReviewModal(registration, "rejected")}
                                >
                                    <XCircle size={16} color="#fff" />
                                    <Text style={styles.actionButtonText}>Từ chối</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {registration.reviewNote && (
                            <View style={styles.reviewNoteBox}>
                                <Text style={styles.reviewNoteLabel}>Ghi chú phê duyệt:</Text>
                                <Text style={styles.reviewNoteText}>{registration.reviewNote}</Text>
                                {registration.reviewedByName && (
                                    <Text style={styles.reviewerText}>- {registration.reviewedByName}</Text>
                                )}
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        );
    };

    return (
        <SidebarLayout title="Phê duyệt lịch làm việc" activeKey="task">
            <View style={styles.container}>
                <View style={[styles.header, isMobile && styles.headerMobile]}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>
                            Phê duyệt lịch làm việc
                        </Text>
                        <Text style={[styles.headerSubtitle, isMobile && styles.headerSubtitleMobile]}>
                            {registrations.length} yêu cầu
                        </Text>
                    </View>
                </View>

                <View style={styles.actionRow}>
                    <TouchableOpacity style={styles.refreshButton} onPress={() => fetchData(true)}>
                        <RefreshCcw size={16} color="#0d9488" />
                    </TouchableOpacity>
                </View>

                {error && (
                    <View style={styles.errorBanner}>
                        <AlertTriangle size={18} color="#dc2626" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {renderTabs()}

                <View style={styles.content}>
                    {renderRegistrations()}
                </View>

                {/* Modal phê duyệt */}
                <Modal visible={showReviewModal} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {reviewAction === "approved" ? "Duyệt yêu cầu" : "Từ chối yêu cầu"}
                                </Text>
                                <TouchableOpacity onPress={() => setShowReviewModal(false)}>
                                    <X size={24} color="#0f172a" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                {selectedRegistration && (
                                    <View style={styles.modalInfo}>
                                        <Text style={styles.modalInfoText}>
                                            Nhân viên: {selectedRegistration.fullName || selectedRegistration.userName}
                                        </Text>
                                        <Text style={styles.modalInfoText}>
                                            Ca: {selectedRegistration.shiftName}
                                        </Text>
                                        <Text style={styles.modalInfoText}>
                                            Ngày: {formatDate(selectedRegistration.requestedDate)}
                                        </Text>
                                    </View>
                                )}

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Ghi chú (tùy chọn)</Text>
                                    <TextInput
                                        style={styles.textArea}
                                        value={reviewNote}
                                        onChangeText={setReviewNote}
                                        placeholder="Nhập ghi chú..."
                                        multiline
                                        numberOfLines={4}
                                    />
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowReviewModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[
                                        styles.modalButton,
                                        reviewAction === "approved" ? styles.approveButton : styles.rejectButton
                                    ]}
                                    onPress={handleReview}
                                >
                                    <Text style={styles.actionButtonText}>
                                        {reviewAction === "approved" ? "Duyệt" : "Từ chối"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
            </View>
        </SidebarLayout>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F9F7",
    },
    header: {
        paddingHorizontal: 16,
        paddingVertical: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        minHeight: 80,
    },
    headerLeft: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#64748b",
        fontWeight: "500",
    },
    actionRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 16,
        paddingVertical: 8,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        gap: 8,
        justifyContent: "flex-end",
    },
    refreshButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        backgroundColor: "#ecfeff",
        borderWidth: 1,
        borderColor: "#99f6e4",
        alignItems: "center",
        justifyContent: "center",
    },
    errorBanner: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        padding: 12,
        marginHorizontal: 16,
        marginTop: 8,
        backgroundColor: "#fee2e2",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#fecaca",
    },
    errorText: {
        flex: 1,
        color: "#dc2626",
        fontSize: 14,
    },
    tabs: {
        flexDirection: "row",
        paddingHorizontal: 16,
        paddingTop: 16,
        gap: 8,
        backgroundColor: "#fff",
    },
    tab: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "#f1f5f9",
    },
    tabActive: {
        backgroundColor: "#0d9488",
    },
    tabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#64748b",
    },
    tabTextActive: {
        color: "#fff",
    },
    content: {
        flex: 1,
        padding: 16,
    },
    list: {
        flex: 1,
    },
    centerState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
    },
    stateText: {
        marginTop: 12,
        color: "#64748b",
        fontSize: 14,
    },
    emptyState: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0f172a",
        marginTop: 16,
    },
    emptyDesc: {
        fontSize: 14,
        color: "#64748b",
        marginTop: 8,
        textAlign: "center",
    },
    registrationCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: "#e2e8f0",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 2,
    },
    cardHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    employeeName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 4,
    },
    shiftName: {
        fontSize: 14,
        color: "#475569",
        marginBottom: 4,
    },
    timeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
    },
    timeText: {
        fontSize: 13,
        color: "#64748b",
    },
    dateText: {
        fontSize: 13,
        color: "#64748b",
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
    reasonBox: {
        backgroundColor: "#f8fafc",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    reasonLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#64748b",
        marginBottom: 4,
    },
    reasonText: {
        fontSize: 13,
        color: "#0f172a",
    },
    cardActionRow: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: 10,
    },
    approveButton: {
        backgroundColor: "#10b981",
    },
    rejectButton: {
        backgroundColor: "#ef4444",
    },
    actionButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    reviewNoteBox: {
        backgroundColor: "#fef3c7",
        padding: 12,
        borderRadius: 8,
        marginTop: 12,
    },
    reviewNoteLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#92400e",
        marginBottom: 4,
    },
    reviewNoteText: {
        fontSize: 13,
        color: "#78350f",
    },
    reviewerText: {
        fontSize: 12,
        color: "#92400e",
        marginTop: 4,
        fontStyle: "italic",
    },
    // Modal styles
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
    },
    modalBody: {
        padding: 20,
        maxHeight: 400,
    },
    modalInfo: {
        backgroundColor: "#f8fafc",
        padding: 12,
        borderRadius: 8,
        marginBottom: 16,
    },
    modalInfoText: {
        fontSize: 14,
        color: "#0f172a",
        marginBottom: 4,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 8,
    },
    textArea: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: "#0f172a",
        backgroundColor: "#fff",
        minHeight: 100,
        textAlignVertical: "top",
    },
    modalFooter: {
        flexDirection: "row",
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#e2e8f0",
    },
    modalButton: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#f1f5f9",
    },
    cancelButtonText: {
        color: "#64748b",
        fontWeight: "600",
        fontSize: 14,
    },
    // Mobile styles
    headerMobile: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        minHeight: 90,
    },
    headerTitleMobile: {
        fontSize: 22,
        fontWeight: "800",
        marginBottom: 6,
    },
    headerSubtitleMobile: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0d9488",
    },
    unauthorizedContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        backgroundColor: "#F4F9F7",
    },
    unauthorizedTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#0f172a",
        marginTop: 24,
        marginBottom: 12,
        textAlign: "center",
    },
    unauthorizedMessage: {
        fontSize: 16,
        color: "#64748b",
        textAlign: "center",
        lineHeight: 24,
        marginBottom: 32,
        paddingHorizontal: 32,
    },
    backButton: {
        paddingHorizontal: 32,
        paddingVertical: 14,
        borderRadius: 12,
        backgroundColor: "#0d9488",
    },
    backButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
});

export default ShiftApprovalScreen;

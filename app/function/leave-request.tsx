import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Modal,
    TextInput,
} from "react-native";
import { Calendar, Plus, X, CheckCircle, XCircle, Clock, Trash2 } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SidebarLayout from "../../components/SidebarLayout";
import leaveRequestService, { LeaveRequest, CreateLeaveRequestDto } from "../../services/leaveRequestService";
import DateTimePicker from "@react-native-community/datetimepicker";
import api from "../../api/axiosClient";

const LEAVE_TYPES = [
    { value: "Nghỉ phép", label: "Nghỉ phép" },
    { value: "Nghỉ ốm", label: "Nghỉ ốm" },
    { value: "Nghỉ việc riêng", label: "Nghỉ việc riêng" },
    { value: "Nghỉ không lương", label: "Nghỉ không lương" },
];

interface MyShift {
    id: number;
    shiftName: string;
    date: string;
    startTime: string;
    endTime: string;
}

export default function LeaveRequestScreen() {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    const [myShifts, setMyShifts] = useState<MyShift[]>([]);
    const [selectedShift, setSelectedShift] = useState<MyShift | null>(null);

    const [formData, setFormData] = useState<CreateLeaveRequestDto>({
        leaveType: "Nghỉ phép",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date().toISOString().split("T")[0],
        reason: "",
    });

    useEffect(() => {
        loadRequests(); // Load danh sách phiếu khi vào màn hình
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await leaveRequestService.getMy();
            setRequests(data);
        } catch (error: any) {
            console.log("Error loading requests:", error);
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const loadMyShifts = async () => {
        setLoading(true);
        try {
            // Lấy lịch làm việc của mình (7 ngày tới)
            const now = new Date();
            const fromDate = now.toISOString().split("T")[0];
            const toDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

            const response = await api.get(`/api/Shifts/my-schedule?fromDate=${fromDate}&toDate=${toDate}`);

            // Map response to MyShift format
            const shifts = response.data.map((shift: any) => ({
                id: shift.id,
                shiftName: shift.shiftName,
                date: shift.shiftDate.split("T")[0],
                startTime: shift.shiftStartTime,
                endTime: shift.shiftEndTime,
            }));

            setMyShifts(shifts);
            setShowShiftModal(true);
        } catch (error: any) {
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tải lịch làm việc");
        } finally {
            setLoading(false);
        }
    };

    const selectShift = (shift: MyShift) => {
        setSelectedShift(shift);
        setFormData({
            ...formData,
            startDate: shift.date,
            endDate: shift.date,
        });
        setShowShiftModal(false);
        setShowCreateModal(true);
    };

    const handleCreate = async () => {
        if (!formData.leaveType) {
            Alert.alert("Lỗi", "Vui lòng chọn loại nghỉ phép");
            return;
        }
        if (!formData.startDate || !formData.endDate) {
            Alert.alert("Lỗi", "Vui lòng chọn ngày bắt đầu và kết thúc");
            return;
        }
        if (new Date(formData.endDate) < new Date(formData.startDate)) {
            Alert.alert("Lỗi", "Ngày kết thúc phải sau ngày bắt đầu");
            return;
        }
        if (formData.reason.trim().length < 10) {
            Alert.alert("Lỗi", "Lý do phải có ít nhất 10 ký tự");
            return;
        }

        setLoading(true);
        try {
            await leaveRequestService.create(formData);
            Alert.alert("Thành công", "Đã tạo phiếu xin nghỉ phép");
            setShowCreateModal(false);
            resetForm();
            loadRequests();
        } catch (error: any) {
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tạo phiếu");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (request: LeaveRequest) => {
        if (request.status !== "Pending") {
            Alert.alert("Thông báo", "Chỉ có thể hủy phiếu đang chờ duyệt");
            return;
        }

        Alert.alert("Xác nhận", "Bạn có chắc muốn hủy phiếu này?", [
            { text: "Không", style: "cancel" },
            {
                text: "Hủy phiếu",
                style: "destructive",
                onPress: async () => {
                    try {
                        await leaveRequestService.delete(request.id);
                        Alert.alert("Thành công", "Đã hủy phiếu");
                        loadRequests();
                    } catch (error: any) {
                        Alert.alert("Lỗi", error?.response?.data?.message || "Không thể hủy phiếu");
                    }
                },
            },
        ]);
    };

    const resetForm = () => {
        setSelectedShift(null);
        setFormData({
            leaveType: "Nghỉ phép",
            startDate: new Date().toISOString().split("T")[0],
            endDate: new Date().toISOString().split("T")[0],
            reason: "",
        });
    };

    const openCreateFlow = () => {
        resetForm();
        // Mở modal tạo phiếu trực tiếp, không cần chọn ca
        setShowCreateModal(true);
        // loadMyShifts(); // Comment tạm để test
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "Approved":
                return "#10b981";
            case "Rejected":
                return "#ef4444";
            default:
                return "#f59e0b";
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "Approved":
                return "Đã duyệt";
            case "Rejected":
                return "Từ chối";
            default:
                return "Chờ duyệt";
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Approved":
                return <CheckCircle size={20} color="#10b981" />;
            case "Rejected":
                return <XCircle size={20} color="#ef4444" />;
            default:
                return <Clock size={20} color="#f59e0b" />;
        }
    };

    const calculateDays = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
    };

    return (
        <SidebarLayout title="Phiếu Xin Nghỉ Phép" activeKey="task">
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Danh sách phiếu xin nghỉ</Text>
                        <Text style={styles.headerSubtitle}>
                            {requests.length} phiếu
                        </Text>
                    </View>
                    <TouchableOpacity
                        style={styles.createButton}
                        onPress={openCreateFlow}
                    >
                        <Plus size={20} color="#fff" />
                        <Text style={styles.createButtonText}>Tạo phiếu</Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0d9488" />
                    </View>
                ) : (
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {requests.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Calendar size={48} color="#cbd5e1" />
                                <Text style={styles.emptyText}>Chưa có phiếu xin nghỉ</Text>
                                <Text style={styles.emptySubtext}>
                                    Nhấn "Tạo phiếu" để tạo phiếu mới
                                </Text>
                            </View>
                        ) : (
                            requests.map((request) => (
                                <View key={request.id} style={styles.requestCard}>
                                    <View style={styles.requestHeader}>
                                        <View style={styles.requestType}>
                                            <Calendar size={20} color="#0d9488" />
                                            <Text style={styles.requestTypeText}>
                                                {request.leaveType}
                                            </Text>
                                        </View>
                                        <View style={styles.statusBadge}>
                                            {getStatusIcon(request.status)}
                                            <Text
                                                style={[
                                                    styles.statusText,
                                                    { color: getStatusColor(request.status) },
                                                ]}
                                            >
                                                {getStatusText(request.status)}
                                            </Text>
                                        </View>
                                    </View>

                                    <View style={styles.requestBody}>
                                        <View style={styles.dateRange}>
                                            <Text style={styles.dateLabel}>Từ ngày:</Text>
                                            <Text style={styles.dateValue}>
                                                {formatDate(request.startDate)}
                                            </Text>
                                        </View>
                                        <View style={styles.dateRange}>
                                            <Text style={styles.dateLabel}>Đến ngày:</Text>
                                            <Text style={styles.dateValue}>
                                                {formatDate(request.endDate)}
                                            </Text>
                                        </View>
                                        <View style={styles.daysCount}>
                                            <Text style={styles.daysCountText}>
                                                {calculateDays(request.startDate, request.endDate)} ngày
                                            </Text>
                                        </View>

                                        <View style={styles.reasonSection}>
                                            <Text style={styles.reasonLabel}>Lý do:</Text>
                                            <Text style={styles.reasonText}>{request.reason}</Text>
                                        </View>

                                        {request.reviewNote && (
                                            <View style={styles.reviewSection}>
                                                <Text style={styles.reviewLabel}>Ghi chú duyệt:</Text>
                                                <Text style={styles.reviewText}>{request.reviewNote}</Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.requestFooter}>
                                        <Text style={styles.footerText}>
                                            Tạo: {formatDateTime(request.createdAt)}
                                        </Text>
                                        {request.status === "Pending" && (
                                            <TouchableOpacity
                                                onPress={() => handleDelete(request)}
                                                style={styles.deleteButton}
                                            >
                                                <Trash2 size={16} color="#ef4444" />
                                                <Text style={styles.deleteButtonText}>Hủy</Text>
                                            </TouchableOpacity>
                                        )}
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}

                {/* Create Modal */}
                <Modal
                    visible={showCreateModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowCreateModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Tạo phiếu xin nghỉ</Text>
                                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                    <X size={24} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                {/* Leave Type */}
                                <Text style={styles.label}>Loại nghỉ phép *</Text>
                                <View style={styles.typeSelector}>
                                    {LEAVE_TYPES.map((type) => (
                                        <TouchableOpacity
                                            key={type.value}
                                            style={[
                                                styles.typeButton,
                                                formData.leaveType === type.value &&
                                                styles.typeButtonActive,
                                            ]}
                                            onPress={() =>
                                                setFormData({ ...formData, leaveType: type.value })
                                            }
                                        >
                                            <Text
                                                style={[
                                                    styles.typeButtonText,
                                                    formData.leaveType === type.value &&
                                                    styles.typeButtonTextActive,
                                                ]}
                                            >
                                                {type.label}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* Start Date */}
                                <Text style={styles.label}>Từ ngày *</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => setShowStartDatePicker(true)}
                                >
                                    <Calendar size={20} color="#6b7280" />
                                    <Text style={styles.dateInputText}>
                                        {formatDate(formData.startDate)}
                                    </Text>
                                </TouchableOpacity>

                                {/* End Date */}
                                <Text style={styles.label}>Đến ngày *</Text>
                                <TouchableOpacity
                                    style={styles.dateInput}
                                    onPress={() => setShowEndDatePicker(true)}
                                >
                                    <Calendar size={20} color="#6b7280" />
                                    <Text style={styles.dateInputText}>
                                        {formatDate(formData.endDate)}
                                    </Text>
                                </TouchableOpacity>

                                {/* Days Count */}
                                <View style={styles.daysPreview}>
                                    <Text style={styles.daysPreviewText}>
                                        Tổng: {calculateDays(formData.startDate, formData.endDate)} ngày
                                    </Text>
                                </View>

                                {/* Reason */}
                                <Text style={styles.label}>Lý do * (tối thiểu 10 ký tự)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Nhập lý do xin nghỉ"
                                    multiline
                                    numberOfLines={4}
                                    value={formData.reason}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, reason: text })
                                    }
                                />
                                <Text style={styles.charCount}>{formData.reason.length} ký tự</Text>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setShowCreateModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.submitButton}
                                    onPress={handleCreate}
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <ActivityIndicator size="small" color="#fff" />
                                    ) : (
                                        <Text style={styles.submitButtonText}>Tạo phiếu</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Date Pickers */}
                {showStartDatePicker && (
                    <DateTimePicker
                        value={new Date(formData.startDate)}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowStartDatePicker(false);
                            if (selectedDate) {
                                setFormData({
                                    ...formData,
                                    startDate: selectedDate.toISOString().split("T")[0],
                                });
                            }
                        }}
                    />
                )}

                {showEndDatePicker && (
                    <DateTimePicker
                        value={new Date(formData.endDate)}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowEndDatePicker(false);
                            if (selectedDate) {
                                setFormData({
                                    ...formData,
                                    endDate: selectedDate.toISOString().split("T")[0],
                                });
                            }
                        }}
                    />
                )}
            </View>
        </SidebarLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F9F7",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 2,
    },
    createButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#0d9488",
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
    },
    createButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        padding: 16,
    },
    emptyState: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6b7280",
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: "#9ca3af",
        marginTop: 8,
    },
    requestCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    requestHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    requestType: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    requestTypeText: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
    },
    statusBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        backgroundColor: "#f9fafb",
    },
    statusText: {
        fontSize: 13,
        fontWeight: "600",
    },
    requestBody: {
        gap: 8,
    },
    dateRange: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    dateLabel: {
        fontSize: 14,
        color: "#6b7280",
    },
    dateValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0f172a",
    },
    daysCount: {
        backgroundColor: "#ecfeff",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
        alignSelf: "flex-start",
        marginTop: 4,
    },
    daysCountText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0e7490",
    },
    reasonSection: {
        marginTop: 8,
    },
    reasonLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6b7280",
        marginBottom: 4,
    },
    reasonText: {
        fontSize: 14,
        color: "#0f172a",
        lineHeight: 20,
    },
    reviewSection: {
        marginTop: 8,
        padding: 12,
        backgroundColor: "#fef3c7",
        borderRadius: 8,
    },
    reviewLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#92400e",
        marginBottom: 4,
    },
    reviewText: {
        fontSize: 13,
        color: "#78350f",
        lineHeight: 18,
    },
    requestFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
    },
    footerText: {
        fontSize: 12,
        color: "#6b7280",
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: "#fef2f2",
    },
    deleteButtonText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#ef4444",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: "90%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0f172a",
    },
    modalBody: {
        padding: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 8,
        marginTop: 16,
    },
    typeSelector: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 8,
    },
    typeButton: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        backgroundColor: "#fff",
    },
    typeButtonActive: {
        backgroundColor: "#0d9488",
        borderColor: "#0d9488",
    },
    typeButtonText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
    },
    typeButtonTextActive: {
        color: "#fff",
    },
    dateInput: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        backgroundColor: "#fff",
    },
    dateInputText: {
        fontSize: 14,
        color: "#0f172a",
        fontWeight: "600",
    },
    daysPreview: {
        backgroundColor: "#ecfeff",
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        alignSelf: "flex-start",
        marginTop: 8,
    },
    daysPreviewText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0e7490",
    },
    input: {
        padding: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        fontSize: 14,
        color: "#0f172a",
        backgroundColor: "#fff",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    charCount: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 4,
        textAlign: "right",
    },
    modalFooter: {
        flexDirection: "row",
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    cancelButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#f3f4f6",
        alignItems: "center",
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6b7280",
    },
    submitButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#0d9488",
        alignItems: "center",
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    shiftItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    shiftItemInfo: {
        flex: 1,
    },
    shiftItemName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 4,
    },
    shiftItemDate: {
        fontSize: 13,
        color: "#6b7280",
    },
    selectedShiftCard: {
        backgroundColor: "#ecfeff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#67e8f9",
    },
    selectedShiftLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0e7490",
        marginBottom: 6,
    },
    selectedShiftName: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 4,
    },
    selectedShiftDate: {
        fontSize: 14,
        color: "#6b7280",
    },
});

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
import { RefreshCw, Plus, X, CheckCircle, XCircle, Clock, Trash2, Calendar, Users } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SidebarLayout from "../../components/SidebarLayout";
import shiftRequestService, { ShiftRequest, CreateShiftRequestDto } from "../../services/shiftRequestService";
import api from "../../api/axiosClient";

interface MyShift {
    id: number;
    shiftName: string;
    date: string;
    startTime: string;
    endTime: string;
    assignedEmployees?: Employee[];
}

interface Employee {
    id: number;
    fullname: string;
    positionName: string;
    departmentName: string;
}

export default function ShiftSwapRequestScreen() {
    const [loading, setLoading] = useState(false);
    const [requests, setRequests] = useState<ShiftRequest[]>([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);

    const [myShifts, setMyShifts] = useState<MyShift[]>([]);
    const [selectedShift, setSelectedShift] = useState<MyShift | null>(null);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [targetShift, setTargetShift] = useState<MyShift | null>(null);
    const [reason, setReason] = useState("");

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        setLoading(true);
        try {
            const data = await shiftRequestService.getMy();
            setRequests(data);
        } catch (error: any) {
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const loadMyShifts = async () => {
        setLoading(true);
        try {
            // Lấy lịch làm việc của mình (30 ngày tới)
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

    const loadShiftEmployees = async (shift: MyShift) => {
        setLoading(true);
        try {
            // Lấy danh sách nhân viên trong ca này
            const response = await api.get(`/api/Schedule/shift/${shift.id}/employees`);
            setSelectedShift({ ...shift, assignedEmployees: response.data });
            setShowShiftModal(false);
            setShowEmployeeModal(true);
        } catch (error: any) {
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tải danh sách nhân viên");
        } finally {
            setLoading(false);
        }
    };

    const selectEmployeeAndShift = (employee: Employee) => {
        setSelectedEmployee(employee);
        // Tìm ca của nhân viên này để đổi
        // Giả sử employee có thông tin ca của họ
        setShowEmployeeModal(false);
    };

    const handleCreate = async () => {
        if (!selectedShift) {
            Alert.alert("Lỗi", "Vui lòng chọn ca muốn đổi");
            return;
        }
        if (!selectedEmployee) {
            Alert.alert("Lỗi", "Vui lòng chọn người muốn đổi ca");
            return;
        }
        if (reason.trim().length < 10) {
            Alert.alert("Lỗi", "Lý do phải có ít nhất 10 ký tự");
            return;
        }

        setLoading(true);
        try {
            // Tạo yêu cầu đổi ca
            await shiftRequestService.create({
                currentShiftId: selectedShift.id,
                requestedShiftId: targetShift?.id || selectedShift.id, // Cần logic để lấy ca của người kia
                reason: reason.trim(),
            });
            Alert.alert("Thành công", "Đã gửi yêu cầu đổi ca");
            setShowCreateModal(false);
            resetForm();
            loadRequests();
        } catch (error: any) {
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tạo yêu cầu");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (request: ShiftRequest) => {
        if (request.status !== "Pending") {
            Alert.alert("Thông báo", "Chỉ có thể hủy yêu cầu đang chờ duyệt");
            return;
        }

        Alert.alert("Xác nhận", "Bạn có chắc muốn hủy yêu cầu này?", [
            { text: "Không", style: "cancel" },
            {
                text: "Hủy yêu cầu",
                style: "destructive",
                onPress: async () => {
                    try {
                        await shiftRequestService.delete(request.id);
                        Alert.alert("Thành công", "Đã hủy yêu cầu");
                        loadRequests();
                    } catch (error: any) {
                        Alert.alert("Lỗi", error?.response?.data?.message || "Không thể hủy yêu cầu");
                    }
                },
            },
        ]);
    };

    const resetForm = () => {
        setSelectedShift(null);
        setSelectedEmployee(null);
        setTargetShift(null);
        setReason("");
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

    const openCreateFlow = () => {
        resetForm();
        loadMyShifts();
    };

    return (
        <SidebarLayout title="Phiếu Xin Đổi Ca" activeKey="task">
            <View style={styles.container}>
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Danh sách yêu cầu đổi ca</Text>
                        <Text style={styles.headerSubtitle}>{requests.length} yêu cầu</Text>
                    </View>
                    <TouchableOpacity style={styles.createButton} onPress={openCreateFlow}>
                        <Plus size={20} color="#fff" />
                        <Text style={styles.createButtonText}>Tạo yêu cầu</Text>
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
                                <RefreshCw size={48} color="#cbd5e1" />
                                <Text style={styles.emptyText}>Chưa có yêu cầu đổi ca</Text>
                                <Text style={styles.emptySubtext}>
                                    Nhấn "Tạo yêu cầu" để tạo yêu cầu mới
                                </Text>
                            </View>
                        ) : (
                            requests.map((request) => (
                                <View key={request.id} style={styles.requestCard}>
                                    <View style={styles.requestHeader}>
                                        <View style={styles.requestType}>
                                            <RefreshCw size={20} color="#8b5cf6" />
                                            <Text style={styles.requestTypeText}>Đổi ca</Text>
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
                                        <View style={styles.shiftSection}>
                                            <Text style={styles.shiftLabel}>Ca hiện tại:</Text>
                                            <View style={styles.shiftInfo}>
                                                <Text style={styles.shiftName}>
                                                    {request.currentShiftName}
                                                </Text>
                                                <Text style={styles.shiftDate}>
                                                    {formatDate(request.currentShiftDate)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.swapArrow}>
                                            <RefreshCw size={20} color="#6b7280" />
                                        </View>

                                        <View style={styles.shiftSection}>
                                            <Text style={styles.shiftLabel}>Ca muốn đổi:</Text>
                                            <View style={styles.shiftInfo}>
                                                <Text style={styles.shiftName}>
                                                    {request.requestedShiftName}
                                                </Text>
                                                <Text style={styles.shiftDate}>
                                                    {formatDate(request.requestedShiftDate)}
                                                </Text>
                                            </View>
                                        </View>

                                        <View style={styles.reasonSection}>
                                            <Text style={styles.reasonLabel}>Lý do:</Text>
                                            <Text style={styles.reasonText}>{request.reason}</Text>
                                        </View>

                                        {request.reviewNote && (
                                            <View style={styles.reviewSection}>
                                                <Text style={styles.reviewLabel}>Ghi chú duyệt:</Text>
                                                <Text style={styles.reviewText}>
                                                    {request.reviewNote}
                                                </Text>
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

                {/* Select Shift Modal */}
                <Modal
                    visible={showShiftModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowShiftModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Chọn ca muốn đổi</Text>
                                <TouchableOpacity onPress={() => setShowShiftModal(false)}>
                                    <X size={24} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                {myShifts.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>Không có ca làm việc</Text>
                                    </View>
                                ) : (
                                    myShifts.map((shift) => (
                                        <TouchableOpacity
                                            key={shift.id}
                                            style={styles.shiftItem}
                                            onPress={() => loadShiftEmployees(shift)}
                                        >
                                            <Calendar size={20} color="#8b5cf6" />
                                            <View style={styles.shiftItemInfo}>
                                                <Text style={styles.shiftItemName}>
                                                    {shift.shiftName}
                                                </Text>
                                                <Text style={styles.shiftItemDate}>
                                                    {formatDate(shift.date)} • {shift.startTime} -{" "}
                                                    {shift.endTime}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Select Employee Modal */}
                <Modal
                    visible={showEmployeeModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowEmployeeModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Chọn người muốn đổi ca</Text>
                                <TouchableOpacity onPress={() => setShowEmployeeModal(false)}>
                                    <X size={24} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                {selectedShift?.assignedEmployees?.length === 0 ? (
                                    <View style={styles.emptyState}>
                                        <Text style={styles.emptyText}>
                                            Không có nhân viên khác trong ca này
                                        </Text>
                                    </View>
                                ) : (
                                    selectedShift?.assignedEmployees?.map((employee) => (
                                        <TouchableOpacity
                                            key={employee.id}
                                            style={styles.employeeItem}
                                            onPress={() => {
                                                setSelectedEmployee(employee);
                                                setShowEmployeeModal(false);
                                                setShowCreateModal(true);
                                            }}
                                        >
                                            <Users size={20} color="#0d9488" />
                                            <View style={styles.employeeItemInfo}>
                                                <Text style={styles.employeeItemName}>
                                                    {employee.fullname}
                                                </Text>
                                                <Text style={styles.employeeItemMeta}>
                                                    {employee.positionName} •{" "}
                                                    {employee.departmentName}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    ))
                                )}
                            </ScrollView>
                        </View>
                    </View>
                </Modal>

                {/* Create Request Modal */}
                <Modal
                    visible={showCreateModal}
                    transparent
                    animationType="slide"
                    onRequestClose={() => setShowCreateModal(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Xác nhận đổi ca</Text>
                                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                    <X size={24} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                {/* Selected Shift */}
                                <View style={styles.previewCard}>
                                    <Text style={styles.previewLabel}>Ca của bạn:</Text>
                                    <Text style={styles.previewValue}>
                                        {selectedShift?.shiftName} -{" "}
                                        {selectedShift && formatDate(selectedShift.date)}
                                    </Text>
                                </View>

                                {/* Selected Employee */}
                                <View style={styles.previewCard}>
                                    <Text style={styles.previewLabel}>Đổi với:</Text>
                                    <Text style={styles.previewValue}>
                                        {selectedEmployee?.fullname}
                                    </Text>
                                    <Text style={styles.previewSubValue}>
                                        {selectedEmployee?.positionName}
                                    </Text>
                                </View>

                                {/* Reason */}
                                <Text style={styles.label}>Lý do * (tối thiểu 10 ký tự)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Nhập lý do muốn đổi ca"
                                    multiline
                                    numberOfLines={4}
                                    value={reason}
                                    onChangeText={setReason}
                                />
                                <Text style={styles.charCount}>{reason.length} ký tự</Text>
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
                                        <Text style={styles.submitButtonText}>Gửi yêu cầu</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>
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
        backgroundColor: "#8b5cf6",
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
        gap: 12,
    },
    shiftSection: {
        backgroundColor: "#f9fafb",
        padding: 12,
        borderRadius: 8,
    },
    shiftLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6b7280",
        marginBottom: 6,
    },
    shiftInfo: {
        gap: 4,
    },
    shiftName: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0f172a",
    },
    shiftDate: {
        fontSize: 13,
        color: "#6b7280",
    },
    swapArrow: {
        alignSelf: "center",
        padding: 8,
    },
    reasonSection: {
        marginTop: 4,
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
        maxHeight: "80%",
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
    employeeItem: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    employeeItemInfo: {
        flex: 1,
    },
    employeeItemName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 4,
    },
    employeeItemMeta: {
        fontSize: 13,
        color: "#6b7280",
    },
    previewCard: {
        backgroundColor: "#f0fdf4",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12,
    },
    previewLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#166534",
        marginBottom: 4,
    },
    previewValue: {
        fontSize: 15,
        fontWeight: "700",
        color: "#0f172a",
    },
    previewSubValue: {
        fontSize: 13,
        color: "#6b7280",
        marginTop: 2,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 8,
        marginTop: 8,
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
        backgroundColor: "#8b5cf6",
        alignItems: "center",
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
});

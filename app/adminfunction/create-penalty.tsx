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
import { useRouter } from "expo-router";
import { AlertCircle, Users, X, CheckCircle } from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";
import rewardPenaltyService, {
    Employee,
    CreateRewardPenaltyDto,
} from "../../services/rewardPenaltyService";

export default function CreatePenaltyScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [amount, setAmount] = useState("");
    const [reason, setReason] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        setLoading(true);
        try {
            const data = await rewardPenaltyService.getEmployees();
            setEmployees(data);
        } catch (error: any) {
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tải danh sách nhân viên");
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        if (!selectedEmployee) {
            Alert.alert("Lỗi", "Vui lòng chọn nhân viên");
            return;
        }
        const amountNum = Number(amount);
        if (!amount || amountNum <= 0) {
            Alert.alert("Lỗi", "Số tiền phải lớn hơn 0");
            return;
        }
        if (reason.trim().length < 5) {
            Alert.alert("Lỗi", "Lý do phải có ít nhất 5 ký tự");
            return;
        }

        // Confirm before creating penalty
        Alert.alert(
            "Xác nhận",
            `Bạn có chắc muốn tạo phiếu phạt ${formatCurrency(amountNum)} cho ${selectedEmployee.fullname}?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xác nhận",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await rewardPenaltyService.create({
                                userId: selectedEmployee.id,
                                type: "Penalty",
                                amount: amountNum,
                                reason: reason.trim(),
                            });

                            Alert.alert(
                                "Thành công",
                                `Đã tạo phiếu phạt ${formatCurrency(amountNum)} cho ${selectedEmployee.fullname}`,
                                [
                                    {
                                        text: "Tạo tiếp",
                                        onPress: () => resetForm(),
                                    },
                                    {
                                        text: "Xem danh sách",
                                        onPress: () => router.push("/adminfunction/reward-penalty-manage"),
                                    },
                                ]
                            );
                        } catch (error: any) {
                            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tạo phiếu phạt");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const resetForm = () => {
        setSelectedEmployee(null);
        setAmount("");
        setReason("");
    };

    const selectEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowEmployeeModal(false);
        setSearchQuery("");
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("vi-VN") + " đ";
    };

    const filteredEmployees = employees.filter((emp) =>
        emp.fullname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.departmentName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <SidebarLayout title="Tạo Phiếu Phạt" activeKey="task">
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Header Card */}
                    <View style={styles.headerCard}>
                        <View style={styles.iconContainer}>
                            <AlertCircle size={48} color="#ef4444" />
                        </View>
                        <Text style={styles.headerTitle}>Tạo Phiếu Phạt</Text>
                        <Text style={styles.headerSubtitle}>
                            Tạo phiếu phạt cho vi phạm nội quy
                        </Text>
                    </View>

                    {/* Warning Card */}
                    <View style={styles.warningCard}>
                        <AlertCircle size={20} color="#f59e0b" />
                        <Text style={styles.warningText}>
                            Lưu ý: Phiếu phạt sẽ được trừ vào lương tháng của nhân viên
                        </Text>
                    </View>

                    {/* Form */}
                    <View style={styles.formCard}>
                        {/* Employee Selection */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Nhân viên <Text style={styles.required}>*</Text>
                            </Text>
                            <TouchableOpacity
                                style={styles.employeeSelector}
                                onPress={() => setShowEmployeeModal(true)}
                                disabled={loading}
                            >
                                <Users size={20} color="#6b7280" />
                                {selectedEmployee ? (
                                    <View style={styles.selectedEmployee}>
                                        <Text style={styles.employeeName}>
                                            {selectedEmployee.fullname}
                                        </Text>
                                        <Text style={styles.employeeInfo}>
                                            {selectedEmployee.positionName} - {selectedEmployee.departmentName}
                                        </Text>
                                    </View>
                                ) : (
                                    <Text style={styles.placeholderText}>Chọn nhân viên</Text>
                                )}
                            </TouchableOpacity>
                        </View>

                        {/* Amount */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Số tiền (VNĐ) <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Nhập số tiền phạt"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                editable={!loading}
                            />
                            {amount && Number(amount) > 0 && (
                                <Text style={styles.amountPreview}>
                                    {formatCurrency(Number(amount))}
                                </Text>
                            )}
                        </View>

                        {/* Reason */}
                        <View style={styles.formGroup}>
                            <Text style={styles.label}>
                                Lý do <Text style={styles.required}>*</Text>
                            </Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                placeholder="Nhập lý do phạt (tối thiểu 5 ký tự)"
                                multiline
                                numberOfLines={4}
                                value={reason}
                                onChangeText={setReason}
                                editable={!loading}
                            />
                            <Text style={styles.charCount}>{reason.length} ký tự</Text>
                        </View>

                        {/* Preview */}
                        {selectedEmployee && amount && reason.length >= 5 && (
                            <View style={styles.previewCard}>
                                <Text style={styles.previewTitle}>Xem trước</Text>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Nhân viên:</Text>
                                    <Text style={styles.previewValue}>
                                        {selectedEmployee.fullname}
                                    </Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Số tiền phạt:</Text>
                                    <Text style={[styles.previewValue, styles.penaltyText]}>
                                        -{formatCurrency(Number(amount))}
                                    </Text>
                                </View>
                                <View style={styles.previewRow}>
                                    <Text style={styles.previewLabel}>Lý do:</Text>
                                    <Text style={styles.previewValue}>{reason}</Text>
                                </View>
                            </View>
                        )}

                        {/* Buttons */}
                        <View style={styles.buttonGroup}>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => router.back()}
                                disabled={loading}
                            >
                                <Text style={styles.cancelButtonText}>Hủy</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                                onPress={handleCreate}
                                disabled={loading}
                            >
                                {loading ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <CheckCircle size={20} color="#fff" />
                                        <Text style={styles.submitButtonText}>Tạo phiếu phạt</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </ScrollView>

            {/* Employee Selection Modal */}
            <Modal
                visible={showEmployeeModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowEmployeeModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Chọn nhân viên</Text>
                            <TouchableOpacity onPress={() => setShowEmployeeModal(false)}>
                                <X size={24} color="#6b7280" />
                            </TouchableOpacity>
                        </View>

                        {/* Search */}
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Tìm kiếm nhân viên..."
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                            />
                        </View>

                        <ScrollView style={styles.modalBody}>
                            {filteredEmployees.length === 0 ? (
                                <View style={styles.emptyState}>
                                    <Text style={styles.emptyText}>Không tìm thấy nhân viên</Text>
                                </View>
                            ) : (
                                filteredEmployees.map((employee) => (
                                    <TouchableOpacity
                                        key={employee.id}
                                        style={styles.employeeItem}
                                        onPress={() => selectEmployee(employee)}
                                    >
                                        <View>
                                            <Text style={styles.employeeItemName}>
                                                {employee.fullname}
                                            </Text>
                                            <Text style={styles.employeeItemInfo}>
                                                {employee.positionName} - {employee.departmentName}
                                            </Text>
                                            <Text style={styles.employeeItemInfo}>
                                                {employee.branchName}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </SidebarLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F9F7",
    },
    content: {
        padding: 16,
    },
    headerCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 24,
        alignItems: "center",
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#fee2e2",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 16,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 8,
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#6b7280",
        textAlign: "center",
    },
    warningCard: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: "#fffbeb",
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#fcd34d",
    },
    warningText: {
        flex: 1,
        fontSize: 13,
        color: "#92400e",
        lineHeight: 18,
    },
    formCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
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
    required: {
        color: "#ef4444",
    },
    employeeSelector: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        backgroundColor: "#fff",
    },
    selectedEmployee: {
        flex: 1,
    },
    employeeName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 4,
    },
    employeeInfo: {
        fontSize: 13,
        color: "#6b7280",
    },
    placeholderText: {
        fontSize: 14,
        color: "#9ca3af",
        flex: 1,
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
    amountPreview: {
        fontSize: 18,
        fontWeight: "700",
        color: "#ef4444",
        marginTop: 8,
    },
    charCount: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 4,
        textAlign: "right",
    },
    previewCard: {
        backgroundColor: "#fef2f2",
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: "#fca5a5",
    },
    previewTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#ef4444",
        marginBottom: 12,
    },
    previewRow: {
        marginBottom: 8,
    },
    previewLabel: {
        fontSize: 13,
        color: "#6b7280",
        marginBottom: 2,
    },
    previewValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0f172a",
    },
    penaltyText: {
        color: "#ef4444",
        fontSize: 16,
    },
    buttonGroup: {
        flexDirection: "row",
        gap: 12,
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
        flex: 2,
        flexDirection: "row",
        gap: 8,
        padding: 16,
        borderRadius: 12,
        backgroundColor: "#ef4444",
        alignItems: "center",
        justifyContent: "center",
    },
    submitButtonDisabled: {
        backgroundColor: "#9ca3af",
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
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
    searchContainer: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    searchInput: {
        padding: 12,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        fontSize: 14,
        backgroundColor: "#f9fafb",
    },
    modalBody: {
        padding: 16,
    },
    emptyState: {
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 14,
        color: "#6b7280",
    },
    employeeItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    employeeItemName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 4,
    },
    employeeItemInfo: {
        fontSize: 13,
        color: "#6b7280",
        marginTop: 2,
    },
});

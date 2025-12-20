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
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    Plus,
    Gift,
    AlertCircle,
    X,
    Trash2,
    Users,
} from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";
import rewardPenaltyService, {
    RewardPenalty,
    Employee,
    CreateRewardPenaltyDto,
} from "../../services/rewardPenaltyService";

export default function RewardPenaltyManageScreen() {
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [records, setRecords] = useState<RewardPenalty[]>([]);
    const [filterType, setFilterType] = useState<"All" | "Reward" | "Penalty">("All");

    // Modal states
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEmployeeModal, setShowEmployeeModal] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [formData, setFormData] = useState<CreateRewardPenaltyDto>({
        userId: 0,
        type: "Reward",
        amount: 0,
        reason: "",
    });

    useEffect(() => {
        loadRecords();
    }, [selectedMonth, selectedYear, filterType]);

    const loadRecords = async () => {
        setLoading(true);
        try {
            const params: any = {
                month: selectedMonth,
                year: selectedYear,
            };
            if (filterType !== "All") {
                params.type = filterType;
            }
            const data = await rewardPenaltyService.getAll(params);
            setRecords(data);
        } catch (error: any) {
            console.error("Error loading records:", error);
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const loadEmployees = async () => {
        try {
            const data = await rewardPenaltyService.getEmployees();
            setEmployees(data);
            setShowEmployeeModal(true);
        } catch (error: any) {
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tải danh sách nhân viên");
        }
    };

    const handleCreate = async () => {
        if (!selectedEmployee) {
            Alert.alert("Lỗi", "Vui lòng chọn nhân viên");
            return;
        }
        if (formData.amount <= 0) {
            Alert.alert("Lỗi", "Số tiền phải lớn hơn 0");
            return;
        }
        if (formData.reason.length < 5) {
            Alert.alert("Lỗi", "Lý do phải có ít nhất 5 ký tự");
            return;
        }

        try {
            await rewardPenaltyService.create({
                ...formData,
                userId: selectedEmployee.id,
            });
            Alert.alert(
                "Thành công",
                `Đã tạo phiếu ${formData.type === "Reward" ? "thưởng" : "phạt"} cho ${selectedEmployee.fullname}`
            );
            setShowCreateModal(false);
            resetForm();
            loadRecords();
        } catch (error: any) {
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tạo phiếu");
        }
    };

    const handleDelete = (record: RewardPenalty) => {
        Alert.alert(
            "Xác nhận xóa",
            `Bạn có chắc muốn xóa phiếu ${record.type === "Reward" ? "thưởng" : "phạt"} này?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await rewardPenaltyService.delete(record.id);
                            Alert.alert("Thành công", "Đã xóa phiếu");
                            loadRecords();
                        } catch (error: any) {
                            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể xóa phiếu");
                        }
                    },
                },
            ]
        );
    };

    const resetForm = () => {
        setSelectedEmployee(null);
        setFormData({
            userId: 0,
            type: "Reward",
            amount: 0,
            reason: "",
        });
    };

    const openCreateModal = () => {
        resetForm();
        setShowCreateModal(true);
    };

    const selectEmployee = (employee: Employee) => {
        setSelectedEmployee(employee);
        setShowEmployeeModal(false);
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("vi-VN") + " đ";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const changeMonth = (delta: number) => {
        let newMonth = selectedMonth + delta;
        let newYear = selectedYear;

        if (newMonth > 12) {
            newMonth = 1;
            newYear++;
        } else if (newMonth < 1) {
            newMonth = 12;
            newYear--;
        }

        setSelectedMonth(newMonth);
        setSelectedYear(newYear);
    };

    const totalReward = records
        .filter((r) => r.type === "Reward")
        .reduce((sum, r) => sum + r.amount, 0);

    const totalPenalty = records
        .filter((r) => r.type === "Penalty")
        .reduce((sum, r) => sum + r.amount, 0);

    return (
        <SidebarLayout title="Quản lý Thưởng/Phạt" activeKey="task">
            <View style={styles.container}>
                {/* Month Selector */}
                <View style={styles.monthSelector}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
                        <ChevronLeft size={24} color="#0d9488" />
                    </TouchableOpacity>
                    <View style={styles.monthDisplay}>
                        <Calendar size={20} color="#0d9488" />
                        <Text style={styles.monthText}>
                            Tháng {selectedMonth.toString().padStart(2, "0")}/{selectedYear}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
                        <ChevronRight size={24} color="#0d9488" />
                    </TouchableOpacity>
                </View>

                {/* Summary Cards */}
                <View style={styles.summaryContainer}>
                    <View style={[styles.summaryCard, styles.rewardCard]}>
                        <Gift size={24} color="#10b981" />
                        <Text style={styles.summaryLabel}>Tổng thưởng</Text>
                        <Text style={[styles.summaryValue, styles.rewardText]}>
                            {formatCurrency(totalReward)}
                        </Text>
                    </View>
                    <View style={[styles.summaryCard, styles.penaltyCard]}>
                        <AlertCircle size={24} color="#ef4444" />
                        <Text style={styles.summaryLabel}>Tổng phạt</Text>
                        <Text style={[styles.summaryValue, styles.penaltyText]}>
                            {formatCurrency(totalPenalty)}
                        </Text>
                    </View>
                </View>

                {/* Filter Tabs */}
                <View style={styles.filterContainer}>
                    <TouchableOpacity
                        style={[styles.filterTab, filterType === "All" && styles.filterTabActive]}
                        onPress={() => setFilterType("All")}
                    >
                        <Text
                            style={[
                                styles.filterTabText,
                                filterType === "All" && styles.filterTabTextActive,
                            ]}
                        >
                            Tất cả
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, filterType === "Reward" && styles.filterTabActive]}
                        onPress={() => setFilterType("Reward")}
                    >
                        <Text
                            style={[
                                styles.filterTabText,
                                filterType === "Reward" && styles.filterTabTextActive,
                            ]}
                        >
                            Thưởng
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.filterTab, filterType === "Penalty" && styles.filterTabActive]}
                        onPress={() => setFilterType("Penalty")}
                    >
                        <Text
                            style={[
                                styles.filterTabText,
                                filterType === "Penalty" && styles.filterTabTextActive,
                            ]}
                        >
                            Phạt
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0d9488" />
                    </View>
                ) : (
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {records.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>Không có dữ liệu</Text>
                            </View>
                        ) : (
                            records.map((record) => (
                                <View
                                    key={record.id}
                                    style={[
                                        styles.recordCard,
                                        record.type === "Reward"
                                            ? styles.rewardBorder
                                            : styles.penaltyBorder,
                                    ]}
                                >
                                    <View style={styles.recordHeader}>
                                        <View style={styles.recordType}>
                                            {record.type === "Reward" ? (
                                                <Gift size={20} color="#10b981" />
                                            ) : (
                                                <AlertCircle size={20} color="#ef4444" />
                                            )}
                                            <View>
                                                <Text
                                                    style={[
                                                        styles.recordTypeText,
                                                        record.type === "Reward"
                                                            ? styles.rewardText
                                                            : styles.penaltyText,
                                                    ]}
                                                >
                                                    {record.type === "Reward" ? "Thưởng" : "Phạt"}
                                                </Text>
                                                <Text style={styles.recordUserName}>
                                                    {record.userName}
                                                </Text>
                                            </View>
                                        </View>
                                        <View style={styles.recordActions}>
                                            <Text
                                                style={[
                                                    styles.recordAmount,
                                                    record.type === "Reward"
                                                        ? styles.rewardText
                                                        : styles.penaltyText,
                                                ]}
                                            >
                                                {record.type === "Reward" ? "+" : "-"}
                                                {formatCurrency(record.amount)}
                                            </Text>
                                            <TouchableOpacity
                                                onPress={() => handleDelete(record)}
                                                style={styles.deleteButton}
                                            >
                                                <Trash2 size={18} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <Text style={styles.recordReason}>{record.reason}</Text>

                                    <View style={styles.recordFooter}>
                                        <Text style={styles.recordMeta}>
                                            Bởi: {record.createdByName}
                                        </Text>
                                        <Text style={styles.recordMeta}>
                                            {formatDate(record.createdAt)}
                                        </Text>
                                    </View>
                                </View>
                            ))
                        )}
                    </ScrollView>
                )}

                {/* Create Button */}
                <TouchableOpacity style={styles.fab} onPress={openCreateModal}>
                    <Plus size={28} color="#fff" />
                </TouchableOpacity>

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
                                <Text style={styles.modalTitle}>Tạo phiếu Thưởng/Phạt</Text>
                                <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                                    <X size={24} color="#6b7280" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                {/* Employee Selection */}
                                <Text style={styles.label}>Nhân viên *</Text>
                                <TouchableOpacity
                                    style={styles.employeeSelector}
                                    onPress={loadEmployees}
                                >
                                    <Users size={20} color="#6b7280" />
                                    <Text
                                        style={[
                                            styles.employeeSelectorText,
                                            !selectedEmployee && styles.placeholderText,
                                        ]}
                                    >
                                        {selectedEmployee
                                            ? `${selectedEmployee.fullname} - ${selectedEmployee.positionName}`
                                            : "Chọn nhân viên"}
                                    </Text>
                                </TouchableOpacity>

                                {/* Type Selection */}
                                <Text style={styles.label}>Loại *</Text>
                                <View style={styles.typeSelector}>
                                    <TouchableOpacity
                                        style={[
                                            styles.typeButton,
                                            formData.type === "Reward" && styles.typeButtonActive,
                                        ]}
                                        onPress={() => setFormData({ ...formData, type: "Reward" })}
                                    >
                                        <Gift
                                            size={20}
                                            color={formData.type === "Reward" ? "#fff" : "#10b981"}
                                        />
                                        <Text
                                            style={[
                                                styles.typeButtonText,
                                                formData.type === "Reward" &&
                                                styles.typeButtonTextActive,
                                            ]}
                                        >
                                            Thưởng
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[
                                            styles.typeButton,
                                            formData.type === "Penalty" && styles.typeButtonActive,
                                        ]}
                                        onPress={() => setFormData({ ...formData, type: "Penalty" })}
                                    >
                                        <AlertCircle
                                            size={20}
                                            color={formData.type === "Penalty" ? "#fff" : "#ef4444"}
                                        />
                                        <Text
                                            style={[
                                                styles.typeButtonText,
                                                formData.type === "Penalty" &&
                                                styles.typeButtonTextActive,
                                            ]}
                                        >
                                            Phạt
                                        </Text>
                                    </TouchableOpacity>
                                </View>

                                {/* Amount */}
                                <Text style={styles.label}>Số tiền (VNĐ) *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập số tiền"
                                    keyboardType="numeric"
                                    value={formData.amount > 0 ? formData.amount.toString() : ""}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, amount: Number(text) || 0 })
                                    }
                                />

                                {/* Reason */}
                                <Text style={styles.label}>Lý do * (tối thiểu 5 ký tự)</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Nhập lý do"
                                    multiline
                                    numberOfLines={4}
                                    value={formData.reason}
                                    onChangeText={(text) =>
                                        setFormData({ ...formData, reason: text })
                                    }
                                />
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={styles.cancelButton}
                                    onPress={() => setShowCreateModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.submitButton} onPress={handleCreate}>
                                    <Text style={styles.submitButtonText}>Tạo phiếu</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

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

                            <ScrollView style={styles.modalBody}>
                                {employees.map((employee) => (
                                    <TouchableOpacity
                                        key={employee.id}
                                        style={styles.employeeItem}
                                        onPress={() => selectEmployee(employee)}
                                    >
                                        <View>
                                            <Text style={styles.employeeName}>
                                                {employee.fullname}
                                            </Text>
                                            <Text style={styles.employeeInfo}>
                                                {employee.positionName} - {employee.departmentName}
                                            </Text>
                                            <Text style={styles.employeeInfo}>
                                                {employee.branchName}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
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
    monthSelector: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    monthButton: {
        padding: 8,
    },
    monthDisplay: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    monthText: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
    },
    summaryContainer: {
        flexDirection: "row",
        padding: 16,
        gap: 12,
    },
    summaryCard: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        gap: 8,
    },
    rewardCard: {
        borderLeftWidth: 4,
        borderLeftColor: "#10b981",
    },
    penaltyCard: {
        borderLeftWidth: 4,
        borderLeftColor: "#ef4444",
    },
    summaryLabel: {
        fontSize: 13,
        color: "#6b7280",
    },
    summaryValue: {
        fontSize: 18,
        fontWeight: "700",
    },
    rewardText: {
        color: "#10b981",
    },
    penaltyText: {
        color: "#ef4444",
    },
    filterContainer: {
        flexDirection: "row",
        paddingHorizontal: 16,
        gap: 8,
        marginBottom: 16,
    },
    filterTab: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        backgroundColor: "#fff",
        alignItems: "center",
    },
    filterTabActive: {
        backgroundColor: "#0d9488",
    },
    filterTabText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#6b7280",
    },
    filterTabTextActive: {
        color: "#fff",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        flex: 1,
        paddingHorizontal: 16,
    },
    emptyState: {
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#6b7280",
    },
    recordCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
    },
    rewardBorder: {
        borderLeftColor: "#10b981",
    },
    penaltyBorder: {
        borderLeftColor: "#ef4444",
    },
    recordHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 12,
    },
    recordType: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        flex: 1,
    },
    recordTypeText: {
        fontSize: 16,
        fontWeight: "700",
    },
    recordUserName: {
        fontSize: 14,
        color: "#6b7280",
        marginTop: 2,
    },
    recordActions: {
        alignItems: "flex-end",
        gap: 8,
    },
    recordAmount: {
        fontSize: 18,
        fontWeight: "700",
    },
    deleteButton: {
        padding: 4,
    },
    recordReason: {
        fontSize: 14,
        color: "#0f172a",
        marginBottom: 12,
        lineHeight: 20,
    },
    recordFooter: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#f1f5f9",
    },
    recordMeta: {
        fontSize: 12,
        color: "#6b7280",
    },
    fab: {
        position: "absolute",
        right: 20,
        bottom: 20,
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: "#0d9488",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
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
    employeeSelector: {
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        backgroundColor: "#fff",
    },
    employeeSelectorText: {
        fontSize: 14,
        color: "#0f172a",
        flex: 1,
    },
    placeholderText: {
        color: "#9ca3af",
    },
    typeSelector: {
        flexDirection: "row",
        gap: 12,
    },
    typeButton: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        padding: 16,
        borderWidth: 2,
        borderColor: "#e5e7eb",
        borderRadius: 8,
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
    input: {
        padding: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 8,
        fontSize: 14,
        color: "#0f172a",
        backgroundColor: "#fff",
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
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
        borderRadius: 8,
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
        borderRadius: 8,
        backgroundColor: "#0d9488",
        alignItems: "center",
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
    employeeItem: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    employeeName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 4,
    },
    employeeInfo: {
        fontSize: 13,
        color: "#6b7280",
        marginTop: 2,
    },
});

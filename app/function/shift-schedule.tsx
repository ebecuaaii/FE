import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
    Clock,
    Edit,
    Plus,
    RefreshCcw,
    Trash2,
    Users,
    X,
    ShieldAlert,
} from "lucide-react-native";

import SidebarLayout from "../../components/SidebarLayout";
import { shiftService, Shift, ShiftAssignment, CreateShiftRequest, AssignShiftRequest } from "../../services/shiftService";
import { employeeService, Employee } from "../../services/employeeService";
import { AuthContext } from "../../context/AuthContext";
import { showAlert, showConfirmDestructive } from "../../utils/alertUtils";

type TabType = "shifts" | "assignments" | "mySchedule";

const ScheduleScreen = () => {
    const router = useRouter();
    const authContext = useContext(AuthContext);
    const user = authContext?.user;

    // ===== TẤT CẢ HOOKS PHẢI Ở ĐÂY, TRƯỚC BẤT KỲ RETURN NÀO =====
    const [activeTab, setActiveTab] = useState<TabType>("shifts");
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
    const [mySchedule, setMySchedule] = useState<ShiftAssignment[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Modal states
    const [showShiftModal, setShowShiftModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [editingShift, setEditingShift] = useState<Shift | null>(null);
    const [shiftForm, setShiftForm] = useState<CreateShiftRequest>({
        name: "",
        startTime: "",
        endTime: "",
    });
    const [assignForm, setAssignForm] = useState<AssignShiftRequest>({
        userId: 0,
        shiftId: 0,
        shiftDate: new Date().toISOString().split("T")[0],
        status: "assigned",
    });

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            if (activeTab === "shifts") {
                const data = await shiftService.getShifts();
                setShifts(data);
            } else if (activeTab === "assignments") {
                const data = await shiftService.getAssignments();
                setAssignments(data);
            } else if (activeTab === "mySchedule") {
                // Lấy userId từ user hiện tại
                const currentUserId = user?.id;
                if (!currentUserId) {
                    setError("Không thể xác định người dùng. Vui lòng đăng nhập lại.");
                    setMySchedule([]);
                    return;
                }
                const data = await shiftService.getMySchedule(Number(currentUserId));
                setMySchedule(data);
            }
        } catch (err: any) {
            let message =
                err?.response?.data?.message ||
                err?.message ||
                "Không thể tải dữ liệu";
            if (err?.response?.status === 403) {
                message = "Bạn không có quyền truy cập dữ liệu này. Vui lòng kiểm tra lại quyền truy cập.";
            }
            console.error("Error fetching data:", err);
            setError(message);
            // Chỉ hiển thị alert nếu không phải lỗi 403 (để tránh spam)
            if (err?.response?.status !== 403) {
                Alert.alert("Lỗi", message);
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const data = await employeeService.getEmployees();
            setEmployees(data);
        } catch (err) {
            console.error("Failed to fetch employees:", err);
        }
    };

    useEffect(() => {
        fetchData();
        if (activeTab === "assignments" || showAssignModal) {
            fetchEmployees();
        }
    }, [activeTab]);

    const handleCreateShift = async () => {
        if (!shiftForm.name || !shiftForm.startTime || !shiftForm.endTime) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            if (editingShift) {
                await shiftService.updateShift(editingShift.id, shiftForm);
            } else {
                await shiftService.createShift(shiftForm);
            }

            // Đóng modal trước
            setShowShiftModal(false);
            setEditingShift(null);
            setShiftForm({ name: "", startTime: "", endTime: "" });

            // Reload data sau khi đóng modal
            setTimeout(async () => {
                const data = await shiftService.getShifts();
                setShifts(data);
                showAlert("Thành công", editingShift ? "Cập nhật ca làm việc thành công!" : "Tạo ca làm việc thành công!");
            }, 100);
        } catch (err: any) {
            let message = err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
            if (err?.response?.status === 404) {
                message = "Backend không hỗ trợ cập nhật ca làm việc. Vui lòng liên hệ admin để kiểm tra API endpoint PUT /api/Shifts/{id}";
            } else if (err?.response?.status === 403) {
                const errorMsg = err?.response?.data?.message || "";
                if (errorMsg.includes("Cần quyền: admin") || errorMsg.includes("Cần quyền: Admin")) {
                    message = "Lỗi phân quyền: Backend đang kiểm tra role case-sensitive. Token có role 'Admin' nhưng backend yêu cầu 'admin'. Vui lòng liên hệ admin để sửa backend.";
                } else {
                    message = "Bạn không có quyền thực hiện thao tác này. Vui lòng kiểm tra lại quyền truy cập.";
                }
            }
            Alert.alert("Lỗi", message);
        }
    };

    const handleDeleteShift = async (shift: Shift) => {
        console.log('handleDeleteShift called with:', shift);

        // Dùng utility function để hoạt động trên cả web và mobile
        const confirmed = await showConfirmDestructive(
            "Xác nhận xóa",
            `Bạn có chắc muốn xóa ca "${shift.name}"?`,
            "Xóa"
        );

        if (!confirmed) return;

        try {
            console.log('Deleting shift:', shift.id);
            console.log('User role:', user?.role);

            await shiftService.deleteShift(shift.id);

            // Reload data ngay lập tức
            const data = await shiftService.getShifts();
            setShifts(data);

            // Hiện thông báo thành công
            showAlert("Thành công", "Xóa ca làm việc thành công!");
        } catch (err: any) {
            console.error('Delete shift error:', err);
            console.error('Error response:', err?.response);

            let message = err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
            if (err?.response?.status === 403) {
                const errorMsg = err?.response?.data?.message || "";
                if (errorMsg.includes("Cần quyền: admin") || errorMsg.includes("Cần quyền: Admin")) {
                    message = "Lỗi phân quyền: Backend đang kiểm tra role case-sensitive. Token có role 'Admin' nhưng backend yêu cầu 'admin'. Vui lòng liên hệ admin để sửa backend.";
                } else {
                    message = "Bạn không có quyền thực hiện thao tác này. Vui lòng kiểm tra lại quyền truy cập.";
                }
            } else if (err?.response?.status === 400) {
                const errorMsg = err?.response?.data?.message || "";
                if (errorMsg.includes("phân công") || errorMsg.includes("assignment")) {
                    message = "Không thể xóa ca này vì đã có nhân viên được phân công. Vui lòng xóa tất cả phân công của ca này trước.";
                } else {
                    message = err?.response?.data?.message || "Không thể xóa ca này. Có thể ca đã có phân công.";
                }
            } else if (err?.response?.status === 404) {
                message = "Backend không hỗ trợ xóa ca làm việc. Vui lòng liên hệ admin để kiểm tra API endpoint DELETE /api/Shifts/{id}";
            }

            showAlert("Lỗi", message);
        }
    };

    const handleAssignShift = async () => {
        if (!assignForm.userId || !assignForm.shiftId || !assignForm.shiftDate) {
            Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            await shiftService.assignShift(assignForm);
            Alert.alert("Thành công", "Phân công ca làm việc thành công");
            setShowAssignModal(false);
            setAssignForm({
                userId: 0,
                shiftId: 0,
                shiftDate: new Date().toISOString().split("T")[0],
                status: "assigned",
            });
            fetchData();
        } catch (err: any) {
            let message = err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
            if (err?.response?.status === 403) {
                message = "Bạn không có quyền thực hiện thao tác này. Vui lòng kiểm tra lại quyền truy cập.";
            }
            Alert.alert("Lỗi", message);
        }
    };

    const handleDeleteAssignment = (assignment: ShiftAssignment) => {
        Alert.alert(
            "Xác nhận",
            "Bạn có chắc muốn hủy phân công này?",
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await shiftService.deleteAssignment(assignment.id);
                            Alert.alert("Thành công", "Hủy phân công thành công");
                            fetchData();
                        } catch (err: any) {
                            let message = err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
                            if (err?.response?.status === 403) {
                                message = "Bạn không có quyền thực hiện thao tác này. Vui lòng kiểm tra lại quyền truy cập.";
                            }
                            console.error("Error deleting shift:", err);
                            Alert.alert("Lỗi", message);
                        }
                    },
                },
            ]
        );
    };

    const openEditModal = (shift: Shift) => {
        const formatTimeForInput = (time: string) => {
            if (!time) return "";
            if (time.match(/^\d{2}:\d{2}$/)) return time;
            if (time.match(/^\d{2}:\d{2}:\d{2}/)) return time.substring(0, 5);
            return time;
        };

        setEditingShift(shift);
        setShiftForm({
            name: shift.name,
            startTime: formatTimeForInput(shift.startTime),
            endTime: formatTimeForInput(shift.endTime),
        });
        setShowShiftModal(true);
    };

    const openCreateModal = () => {
        setEditingShift(null);
        setShiftForm({ name: "", startTime: "", endTime: "" });
        setShowShiftModal(true);
    };

    const openAssignModal = () => {
        fetchEmployees();
        setShowAssignModal(true);
    };

    const formatTime = (time: string) => {
        if (!time) return "";
        return time.substring(0, 5); // HH:mm
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

    const renderTabs = () => (
        <View style={styles.tabs}>
            <TouchableOpacity
                style={[styles.tab, activeTab === "shifts" && styles.tabActive]}
                onPress={() => setActiveTab("shifts")}
            >
                <Text style={[styles.tabText, activeTab === "shifts" && styles.tabTextActive]}>
                    Ca làm việc
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === "assignments" && styles.tabActive]}
                onPress={() => setActiveTab("assignments")}
            >
                <Text style={[styles.tabText, activeTab === "assignments" && styles.tabTextActive]}>
                    Phân công
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.tab, activeTab === "mySchedule" && styles.tabActive]}
                onPress={() => setActiveTab("mySchedule")}
            >
                <Text style={[styles.tabText, activeTab === "mySchedule" && styles.tabTextActive]}>
                    Lịch của tôi
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderShifts = () => {
        if (loading && !refreshing) {
            return (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color="#0d9488" />
                    <Text style={styles.stateText}>Đang tải...</Text>
                </View>
            );
        }

        if (shifts.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <CalendarDays size={48} color="#94a3b8" />
                    <Text style={styles.emptyTitle}>Chưa có ca làm việc</Text>
                    <Text style={styles.emptyDesc}>Tạo ca mới để bắt đầu</Text>
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
                {shifts.map((shift) => (
                    <View key={shift.id} style={styles.shiftCard}>
                        <View style={styles.shiftHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.shiftName}>{shift.name}</Text>
                                <View style={styles.shiftTimeRow}>
                                    <Clock size={16} color="#0d9488" />
                                    <Text style={styles.shiftTime}>
                                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                    </Text>
                                    {shift.durationMinutes && (
                                        <Text style={styles.duration}>
                                            ({Math.floor(shift.durationMinutes / 60)}h)
                                        </Text>
                                    )}
                                </View>
                            </View>
                            <View style={styles.shiftActions}>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => openEditModal(shift)}
                                >
                                    <Edit size={18} color="#0d9488" />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionButton, styles.deleteButton]}
                                    onPress={() => handleDeleteShift(shift)}
                                >
                                    <Trash2 size={18} color="#dc2626" />
                                </TouchableOpacity>
                            </View>
                        </View>
                        {shift.createdByName && (
                            <Text style={styles.shiftMeta}>
                                Tạo bởi: {shift.createdByName}
                            </Text>
                        )}
                    </View>
                ))}
            </ScrollView>
        );
    };

    const renderAssignments = () => {
        if (loading && !refreshing) {
            return (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color="#0d9488" />
                    <Text style={styles.stateText}>Đang tải...</Text>
                </View>
            );
        }

        if (assignments.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Users size={48} color="#94a3b8" />
                    <Text style={styles.emptyTitle}>Chưa có phân công</Text>
                    <Text style={styles.emptyDesc}>Phân công ca cho nhân viên để bắt đầu</Text>
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
                {assignments.map((assignment) => (
                    <View key={assignment.id} style={styles.assignmentCard}>
                        <View style={styles.assignmentHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.assignmentName}>
                                    {assignment.fullName || assignment.userName || `User ${assignment.userId}`}
                                </Text>
                                <Text style={styles.assignmentShift}>
                                    {assignment.shiftName} - {formatDate(assignment.shiftDate)}
                                </Text>
                                <View style={styles.assignmentTimeRow}>
                                    <Clock size={14} color="#0d9488" />
                                    <Text style={styles.assignmentTime}>
                                        {formatTime(assignment.shiftStartTime || "")} -{" "}
                                        {formatTime(assignment.shiftEndTime || "")}
                                    </Text>
                                </View>
                            </View>
                            <TouchableOpacity
                                style={[styles.actionButton, styles.deleteButton]}
                                onPress={() => handleDeleteAssignment(assignment)}
                            >
                                <Trash2 size={18} color="#dc2626" />
                            </TouchableOpacity>
                        </View>
                        {assignment.status && (
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{assignment.status}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        );
    };

    const renderMySchedule = () => {
        if (loading && !refreshing) {
            return (
                <View style={styles.centerState}>
                    <ActivityIndicator size="large" color="#0d9488" />
                    <Text style={styles.stateText}>Đang tải...</Text>
                </View>
            );
        }

        if (mySchedule.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <CalendarDays size={48} color="#94a3b8" />
                    <Text style={styles.emptyTitle}>Chưa có lịch làm việc</Text>
                    <Text style={styles.emptyDesc}>Bạn chưa được phân công ca nào</Text>
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
                {mySchedule.map((assignment) => (
                    <View key={assignment.id} style={styles.assignmentCard}>
                        <View style={styles.assignmentHeader}>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.assignmentShift}>{assignment.shiftName}</Text>
                                <Text style={styles.assignmentDate}>{formatDate(assignment.shiftDate)}</Text>
                                <View style={styles.assignmentTimeRow}>
                                    <Clock size={14} color="#0d9488" />
                                    <Text style={styles.assignmentTime}>
                                        {formatTime(assignment.shiftStartTime || "")} -{" "}
                                        {formatTime(assignment.shiftEndTime || "")}
                                    </Text>
                                </View>
                            </View>
                        </View>
                        {assignment.status && (
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>{assignment.status}</Text>
                            </View>
                        )}
                    </View>
                ))}
            </ScrollView>
        );
    };

    // ===== KIỂM TRA QUYỀN TRUY CẬP (SAU TẤT CẢ HOOKS) =====
    const userRole = user?.role || user?.userRole || user?.Role || user?.roleName;
    const userRoleLower = userRole?.toLowerCase();
    const isAdminOrManager =
        userRoleLower === 'admin' ||
        userRoleLower === 'manager' ||
        userRole === 'Admin' ||
        userRole === 'Manager';

    const isLoading = authContext?.loading === true;

    // Nếu đang loading, hiển thị loading
    if (isLoading || (!user && authContext?.loading === false)) {
        return (
            <SidebarLayout title="Xếp lịch làm việc" activeKey="task">
                <View style={styles.unauthorizedContainer}>
                    <ActivityIndicator size="large" color="#0d9488" />
                    <Text style={styles.unauthorizedMessage}>Đang kiểm tra quyền truy cập...</Text>
                </View>
            </SidebarLayout>
        );
    }

    // Nếu không có quyền, hiển thị thông báo
    if (!isAdminOrManager) {
        return (
            <SidebarLayout title="Xếp lịch làm việc" activeKey="task">
                <View style={styles.unauthorizedContainer}>
                    <ShieldAlert size={64} color="#dc2626" />
                    <Text style={styles.unauthorizedTitle}>Không có quyền truy cập</Text>
                    <Text style={styles.unauthorizedMessage}>
                        Chỉ Admin và Manager mới có quyền truy cập trang quản lý lịch làm việc.
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

    return (
        <SidebarLayout title="Xếp lịch làm việc" activeKey="task">
            <View style={styles.container}>
                <View style={styles.header}>
                    <View>
                        <Text style={styles.headerTitle}>Quản lý lịch làm việc</Text>
                        <Text style={styles.headerSubtitle}>
                            {activeTab === "shifts" && `${shifts.length} ca làm việc`}
                            {activeTab === "assignments" && `${assignments.length} phân công`}
                            {activeTab === "mySchedule" && `${mySchedule.length} ca của tôi`}
                        </Text>
                    </View>
                    <View style={styles.headerActions}>
                        {activeTab === "shifts" && (
                            <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
                                <Plus size={18} color="#fff" />
                                <Text style={styles.addButtonText}>Thêm ca</Text>
                            </TouchableOpacity>
                        )}
                        {activeTab === "assignments" && (
                            <TouchableOpacity style={styles.addButton} onPress={openAssignModal}>
                                <Plus size={18} color="#fff" />
                                <Text style={styles.addButtonText}>Phân công</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity style={styles.refreshButton} onPress={() => fetchData(true)}>
                            <RefreshCcw size={18} color="#0d9488" />
                        </TouchableOpacity>
                    </View>
                </View>

                {error && (
                    <View style={styles.errorBanner}>
                        <AlertTriangle size={18} color="#dc2626" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                )}

                {renderTabs()}

                <View style={styles.content}>
                    {activeTab === "shifts" && renderShifts()}
                    {activeTab === "assignments" && renderAssignments()}
                    {activeTab === "mySchedule" && renderMySchedule()}
                </View>

                {/* Modal tạo/sửa ca */}
                <Modal visible={showShiftModal} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editingShift ? "Sửa ca làm việc" : "Tạo ca làm việc mới"}
                                </Text>
                                <TouchableOpacity onPress={() => setShowShiftModal(false)}>
                                    <X size={24} color="#0f172a" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Tên ca *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={shiftForm.name}
                                        onChangeText={(text) => setShiftForm({ ...shiftForm, name: text })}
                                        placeholder="Ví dụ: Ca sáng, Ca chiều"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Giờ bắt đầu *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={shiftForm.startTime}
                                        onChangeText={(text) => setShiftForm({ ...shiftForm, startTime: text })}
                                        placeholder="HH:mm (ví dụ: 08:00)"
                                    />
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Giờ kết thúc *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={shiftForm.endTime}
                                        onChangeText={(text) => setShiftForm({ ...shiftForm, endTime: text })}
                                        placeholder="HH:mm (ví dụ: 17:00)"
                                    />
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowShiftModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleCreateShift}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {editingShift ? "Cập nhật" : "Tạo"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>

                {/* Modal phân công ca */}
                <Modal visible={showAssignModal} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>Phân công ca làm việc</Text>
                                <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                                    <X size={24} color="#0f172a" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Nhân viên *</Text>
                                    <ScrollView style={styles.pickerContainer}>
                                        {employees.map((emp) => (
                                            <TouchableOpacity
                                                key={emp.id || emp.employeeId}
                                                style={[
                                                    styles.pickerItem,
                                                    assignForm.userId === (emp.id || emp.employeeId) &&
                                                    styles.pickerItemActive,
                                                ]}
                                                onPress={() =>
                                                    setAssignForm({
                                                        ...assignForm,
                                                        userId: (emp.id || emp.employeeId) as number,
                                                    })
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.pickerItemText,
                                                        assignForm.userId === (emp.id || emp.employeeId) &&
                                                        styles.pickerItemTextActive,
                                                    ]}
                                                >
                                                    {emp.fullname || emp.fullName || emp.username || `User ${emp.id}`}
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Ca làm việc *</Text>
                                    <ScrollView style={styles.pickerContainer}>
                                        {shifts.map((shift) => (
                                            <TouchableOpacity
                                                key={shift.id}
                                                style={[
                                                    styles.pickerItem,
                                                    assignForm.shiftId === shift.id && styles.pickerItemActive,
                                                ]}
                                                onPress={() =>
                                                    setAssignForm({ ...assignForm, shiftId: shift.id })
                                                }
                                            >
                                                <Text
                                                    style={[
                                                        styles.pickerItemText,
                                                        assignForm.shiftId === shift.id && styles.pickerItemTextActive,
                                                    ]}
                                                >
                                                    {shift.name} ({formatTime(shift.startTime)} -{" "}
                                                    {formatTime(shift.endTime)})
                                                </Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>
                                </View>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Ngày làm việc *</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={assignForm.shiftDate}
                                        onChangeText={(text) => setAssignForm({ ...assignForm, shiftDate: text })}
                                        placeholder="YYYY-MM-DD (ví dụ: 2024-12-25)"
                                    />
                                </View>
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.cancelButton]}
                                    onPress={() => setShowAssignModal(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.modalButton, styles.saveButton]}
                                    onPress={handleAssignShift}
                                >
                                    <Text style={styles.saveButtonText}>Phân công</Text>
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
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0f172a",
    },
    headerSubtitle: {
        fontSize: 14,
        color: "#64748b",
        marginTop: 4,
    },
    headerActions: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: "#0d9488",
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
    },
    refreshButton: {
        width: 40,
        height: 40,
        borderRadius: 12,
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
    shiftCard: {
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
    shiftHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    shiftName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 8,
    },
    shiftTimeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    shiftTime: {
        fontSize: 14,
        color: "#475569",
    },
    duration: {
        fontSize: 12,
        color: "#94a3b8",
        marginLeft: 4,
    },
    shiftActions: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 8,
        backgroundColor: "#ecfeff",
        alignItems: "center",
        justifyContent: "center",
    },
    deleteButton: {
        backgroundColor: "#fee2e2",
    },
    shiftMeta: {
        fontSize: 12,
        color: "#94a3b8",
        marginTop: 4,
    },
    assignmentCard: {
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
    assignmentHeader: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    assignmentName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 4,
    },
    assignmentShift: {
        fontSize: 14,
        color: "#475569",
        marginBottom: 4,
    },
    assignmentDate: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 4,
    },
    assignmentTimeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    assignmentTime: {
        fontSize: 13,
        color: "#64748b",
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        backgroundColor: "#dbeafe",
        marginTop: 8,
    },
    statusText: {
        fontSize: 12,
        color: "#1e40af",
        fontWeight: "500",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        maxHeight: "90%",
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
        maxHeight: 500,
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
    input: {
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 12,
        padding: 12,
        fontSize: 14,
        color: "#0f172a",
        backgroundColor: "#fff",
    },
    pickerContainer: {
        maxHeight: 200,
        borderWidth: 1,
        borderColor: "#cbd5e1",
        borderRadius: 12,
        backgroundColor: "#fff",
    },
    pickerItem: {
        padding: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    pickerItemActive: {
        backgroundColor: "#ecfeff",
    },
    pickerItemText: {
        fontSize: 14,
        color: "#0f172a",
    },
    pickerItemTextActive: {
        color: "#0d9488",
        fontWeight: "600",
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
    saveButton: {
        backgroundColor: "#0d9488",
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 14,
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

export default ScheduleScreen;

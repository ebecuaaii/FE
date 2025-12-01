import React, { useContext, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    Alert,
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
    Clock,
    Plus,
    RefreshCcw,
    Users,
    X,
    ShieldAlert,
    Copy,
    UserPlus,
} from "lucide-react-native";

import SidebarLayout from "../../components/SidebarLayout";
import { shiftService, Shift, ShiftAssignment, AssignShiftRequest } from "../../services/shiftService";
import { employeeService, Employee } from "../../services/employeeService";
import { weeklyScheduleRequestService, WeeklyScheduleRequest } from "../../services/weeklyScheduleRequestService";
import { AuthContext } from "../../context/AuthContext";
import { showAlert, showConfirmDestructive } from "../../utils/alertUtils";

const WeeklyScheduleScreen = () => {
    const router = useRouter();
    const authContext = useContext(AuthContext);
    const user = authContext?.user;

    // Get screen dimensions for responsive design
    const { width: screenWidth } = Dimensions.get('window');
    const isMobile = screenWidth < 768;

    // ===== TẤT CẢ HOOKS PHẢI Ở ĐÂY, TRƯỚC BẤT KỲ RETURN NÀO =====
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [weeklySchedule, setWeeklySchedule] = useState<{ [key: string]: ShiftAssignment[] }>({});
    const [weeklyRequests, setWeeklyRequests] = useState<{ [key: string]: WeeklyScheduleRequest[] }>({});
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calendar states
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [weekDates, setWeekDates] = useState<string[]>([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

    // Modal states
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
    const [selectedDateForAssign, setSelectedDateForAssign] = useState("");
    const [assignForm, setAssignForm] = useState<AssignShiftRequest>({
        userId: 0,
        shiftId: 0,
        shiftDate: new Date().toISOString().split("T")[0],
        status: "assigned",
    });

    // Tạo tuần hiện tại
    useEffect(() => {
        const today = new Date();
        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ...
        const monday = new Date(today);
        monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1)); // Tính thứ 2
        setCurrentWeekStart(monday);
    }, []);

    // Generate week dates khi currentWeekStart thay đổi
    useEffect(() => {
        const generateWeekDates = () => {
            const week = [];
            for (let i = 0; i < 7; i++) {
                const date = new Date(currentWeekStart);
                date.setDate(currentWeekStart.getDate() + i);
                week.push(date.toISOString().split("T")[0]);
            }
            setWeekDates(week);
        };
        generateWeekDates();
    }, [currentWeekStart]);

    const goToPreviousWeek = () => {
        const prevWeek = new Date(currentWeekStart);
        prevWeek.setDate(currentWeekStart.getDate() - 7);
        setCurrentWeekStart(prevWeek);
    };

    const goToNextWeek = () => {
        const nextWeek = new Date(currentWeekStart);
        nextWeek.setDate(currentWeekStart.getDate() + 7);
        setCurrentWeekStart(nextWeek);
    };

    const goToCurrentWeek = () => {
        const today = new Date();
        const currentDay = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        setCurrentWeekStart(monday);
        setSelectedDate(today.toISOString().split("T")[0]);
    };

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }
        setError(null);

        try {
            // Fetch shifts và employees
            const [shiftsData, employeesData] = await Promise.all([
                shiftService.getShifts(),
                employeeService.getEmployees()
            ]);

            setShifts(shiftsData);
            setEmployees(employeesData);

            // Fetch assignments cho tuần hiện tại
            await fetchWeeklyAssignments();
        } catch (err: any) {
            let message = err?.response?.data?.message || err?.message || "Không thể tải dữ liệu";
            if (err?.response?.status === 401) {
                message = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
            }
            setError(message);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const fetchWeeklyAssignments = async () => {
        try {
            const [assignments, requests] = await Promise.all([
                shiftService.getAssignments(),
                weeklyScheduleRequestService.getRequests()
            ]);

            // Group assignments by date
            const weeklyData: { [key: string]: ShiftAssignment[] } = {};
            weekDates.forEach(date => {
                weeklyData[date] = assignments.filter(assignment => {
                    const assignmentDate = assignment.shiftDate.split("T")[0];
                    return assignmentDate === date;
                });
            });

            // Group requests by date
            const requestsData: { [key: string]: WeeklyScheduleRequest[] } = {};
            weekDates.forEach(date => {
                const filtered = requests.filter(request => {
                    // Normalize date format - handle both ISO and other formats
                    let requestDate = request.requestedDate;
                    if (requestDate.includes('T')) {
                        requestDate = requestDate.split("T")[0];
                    } else if (requestDate.includes(' ')) {
                        requestDate = requestDate.split(" ")[0];
                    }
                    return requestDate === date;
                });
                requestsData[date] = filtered;
            });
            setWeeklySchedule(weeklyData);
            setWeeklyRequests(requestsData);
        } catch (err) {
            console.error("Error fetching weekly assignments:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (weekDates.length > 0) {
            fetchWeeklyAssignments();
        }
    }, [weekDates]);

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
            <SidebarLayout title="Lịch làm việc theo ca" activeKey="task">
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
            <SidebarLayout title="Lịch làm việc theo ca" activeKey="task">
                <View style={styles.unauthorizedContainer}>
                    <ShieldAlert size={64} color="#dc2626" />
                    <Text style={styles.unauthorizedTitle}>Không có quyền truy cập</Text>
                    <Text style={styles.unauthorizedMessage}>
                        Chỉ Admin và Manager mới có quyền truy cập trang này.
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
        return time.substring(0, 5); // HH:mm
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "";
        const date = new Date(dateStr);
        return date.toLocaleDateString("vi-VN", {
            weekday: "short",
            day: "numeric",
            month: "numeric",
        });
    };

    const renderWeekCalendar = () => {
        const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const today = new Date().toISOString().split("T")[0];

        // Format tháng năm để hiển thị
        const startDate = new Date(weekDates[0]);
        const endDate = new Date(weekDates[6]);
        const monthYear = startDate.getMonth() === endDate.getMonth()
            ? `Tháng ${startDate.getMonth() + 1}/${startDate.getFullYear()}`
            : `${startDate.getMonth() + 1}/${startDate.getFullYear()} - ${endDate.getMonth() + 1}/${endDate.getFullYear()}`;

        return (
            <View style={styles.weekCalendar}>
                <View style={styles.weekHeader}>
                    <TouchableOpacity style={styles.weekNavButton} onPress={goToPreviousWeek}>
                        <Text style={styles.weekNavText}>‹</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.weekTitleContainer} onPress={goToCurrentWeek}>
                        <Text style={styles.weekTitle}>{monthYear}</Text>
                        <Text style={styles.weekSubtitle}>Nhấn để về tuần hiện tại</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.weekNavButton} onPress={goToNextWeek}>
                        <Text style={styles.weekNavText}>›</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.weekDays}>
                    {weekDates.map((date, index) => {
                        const isSelected = date === selectedDate;
                        const dayNum = new Date(date).getDate();
                        const isToday = date === today;

                        return (
                            <TouchableOpacity
                                key={date}
                                style={[
                                    styles.dayButton,
                                    isSelected && styles.dayButtonSelected,
                                    isToday && styles.dayButtonToday
                                ]}
                                onPress={() => setSelectedDate(date)}
                            >
                                <Text style={[
                                    styles.dayName,
                                    isSelected && styles.dayNameSelected
                                ]}>
                                    {dayNames[index]}
                                </Text>
                                <Text style={[
                                    styles.dayNumber,
                                    isSelected && styles.dayNumberSelected,
                                    isToday && styles.dayNumberToday
                                ]}>
                                    {dayNum}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    const openAssignModal = (shift: Shift, date: string) => {
        setSelectedShift(shift);
        setSelectedDateForAssign(date);
        setAssignForm({
            userId: 0,
            shiftId: shift.id,
            shiftDate: date,
            status: "assigned",
        });

        // Fetch employees nếu chưa có (giống shift-schedule)
        if (employees.length === 0) {
            fetchEmployees();
        }

        setShowAssignModal(true);
    };

    const fetchEmployees = async () => {
        try {
            const data = await employeeService.getEmployees();
            setEmployees(data);
        } catch (err) {
            console.error("Failed to fetch employees:", err);
        }
    };

    const handleAssignShift = async () => {
        if (!assignForm.userId || !assignForm.shiftId || !assignForm.shiftDate) {
            showAlert("Lỗi", "Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            console.log('Assigning shift:', assignForm);

            const result = await shiftService.assignShift(assignForm);
            console.log('Assign result:', result);

            // Đóng modal trước
            setShowAssignModal(false);
            setAssignForm({
                userId: 0,
                shiftId: 0,
                shiftDate: new Date().toISOString().split("T")[0],
                status: "assigned",
            });

            // Cập nhật weekly schedule từ response hoặc reload
            if (result.allAssignments) {
                // Group assignments by date nếu có response
                const weeklyData: { [key: string]: ShiftAssignment[] } = {};
                weekDates.forEach(date => {
                    weeklyData[date] = result.allAssignments.filter((assignment: any) => {
                        const assignmentDate = assignment.shiftDate.split("T")[0];
                        return assignmentDate === date;
                    });
                });
                setWeeklySchedule(weeklyData);
            } else {
                // Fallback: reload manually
                await fetchWeeklyAssignments();
            }

            showAlert("Thành công", "Phân công ca làm việc thành công");
        } catch (err: any) {
            let message = err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
            if (err?.response?.status === 500) {
                message = "Lỗi server: " + (err?.response?.data?.message || "Vui lòng kiểm tra dữ liệu đầu vào và thử lại");
            } else if (err?.response?.status === 403) {
                message = "Bạn không có quyền thực hiện thao tác này. Vui lòng kiểm tra lại quyền truy cập.";
            } else if (err?.response?.status === 400) {
                message = "Dữ liệu không hợp lệ: " + (err?.response?.data?.message || "Vui lòng kiểm tra lại thông tin");
            }
            showAlert("Lỗi", message);
        }
    };

    const renderShiftGrid = () => {
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
                    <Text style={styles.emptyDesc}>Vui lòng tạo ca làm việc trước</Text>
                </View>
            );
        }

        return (
            <ScrollView
                style={styles.gridContainer}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
                }
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.grid}>
                        {/* Header row */}
                        <View style={styles.gridRow}>
                            <View style={[styles.gridCell, styles.headerCell, styles.shiftNameCell]}>
                                <Text style={styles.headerText}>Ca làm việc</Text>
                            </View>
                            {weekDates.map((date, index) => (
                                <View key={date} style={[styles.gridCell, styles.headerCell]}>
                                    <Text style={styles.headerText}>{formatDate(date)}</Text>
                                </View>
                            ))}
                        </View>

                        {/* Shift rows */}
                        {shifts.map((shift) => (
                            <View key={shift.id} style={styles.gridRow}>
                                <View style={[styles.gridCell, styles.shiftNameCell]}>
                                    <Text style={styles.shiftNameText}>{shift.name}</Text>
                                    <Text style={styles.shiftTimeText}>
                                        {formatTime(shift.startTime)} - {formatTime(shift.endTime)}
                                    </Text>
                                </View>
                                {weekDates.map((date) => {
                                    const dayAssignments = weeklySchedule[date] || [];
                                    const shiftAssignments = dayAssignments.filter(a => a.shiftId === shift.id);
                                    const dayRequests = weeklyRequests[date] || [];
                                    const shiftRequests = dayRequests.filter(r => r.shiftId === shift.id);

                                    return (
                                        <View key={`${shift.id}-${date}`} style={styles.gridCell}>
                                            <ScrollView style={styles.assignmentList} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                                                {/* Hiển thị phân công từ admin */}
                                                {shiftAssignments.map((assignment) => (
                                                    <View key={`assign-${assignment.id}`} style={styles.assignmentChip}>
                                                        <Text style={styles.assignmentText} numberOfLines={1}>
                                                            {assignment.fullName || assignment.userName || `User ${assignment.userId}`}
                                                        </Text>
                                                    </View>
                                                ))}
                                                {/* Hiển thị yêu cầu đăng ký từ user */}
                                                {shiftRequests.map((request) => (
                                                    <View key={`req-${request.id}`} style={styles.assignmentChip}>
                                                        <Text style={styles.assignmentText} numberOfLines={1}>
                                                            {request.fullName || request.userName || `User ${request.userId}`}
                                                        </Text>
                                                    </View>
                                                ))}
                                            </ScrollView>
                                            <TouchableOpacity
                                                style={styles.addButton}
                                                onPress={() => openAssignModal(shift, date)}
                                            >
                                                <UserPlus size={12} color="#0d9488" />
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </ScrollView>
        );
    };

    return (
        <SidebarLayout title="Lịch làm việc theo ca" activeKey="task">
            <View style={styles.container}>
                <View style={[styles.header, isMobile && styles.headerMobile]}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>
                            Lịch làm việc theo ca
                        </Text>
                        <Text style={[styles.headerSubtitle, isMobile && styles.headerSubtitleMobile]}>
                            Quản lý lịch làm việc theo tuần
                        </Text>
                    </View>
                </View>

                {/* Action buttons row */}
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

                {renderWeekCalendar()}

                <View style={styles.content}>
                    {renderShiftGrid()}
                </View>

                {/* Modal phân công ca */}
                <Modal visible={showAssignModal} animationType="slide" transparent>
                    <View style={styles.modalOverlay}>
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    Phân công ca: {selectedShift?.name}
                                </Text>
                                <TouchableOpacity onPress={() => setShowAssignModal(false)}>
                                    <X size={24} color="#0f172a" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView style={styles.modalBody}>
                                <Text style={styles.modalSubtitle}>
                                    Ngày: {formatDate(selectedDateForAssign)}
                                </Text>

                                <View style={styles.formGroup}>
                                    <Text style={styles.label}>Chọn nhân viên *</Text>
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
    content: {
        flex: 1,
        padding: 16,
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
    // Calendar styles
    weekCalendar: {
        backgroundColor: "#fff",
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
    },
    weekHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
    },
    weekNavButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#f1f5f9",
        justifyContent: "center",
        alignItems: "center",
    },
    weekNavText: {
        fontSize: 24,
        fontWeight: "600",
        color: "#0d9488",
    },
    weekTitleContainer: {
        flex: 1,
        alignItems: "center",
    },
    weekTitle: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0f172a",
    },
    weekSubtitle: {
        fontSize: 11,
        color: "#64748b",
        marginTop: 1,
    },
    weekDays: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    dayButton: {
        alignItems: "center",
        paddingVertical: 8,
        paddingHorizontal: 8,
        borderRadius: 12,
        backgroundColor: "#f8fafc",
        flex: 1,
        marginHorizontal: 2,
    },
    dayButtonSelected: {
        backgroundColor: "#0d9488",
    },
    dayButtonToday: {
        borderWidth: 2,
        borderColor: "#0d9488",
    },
    dayName: {
        fontSize: 12,
        color: "#64748b",
        fontWeight: "500",
        marginBottom: 2,
    },
    dayNameSelected: {
        color: "#fff",
    },
    dayNumber: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
    },
    dayNumberSelected: {
        color: "#fff",
    },
    dayNumberToday: {
        color: "#fff",
    },
    // Grid styles
    gridContainer: {
        flex: 1,
    },
    grid: {
        backgroundColor: "#fff",
        borderRadius: 12,
        overflow: "hidden",
        borderWidth: 1,
        borderColor: "#e2e8f0",
        minWidth: 800, // Ensure minimum width for proper display
    },
    gridRow: {
        flexDirection: "row",
        borderBottomWidth: 1,
        borderBottomColor: "#e2e8f0",
        minHeight: 100,
    },
    gridCell: {
        width: 100, // Fixed width for consistency
        minHeight: 100,
        padding: 6,
        borderRightWidth: 1,
        borderRightColor: "#e2e8f0",
        justifyContent: "flex-start",
    },
    headerCell: {
        backgroundColor: "#f8fafc",
        minHeight: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    headerText: {
        fontSize: 11,
        fontWeight: "600",
        color: "#475569",
        textAlign: "center",
        lineHeight: 14,
    },
    shiftNameCell: {
        backgroundColor: "#f1f5f9",
        width: 140, // Fixed width for shift names
        justifyContent: "center",
        paddingHorizontal: 8,
    },
    shiftNameText: {
        fontSize: 13,
        fontWeight: "600",
        color: "#0f172a",
        textAlign: "center",
    },
    shiftTimeText: {
        fontSize: 10,
        color: "#64748b",
        marginTop: 2,
        textAlign: "center",
    },
    assignmentList: {
        flex: 1,
        maxHeight: 80,
        marginBottom: 2,
    },
    assignmentChip: {
        backgroundColor: "#ecfeff",
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        marginBottom: 3,
        borderWidth: 1,
        borderColor: "#cffafe",
    },
    assignmentText: {
        fontSize: 9,
        color: "#0e7490",
        fontWeight: "500",
        textAlign: "center",
    },
    addButton: {
        alignSelf: "center",
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: "#f0fdfa",
        borderWidth: 1,
        borderColor: "#99f6e4",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 4,
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
    modalSubtitle: {
        fontSize: 14,
        color: "#64748b",
        marginBottom: 16,
    },
    modalBody: {
        padding: 20,
        maxHeight: 400,
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
    // Mobile-specific styles
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

export default WeeklyScheduleScreen;
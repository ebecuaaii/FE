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
import { useRouter, useLocalSearchParams } from "expo-router";
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
    const params = useLocalSearchParams();
    const authContext = useContext(AuthContext);
    const user = authContext?.user;

    // Get screen dimensions for responsive design
    const { width: screenWidth } = Dimensions.get('window');
    const isMobile = screenWidth < 768;

    // ===== TẤT CẢ HOOKS PHẢI Ở ĐÂY, TRƯỚC BẤT KỲ RETURN NÀO =====
    const [activeTab, setActiveTab] = useState<TabType>("shifts");
    const [shifts, setShifts] = useState<Shift[]>([]);
    const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
    const [mySchedule, setMySchedule] = useState<ShiftAssignment[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Calendar states
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
    const [weekDates, setWeekDates] = useState<string[]>([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

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
                console.log('Fetched shifts:', data.length);
                setShifts(data);
            } else if (activeTab === "assignments") {
                const data = await shiftService.getAssignments();
                console.log('Fetched assignments:', data.length, data);
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

    // Xử lý query parameter để set active tab
    useEffect(() => {
        if (params.tab) {
            const tabParam = params.tab as string;
            if (tabParam === "assignments" || tabParam === "shifts" || tabParam === "mySchedule") {
                setActiveTab(tabParam as TabType);
            }
        }
    }, [params.tab]);

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

    useEffect(() => {
        fetchData();
        if (activeTab === "assignments" || showAssignModal) {
            fetchEmployees();
        }
    }, [activeTab]);

    // Filter assignments theo ngày được chọn
    const filteredAssignments = useMemo(() => {
        if (activeTab !== "assignments") return assignments;

        return assignments.filter(assignment => {
            const assignmentDate = assignment.shiftDate.split("T")[0];
            return assignmentDate === selectedDate;
        });
    }, [assignments, selectedDate, activeTab]);

    // Filter mySchedule theo tuần được chọn
    const filteredMySchedule = useMemo(() => {
        if (activeTab !== "mySchedule") return mySchedule;

        return mySchedule
            .filter(assignment => {
                const assignmentDate = assignment.shiftDate.split("T")[0];
                return weekDates.includes(assignmentDate);
            })
            .sort((a, b) => {
                // Sắp xếp theo ngày, sau đó theo giờ bắt đầu
                const dateA = new Date(a.shiftDate).getTime();
                const dateB = new Date(b.shiftDate).getTime();
                if (dateA !== dateB) return dateA - dateB;

                const timeA = a.shiftStartTime || "00:00";
                const timeB = b.shiftStartTime || "00:00";
                return timeA.localeCompare(timeB);
            });
    }, [mySchedule, weekDates, activeTab]);

    // ===== KIỂM TRA QUYỀN TRUY CẬP (SAU TẤT CẢ HOOKS) =====
    const userRole = user?.role || user?.userRole || user?.Role || user?.roleName;
    const userRoleLower = userRole?.toLowerCase();
    const isAdminOrManager =
        userRoleLower === 'admin' ||
        userRoleLower === 'manager' ||
        userRole === 'Admin' ||
        userRole === 'Manager';

    const isLoading = authContext?.loading === true;
    const canManageShifts = isAdminOrManager;

    // Nếu không có quyền quản lý và đang ở tab quản lý, chuyển về "Lịch của tôi"
    useEffect(() => {
        if (!canManageShifts && (activeTab === "shifts" || activeTab === "assignments")) {
            setActiveTab("mySchedule");
        }
    }, [canManageShifts, activeTab]);

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

            // Reload shifts ngay lập tức
            const data = await shiftService.getShifts();
            setShifts(data);

            showAlert("Thành công", editingShift ? "Cập nhật ca làm việc thành công!" : "Tạo ca làm việc thành công!");
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
            showAlert("Lỗi", "Vui lòng điền đầy đủ thông tin");
            return;
        }

        try {
            console.log('Assigning shift:', assignForm);

            // Sử dụng assignShift với returnList=true
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

            // Cập nhật assignments từ response
            if (activeTab === "assignments") {
                if (result.allAssignments) {
                    setAssignments(result.allAssignments);
                } else {
                    // Fallback: reload manually
                    const data = await shiftService.getAssignments();
                    setAssignments(data);
                }
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

    const handleDeleteAssignment = async (assignment: ShiftAssignment) => {
        const confirmed = await showConfirmDestructive(
            "Xác nhận xóa",
            "Bạn có chắc muốn hủy phân công này?",
            "Xóa"
        );

        if (!confirmed) return;

        try {
            console.log('Deleting assignment:', assignment.id);
            await shiftService.deleteAssignment(assignment.id);

            // Reload assignments ngay lập tức
            if (activeTab === "assignments") {
                const data = await shiftService.getAssignments();
                console.log('Assignments after delete:', data);
                setAssignments(data);
            }

            showAlert("Thành công", "Hủy phân công thành công");
        } catch (err: any) {
            console.error("Error deleting assignment:", err);
            console.error('Error response:', err?.response);

            let message = err?.response?.data?.message || err?.message || "Có lỗi xảy ra";
            if (err?.response?.status === 403) {
                message = "Bạn không có quyền thực hiện thao tác này. Vui lòng kiểm tra lại quyền truy cập.";
            } else if (err?.response?.status === 404) {
                message = "Backend không hỗ trợ xóa phân công. Vui lòng liên hệ admin để kiểm tra API endpoint DELETE /api/ShiftAssignments/{id}";
            }
            showAlert("Lỗi", message);
        }
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

    const renderTabs = () => (
        <View style={styles.tabs}>
            {canManageShifts && (
                <TouchableOpacity
                    style={[styles.tab, activeTab === "shifts" && styles.tabActive]}
                    onPress={() => setActiveTab("shifts")}
                >
                    <Text style={[styles.tabText, activeTab === "shifts" && styles.tabTextActive]}>
                        Ca làm việc
                    </Text>
                </TouchableOpacity>
            )}
            {canManageShifts && (
                <TouchableOpacity
                    style={[styles.tab, activeTab === "assignments" && styles.tabActive]}
                    onPress={() => setActiveTab("assignments")}
                >
                    <Text style={[styles.tabText, activeTab === "assignments" && styles.tabTextActive]}>
                        Phân công
                    </Text>
                </TouchableOpacity>
            )}
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

        if (filteredAssignments.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <Users size={48} color="#94a3b8" />
                    <Text style={styles.emptyTitle}>Chưa có phân công</Text>
                    <Text style={styles.emptyDesc}>
                        {assignments.length === 0
                            ? "Phân công ca cho nhân viên để bắt đầu"
                            : `Không có phân công nào cho ngày ${formatDate(selectedDate)}`
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
                {filteredAssignments.map((assignment) => (
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

        if (filteredMySchedule.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <CalendarDays size={48} color="#94a3b8" />
                    <Text style={styles.emptyTitle}>Chưa có lịch làm việc</Text>
                    <Text style={styles.emptyDesc}>
                        {mySchedule.length === 0
                            ? "Bạn chưa được phân công ca nào"
                            : "Không có ca nào trong tuần này"
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
                {filteredMySchedule.map((assignment) => {
                    const assignmentDate = assignment.shiftDate.split("T")[0];
                    const isSelectedDate = assignmentDate === selectedDate;
                    const isToday = assignmentDate === new Date().toISOString().split("T")[0];

                    return (
                        <View
                            key={assignment.id}
                            style={[
                                styles.assignmentCard,
                                isSelectedDate && styles.assignmentCardSelected,
                                isToday && styles.assignmentCardToday
                            ]}
                        >
                            <View style={styles.assignmentHeader}>
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.assignmentShift}>{assignment.shiftName}</Text>
                                    <Text style={[
                                        styles.assignmentDate,
                                        isSelectedDate && styles.assignmentDateSelected,
                                        isToday && styles.assignmentDateToday
                                    ]}>
                                        {formatDate(assignment.shiftDate)}
                                    </Text>
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
                    );
                })}
            </ScrollView>
        );
    };

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

    return (
        <SidebarLayout title={canManageShifts ? "Xếp lịch làm việc" : "Lịch làm việc của tôi"} activeKey="task">
            <View style={styles.container}>
                <View style={[styles.header, isMobile && styles.headerMobile]}>
                    <View style={styles.headerLeft}>
                        <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>
                            {canManageShifts ? "Quản lý lịch làm việc" : "Lịch làm việc của tôi"}
                        </Text>
                        <Text style={[styles.headerSubtitle, isMobile && styles.headerSubtitleMobile]}>
                            {canManageShifts && activeTab === "shifts" && `${shifts.length} ca làm việc`}
                            {canManageShifts && activeTab === "assignments" && `${filteredAssignments.length} phân công`}
                            {activeTab === "mySchedule" && `${filteredMySchedule.length} ca trong tuần`}
                        </Text>
                    </View>
                </View>

                {/* Action buttons row */}
                <View style={styles.actionRow}>
                    {canManageShifts && activeTab === "shifts" && (
                        <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
                            <Plus size={16} color="#fff" />
                            <Text style={styles.addButtonText}>Thêm ca</Text>
                        </TouchableOpacity>
                    )}
                    {canManageShifts && activeTab === "assignments" && (
                        <TouchableOpacity style={styles.addButton} onPress={openAssignModal}>
                            <Plus size={16} color="#fff" />
                            <Text style={styles.addButtonText}>Phân công</Text>
                        </TouchableOpacity>
                    )}
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

                {(activeTab === "assignments" || activeTab === "mySchedule") && renderWeekCalendar()}

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
    headerActions: {
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: "#0d9488",
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 13,
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
    // Highlight styles for selected and today assignments
    assignmentCardSelected: {
        borderColor: "#0d9488",
        borderWidth: 2,
        backgroundColor: "#ecfeff",
    },
    assignmentCardToday: {
        borderColor: "#f59e0b",
        borderWidth: 2,
        backgroundColor: "#fef3c7",
    },
    assignmentDateSelected: {
        color: "#0d9488",
        fontWeight: "700",
    },
    assignmentDateToday: {
        color: "#f59e0b",
        fontWeight: "700",
    },
});

export default ScheduleScreen;

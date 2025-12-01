import React, { useContext, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Dimensions,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useRouter } from "expo-router";
import { AlertTriangle, CalendarDays, Clock, Plus, RefreshCcw, Trash2 } from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";
import { weeklyScheduleRequestService, WeeklyScheduleRequest } from "../../services/weeklyScheduleRequestService";
import { shiftService, Shift } from "../../services/shiftService";
import { employeeService, Employee } from "../../services/employeeService";
import { AuthContext } from "../../context/AuthContext";
import { showAlert, showConfirmDestructive } from "../../utils/alertUtils";

const WeeklyScheduleRequestsScreen = () => {
    const router = useRouter();
    const authContext = useContext(AuthContext);
    const user = authContext?.user;
    const { width: screenWidth } = Dimensions.get('window');
    const isMobile = screenWidth < 768;

    const [shifts, setShifts] = useState<Shift[]>([]);
    const [weeklyRequests, setWeeklyRequests] = useState<{ [key: string]: WeeklyScheduleRequest[] }>({});
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [weekDates, setWeekDates] = useState<string[]>([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

    const userRole = user?.role || user?.userRole || user?.Role || user?.roleName;
    const userRoleLower = userRole?.toLowerCase();
    const isAdminOrManager = userRoleLower === 'admin' || userRoleLower === 'manager' || userRole === 'Admin' || userRole === 'Manager';

    useEffect(() => {
        const today = new Date();
        const currentDay = today.getDay();
        const monday = new Date(today);
        monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
        setCurrentWeekStart(monday);
    }, []);

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

    const fetchData = async (isRefresh = false) => {
        if (isRefresh) setRefreshing(true);
        else setLoading(true);
        setError(null);

        try {
            const [shiftsData, requestsData, employeesData] = await Promise.all([
                shiftService.getShifts(),
                weeklyScheduleRequestService.getRequests(),
                employeeService.getEmployees()
            ]);



            setShifts(shiftsData);
            setEmployees(employeesData);

            // Merge employee info vào requests
            const enrichedRequests = requestsData.map(req => {
                if (!req.fullName && !req.userName) {
                    const employee = employeesData.find(emp =>
                        emp.id === req.userId ||
                        emp.employeeId === req.userId ||
                        String(emp.id) === String(req.userId) ||
                        String(emp.employeeId) === String(req.userId)
                    );
                    if (employee) {
                        return {
                            ...req,
                            fullName: employee.fullname || employee.username,
                            userName: employee.username
                        };
                    }
                }
                return req;
            });

            const weeklyData: { [key: string]: WeeklyScheduleRequest[] } = {};
            weekDates.forEach(date => {
                const filtered = enrichedRequests.filter(req => {
                    // Normalize date format - handle both ISO and other formats
                    let reqDate = req.requestedDate;
                    if (reqDate.includes('T')) {
                        reqDate = reqDate.split("T")[0];
                    } else if (reqDate.includes(' ')) {
                        reqDate = reqDate.split(" ")[0];
                    }
                    return reqDate === date;
                });
                weeklyData[date] = filtered;
            });

            setWeeklyRequests(weeklyData);
        } catch (err: any) {
            if (err?.response?.status === 401) {
                setError("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
            } else {
                setError(err?.response?.data?.message || err?.message || "Không thể tải dữ liệu");
            }
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (weekDates.length > 0) fetchData();
    }, [weekDates]);

    const handleRegister = async (shift: Shift, date: string) => {
        try {
            const requestData = {
                shiftId: shift.id,
                requestedDate: date,
            };

            await weeklyScheduleRequestService.createRequest(requestData);

            await fetchData(true);
            showAlert("Thành công", "Đăng ký ca thành công");
        } catch (err: any) {
            if (err?.response?.status === 401) {
                showAlert("Lỗi xác thực", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
                return;
            }

            const errorData = err?.response?.data;
            const errorDetail = typeof errorData === 'string'
                ? errorData
                : (errorData?.message || errorData?.title || err?.message || "Không thể đăng ký");

            showAlert("Lỗi", errorDetail);
        }
    };

    const handleDelete = async (requestId: number) => {
        const confirmed = await showConfirmDestructive("Xác nhận", "Bạn có chắc muốn xóa đăng ký này?", "Xóa");
        if (!confirmed) return;

        try {
            await weeklyScheduleRequestService.deleteRequest(requestId);
            await fetchData(true);
            showAlert("Thành công", "Đã xóa đăng ký");
        } catch (err: any) {
            showAlert("Lỗi", err?.response?.data?.message || "Không thể xóa");
        }
    };

    const formatTime = (time: string) => time ? time.substring(0, 5) : "";
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const day = date.getDate();
        const month = date.getMonth() + 1;
        return `${day}/${month}`;
    };

    const renderWeekCalendar = () => {
        const dayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
        const today = new Date().toISOString().split("T")[0];
        const startDate = new Date(weekDates[0]);
        const endDate = new Date(weekDates[6]);
        const monthYear = startDate.getMonth() === endDate.getMonth()
            ? `Tháng ${startDate.getMonth() + 1}/${startDate.getFullYear()}`
            : `${startDate.getMonth() + 1}/${startDate.getFullYear()} - ${endDate.getMonth() + 1}/${endDate.getFullYear()}`;

        return (
            <View style={styles.weekCalendar}>
                <View style={styles.weekHeader}>
                    <TouchableOpacity style={styles.weekNavButton} onPress={() => {
                        const prevWeek = new Date(currentWeekStart);
                        prevWeek.setDate(currentWeekStart.getDate() - 7);
                        setCurrentWeekStart(prevWeek);
                    }}>
                        <Text style={styles.weekNavText}>‹</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.weekTitleContainer} onPress={() => {
                        const today = new Date();
                        const currentDay = today.getDay();
                        const monday = new Date(today);
                        monday.setDate(today.getDate() - (currentDay === 0 ? 6 : currentDay - 1));
                        setCurrentWeekStart(monday);
                    }}>
                        <Text style={styles.weekTitle}>{monthYear}</Text>
                        <Text style={styles.weekSubtitle}>Nhấn để về tuần hiện tại</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.weekNavButton} onPress={() => {
                        const nextWeek = new Date(currentWeekStart);
                        nextWeek.setDate(currentWeekStart.getDate() + 7);
                        setCurrentWeekStart(nextWeek);
                    }}>
                        <Text style={styles.weekNavText}>›</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.weekDays}>
                    {weekDates.map((date, index) => {
                        const dayNum = new Date(date).getDate();
                        const isToday = date === today;
                        return (
                            <View key={date} style={[styles.dayButton, isToday && styles.dayButtonToday]}>
                                <Text style={[styles.dayName, isToday && styles.dayNameToday]}>{dayNames[index]}</Text>
                                <Text style={[styles.dayNumber, isToday && styles.dayNumberToday]}>{dayNum}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        );
    };

    const renderGrid = () => {
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
                </View>
            );
        }

        return (
            <ScrollView style={styles.gridContainer} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.grid}>
                        <View style={styles.gridRow}>
                            <View style={[styles.gridCell, styles.headerCell, styles.shiftNameCell]}>
                                <Text style={styles.headerText}>Ca làm việc</Text>
                            </View>
                            {weekDates.map((date) => (
                                <View key={date} style={[styles.gridCell, styles.headerCell]}>
                                    <Text style={styles.headerText}>{formatDate(date)}</Text>
                                </View>
                            ))}
                        </View>
                        {shifts.map((shift) => (
                            <View key={shift.id} style={styles.gridRow}>
                                <View style={[styles.gridCell, styles.shiftNameCell]}>
                                    <Text style={styles.shiftNameText}>{shift.name}</Text>
                                    <Text style={styles.shiftTimeText}>{formatTime(shift.startTime)} - {formatTime(shift.endTime)}</Text>
                                </View>
                                {weekDates.map((date) => {
                                    const dayRequests = weeklyRequests[date] || [];
                                    const shiftRequests = dayRequests.filter(r => r.shiftId === shift.id);
                                    const myRequest = shiftRequests.find(r => r.userId === user?.id);

                                    return (
                                        <View key={`${shift.id}-${date}`} style={styles.gridCell}>
                                            <ScrollView style={styles.requestList} nestedScrollEnabled showsVerticalScrollIndicator={true}>
                                                {shiftRequests.map((req) => {
                                                    // Tìm tên hiển thị với nhiều fallback
                                                    const displayName =
                                                        req.fullName ||
                                                        req.userName ||
                                                        (req.userId === user?.id ? (user?.fullName || user?.userName || user?.name || 'Bạn') : null) ||
                                                        `User #${req.userId}`;

                                                    return (
                                                        <View key={req.id} style={styles.requestChip}>
                                                            <Text style={styles.requestText}>{displayName}</Text>
                                                            {(req.userId === user?.id || isAdminOrManager) && (
                                                                <TouchableOpacity onPress={() => handleDelete(req.id)} style={styles.deleteIcon}>
                                                                    <Trash2 size={10} color="#ef4444" />
                                                                </TouchableOpacity>
                                                            )}
                                                        </View>
                                                    );
                                                })}
                                            </ScrollView>
                                            {!myRequest && !isAdminOrManager && (
                                                <TouchableOpacity style={styles.addButton} onPress={() => handleRegister(shift, date)}>
                                                    <Plus size={12} color="#0d9488" />
                                                </TouchableOpacity>
                                            )}
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
        <SidebarLayout title="Đăng ký lịch làm việc" activeKey="task">
            <View style={styles.container}>
                <View style={[styles.header, isMobile && styles.headerMobile]}>
                    <Text style={[styles.headerTitle, isMobile && styles.headerTitleMobile]}>
                        Đăng ký lịch làm việc
                    </Text>
                    <Text style={[styles.headerSubtitle, isMobile && styles.headerSubtitleMobile]}>
                        {isAdminOrManager ? "Xem tất cả yêu cầu đăng ký" : "Đăng ký ca làm việc mong muốn"}
                    </Text>
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
                {renderWeekCalendar()}
                <View style={styles.content}>{renderGrid()}</View>
            </View>
        </SidebarLayout>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F9F7" },
    header: { paddingHorizontal: 16, paddingVertical: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", minHeight: 80 },
    headerTitle: { fontSize: 20, fontWeight: "700", color: "#0f172a", marginBottom: 4 },
    headerSubtitle: { fontSize: 14, color: "#64748b", fontWeight: "500" },
    headerMobile: { paddingHorizontal: 20, paddingVertical: 20, minHeight: 90 },
    headerTitleMobile: { fontSize: 22, fontWeight: "800", marginBottom: 6 },
    headerSubtitleMobile: { fontSize: 15, fontWeight: "600", color: "#0d9488" },
    actionRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 8, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", gap: 8, justifyContent: "flex-end" },
    refreshButton: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#ecfeff", borderWidth: 1, borderColor: "#99f6e4", alignItems: "center", justifyContent: "center" },
    errorBanner: { flexDirection: "row", alignItems: "center", gap: 8, padding: 12, marginHorizontal: 16, marginTop: 8, backgroundColor: "#fee2e2", borderRadius: 8, borderWidth: 1, borderColor: "#fecaca" },
    errorText: { flex: 1, color: "#dc2626", fontSize: 14 },
    weekCalendar: { backgroundColor: "#fff", paddingVertical: 12, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
    weekHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
    weekNavButton: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#f1f5f9", justifyContent: "center", alignItems: "center" },
    weekNavText: { fontSize: 24, fontWeight: "600", color: "#0d9488" },
    weekTitleContainer: { flex: 1, alignItems: "center" },
    weekTitle: { fontSize: 15, fontWeight: "600", color: "#0f172a" },
    weekSubtitle: { fontSize: 11, color: "#64748b", marginTop: 1 },
    weekDays: { flexDirection: "row", justifyContent: "space-between" },
    dayButton: { alignItems: "center", paddingVertical: 8, paddingHorizontal: 8, borderRadius: 12, backgroundColor: "#f8fafc", flex: 1, marginHorizontal: 2 },
    dayButtonToday: { backgroundColor: "#0d9488", borderWidth: 2, borderColor: "#0d9488" },
    dayName: { fontSize: 12, color: "#64748b", fontWeight: "500", marginBottom: 2 },
    dayNameToday: { color: "#fff" },
    dayNumber: { fontSize: 16, fontWeight: "600", color: "#0f172a" },
    dayNumberToday: { color: "#fff" },
    content: { flex: 1, padding: 16 },
    centerState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
    stateText: { marginTop: 12, color: "#64748b", fontSize: 14 },
    emptyState: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
    emptyTitle: { fontSize: 18, fontWeight: "600", color: "#0f172a", marginTop: 16 },
    gridContainer: { flex: 1, minHeight: 400 },
    grid: { backgroundColor: "#fff", borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "#e2e8f0", minWidth: 800 },
    gridRow: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", minHeight: 100 },
    gridCell: { width: 100, minHeight: 100, padding: 6, borderRightWidth: 1, borderRightColor: "#e2e8f0", justifyContent: "flex-start" },
    headerCell: { backgroundColor: "#f8fafc", minHeight: 50, justifyContent: "center", alignItems: "center" },
    headerText: { fontSize: 11, fontWeight: "600", color: "#475569", textAlign: "center", lineHeight: 14 },
    shiftNameCell: { backgroundColor: "#f1f5f9", width: 140, justifyContent: "center", paddingHorizontal: 8 },
    shiftNameText: { fontSize: 13, fontWeight: "600", color: "#0f172a", textAlign: "center" },
    shiftTimeText: { fontSize: 10, color: "#64748b", marginTop: 2, textAlign: "center" },
    requestList: { flex: 1, maxHeight: 70, marginBottom: 2 },
    requestChip: { backgroundColor: "#ecfeff", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, marginBottom: 4, borderWidth: 1, borderColor: "#cffafe", flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
    requestText: { fontSize: 10, color: "#0e7490", fontWeight: "600", flex: 1 },
    deleteIcon: { marginLeft: 4 },
    addButton: { alignSelf: "center", width: 20, height: 20, borderRadius: 10, backgroundColor: "#f0fdfa", borderWidth: 1, borderColor: "#99f6e4", alignItems: "center", justifyContent: "center", marginTop: 4 },
});

export default WeeklyScheduleRequestsScreen;

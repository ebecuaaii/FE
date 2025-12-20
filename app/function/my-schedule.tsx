import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Modal,
} from "react-native";
import { Calendar, Clock, Plus, X, FileText, AlertCircle, RefreshCw } from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";
import api from "../../api/axiosClient";
import { useRouter } from "expo-router";

interface MyShift {
    id: number;
    shiftDate: string;
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
    location?: string;
    status: string;
}

export default function MyScheduleScreen() {
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [shifts, setShifts] = useState<MyShift[]>([]);
    const [selectedDate, setSelectedDate] = useState(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        const day = now.getDate().toString().padStart(2, "0");
        return `${year}-${month}-${day}`;
    });
    const [weekDates, setWeekDates] = useState<string[]>([]);
    const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

    // Tạo tuần hiện tại
    useEffect(() => {
        // Dùng local date để tránh timezone issue
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const monday = new Date(today);

        // Tính thứ 2 đầu tuần
        const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
        monday.setDate(today.getDate() - daysToMonday);

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

    useEffect(() => {
        if (weekDates.length > 0) {
            loadMySchedule();
        }
    }, [weekDates]);

    const loadMySchedule = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            const fromDate = weekDates[0];
            const toDate = weekDates[6];

            console.log("Loading schedule:", { fromDate, toDate });

            // Gọi API lấy lịch của chính mình
            const response = await api.get(
                `/api/Shifts/my-schedule?fromDate=${fromDate}&toDate=${toDate}`
            );

            console.log("Schedule response:", response.data);
            setShifts(response.data || []);
        } catch (error: any) {
            console.error("Error loading my schedule:", error);
            console.error("Error details:", error?.response?.data);

            const errorMessage =
                error?.response?.data?.message ||
                error?.response?.data?.title ||
                error?.message ||
                "Không thể tải lịch làm việc";

            Alert.alert("Lỗi", errorMessage);
            setShifts([]);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

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
        // Dùng local date để tránh timezone issue
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        const currentDay = today.getDay();
        const monday = new Date(today);
        const daysToMonday = currentDay === 0 ? 6 : currentDay - 1;
        monday.setDate(today.getDate() - daysToMonday);

        setCurrentWeekStart(monday);

        // Format date as YYYY-MM-DD
        const year = now.getFullYear();
        const month = (now.getMonth() + 1).toString().padStart(2, "0");
        const day = now.getDate().toString().padStart(2, "0");
        setSelectedDate(`${year}-${month}-${day}`);
    };

    const formatTime = (timeString: string) => {
        if (!timeString) return "N/A";
        return timeString.split(":").slice(0, 2).join(":");
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
        switch (status.toLowerCase()) {
            case "confirmed":
            case "completed":
                return "#10b981";
            case "pending":
                return "#f59e0b";
            case "cancelled":
                return "#ef4444";
            default:
                return "#6b7280";
        }
    };

    const getStatusText = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed":
                return "Đã xác nhận";
            case "completed":
                return "Hoàn thành";
            case "pending":
                return "Chờ xác nhận";
            case "cancelled":
                return "Đã hủy";
            default:
                return status;
        }
    };

    // Filter shifts theo tuần
    const filteredShifts = shifts
        .filter((shift) => {
            const shiftDate = shift.shiftDate.split("T")[0];
            return weekDates.includes(shiftDate);
        })
        .sort((a, b) => {
            const dateA = new Date(a.shiftDate).getTime();
            const dateB = new Date(b.shiftDate).getTime();
            if (dateA !== dateB) return dateA - dateB;

            const timeA = a.shiftStartTime || "00:00";
            const timeB = b.shiftStartTime || "00:00";
            return timeA.localeCompare(timeB);
        });

    const renderWeekCalendar = () => {
        const dayNames = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
        const today = new Date().toISOString().split("T")[0];

        const startDate = new Date(weekDates[0]);
        const endDate = new Date(weekDates[6]);
        const monthYear =
            startDate.getMonth() === endDate.getMonth()
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
                                    isToday && styles.dayButtonToday,
                                ]}
                                onPress={() => setSelectedDate(date)}
                            >
                                <Text
                                    style={[styles.dayName, isSelected && styles.dayNameSelected]}
                                >
                                    {dayNames[index]}
                                </Text>
                                <Text
                                    style={[
                                        styles.dayNumber,
                                        isSelected && styles.dayNumberSelected,
                                        isToday && styles.dayNumberToday,
                                    ]}
                                >
                                    {dayNum}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    return (
        <SidebarLayout title="Lịch làm việc của tôi" activeKey="home">
            <View style={styles.container}>
                {renderWeekCalendar()}

                {loading && !refreshing ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0d9488" />
                        <Text style={styles.stateText}>Đang tải...</Text>
                    </View>
                ) : (
                    <ScrollView
                        style={styles.content}
                        showsVerticalScrollIndicator={false}
                        refreshControl={
                            <RefreshControl
                                refreshing={refreshing}
                                onRefresh={() => loadMySchedule(true)}
                            />
                        }
                    >
                        {filteredShifts.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Calendar size={48} color="#94a3b8" />
                                <Text style={styles.emptyTitle}>Chưa có lịch làm việc</Text>
                                <Text style={styles.emptyDesc}>
                                    {shifts.length === 0
                                        ? "Bạn chưa được phân công ca nào"
                                        : "Không có ca nào trong tuần này"}
                                </Text>
                            </View>
                        ) : (
                            filteredShifts.map((shift) => {
                                const shiftDate = shift.shiftDate.split("T")[0];
                                const isSelectedDate = shiftDate === selectedDate;
                                const isToday =
                                    shiftDate === new Date().toISOString().split("T")[0];

                                return (
                                    <View
                                        key={shift.id}
                                        style={[
                                            styles.shiftCard,
                                            isSelectedDate && styles.shiftCardSelected,
                                            isToday && styles.shiftCardToday,
                                        ]}
                                    >
                                        <View style={styles.shiftHeader}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.shiftName}>{shift.shiftName}</Text>
                                                <Text
                                                    style={[
                                                        styles.shiftDate,
                                                        isSelectedDate && styles.shiftDateSelected,
                                                        isToday && styles.shiftDateToday,
                                                    ]}
                                                >
                                                    {formatDate(shift.shiftDate)}
                                                </Text>
                                                <View style={styles.shiftTimeRow}>
                                                    <Clock size={14} color="#0d9488" />
                                                    <Text style={styles.shiftTime}>
                                                        {formatTime(shift.shiftStartTime)} -{" "}
                                                        {formatTime(shift.shiftEndTime)}
                                                    </Text>
                                                </View>
                                                {shift.location && (
                                                    <Text style={styles.shiftLocation}>
                                                        📍 {shift.location}
                                                    </Text>
                                                )}
                                            </View>
                                        </View>
                                        {shift.status && (
                                            <View
                                                style={[
                                                    styles.statusBadge,
                                                    {
                                                        backgroundColor:
                                                            getStatusColor(shift.status) + "20",
                                                    },
                                                ]}
                                            >
                                                <Text
                                                    style={[
                                                        styles.statusText,
                                                        { color: getStatusColor(shift.status) },
                                                    ]}
                                                >
                                                    {getStatusText(shift.status)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>
                                );
                            })
                        )}
                    </ScrollView>
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
    weekCalendar: {
        backgroundColor: "#fff",
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    weekHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 16,
        marginBottom: 16,
    },
    weekNavButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
    },
    weekNavText: {
        fontSize: 24,
        color: "#0d9488",
        fontWeight: "700",
    },
    weekTitleContainer: {
        flex: 1,
        alignItems: "center",
    },
    weekTitle: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
    },
    weekSubtitle: {
        fontSize: 12,
        color: "#6b7280",
        marginTop: 2,
    },
    weekDays: {
        flexDirection: "row",
        paddingHorizontal: 8,
    },
    dayButton: {
        flex: 1,
        alignItems: "center",
        paddingVertical: 8,
        marginHorizontal: 4,
        borderRadius: 12,
        backgroundColor: "#f8fafc",
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
        color: "#6b7280",
        marginBottom: 4,
    },
    dayNameSelected: {
        color: "#fff",
        fontWeight: "600",
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
        color: "#0d9488",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    stateText: {
        marginTop: 12,
        color: "#475569",
        fontSize: 15,
    },
    content: {
        flex: 1,
        padding: 16,
    },
    emptyState: {
        padding: 40,
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        marginTop: 20,
    },
    emptyTitle: {
        fontSize: 16,
        fontWeight: "600",
        color: "#6b7280",
        marginTop: 16,
        marginBottom: 8,
    },
    emptyDesc: {
        fontSize: 14,
        color: "#9ca3af",
        textAlign: "center",
    },
    shiftCard: {
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
    shiftCardSelected: {
        borderWidth: 2,
        borderColor: "#0d9488",
    },
    shiftCardToday: {
        backgroundColor: "#ecfeff",
    },
    shiftHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    shiftName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 4,
    },
    shiftDate: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 8,
    },
    shiftDateSelected: {
        color: "#0d9488",
        fontWeight: "600",
    },
    shiftDateToday: {
        color: "#0d9488",
    },
    shiftTimeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 4,
    },
    shiftTime: {
        fontSize: 14,
        color: "#0f172a",
    },
    shiftLocation: {
        fontSize: 13,
        color: "#6b7280",
        marginTop: 4,
    },
    statusBadge: {
        alignSelf: "flex-start",
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginTop: 8,
    },
    statusText: {
        fontSize: 12,
        fontWeight: "600",
    },
});

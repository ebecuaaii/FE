import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";
import payrollService, { AttendancePayroll } from "../../services/payrollService";
import { getUserId } from "../../utils/secureStore";

interface DailySalaryGroup {
    date: string;
    shifts: AttendancePayroll[];
    totalAmount: number;
}

export default function DailySalaryScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(() => {
        // Nếu có params month/year thì dùng, không thì dùng tháng hiện tại
        if (params.month && params.year) {
            return new Date(Number(params.year), Number(params.month) - 1, 1);
        }
        return new Date();
    });
    const [dailySalaries, setDailySalaries] = useState<DailySalaryGroup[]>([]);

    useEffect(() => {
        loadDailySalaries();
    }, [selectedMonth]);

    const loadDailySalaries = async () => {
        setLoading(true);
        try {
            const userId = await getUserId();
            if (!userId) {
                Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
                return;
            }

            const month = selectedMonth.getMonth() + 1;
            const year = selectedMonth.getFullYear();

            // Tạo fromDate và toDate
            const fromDate = `${year}-${month.toString().padStart(2, "0")}-01`;
            const lastDay = new Date(year, month, 0).getDate();
            const toDate = `${year}-${month.toString().padStart(2, "0")}-${lastDay}`;

            // Gọi API lấy lương theo ngày
            const data = await payrollService.getDailySalary(Number(userId), fromDate, toDate);

            // Group theo ngày
            const groupedByDate: { [key: string]: AttendancePayroll[] } = {};
            data.forEach(item => {
                const dateKey = item.date.split("T")[0]; // Lấy phần date
                if (!groupedByDate[dateKey]) {
                    groupedByDate[dateKey] = [];
                }
                groupedByDate[dateKey].push(item);
            });

            // Convert sang format hiển thị
            const grouped: DailySalaryGroup[] = Object.keys(groupedByDate)
                .sort((a, b) => new Date(b).getTime() - new Date(a).getTime()) // Sort mới nhất trước
                .map(date => ({
                    date,
                    shifts: groupedByDate[date],
                    totalAmount: groupedByDate[date].reduce((sum, shift) => sum + shift.totalAmount, 0),
                }));

            setDailySalaries(grouped);
        } catch (error: any) {
            console.error("Error loading daily salaries:", error);
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tải dữ liệu lương");
        } finally {
            setLoading(false);
        }
    };

    const changeMonth = (direction: number) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + direction);
        setSelectedMonth(newDate);
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("vi-VN") + " đ";
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            weekday: "short",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <SidebarLayout title="Lương theo ngày" activeKey="task">
            <View style={styles.container}>
                <View style={styles.monthSelector}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
                        <ChevronLeft size={24} color="#0d9488" />
                    </TouchableOpacity>
                    <View style={styles.monthDisplay}>
                        <Calendar size={20} color="#0d9488" />
                        <Text style={styles.monthText}>
                            Tháng {selectedMonth.getMonth() + 1}/{selectedMonth.getFullYear()}
                        </Text>
                    </View>
                    <TouchableOpacity onPress={() => changeMonth(1)} style={styles.monthButton}>
                        <ChevronRight size={24} color="#0d9488" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0d9488" />
                    </View>
                ) : (
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {dailySalaries.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>Không có dữ liệu lương</Text>
                            </View>
                        ) : (
                            dailySalaries.map((day, index) => (
                                <View key={index} style={styles.dayCard}>
                                    <View style={styles.dayHeader}>
                                        <Text style={styles.dayDate}>{formatDate(day.date)}</Text>
                                        <Text style={styles.dayTotal}>{formatCurrency(day.totalAmount)}</Text>
                                    </View>

                                    {day.shifts.map((shift, shiftIndex) => (
                                        <View key={shiftIndex} style={styles.shiftCard}>
                                            <View style={styles.shiftHeader}>
                                                <Text style={styles.shiftName}>{shift.shiftName}</Text>
                                                <Text style={styles.shiftTotal}>
                                                    {formatCurrency(shift.totalAmount)}
                                                </Text>
                                            </View>

                                            <View style={styles.shiftDetails}>
                                                <View style={styles.shiftRow}>
                                                    <Text style={styles.shiftLabel}>Ca quy định:</Text>
                                                    <Text style={styles.shiftValue}>
                                                        {shift.shiftStartTime || "N/A"} - {shift.shiftEndTime || "N/A"} ({shift.shiftDuration || 0}h)
                                                    </Text>
                                                </View>
                                                <View style={styles.shiftRow}>
                                                    <Text style={styles.shiftLabel}>Thực tế:</Text>
                                                    <Text style={styles.shiftValue}>
                                                        {shift.checkinTime || "N/A"} - {shift.checkoutTime || "N/A"} ({(shift.hoursWorked || 0).toFixed(1)}h)
                                                    </Text>
                                                </View>
                                                <View style={styles.shiftRow}>
                                                    <Text style={styles.shiftLabel}>Giờ thường:</Text>
                                                    <Text style={styles.shiftValue}>
                                                        {(shift.regularHours || 0).toFixed(1)}h × {formatCurrency(shift.salaryRate || 0)} × {shift.shiftMultiplier || 1} = {formatCurrency(shift.regularAmount || 0)}
                                                    </Text>
                                                </View>
                                                {(shift.overtimeHours || 0) > 0 && (
                                                    <View style={styles.shiftRow}>
                                                        <Text style={[styles.shiftLabel, styles.overtimeText]}>Tăng ca:</Text>
                                                        <Text style={[styles.shiftValue, styles.overtimeText]}>
                                                            {(shift.overtimeHours || 0).toFixed(1)}h × {formatCurrency(shift.salaryRate || 0)} × {shift.shiftMultiplier || 1} × 1.5 = {formatCurrency(shift.overtimeAmount || 0)}
                                                        </Text>
                                                    </View>
                                                )}

                                                {/* Hiển thị status nếu chưa checkout */}
                                                {!shift.checkoutTime && (
                                                    <View style={styles.shiftRow}>
                                                        <Text style={[styles.shiftLabel, styles.workingText]}>Trạng thái:</Text>
                                                        <Text style={[styles.shiftValue, styles.workingText]}>
                                                            Đang làm việc / Chưa hoàn thành
                                                        </Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    ))}
                                </View>
                            ))
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
        padding: 40,
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#6b7280",
    },
    dayCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    dayHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 2,
        borderBottomColor: "#0d9488",
    },
    dayDate: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
    },
    dayTotal: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0d9488",
    },
    shiftCard: {
        backgroundColor: "#f8fafc",
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    shiftHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 8,
    },
    shiftName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0f172a",
    },
    shiftTotal: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0d9488",
    },
    shiftDetails: {
        gap: 6,
    },
    shiftRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    shiftLabel: {
        fontSize: 13,
        color: "#6b7280",
        width: 100,
    },
    shiftValue: {
        flex: 1,
        fontSize: 13,
        color: "#0f172a",
        textAlign: "right",
    },
    overtimeText: {
        color: "#f59e0b",
        fontWeight: "600",
    },
    workingText: {
        color: "#3b82f6",
        fontWeight: "600",
        fontStyle: "italic",
    },
});

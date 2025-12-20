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
import { useRouter } from "expo-router";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";
import api from "../../api/axiosClient";
import { getUserId } from "../../utils/secureStore";

interface WorkPerformance {
    period: string; // "01/12/2025 - 31/12/2025"
    assignedHours: number;
    assignedShifts: number;
    workedHours: number;
    workedShifts: number;
    lateCount: number;
    lateMinutes: number;
    earlyLeaveCount: number;
    earlyLeaveMinutes: number;
    leaveRequestCount: number;
}

export default function WorkPerformanceScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date());
    const [performance, setPerformance] = useState<WorkPerformance | null>(null);

    useEffect(() => {
        loadPerformance();
    }, [selectedMonth]);

    const loadPerformance = async () => {
        setLoading(true);
        try {
            const userId = await getUserId();
            if (!userId) {
                Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
                return;
            }

            const year = selectedMonth.getFullYear();
            const month = selectedMonth.getMonth() + 1;

            // TODO: Gọi API lấy hiệu quả làm việc
            // const response = await api.get(`/api/Performance/user/${userId}?month=${month}&year=${year}`);

            // Mock data
            const mockData: WorkPerformance = {
                period: `01/${month.toString().padStart(2, "0")}/${year} - ${new Date(year, month, 0).getDate()}/${month.toString().padStart(2, "0")}/${year}`,
                assignedHours: 16.0,
                assignedShifts: 2,
                workedHours: 16.0,
                workedShifts: 2,
                lateCount: 0,
                lateMinutes: 0,
                earlyLeaveCount: 0,
                earlyLeaveMinutes: 0,
                leaveRequestCount: 0,
            };

            setPerformance(mockData);
        } catch (error: any) {
            console.error("Error loading performance:", error);
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const changeMonth = (direction: number) => {
        const newDate = new Date(selectedMonth);
        newDate.setMonth(newDate.getMonth() + direction);
        setSelectedMonth(newDate);
    };

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours} phút - ${mins.toFixed(1)} giờ`;
    };

    return (
        <SidebarLayout title="Hiệu quả làm việc" activeKey="home">
            <View style={styles.container}>
                {/* Month Selector */}
                <View style={styles.monthSelector}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.monthButton}>
                        <ChevronLeft size={24} color="#0d9488" />
                    </TouchableOpacity>
                    <View style={styles.monthDisplay}>
                        <Text style={styles.monthText}>
                            {performance?.period || "Loading..."}
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
                        {!performance ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>Không có dữ liệu</Text>
                            </View>
                        ) : (
                            <>
                                {/* Work Stats Card */}
                                <View style={styles.card}>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Số giờ làm việc được phân công</Text>
                                        <Text style={styles.statValue}>{performance.assignedHours.toFixed(1)}</Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Số ca làm việc được phân công</Text>
                                        <Text style={styles.statValue}>{performance.assignedShifts}</Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Số giờ làm việc tính lương</Text>
                                        <Text style={styles.statValue}>{performance.workedHours.toFixed(1)}</Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Số ca làm việc tính lương</Text>
                                        <Text style={styles.statValue}>{performance.workedShifts}</Text>
                                    </View>
                                </View>

                                {/* Late Stats Card */}
                                <View style={styles.card}>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Số lần đi muộn không phép</Text>
                                        <Text style={[styles.statValue, performance.lateCount > 0 && styles.warningText]}>
                                            {performance.lateCount}
                                        </Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Thời gian đi muộn không phép</Text>
                                        <Text style={[styles.statValue, performance.lateMinutes > 0 && styles.warningText]}>
                                            {formatTime(performance.lateMinutes)}
                                        </Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Số lần về sớm không phép</Text>
                                        <Text style={[styles.statValue, performance.earlyLeaveCount > 0 && styles.warningText]}>
                                            {performance.earlyLeaveCount}
                                        </Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Thời gian về sớm không phép</Text>
                                        <Text style={[styles.statValue, performance.earlyLeaveMinutes > 0 && styles.warningText]}>
                                            {formatTime(performance.earlyLeaveMinutes)}
                                        </Text>
                                    </View>
                                    <View style={styles.statRow}>
                                        <Text style={styles.statLabel}>Số ca xin nghỉ trong tháng</Text>
                                        <Text style={styles.statValue}>{performance.leaveRequestCount}</Text>
                                    </View>
                                </View>

                                {/* Action Button */}
                                <TouchableOpacity
                                    style={styles.payslipButton}
                                    onPress={() => router.push("/function/monthly-salary")}
                                >
                                    <FileText size={20} color="#0d9488" />
                                    <Text style={styles.payslipButtonText}>Xem phiếu lương</Text>
                                </TouchableOpacity>

                                {/* Bottom Buttons */}
                                <View style={styles.bottomButtons}>
                                    <TouchableOpacity
                                        style={[styles.bottomButton, styles.calculateButton]}
                                        onPress={() => Alert.alert("Thông báo", "Chức năng đang phát triển")}
                                    >
                                        <Text style={styles.calculateButtonText}>💰 Tính lại lương</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.bottomButton, styles.detailButton]}
                                        onPress={() => router.push("/function/daily-salary")}
                                    >
                                        <Text style={styles.detailButtonText}>Xem chi tiết</Text>
                                    </TouchableOpacity>
                                </View>
                            </>
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
        backgroundColor: "#f1f5f9",
        borderRadius: 8,
    },
    monthDisplay: {
        flex: 1,
        alignItems: "center",
    },
    monthText: {
        fontSize: 14,
        fontWeight: "600",
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
        backgroundColor: "#fff",
        borderRadius: 16,
    },
    emptyText: {
        fontSize: 16,
        color: "#6b7280",
    },
    card: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    statLabel: {
        fontSize: 14,
        color: "#6b7280",
        flex: 1,
    },
    statValue: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
        marginLeft: 12,
    },
    warningText: {
        color: "#3b82f6",
    },
    payslipButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        backgroundColor: "#fff",
        padding: 16,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#0d9488",
    },
    payslipButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0d9488",
    },
    bottomButtons: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 24,
    },
    bottomButton: {
        flex: 1,
        padding: 16,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
    },
    calculateButton: {
        backgroundColor: "#fbbf24",
    },
    calculateButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
    },
    detailButton: {
        backgroundColor: "#0d9488",
    },
    detailButtonText: {
        fontSize: 15,
        fontWeight: "600",
        color: "#fff",
    },
});

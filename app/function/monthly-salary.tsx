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
import { Calendar, ChevronLeft, ChevronRight, FileText } from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";
import payrollService, { MonthlyPayroll } from "../../services/payrollService";
import { getUserId } from "../../utils/secureStore";

// Sử dụng MonthlyPayroll từ service

export default function MonthlySalaryScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [monthlySalaries, setMonthlySalaries] = useState<MonthlyPayroll[]>([]);

    useEffect(() => {
        loadMonthlySalaries();
    }, [selectedYear]);

    const loadMonthlySalaries = async () => {
        setLoading(true);
        try {
            const userId = await getUserId();
            if (!userId) {
                Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
                return;
            }

            // Gọi API lấy lương theo tháng trong năm
            const data = await payrollService.getMonthlySalaries(Number(userId), selectedYear);
            setMonthlySalaries(data);
        } catch (error: any) {
            console.error("Error loading monthly salaries:", error);
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tải dữ liệu lương");
        } finally {
            setLoading(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("vi-VN") + " đ";
    };

    const formatMonth = (month: number, year: number) => {
        return `Tháng ${month.toString().padStart(2, "0")}/${year}`;
    };

    return (
        <SidebarLayout title="Lương theo tháng" activeKey="task">
            <View style={styles.container}>
                {/* Year Selector */}
                <View style={styles.yearSelector}>
                    <TouchableOpacity
                        onPress={() => setSelectedYear(selectedYear - 1)}
                        style={styles.yearButton}
                    >
                        <ChevronLeft size={24} color="#0d9488" />
                    </TouchableOpacity>
                    <View style={styles.yearDisplay}>
                        <Calendar size={20} color="#0d9488" />
                        <Text style={styles.yearText}>Năm {selectedYear}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => setSelectedYear(selectedYear + 1)}
                        style={styles.yearButton}
                    >
                        <ChevronRight size={24} color="#0d9488" />
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0d9488" />
                    </View>
                ) : (
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {monthlySalaries.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>Không có dữ liệu lương</Text>
                            </View>
                        ) : (
                            monthlySalaries.map((month, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.monthCard}
                                    onPress={() => router.push({
                                        pathname: "/function/payslip",
                                        params: { month: month.month, year: month.year }
                                    })}
                                >
                                    <View style={styles.monthHeader}>
                                        <Text style={styles.monthTitle}>{formatMonth(month.month, month.year)}</Text>
                                        <FileText size={20} color="#0d9488" />
                                    </View>

                                    <View style={styles.salaryDetails}>
                                        <View style={styles.salaryRow}>
                                            <Text style={styles.salaryLabel}>Lương cứng</Text>
                                            <Text style={styles.salaryValue}>
                                                {formatCurrency(month.baseSalary)}
                                            </Text>
                                        </View>

                                        {month.totalShifts > 0 ? (
                                            <>
                                                <View style={styles.salaryRow}>
                                                    <Text style={styles.salaryLabel}>
                                                        Lương ca ({month.totalShifts} ca, {month.totalHours.toFixed(1)}h)
                                                    </Text>
                                                    <Text style={styles.salaryValue}>
                                                        {formatCurrency(month.shiftSalary)}
                                                    </Text>
                                                </View>

                                                <View style={[styles.salaryRow, styles.indentedRow]}>
                                                    <Text style={styles.salarySubLabel}>
                                                        • Giờ thường: {month.regularHours.toFixed(1)}h
                                                    </Text>
                                                    <Text style={styles.salarySubValue}>
                                                        {formatCurrency(month.regularAmount)}
                                                    </Text>
                                                </View>

                                                {month.overtimeHours > 0 && (
                                                    <View style={[styles.salaryRow, styles.indentedRow]}>
                                                        <Text style={[styles.salarySubLabel, styles.overtimeText]}>
                                                            • Tăng ca: {month.overtimeHours.toFixed(1)}h
                                                        </Text>
                                                        <Text style={[styles.salarySubValue, styles.overtimeText]}>
                                                            {formatCurrency(month.overtimeAmount)}
                                                        </Text>
                                                    </View>
                                                )}
                                            </>
                                        ) : (
                                            <View style={styles.salaryRow}>
                                                <Text style={styles.salaryLabel}>
                                                    Lương ca (0 ca, 0h)
                                                </Text>
                                                <Text style={styles.salaryValue}>
                                                    {formatCurrency(0)}
                                                </Text>
                                            </View>
                                        )}

                                        {month.bonusAmount > 0 && (
                                            <View style={styles.salaryRow}>
                                                <Text style={[styles.salaryLabel, styles.bonusText]}>
                                                    Thưởng
                                                </Text>
                                                <Text style={[styles.salaryValue, styles.bonusText]}>
                                                    +{formatCurrency(month.bonusAmount)}
                                                </Text>
                                            </View>
                                        )}

                                        {month.penaltyAmount > 0 && (
                                            <View style={styles.salaryRow}>
                                                <Text style={[styles.salaryLabel, styles.deductionText]}>
                                                    Phạt/Trừ
                                                </Text>
                                                <Text style={[styles.salaryValue, styles.deductionText]}>
                                                    -{formatCurrency(month.penaltyAmount)}
                                                </Text>
                                            </View>
                                        )}
                                    </View>

                                    <View style={styles.totalRow}>
                                        <Text style={styles.totalLabel}>Tổng lương</Text>
                                        <Text style={styles.totalValue}>
                                            {formatCurrency(month.totalAmount)}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
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
    yearSelector: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    yearButton: {
        padding: 8,
    },
    yearDisplay: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    yearText: {
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
    monthCard: {
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
    monthHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
    },
    salaryDetails: {
        gap: 12,
        marginBottom: 16,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    salaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    salaryLabel: {
        fontSize: 14,
        color: "#6b7280",
    },
    salaryValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0f172a",
    },
    indentedRow: {
        paddingLeft: 12,
    },
    salarySubLabel: {
        fontSize: 13,
        color: "#6b7280",
    },
    salarySubValue: {
        fontSize: 14,
        fontWeight: "500",
        color: "#475569",
    },
    overtimeText: {
        color: "#f59e0b",
        fontWeight: "600",
    },
    bonusText: {
        color: "#10b981",
    },
    deductionText: {
        color: "#ef4444",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: "700",
        color: "#0f172a",
    },
    totalValue: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0d9488",
    },
});

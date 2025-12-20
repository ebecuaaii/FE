import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Share,
    Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Download, Share2, ChevronLeft } from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";
import payrollService, { PayrollDetail } from "../../services/payrollService";
import { getUserId } from "../../utils/secureStore";

// Sử dụng PayrollDetail từ service

export default function PayslipScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const [loading, setLoading] = useState(false);
    const [payslip, setPayslip] = useState<PayrollDetail | null>(null);

    useEffect(() => {
        loadPayslip();
    }, []);

    const loadPayslip = async () => {
        setLoading(true);
        try {
            const userId = await getUserId();
            if (!userId) {
                Alert.alert("Lỗi", "Không tìm thấy thông tin người dùng");
                return;
            }

            // Lấy month/year từ params hoặc dùng tháng hiện tại
            const now = new Date();
            const month = params.month ? Number(params.month) : now.getMonth() + 1;
            const year = params.year ? Number(params.year) : now.getFullYear();

            // Gọi API lấy chi tiết phiếu lương
            const data = await payrollService.getPayslipDetail(Number(userId), month, year);
            setPayslip(data);
        } catch (error: any) {
            console.error("Error loading payslip:", error);
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tải phiếu lương");
        } finally {
            setLoading(false);
        }
    };

    const handleShare = async () => {
        if (!payslip) return;
        try {
            await Share.share({
                message: `Phiếu lương tháng ${formatMonth(payslip.month, payslip.year)}\nTổng lương: ${formatCurrency(payslip.totalAmount)}`,
            });
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    const formatCurrency = (amount: number) => {
        return amount.toLocaleString("vi-VN") + " đ";
    };

    const formatMonth = (month: number, year: number) => {
        return `${month.toString().padStart(2, "0")}/${year}`;
    };

    if (loading) {
        return (
            <SidebarLayout title="Phiếu lương" activeKey="task">
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#0d9488" />
                </View>
            </SidebarLayout>
        );
    }

    if (!payslip) {
        return (
            <SidebarLayout title="Phiếu lương" activeKey="task">
                <View style={styles.emptyState}>
                    <Text style={styles.emptyText}>Không có dữ liệu phiếu lương</Text>
                </View>
            </SidebarLayout>
        );
    }

    return (
        <SidebarLayout title="Phiếu lương" activeKey="task">
            <View style={styles.container}>
                {/* Header Actions */}
                <View style={styles.headerActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => router.push({
                            pathname: "/function/daily-salary",
                            params: { month: payslip.month, year: payslip.year }
                        })}
                    >
                        <Text style={styles.actionText}>Xem chi tiết</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
                        <Share2 size={20} color="#0d9488" />
                        <Text style={styles.actionText}>Chia sẻ</Text>
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                    {/* Payslip Card */}
                    <View style={styles.payslipCard}>
                        {/* Title */}
                        <View style={styles.titleSection}>
                            <Text style={styles.title}>PHIẾU LƯƠNG</Text>
                            <Text style={styles.monthTitle}>Tháng {formatMonth(payslip.month, payslip.year)}</Text>
                        </View>

                        {/* Employee Info */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>THÔNG TIN NHÂN VIÊN</Text>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Họ tên:</Text>
                                <Text style={styles.infoValue}>{payslip.employeeName}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Mã NV:</Text>
                                <Text style={styles.infoValue}>{payslip.employeeId}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Chức vụ:</Text>
                                <Text style={styles.infoValue}>{payslip.position}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>Bộ phận:</Text>
                                <Text style={styles.infoValue}>{payslip.department}</Text>
                            </View>
                        </View>

                        {/* Salary Details */}
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>CHI TIẾT LƯƠNG</Text>

                            <View style={styles.detailRow}>
                                <Text style={styles.detailLabel}>Lương cứng</Text>
                                <Text style={styles.detailValue}>{formatCurrency(payslip.baseSalary)}</Text>
                            </View>

                            {payslip.totalShifts > 0 ? (
                                <>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>
                                            Lương ca ({payslip.totalShifts} ca, {payslip.totalHours.toFixed(1)}h)
                                        </Text>
                                        <Text style={styles.detailValue}>{formatCurrency(payslip.shiftSalary)}</Text>
                                    </View>

                                    <View style={[styles.detailRow, styles.indentedRow]}>
                                        <Text style={styles.subDetailLabel}>
                                            • Giờ thường: {payslip.regularHours.toFixed(1)}h × {formatCurrency(payslip.salaryRate)}/h
                                        </Text>
                                        <Text style={styles.subDetailValue}>{formatCurrency(payslip.regularAmount)}</Text>
                                    </View>

                                    {payslip.overtimeHours > 0 && (
                                        <View style={[styles.detailRow, styles.indentedRow]}>
                                            <Text style={[styles.subDetailLabel, styles.overtimeText]}>
                                                • Tăng ca: {payslip.overtimeHours.toFixed(1)}h × {formatCurrency(payslip.salaryRate)}/h × 1.5
                                            </Text>
                                            <Text style={[styles.subDetailValue, styles.overtimeText]}>
                                                {formatCurrency(payslip.overtimeAmount)}
                                            </Text>
                                        </View>
                                    )}
                                </>
                            ) : (
                                <View style={styles.detailRow}>
                                    <Text style={styles.detailLabel}>
                                        Lương ca (0 ca, 0h)
                                    </Text>
                                    <Text style={styles.detailValue}>{formatCurrency(0)}</Text>
                                </View>
                            )}

                            {payslip.bonusAmount > 0 && (
                                <>
                                    <Text style={styles.subSectionTitle}>Thưởng</Text>
                                    {payslip.bonuses && payslip.bonuses.length > 0 ? (
                                        payslip.bonuses.map((item, index) => (
                                            <View key={index} style={styles.detailRow}>
                                                <Text style={[styles.detailLabel, styles.bonusText]}>• {item.name}</Text>
                                                <Text style={[styles.detailValue, styles.bonusText]}>
                                                    +{formatCurrency(item.amount)}
                                                </Text>
                                            </View>
                                        ))
                                    ) : (
                                        <View style={styles.detailRow}>
                                            <Text style={[styles.detailLabel, styles.bonusText]}>• Thưởng</Text>
                                            <Text style={[styles.detailValue, styles.bonusText]}>
                                                +{formatCurrency(payslip.bonusAmount)}
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}

                            {payslip.penaltyAmount > 0 && (
                                <>
                                    <Text style={styles.subSectionTitle}>Phạt/Trừ</Text>
                                    {payslip.penalties && payslip.penalties.length > 0 ? (
                                        payslip.penalties.map((item, index) => (
                                            <View key={index} style={styles.detailRow}>
                                                <Text style={[styles.detailLabel, styles.deductionText]}>• {item.name}</Text>
                                                <Text style={[styles.detailValue, styles.deductionText]}>
                                                    -{formatCurrency(item.amount)}
                                                </Text>
                                            </View>
                                        ))
                                    ) : (
                                        <View style={styles.detailRow}>
                                            <Text style={[styles.detailLabel, styles.deductionText]}>• Phạt/Trừ</Text>
                                            <Text style={[styles.detailValue, styles.deductionText]}>
                                                -{formatCurrency(payslip.penaltyAmount)}
                                            </Text>
                                        </View>
                                    )}
                                </>
                            )}
                        </View>

                        {/* Summary */}
                        <View style={styles.summarySection}>
                            <View style={styles.summaryRow}>
                                <Text style={styles.summaryLabel}>Tổng thu nhập</Text>
                                <Text style={styles.summaryValue}>
                                    {formatCurrency(
                                        payslip.baseSalary + payslip.shiftSalary + payslip.bonusAmount
                                    )}
                                </Text>
                            </View>
                            {payslip.penaltyAmount > 0 && (
                                <View style={styles.summaryRow}>
                                    <Text style={styles.summaryLabel}>Tổng khấu trừ</Text>
                                    <Text style={[styles.summaryValue, styles.deductionText]}>
                                        -{formatCurrency(payslip.penaltyAmount)}
                                    </Text>
                                </View>
                            )}
                            <View style={styles.totalRow}>
                                <Text style={styles.totalLabel}>THỰC LĨNH</Text>
                                <Text style={styles.totalValue}>{formatCurrency(payslip.totalAmount)}</Text>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </View>
        </SidebarLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F9F7",
    },
    headerActions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    actionButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "#0d9488",
    },
    actionText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0d9488",
    },
    loadingContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyState: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    emptyText: {
        fontSize: 16,
        color: "#6b7280",
    },
    content: {
        flex: 1,
        padding: 16,
    },
    payslipCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    titleSection: {
        alignItems: "center",
        marginBottom: 24,
        paddingBottom: 16,
        borderBottomWidth: 2,
        borderBottomColor: "#0d9488",
    },
    title: {
        fontSize: 24,
        fontWeight: "700",
        color: "#0d9488",
        marginBottom: 8,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: "600",
        color: "#0f172a",
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "700",
        color: "#64748b",
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    infoRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 6,
    },
    infoLabel: {
        fontSize: 14,
        color: "#6b7280",
    },
    infoValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0f172a",
    },
    detailRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    detailLabel: {
        flex: 1,
        fontSize: 14,
        color: "#0f172a",
    },
    detailValue: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0f172a",
        marginLeft: 12,
    },
    indentedRow: {
        paddingLeft: 12,
    },
    subDetailLabel: {
        flex: 1,
        fontSize: 13,
        color: "#6b7280",
    },
    subDetailValue: {
        fontSize: 13,
        fontWeight: "500",
        color: "#475569",
        marginLeft: 12,
    },
    subSectionTitle: {
        fontSize: 13,
        fontWeight: "600",
        color: "#475569",
        marginTop: 12,
        marginBottom: 4,
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
    summarySection: {
        marginTop: 16,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: "#e5e7eb",
    },
    summaryRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 8,
    },
    summaryLabel: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0f172a",
    },
    summaryValue: {
        fontSize: 15,
        fontWeight: "600",
        color: "#0f172a",
    },
    totalRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 12,
        marginTop: 8,
        paddingTop: 16,
        borderTopWidth: 2,
        borderTopColor: "#0d9488",
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
    },
    totalValue: {
        fontSize: 22,
        fontWeight: "700",
        color: "#0d9488",
    },
});

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
import { Calendar, ChevronLeft, ChevronRight, Gift, AlertCircle } from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";
import rewardPenaltyService, { RewardPenalty } from "../../services/rewardPenaltyService";

export default function RewardPenaltyHistoryScreen() {
    const [loading, setLoading] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [records, setRecords] = useState<RewardPenalty[]>([]);
    const [filterType, setFilterType] = useState<"All" | "Reward" | "Penalty">("All");

    useEffect(() => {
        loadRecords();
    }, [selectedMonth, selectedYear]);

    const loadRecords = async () => {
        setLoading(true);
        try {
            const data = await rewardPenaltyService.getMy({
                month: selectedMonth,
                year: selectedYear,
            });
            setRecords(data);
        } catch (error: any) {
            console.error("Error loading records:", error);
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
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

    const filteredRecords = records.filter((record) => {
        if (filterType === "All") return true;
        return record.type === filterType;
    });

    const totalReward = records
        .filter((r) => r.type === "Reward")
        .reduce((sum, r) => sum + r.amount, 0);

    const totalPenalty = records
        .filter((r) => r.type === "Penalty")
        .reduce((sum, r) => sum + r.amount, 0);

    return (
        <SidebarLayout title="Lịch sử Thưởng/Phạt" activeKey="task">
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
                            Tất cả ({records.length})
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
                            Thưởng ({records.filter((r) => r.type === "Reward").length})
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
                            Phạt ({records.filter((r) => r.type === "Penalty").length})
                        </Text>
                    </TouchableOpacity>
                </View>

                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color="#0d9488" />
                    </View>
                ) : (
                    <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                        {filteredRecords.length === 0 ? (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>Không có dữ liệu</Text>
                            </View>
                        ) : (
                            filteredRecords.map((record) => (
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
                                        </View>
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
        alignItems: "center",
        marginBottom: 12,
    },
    recordType: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
    recordTypeText: {
        fontSize: 16,
        fontWeight: "700",
    },
    recordAmount: {
        fontSize: 18,
        fontWeight: "700",
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
});

import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Modal, ActivityIndicator } from "react-native";
import { ChevronDown, ChevronUp, UserRoundPlus, ListCollapse, Settings2, Wrench, CircleDollarSign, CircleEqual, UserRound, PackageCheck, TagsIcon, CopyPlus, CircleMinus, CalendarCheck, CalendarDays, CalendarRange, FolderCheck, SquareLibrary, X, Store, SquareUser, UserRoundPen } from "lucide-react-native";
import { useRouter } from "expo-router";
import SidebarLayout from "../../../components/SidebarLayout";
import { employeeService } from "../../../services/employeeService";
import type { Employee } from "../../../services/employeeService";

export default function AdminTaskScreen() {
    const router = useRouter();
    type ExpandKey = "category" | "employee" | "schedule" | "attendance" | "payroll" | "configuration";
    const [expanded, setExpanded] = useState({
        category: true,
        employee: true,
        schedule: true,
        attendance: true,
        configuration: true,
        payroll: true
    });
    const [employeeModalVisible, setEmployeeModalVisible] = useState(false);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [employeeLoading, setEmployeeLoading] = useState(false);
    const [employeeError, setEmployeeError] = useState<string | null>(null);


    const toggle = (key: ExpandKey) => {
        setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const openEmployeeList = async () => {
        setEmployeeModalVisible(true);
        setEmployeeLoading(true);
        setEmployeeError(null);

        try {
            const data = await employeeService.getEmployees();
            setEmployees(data);
            if (!data.length) {
                setEmployeeError("Chưa có dữ liệu nhân viên");
            }
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                "Không thể tải danh sách nhân viên";
            setEmployeeError(message);
            setEmployees([]);
        } finally {
            setEmployeeLoading(false);
        }
    };

    const closeEmployeeList = () => {
        setEmployeeModalVisible(false);
    };

    const renderEmployeeRow = (employee: Employee, index: number) => {
        const displayName =
            employee.fullname ||
            employee.fullName ||
            employee.name ||
            employee.username ||
            `Nhân viên ${index + 1}`;

        // Tạo mảng thông tin: position, role, department
        // Kiểm tra nhiều variant của field name (bao gồm cả nested objects)
        const position =
            employee.PositionName ||
            employee.roleName ||
            (employee as any)?.user?.role ||
            (employee as any)?.User?.RoleName;

        const department =
            employee.departmentName ||
            (employee as any)?.user?.departmentName ||
            (employee as any)?.User?.DepartmentName;

        // Filter chỉ loại bỏ null, undefined, và empty string
        const infoParts = [
            employee.PositionName,
            employee.roleName,
            employee.departmentName
        ].filter((val) => val != null && val !== "" && val !== undefined);

        const secondaryInfo = infoParts.length > 0
            ? infoParts.join(" • ")
            : "Chưa cập nhật";

        const initials = (displayName || "U")
            .split(" ")
            .map((w: string) => w.charAt(0))
            .join("")
            .slice(0, 2)
            .toUpperCase();

        return (
            <View key={`${employee.id || employee.employeeId || displayName}-${index}`} style={styles.employeeRow}>
                <View style={styles.employeeAvatar}>
                    <Text style={styles.employeeAvatarText}>{initials}</Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.employeeName}>{displayName}</Text>
                    <Text style={styles.employeeMeta}>{secondaryInfo}</Text>
                </View>
            </View>
        );
    };

    return (
        <SidebarLayout title="Tác vụ" activeKey="task">
            <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                {/* ----- SECTION: DANH MỤC ----- */}
                <TouchableOpacity style={styles.sectionHeader} onPress={() => toggle("category")}>
                    <Text style={styles.sectionTitle}>Danh mục</Text>
                    {expanded.category ? <ChevronUp size={20} color="#333" /> : <ChevronDown size={20} color="#333" />}
                </TouchableOpacity>

                {expanded.category && (
                    <View style={styles.cardRow}>
                        <TaskCard
                            icon={<Store size={32} />}
                            label="Chi nhánh"
                            onPress={() => router.push("/adminfunction/branch-management")}
                        />
                        <TaskCard
                            icon={<SquareUser size={32} />}
                            label="Bộ phận"
                            onPress={() => router.push("/adminfunction/department-management")}
                        />
                        <TaskCard
                            icon={<UserRoundPen size={32} />}
                            label="Chức danh"
                            onPress={() => router.push("/adminfunction/position-management")}
                        />
                    </View>
                )}
                {/* ----- SECTION: NHÂN VIÊN ----- */}
                <TouchableOpacity style={styles.sectionHeader} onPress={() => toggle("employee")}>
                    <Text style={styles.sectionTitle}>Nhân viên</Text>
                    {expanded.employee ? <ChevronUp size={20} color="#333" /> : <ChevronDown size={20} color="#333" />}
                </TouchableOpacity>

                {expanded.employee && (
                    <View style={styles.cardRow}>
                        <TaskCard
                            icon={<UserRoundPlus size={32} />}
                            label="Mời nhân viên"
                            onPress={() => router.push("/adminfunction/employee-invitation")}
                        />
                        <TaskCard
                            icon={<ListCollapse size={32} />}
                            label="Danh sách nhân viên"
                            onPress={openEmployeeList}
                        />
                    </View>
                )}

                {/* ----- SECTION: LỊCH LÀM VIỆC ----- */}
                <TouchableOpacity style={styles.sectionHeader} onPress={() => toggle("schedule")}>
                    <Text style={styles.sectionTitle}>Lịch làm việc</Text>
                    {expanded.schedule ? <ChevronUp size={20} color="#333" /> : <ChevronDown size={20} color="#333" />}
                </TouchableOpacity>

                {expanded.schedule && (
                    <View style={styles.cardRow}>
                        <TaskCard
                            icon={<CalendarCheck size={32} />}
                            label="Xếp lịch làm việc"
                            onPress={() => {
                                router.push("/function/shift-schedule");
                            }}
                        />
                        <TaskCard
                            icon={<CalendarDays size={32} />}
                            label="Lịch làm việc theo ca"
                            onPress={() => {
                                router.push("/function/weekly-schedule");
                            }}
                        />
                        <TaskCard
                            icon={<CalendarRange size={32} />}
                            label="Lịch làm việc theo nhân viên"
                            onPress={() => {
                                router.push("/function/shift-schedule?tab=assignments");
                            }}
                        />
                        <TaskCard
                            icon={<FolderCheck size={32} />}
                            label="Xem yêu cầu đăng ký lịch làm"
                            onPress={() => {
                                router.push("/function/weekly-schedule-requests");
                            }}
                        />
                    </View>
                )}

                {/* ----- SECTION: CHẤM CÔNG ----- */}
                <TouchableOpacity style={styles.sectionHeader} onPress={() => toggle("attendance")}>
                    <Text style={styles.sectionTitle}>Chấm công</Text>
                    {expanded.attendance ? <ChevronUp size={20} color="#333" /> : <ChevronDown size={20} color="#333" />}
                </TouchableOpacity>

                {expanded.attendance && (
                    <View style={styles.cardRow}>
                        <TaskCard icon={<SquareLibrary size={32} />} label="Báo cáo chấm công" onPress={() => { router.push("/adminfunction/late-arrivals") }} />
                        <TaskCard
                            icon={<ListCollapse size={32} />}
                            label="Yêu cầu bổ sung chấm công"
                            onPress={() => {
                                router.push("/function/shift-approval");
                            }}
                        />
                    </View>
                )}
                {/* ----- SECTION: LƯƠNG ----- */}
                <TouchableOpacity style={styles.sectionHeader} onPress={() => toggle("payroll")}>
                    <Text style={styles.sectionTitle}>Lương</Text>
                    {expanded.payroll ? <ChevronUp size={20} color="#333" /> : <ChevronDown size={20} color="#333" />}
                </TouchableOpacity>

                {expanded.payroll && (
                    <View style={styles.cardRow}>
                        <TaskCard icon={<UserRound size={32} />} label="Hệ số lương" />
                        <TaskCard icon={<PackageCheck size={32} />} label="Đánh giá KPI" />
                        <TaskCard icon={<TagsIcon size={32} />} label="Phiếu tạm ứng lương" />
                        <TaskCard
                            icon={<CopyPlus size={32} />}
                            label="Phiếu cộng tiền"
                            onPress={() => router.push("/adminfunction/create-reward")}
                        />
                        <TaskCard
                            icon={<CircleMinus size={32} />}
                            label="Phiếu trừ tiền"
                            onPress={() => router.push("/adminfunction/create-penalty")}
                        />
                    </View>
                )}
            </ScrollView>
            <Modal
                visible={employeeModalVisible}
                animationType="slide"
                transparent
                onRequestClose={closeEmployeeList}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Danh sách nhân viên</Text>
                            <TouchableOpacity onPress={closeEmployeeList} style={styles.closeButton}>
                                <X color="#0f172a" size={18} />
                            </TouchableOpacity>
                        </View>

                        {employeeLoading && (
                            <View style={styles.modalStateContainer}>
                                <ActivityIndicator color="#0d9488" size="large" />
                                <Text style={styles.modalStateText}>Đang tải dữ liệu...</Text>
                            </View>
                        )}

                        {!employeeLoading && employeeError && (
                            <View style={styles.modalStateContainer}>
                                <Text style={styles.modalErrorText}>{employeeError}</Text>
                                <TouchableOpacity style={styles.retryButton} onPress={openEmployeeList}>
                                    <Text style={styles.retryButtonText}>Thử lại</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {!employeeLoading && !employeeError && (
                            <ScrollView style={styles.employeeList}>
                                {employees.length === 0 ? (
                                    <View style={styles.modalStateContainer}>
                                        <Text style={styles.modalErrorText}>Không có dữ liệu nhân viên</Text>
                                    </View>
                                ) : (
                                    employees.map((employee, index) => renderEmployeeRow(employee, index))
                                )}
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </SidebarLayout>
    );
}

// ========================= COMPONENT CARD =========================
interface TaskCardProps {
    icon: React.ReactElement<any>;
    label: string;
    iconColor?: string;
    onPress?: () => void;
}

function TaskCard({
    icon,
    label,
    iconColor = "#0d9488",
    onPress,
}: TaskCardProps) {
    const coloredIcon = React.cloneElement(icon, { color: iconColor } as any);
    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
            {coloredIcon}
            <Text style={styles.cardText}>{label}</Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 16,
        backgroundColor: "#F4F9F7",
    },
    card: {
        width: "47%",
        backgroundColor: "#fff",
        paddingVertical: 24,
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardRow: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
        flexWrap: "wrap"
    },
    cardText: {
        marginTop: 8,
        fontWeight: "500",
        textAlign: "center",
        color: "#333"
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#333"
    },
    sectionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 16,
        marginBottom: 12,
        paddingVertical: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.4)",
        justifyContent: "flex-end",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 32,
        maxHeight: "80%",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 16,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
    },
    closeButton: {
        width: 34,
        height: 34,
        borderRadius: 17,
        backgroundColor: "#f1f5f9",
        alignItems: "center",
        justifyContent: "center",
    },
    modalStateContainer: {
        alignItems: "center",
        justifyContent: "center",
        paddingVertical: 24,
    },
    modalStateText: {
        marginTop: 12,
        color: "#475569",
        fontSize: 15,
    },
    modalErrorText: {
        color: "#dc2626",
        fontWeight: "600",
        textAlign: "center",
    },
    retryButton: {
        marginTop: 12,
        paddingHorizontal: 24,
        paddingVertical: 10,
        borderRadius: 16,
        backgroundColor: "#0d9488",
    },
    retryButtonText: {
        color: "#fff",
        fontWeight: "600",
    },
    employeeList: {
        maxHeight: "100%",
    },
    employeeRow: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: "#e2e8f0",
        gap: 12,
    },
    employeeAvatar: {
        width: 48,
        height: 48,
        borderRadius: 16,
        backgroundColor: "#ecfeff",
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: "#cffafe",
    },
    employeeAvatarText: {
        fontWeight: "700",
        color: "#0e7490",
    },
    employeeName: {
        fontSize: 16,
        fontWeight: "600",
        color: "#0f172a",
    },
    employeeMeta: {
        marginTop: 2,
        color: "#475569",
    },
});

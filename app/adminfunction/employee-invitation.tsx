import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Calendar, ChevronDown, Check } from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";
import { employeeInvitationService } from "../../services/employeeInvitationService";
import { positionService, Position } from "../../services/positionService";
import { departmentService, Department } from "../../services/departmentService";
import { branchService, Branch } from "../../services/branchService";


export default function EmployeeInvitationScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form state
    const [email, setEmail] = useState("");
    const [fullname, setFullname] = useState("");
    const [phone, setPhone] = useState("");
    const [workAddress, setWorkAddress] = useState("");
    const [startDate, setStartDate] = useState(new Date());

    // Salary fields
    const [hourlyRate, setHourlyRate] = useState("");
    const [baseSalary, setBaseSalary] = useState("");
    const [shiftRate, setShiftRate] = useState("");

    // Dropdowns
    const [positions, setPositions] = useState<Position[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [selectedEmployeeType, setSelectedEmployeeType] = useState<string>("Full-time");

    const employeeTypes = ["Full-time", "Part-time", "Contract", "Intern"];

    // Dropdown states
    const [showPositionDropdown, setShowPositionDropdown] = useState(false);
    const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
    const [showBranchDropdown, setShowBranchDropdown] = useState(false);
    const [showEmployeeTypeDropdown, setShowEmployeeTypeDropdown] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [positionsData, departmentsData, branchesData] = await Promise.all([
                positionService.getPositions(),
                departmentService.getDepartments(),
                branchService.getBranches(),
            ]);
            setPositions(positionsData);
            setDepartments(departmentsData);
            setBranches(branchesData);
        } catch (error: any) {
            Alert.alert("Lỗi", "Không thể tải dữ liệu");
        }
    };

    const handleSendInvitation = async () => {
        if (!email.trim() || !fullname.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập email và họ tên ứng viên");
            return;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Alert.alert("Lỗi", "Email không hợp lệ");
            return;
        }

        // Kiểm tra xem có phải quản lý không
        const isManager = selectedPosition &&
            (selectedPosition.name?.toLowerCase().includes("manager") ||
                selectedPosition.name?.toLowerCase().includes("quản lý") ||
                selectedPosition.titlename?.toLowerCase().includes("manager") ||
                selectedPosition.titlename?.toLowerCase().includes("quản lý"));

        setLoading(true);
        try {
            const invitationData = {
                email: email.trim(),
                fullname: fullname.trim(),
                phone: phone.trim() || undefined,
                positionId: selectedPosition?.id || selectedPosition?.positionId,
                departmentId: selectedDepartment?.id || selectedDepartment?.departmentId,
                branchId: selectedBranch?.id || selectedBranch?.branchId,
                startDate: startDate.toISOString(),
                workAddress: workAddress.trim() || undefined,
                employeeType: selectedEmployeeType,
                // Manager: salaryRate = lương ca (shiftRate), baseSalary = lương cứng
                // Employee: salaryRate = lương theo giờ (hourlyRate)
                salaryRate: isManager
                    ? (shiftRate ? parseFormattedNumber(shiftRate) : 0)
                    : (hourlyRate ? parseFormattedNumber(hourlyRate) : 0),
                baseSalary: isManager && baseSalary ? parseFormattedNumber(baseSalary) : undefined,
            };

            console.log('Sending invitation data:', invitationData);
            await employeeInvitationService.createInvitation(invitationData);
            Alert.alert("Thành công", "Đã gửi lời mời thành công");
            router.back();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.message || "Không thể gửi lời mời";
            Alert.alert("Lỗi", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Helper function để format số với dấu phẩy
    const formatNumber = (value: string): string => {
        // Xóa tất cả ký tự không phải số
        const numbers = value.replace(/[^\d]/g, '');
        // Thêm dấu phẩy
        return numbers.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    };

    // Helper function để parse số từ string có dấu phẩy
    const parseFormattedNumber = (value: string): number => {
        return parseFloat(value.replace(/,/g, '')) || 0;
    };

    const handleHourlyRateChange = (text: string) => {
        const formatted = formatNumber(text);
        setHourlyRate(formatted);
    };

    const handleBaseSalaryChange = (text: string) => {
        const formatted = formatNumber(text);
        setBaseSalary(formatted);
    };

    const handleShiftRateChange = (text: string) => {
        const formatted = formatNumber(text);
        setShiftRate(formatted);
    };

    return (
        <SidebarLayout title="Lời mời làm việc" activeKey="task">
            <KeyboardAvoidingView
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
            >
                <ScrollView
                    style={styles.container}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                >
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>THÔNG TIN ỨNG VIÊN</Text>

                        <Text style={styles.label}>Email ứng viên *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập email của ứng viên"
                            placeholderTextColor="#9ca3af"
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />

                        <Text style={styles.label}>Họ tên ứng viên *</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập họ tên"
                            placeholderTextColor="#9ca3af"
                            value={fullname}
                            onChangeText={setFullname}
                        />

                        <Text style={styles.label}>Số điện thoại</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập số điện thoại"
                            placeholderTextColor="#9ca3af"
                            value={phone}
                            onChangeText={setPhone}
                            keyboardType="phone-pad"
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>THÔNG TIN CÔNG VIỆC</Text>

                        <Text style={styles.label}>Chọn chức danh</Text>
                        <View>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowPositionDropdown(!showPositionDropdown)}
                            >
                                <Text style={selectedPosition ? styles.dropdownText : styles.dropdownPlaceholder}>
                                    {selectedPosition
                                        ? selectedPosition.name || selectedPosition.titlename || selectedPosition.Titlename
                                        : "Chọn chức danh"}
                                </Text>
                                <ChevronDown size={20} color="#6b7280" />
                            </TouchableOpacity>
                            {showPositionDropdown && (
                                <View style={styles.dropdownList}>
                                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                                        {positions.map((pos, index) => {
                                            const posName = pos.name || pos.titlename || pos.Titlename || "Chưa có tên";
                                            const isSelected = selectedPosition?.id === pos.id || selectedPosition?.positionId === pos.positionId;
                                            return (
                                                <TouchableOpacity
                                                    key={pos.id || pos.positionId || index}
                                                    style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                                                    onPress={() => {
                                                        setSelectedPosition(pos);
                                                        setShowPositionDropdown(false);
                                                    }}
                                                >
                                                    <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                                                        {posName}
                                                    </Text>
                                                    {isSelected && <Check size={18} color="#0d9488" />}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        <Text style={styles.label}>Chi nhánh</Text>
                        <View>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowBranchDropdown(!showBranchDropdown)}
                            >
                                <Text style={selectedBranch ? styles.dropdownText : styles.dropdownPlaceholder}>
                                    {selectedBranch ? selectedBranch.name || selectedBranch.branchName : "Chọn chi nhánh"}
                                </Text>
                                <ChevronDown size={20} color="#6b7280" />
                            </TouchableOpacity>
                            {showBranchDropdown && (
                                <View style={styles.dropdownList}>
                                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                                        {branches.map((branch, index) => {
                                            const branchName = branch.name || branch.branchName || "Chưa có tên";
                                            const isSelected = selectedBranch?.id === branch.id || selectedBranch?.branchId === branch.branchId;
                                            return (
                                                <TouchableOpacity
                                                    key={branch.id || branch.branchId || index}
                                                    style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                                                    onPress={() => {
                                                        setSelectedBranch(branch);
                                                        setShowBranchDropdown(false);
                                                    }}
                                                >
                                                    <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                                                        {branchName}
                                                    </Text>
                                                    {isSelected && <Check size={18} color="#0d9488" />}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        <Text style={styles.label}>Chọn bộ phận</Text>
                        <View>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowDepartmentDropdown(!showDepartmentDropdown)}
                            >
                                <Text style={selectedDepartment ? styles.dropdownText : styles.dropdownPlaceholder}>
                                    {selectedDepartment
                                        ? selectedDepartment.name || selectedDepartment.departmentName
                                        : "Chọn bộ phận"}
                                </Text>
                                <ChevronDown size={20} color="#6b7280" />
                            </TouchableOpacity>
                            {showDepartmentDropdown && (
                                <View style={styles.dropdownList}>
                                    <ScrollView style={styles.dropdownScroll} nestedScrollEnabled>
                                        {departments.map((dept, index) => {
                                            const deptName = dept.name || dept.departmentName || "Chưa có tên";
                                            const isSelected = selectedDepartment?.id === dept.id || selectedDepartment?.departmentId === dept.departmentId;
                                            return (
                                                <TouchableOpacity
                                                    key={dept.id || dept.departmentId || index}
                                                    style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                                                    onPress={() => {
                                                        setSelectedDepartment(dept);
                                                        setShowDepartmentDropdown(false);
                                                    }}
                                                >
                                                    <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                                                        {deptName}
                                                    </Text>
                                                    {isSelected && <Check size={18} color="#0d9488" />}
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </ScrollView>
                                </View>
                            )}
                        </View>

                        <Text style={styles.label}>Ngày bắt đầu</Text>
                        <TouchableOpacity
                            style={styles.dateInput}
                            onPress={() => {
                                Alert.prompt(
                                    "Nhập ngày bắt đầu",
                                    "Định dạng: DD/MM/YYYY",
                                    (text) => {
                                        const parts = text.split("/");
                                        if (parts.length === 3) {
                                            const date = new Date(
                                                parseInt(parts[2]),
                                                parseInt(parts[1]) - 1,
                                                parseInt(parts[0])
                                            );
                                            if (!isNaN(date.getTime())) {
                                                setStartDate(date);
                                            }
                                        }
                                    },
                                    "plain-text",
                                    startDate.toLocaleDateString("vi-VN")
                                );
                            }}
                        >
                            <Text style={styles.dateText}>{startDate.toLocaleDateString("vi-VN")}</Text>
                            <Calendar size={20} color="#0d9488" />
                        </TouchableOpacity>

                        <Text style={styles.label}>Địa chỉ làm việc</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Nhập địa chỉ làm việc"
                            placeholderTextColor="#9ca3af"
                            value={workAddress}
                            onChangeText={setWorkAddress}
                        />

                        <Text style={styles.label}>Chọn loại nhân viên</Text>
                        <View>
                            <TouchableOpacity
                                style={styles.dropdown}
                                onPress={() => setShowEmployeeTypeDropdown(!showEmployeeTypeDropdown)}
                            >
                                <Text style={styles.dropdownText}>{selectedEmployeeType}</Text>
                                <ChevronDown size={20} color="#6b7280" />
                            </TouchableOpacity>
                            {showEmployeeTypeDropdown && (
                                <View style={styles.dropdownList}>
                                    {employeeTypes.map((type, index) => {
                                        const isSelected = selectedEmployeeType === type;
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                style={[styles.dropdownItem, isSelected && styles.dropdownItemSelected]}
                                                onPress={() => {
                                                    setSelectedEmployeeType(type);
                                                    setShowEmployeeTypeDropdown(false);
                                                }}
                                            >
                                                <Text style={[styles.dropdownItemText, isSelected && styles.dropdownItemTextSelected]}>
                                                    {type}
                                                </Text>
                                                {isSelected && <Check size={18} color="#0d9488" />}
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            )}
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>THÔNG TIN LƯƠNG</Text>

                        {/* Kiểm tra xem có phải quản lý không - dựa vào tên position */}
                        {selectedPosition &&
                            (selectedPosition.name?.toLowerCase().includes("manager") ||
                                selectedPosition.name?.toLowerCase().includes("quản lý") ||
                                selectedPosition.titlename?.toLowerCase().includes("manager") ||
                                selectedPosition.titlename?.toLowerCase().includes("quản lý")) ? (
                            <>
                                <Text style={styles.label}>Lương cứng (VNĐ/tháng)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập lương cứng (VD: 10,000,000)"
                                    placeholderTextColor="#9ca3af"
                                    value={baseSalary}
                                    onChangeText={handleBaseSalaryChange}
                                    keyboardType="numeric"
                                />

                                <Text style={styles.label}>Lương ca (VNĐ/giờ)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập lương ca (VD: 50,000)"
                                    placeholderTextColor="#9ca3af"
                                    value={shiftRate}
                                    onChangeText={handleShiftRateChange}
                                    keyboardType="numeric"
                                />
                            </>
                        ) : (
                            <>
                                <Text style={styles.label}>Lương theo giờ (VNĐ/giờ)</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập lương theo giờ (VD: 30,000)"
                                    placeholderTextColor="#9ca3af"
                                    value={hourlyRate}
                                    onChangeText={handleHourlyRateChange}
                                    keyboardType="numeric"
                                />
                            </>
                        )}
                    </View>

                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.buttonDisabled]}
                        onPress={handleSendInvitation}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Gửi lời mời</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SidebarLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F9F7",
        padding: 16,
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: "700",
        color: "#64748b",
        marginBottom: 16,
        letterSpacing: 0.5,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        padding: 14,
        fontSize: 15,
        backgroundColor: "#fff",
        marginBottom: 16,
        color: "#0f172a",
    },
    dropdown: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        padding: 14,
        backgroundColor: "#fff",
        marginBottom: 16,
    },
    dropdownText: {
        fontSize: 15,
        color: "#0f172a",
    },
    dropdownPlaceholder: {
        fontSize: 15,
        color: "#9ca3af",
    },
    dateInput: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        padding: 14,
        backgroundColor: "#fff",
        marginBottom: 16,
    },
    dateText: {
        fontSize: 15,
        color: "#0f172a",
    },
    submitButton: {
        backgroundColor: "#0d9488",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginTop: 8,
        marginBottom: 32,
    },
    submitButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "700",
    },
    buttonDisabled: {
        backgroundColor: "#94a3b8",
    },
    dropdownList: {
        position: "absolute",
        top: "100%",
        left: 0,
        right: 0,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#e5e7eb",
        borderRadius: 12,
        marginTop: 4,
        maxHeight: 200,
        zIndex: 1000,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
    },
    dropdownScroll: {
        maxHeight: 200,
    },
    dropdownItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 14,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    dropdownItemSelected: {
        backgroundColor: "#f0fdfa",
    },
    dropdownItemText: {
        fontSize: 15,
        color: "#0f172a",
    },
    dropdownItemTextSelected: {
        color: "#0d9488",
        fontWeight: "600",
    },
});

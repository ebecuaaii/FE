import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    TextInput,
} from "react-native";
import { Clock, Calendar, ChevronDown, Image as ImageIcon } from "lucide-react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import SidebarLayout from "../../components/SidebarLayout";
import attendanceSupplementService, {
    Branch,
    Shift,
    CreateAttendanceSupplementDto,
} from "../../services/attendanceSupplementService";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function AttendanceSupplementScreen() {
    const [loading, setLoading] = useState(false);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [shifts, setShifts] = useState<Shift[]>([]);

    const [showBranchPicker, setShowBranchPicker] = useState(false);
    const [showShiftPicker, setShowShiftPicker] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showCheckInTimePicker, setShowCheckInTimePicker] = useState(false);
    const [showCheckOutTimePicker, setShowCheckOutTimePicker] = useState(false);

    const [formData, setFormData] = useState<CreateAttendanceSupplementDto>({
        branchId: 0,
        date: new Date().toISOString().split("T")[0],
        shiftId: 0,
        checkInTime: "",
        checkOutTime: "",
        note: "",
    });

    const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
    const [selectedShift, setSelectedShift] = useState<Shift | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [branchesData, shiftsData] = await Promise.all([
                attendanceSupplementService.getBranches(),
                attendanceSupplementService.getShifts(),
            ]);
            setBranches(branchesData);
            setShifts(shiftsData);
        } catch (error: any) {
            console.error("Error loading data:", error);
            Alert.alert("Lỗi", "Không thể tải dữ liệu");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.branchId) {
            Alert.alert("Lỗi", "Vui lòng chọn chi nhánh");
            return;
        }
        if (!formData.date) {
            Alert.alert("Lỗi", "Vui lòng chọn ngày chấm công");
            return;
        }
        if (!formData.shiftId) {
            Alert.alert("Lỗi", "Vui lòng chọn ca làm việc");
            return;
        }
        if (!formData.checkInTime) {
            Alert.alert("Lỗi", "Vui lòng chọn giờ bắt đầu");
            return;
        }
        if (!formData.checkOutTime) {
            Alert.alert("Lỗi", "Vui lòng chọn giờ kết thúc");
            return;
        }
        if (formData.note.trim().length < 5) {
            Alert.alert("Lỗi", "Ghi chú phải có ít nhất 5 ký tự");
            return;
        }

        setLoading(true);
        try {
            await attendanceSupplementService.create(formData);
            Alert.alert("Thành công", "Đã tạo yêu cầu bổ sung chấm công", [
                {
                    text: "OK",
                    onPress: () => {
                        // Reset form
                        setFormData({
                            branchId: 0,
                            date: new Date().toISOString().split("T")[0],
                            shiftId: 0,
                            checkInTime: "",
                            checkOutTime: "",
                            note: "",
                        });
                        setSelectedBranch(null);
                        setSelectedShift(null);
                    },
                },
            ]);
        } catch (error: any) {
            Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tạo yêu cầu");
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    return (
        <SidebarLayout title="Bổ sung/ Sửa chấm công" activeKey="task">
            <KeyboardAwareScrollView style={styles.container} showsVerticalScrollIndicator={false}>
                <View style={styles.content}>
                    {/* Chọn chi nhánh */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Chọn chi nhánh</Text>
                        <TouchableOpacity
                            style={styles.picker}
                            onPress={() => setShowBranchPicker(!showBranchPicker)}
                        >
                            <Text style={selectedBranch ? styles.pickerText : styles.placeholderText}>
                                {selectedBranch ? selectedBranch.name : "KEYBOX KAFE"}
                            </Text>
                            <ChevronDown size={20} color="#0d9488" />
                        </TouchableOpacity>
                        {showBranchPicker && (
                            <View style={styles.pickerOptions}>
                                {branches.map((branch) => (
                                    <TouchableOpacity
                                        key={branch.id}
                                        style={styles.pickerOption}
                                        onPress={() => {
                                            setSelectedBranch(branch);
                                            setFormData({ ...formData, branchId: branch.id });
                                            setShowBranchPicker(false);
                                        }}
                                    >
                                        <Text style={styles.pickerOptionText}>{branch.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Chọn ngày */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Chọn ngày chấm công</Text>
                        <TouchableOpacity
                            style={styles.picker}
                            onPress={() => setShowDatePicker(true)}
                        >
                            <Text style={styles.pickerText}>{formatDate(formData.date)}</Text>
                            <Calendar size={20} color="#0d9488" />
                        </TouchableOpacity>
                    </View>

                    {/* Chọn ca làm việc */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Chọn ca làm việc</Text>
                        <TouchableOpacity
                            style={styles.picker}
                            onPress={() => setShowShiftPicker(!showShiftPicker)}
                        >
                            <Text style={selectedShift ? styles.pickerText : styles.placeholderText}>
                                {selectedShift
                                    ? `${selectedShift.name} (${selectedShift.startTime} - ${selectedShift.endTime})`
                                    : "Chọn ca làm việc"}
                            </Text>
                            <ChevronDown size={20} color="#0d9488" />
                        </TouchableOpacity>
                        {showShiftPicker && (
                            <View style={styles.pickerOptions}>
                                {shifts.map((shift) => (
                                    <TouchableOpacity
                                        key={shift.id}
                                        style={styles.pickerOption}
                                        onPress={() => {
                                            setSelectedShift(shift);
                                            setFormData({ ...formData, shiftId: shift.id });
                                            setShowShiftPicker(false);
                                        }}
                                    >
                                        <Text style={styles.pickerOptionText}>
                                            {shift.name} ({shift.startTime} - {shift.endTime})
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>

                    {/* Giờ bắt đầu */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Giờ bắt đầu</Text>
                        <TouchableOpacity
                            style={styles.picker}
                            onPress={() => setShowCheckInTimePicker(true)}
                        >
                            <Text
                                style={
                                    formData.checkInTime ? styles.pickerText : styles.placeholderText
                                }
                            >
                                {formData.checkInTime || "Chọn giờ bắt đầu"}
                            </Text>
                            <Clock size={20} color="#0d9488" />
                        </TouchableOpacity>
                    </View>

                    {/* Giờ kết thúc */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Giờ kết thúc</Text>
                        <TouchableOpacity
                            style={styles.picker}
                            onPress={() => setShowCheckOutTimePicker(true)}
                        >
                            <Text
                                style={
                                    formData.checkOutTime ? styles.pickerText : styles.placeholderText
                                }
                            >
                                {formData.checkOutTime || "Chọn giờ kết thúc"}
                            </Text>
                            <Clock size={20} color="#0d9488" />
                        </TouchableOpacity>
                    </View>

                    {/* Ghi chú */}
                    <View style={styles.formGroup}>
                        <Text style={styles.label}>Ghi chú</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Nhập ghi chú"
                            multiline
                            numberOfLines={4}
                            value={formData.note}
                            onChangeText={(text) => setFormData({ ...formData, note: text })}
                        />
                    </View>

                    {/* Upload ảnh */}
                    <TouchableOpacity style={styles.uploadButton}>
                        <View style={styles.uploadIcon}>
                            <ImageIcon size={24} color="#0d9488" />
                        </View>
                    </TouchableOpacity>

                    {/* Submit button */}
                    <TouchableOpacity
                        style={[styles.submitButton, loading && styles.submitButtonDisabled]}
                        onPress={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Text style={styles.submitButtonText}>Tạo mới</Text>
                        )}
                    </TouchableOpacity>
                </View>

                {/* Date Picker */}
                {showDatePicker && (
                    <DateTimePicker
                        value={new Date(formData.date)}
                        mode="date"
                        display="default"
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (selectedDate) {
                                setFormData({
                                    ...formData,
                                    date: selectedDate.toISOString().split("T")[0],
                                });
                            }
                        }}
                    />
                )}

                {/* Check In Time Picker */}
                {showCheckInTimePicker && (
                    <DateTimePicker
                        value={
                            formData.checkInTime
                                ? new Date(`2000-01-01T${formData.checkInTime}:00`)
                                : new Date()
                        }
                        mode="time"
                        display="default"
                        is24Hour={true}
                        onChange={(event, selectedTime) => {
                            setShowCheckInTimePicker(false);
                            if (selectedTime) {
                                const hours = selectedTime.getHours().toString().padStart(2, "0");
                                const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
                                setFormData({
                                    ...formData,
                                    checkInTime: `${hours}:${minutes}`,
                                });
                            }
                        }}
                    />
                )}

                {/* Check Out Time Picker */}
                {showCheckOutTimePicker && (
                    <DateTimePicker
                        value={
                            formData.checkOutTime
                                ? new Date(`2000-01-01T${formData.checkOutTime}:00`)
                                : new Date()
                        }
                        mode="time"
                        display="default"
                        is24Hour={true}
                        onChange={(event, selectedTime) => {
                            setShowCheckOutTimePicker(false);
                            if (selectedTime) {
                                const hours = selectedTime.getHours().toString().padStart(2, "0");
                                const minutes = selectedTime.getMinutes().toString().padStart(2, "0");
                                setFormData({
                                    ...formData,
                                    checkOutTime: `${hours}:${minutes}`,
                                });
                            }
                        }}
                    />
                )}
            </KeyboardAwareScrollView>
        </SidebarLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F9F7",
    },
    content: {
        padding: 20,
    },
    formGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: "#6b7280",
        marginBottom: 8,
    },
    picker: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
    },
    pickerText: {
        fontSize: 15,
        color: "#0f172a",
        fontWeight: "500",
    },
    placeholderText: {
        fontSize: 15,
        color: "#9ca3af",
    },
    pickerOptions: {
        backgroundColor: "#fff",
        borderRadius: 12,
        marginTop: 8,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        maxHeight: 200,
    },
    pickerOption: {
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: "#f1f5f9",
    },
    pickerOptionText: {
        fontSize: 15,
        color: "#0f172a",
    },
    input: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        fontSize: 15,
        color: "#0f172a",
    },
    textArea: {
        height: 120,
        textAlignVertical: "top",
    },
    uploadButton: {
        backgroundColor: "#e0f2f1",
        borderRadius: 12,
        padding: 20,
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
    uploadIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
    },
    submitButton: {
        backgroundColor: "#0d9488",
        borderRadius: 12,
        padding: 16,
        alignItems: "center",
        marginBottom: 40,
    },
    submitButtonDisabled: {
        backgroundColor: "#9ca3af",
    },
    submitButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#fff",
    },
});

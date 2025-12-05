import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    Modal,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { X, Plus, Edit2, Trash2, Users } from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";
import { departmentService, Department } from "../../services/departmentService";

export default function DepartmentManagementScreen() {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentDepartment, setCurrentDepartment] = useState<Department | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        loadDepartments();
    }, []);

    const loadDepartments = async () => {
        setLoading(true);
        try {
            const data = await departmentService.getDepartments();
            setDepartments(data);
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data?.message || "Không thể tải danh sách bộ phận");
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditMode(false);
        setCurrentDepartment(null);
        setName("");
        setDescription("");
        setModalVisible(true);
    };

    const openEditModal = (department: Department) => {
        setEditMode(true);
        setCurrentDepartment(department);
        setName(department.name || department.departmentName || "");
        setDescription(department.description || "");
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tên bộ phận");
            return;
        }

        setLoading(true);
        try {
            const departmentId = currentDepartment?.id || currentDepartment?.departmentId;

            if (editMode && departmentId) {
                const updateData = {
                    departmentName: name,
                    description,
                };
                await departmentService.updateDepartment(departmentId, updateData);
                Alert.alert("Thành công", "Cập nhật bộ phận thành công");
            } else {
                const createData = {
                    departmentName: name,
                    description,
                };
                await departmentService.createDepartment(createData);
                Alert.alert("Thành công", "Tạo bộ phận thành công");
            }
            setModalVisible(false);
            await loadDepartments();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.title || "Không thể lưu bộ phận";
            Alert.alert("Lỗi", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (department: Department) => {
        const departmentName = department.name || department.departmentName || "bộ phận này";
        const departmentId = department.id || department.departmentId;

        if (!departmentId) {
            Alert.alert("Lỗi", "Không tìm thấy ID bộ phận");
            return;
        }

        Alert.alert(
            "Xác nhận xóa",
            `Bạn có chắc muốn xóa bộ phận "${departmentName}"?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await departmentService.deleteDepartment(departmentId);
                            Alert.alert("Thành công", "Xóa bộ phận thành công");
                            await loadDepartments();
                        } catch (error: any) {
                            const errorMsg = error.response?.data?.message || error.response?.data?.title || error.message || "Không thể xóa bộ phận";
                            Alert.alert("Lỗi", errorMsg);
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <SidebarLayout title="Quản lý bộ phận" activeKey="task">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Danh sách bộ phận</Text>
                    <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
                        <Plus size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Thêm bộ phận</Text>
                    </TouchableOpacity>
                </View>

                {loading && departments.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#0d9488" />
                    </View>
                ) : (
                    <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                        {departments.map((department, index) => {
                            const departmentId = department.id || department.departmentId;
                            const departmentName = department.name || department.departmentName || `Bộ phận ${index + 1}`;
                            const departmentDesc = department.description;

                            return (
                                <View key={departmentId || index} style={styles.departmentCard}>
                                    <View style={styles.departmentHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.departmentName}>{departmentName}</Text>
                                            <Text style={styles.departmentDescription}>
                                                {departmentDesc || "Chưa có mô tả"}
                                            </Text>
                                        </View>
                                        <View style={styles.departmentActions}>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => openEditModal(department)}
                                            >
                                                <Edit2 size={18} color="#0d9488" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => handleDelete(department)}
                                            >
                                                <Trash2 size={18} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </View>
                            );
                        })}
                    </ScrollView>
                )}

                {/* Modal Tạo/Sửa bộ phận */}
                <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editMode ? "Chỉnh sửa bộ phận" : "Thêm bộ phận mới"}
                                </Text>
                                <TouchableOpacity onPress={() => setModalVisible(false)}>
                                    <X size={24} color="#0f172a" />
                                </TouchableOpacity>
                            </View>

                            <ScrollView
                                style={styles.modalBody}
                                showsVerticalScrollIndicator={false}
                                keyboardShouldPersistTaps="handled"
                            >
                                <Text style={styles.label}>Tên bộ phận *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên bộ phận"
                                    placeholderTextColor="#9ca3af"
                                    value={name}
                                    onChangeText={setName}
                                />

                                <Text style={styles.label}>Mô tả</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Nhập mô tả bộ phận"
                                    placeholderTextColor="#9ca3af"
                                    value={description}
                                    onChangeText={setDescription}
                                    multiline
                                    numberOfLines={4}
                                />
                            </ScrollView>

                            <View style={styles.modalFooter}>
                                <TouchableOpacity
                                    style={[styles.button, styles.cancelButton]}
                                    onPress={() => setModalVisible(false)}
                                >
                                    <Text style={styles.cancelButtonText}>Hủy</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
                                    onPress={handleSave}
                                    disabled={loading}
                                >
                                    <Text style={styles.saveButtonText}>
                                        {loading ? "Đang lưu..." : "Lưu"}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </KeyboardAvoidingView>
                </Modal>
            </View>
        </SidebarLayout>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#F4F9F7",
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: "700",
        color: "#0f172a",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0d9488",
        paddingHorizontal: 13,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 6,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "500",
        fontSize: 14,
    },
    centerContainer: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    list: {
        flex: 1,
        padding: 16,
    },
    departmentCard: {
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    departmentHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    departmentName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 6,
    },
    departmentDescription: {
        fontSize: 14,
        color: "#94a3b8",
        lineHeight: 20,
    },
    departmentActions: {
        flexDirection: "row",
        gap: 8,
    },
    actionButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#f1f5f9",
        justifyContent: "center",
        alignItems: "center",
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },
    modalContent: {
        backgroundColor: "#fff",
        borderRadius: 24,
        width: "90%",
        maxHeight: "80%",
        overflow: "hidden",
    },
    modalHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: "#e5e7eb",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
    },
    modalBody: {
        padding: 20,
        flexGrow: 1,
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
        padding: 12,
        fontSize: 14,
        backgroundColor: "#f9fafb",
        marginBottom: 16,
    },
    textArea: {
        height: 100,
        textAlignVertical: "top",
    },
    modalFooter: {
        flexDirection: "row",
        gap: 12,
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    button: {
        flex: 1,
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: "center",
    },
    cancelButton: {
        backgroundColor: "#f1f5f9",
    },
    cancelButtonText: {
        color: "#475569",
        fontWeight: "600",
        fontSize: 16,
    },
    saveButton: {
        backgroundColor: "#0d9488",
    },
    saveButtonText: {
        color: "#fff",
        fontWeight: "600",
        fontSize: 16,
    },
    buttonDisabled: {
        backgroundColor: "#94a3b8",
    },
});

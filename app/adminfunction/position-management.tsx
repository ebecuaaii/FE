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
import { X, Plus, Edit2, Trash2 } from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";
import { positionService, Position } from "../../services/positionService";

export default function PositionManagementScreen() {
    const [positions, setPositions] = useState<Position[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentPosition, setCurrentPosition] = useState<Position | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    useEffect(() => {
        loadPositions();
    }, []);

    const loadPositions = async () => {
        setLoading(true);
        try {
            const data = await positionService.getPositions();
            setPositions(data);
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data?.message || "Không thể tải danh sách chức danh");
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditMode(false);
        setCurrentPosition(null);
        setName("");
        setDescription("");
        setModalVisible(true);
    };

    const openEditModal = (position: Position) => {
        setEditMode(true);
        setCurrentPosition(position);
        setName(position.name || position.titlename || position.Titlename || position.titleName || "");
        setDescription(position.description || "");
        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tên chức danh");
            return;
        }

        setLoading(true);
        try {
            const positionId = currentPosition?.id || currentPosition?.positionId;

            if (editMode && positionId) {
                const updateData = {
                    titlename: name,
                    description,
                };
                await positionService.updatePosition(positionId, updateData);
                Alert.alert("Thành công", "Cập nhật chức danh thành công");
            } else {
                const createData = {
                    titlename: name,
                    description,
                };
                await positionService.createPosition(createData);
                Alert.alert("Thành công", "Tạo chức danh thành công");
            }
            setModalVisible(false);
            await loadPositions();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.title || "Không thể lưu chức danh";
            Alert.alert("Lỗi", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (position: Position) => {
        const positionName = position.name || position.titlename || position.Titlename || position.titleName || "chức danh này";
        const positionId = position.id || position.positionId;

        if (!positionId) {
            Alert.alert("Lỗi", "Không tìm thấy ID chức danh");
            return;
        }

        Alert.alert(
            "Xác nhận xóa",
            `Bạn có chắc muốn xóa chức danh "${positionName}"?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            await positionService.deletePosition(positionId);
                            Alert.alert("Thành công", "Xóa chức danh thành công");
                            await loadPositions();
                        } catch (error: any) {
                            const errorMsg = error.response?.data?.message || error.response?.data?.title || error.message || "Không thể xóa chức danh";
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
        <SidebarLayout title="Quản lý chức danh" activeKey="task">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Danh sách chức danh</Text>
                    <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
                        <Plus size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Thêm chức danh</Text>
                    </TouchableOpacity>
                </View>

                {loading && positions.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#0d9488" />
                    </View>
                ) : (
                    <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                        {positions.map((position, index) => {
                            const positionId = position.id || position.positionId;
                            const positionName = position.name || position.titlename || position.Titlename || position.titleName || `Chức danh ${index + 1}`;
                            const positionDesc = position.description;

                            return (
                                <View key={positionId || index} style={styles.positionCard}>
                                    <View style={styles.positionHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.positionName}>{positionName}</Text>
                                            <Text style={styles.positionDescription}>
                                                {positionDesc || "Chưa có mô tả"}
                                            </Text>
                                        </View>
                                        <View style={styles.positionActions}>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => openEditModal(position)}
                                            >
                                                <Edit2 size={18} color="#0d9488" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => handleDelete(position)}
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

                {/* Modal Tạo/Sửa chức danh */}
                <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editMode ? "Chỉnh sửa chức danh" : "Thêm chức danh mới"}
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
                                <Text style={styles.label}>Tên chức danh *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên chức danh"
                                    placeholderTextColor="#9ca3af"
                                    value={name}
                                    onChangeText={setName}
                                />

                                <Text style={styles.label}>Mô tả</Text>
                                <TextInput
                                    style={[styles.input, styles.textArea]}
                                    placeholder="Nhập mô tả chức danh"
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
        fontSize: 19,
        fontWeight: "700",
        color: "#0f172a",
    },
    addButton: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#0d9488",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 12,
        gap: 5,
    },
    addButtonText: {
        color: "#fff",
        fontWeight: "600",
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
    positionCard: {
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
    positionHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
    },
    positionName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 6,
    },
    positionDescription: {
        fontSize: 14,
        color: "#94a3b8",
        lineHeight: 20,
    },
    positionActions: {
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

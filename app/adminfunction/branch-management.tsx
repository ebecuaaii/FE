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
import { useRouter } from "expo-router";
import { X, Plus, Edit2, Trash2, Wifi, MapPin } from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";
import { branchService, Branch, WiFiLocation } from "../../services/branchService";

export default function BranchManagementScreen() {
    const router = useRouter();
    const [branches, setBranches] = useState<Branch[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [currentBranch, setCurrentBranch] = useState<Branch | null>(null);

    // Form state
    const [name, setName] = useState("");
    const [address, setAddress] = useState("");
    const [description, setDescription] = useState("");
    const [wifiLocations, setWifiLocations] = useState<WiFiLocation[]>([]);

    useEffect(() => {
        loadBranches();
    }, []);

    const loadBranches = async () => {
        setLoading(true);
        try {
            const data = await branchService.getBranches();
            setBranches(data);
        } catch (error: any) {
            Alert.alert("Lỗi", error.response?.data?.message || "Không thể tải danh sách chi nhánh");
        } finally {
            setLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditMode(false);
        setCurrentBranch(null);
        setName("");
        setAddress("");
        setDescription("");
        setWifiLocations([]);
        setModalVisible(true);
    };

    const openEditModal = async (branch: Branch) => {
        setEditMode(true);
        setCurrentBranch(branch);
        setName(branch.name || branch.branchName || "");
        setAddress(branch.address || branch.locationAddress || "");
        setDescription(branch.description || "");

        // Load full branch details with WiFi locations
        try {
            const branchId = branch.id || branch.branchId;
            if (branchId) {
                const fullBranch = await branchService.getBranchById(branchId);
                // Map backend field names to frontend
                const mappedWifiLocations = (fullBranch.wifiLocations || []).map(wifi => ({
                    id: wifi.id,
                    ssid: wifi.ssid || wifi.wifissid || wifi.wifiSsid || "",
                    bssid: wifi.bssid || wifi.wifibssid || wifi.wifiBssid || "",
                    description: wifi.description || "",
                }));
                setWifiLocations(mappedWifiLocations);
            } else {
                setWifiLocations([]);
            }
        } catch (error) {
            setWifiLocations([]);
        }

        setModalVisible(true);
    };

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert("Lỗi", "Vui lòng nhập tên chi nhánh");
            return;
        }

        // Validate and map WiFi locations to backend format
        const validWifiLocations = wifiLocations
            .filter(wifi => wifi.ssid && wifi.bssid)
            .map(wifi => ({
                wifissid: wifi.ssid,
                wifibssid: wifi.bssid,
                locationname: wifi.ssid,
            }));

        if (wifiLocations.length > 0 && validWifiLocations.length === 0) {
            Alert.alert("Lỗi", "Vui lòng nhập đầy đủ SSID và BSSID cho WiFi location");
            return;
        }

        setLoading(true);
        try {
            const branchId = currentBranch?.id || currentBranch?.branchId;

            if (editMode && branchId) {
                const updateData = {
                    branchName: name,
                    branchCode: currentBranch?.branchCode,
                    locationAddress: address,
                    description,
                    wifiLocations: validWifiLocations,
                };
                await branchService.updateBranch(branchId, updateData);
                Alert.alert("Thành công", "Cập nhật chi nhánh thành công. Lưu ý: Backend chưa trả về WiFi locations trong danh sách.");
            } else {
                const createData = {
                    branchName: name,
                    locationAddress: address,
                    description,
                    wifiLocations: validWifiLocations,
                };
                await branchService.createBranch(createData);
                Alert.alert("Thành công", "Tạo chi nhánh thành công. Lưu ý: Backend chưa trả về WiFi locations trong danh sách.");
            }
            setModalVisible(false);
            await loadBranches();
        } catch (error: any) {
            const errorMsg = error.response?.data?.message || error.response?.data?.title || "Không thể lưu chi nhánh";
            Alert.alert("Lỗi", errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = (branch: Branch) => {
        const branchName = branch.name || branch.branchName || "chi nhánh này";
        const branchId = branch.id || branch.branchId;

        Alert.alert(
            "Xác nhận xóa",
            `Bạn có chắc muốn xóa chi nhánh "${branchName}"?`,
            [
                { text: "Hủy", style: "cancel" },
                {
                    text: "Xóa",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            if (!branchId) {
                                Alert.alert("Lỗi", "Không tìm thấy ID chi nhánh");
                                return;
                            }
                            await branchService.deleteBranch(branchId);
                            Alert.alert("Thành công", "Xóa chi nhánh thành công");
                            loadBranches();
                        } catch (error: any) {
                            Alert.alert("Lỗi", error.response?.data?.message || "Không thể xóa chi nhánh");
                        }
                    },
                },
            ]
        );
    };

    const addWifiLocation = () => {
        setWifiLocations([...wifiLocations, { ssid: "", bssid: "", description: "" }]);
    };

    const updateWifiLocation = (index: number, field: keyof WiFiLocation, value: string) => {
        const updated = [...wifiLocations];
        updated[index] = { ...updated[index], [field]: value };
        setWifiLocations(updated);
    };

    const removeWifiLocation = (index: number) => {
        setWifiLocations(wifiLocations.filter((_, i) => i !== index));
    };

    return (
        <SidebarLayout title="Quản lý chi nhánh" activeKey="task">
            <View style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Danh sách chi nhánh</Text>
                    <TouchableOpacity style={styles.addButton} onPress={openCreateModal}>
                        <Plus size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Thêm chi nhánh</Text>
                    </TouchableOpacity>
                </View>

                {loading && branches.length === 0 ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#0d9488" />
                    </View>
                ) : (
                    <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
                        {branches.map((branch, index) => {
                            const branchId = branch.id || branch.branchId;
                            const branchName = branch.name || branch.branchName || `Chi nhánh ${index + 1}`;
                            const branchAddress = branch.address || branch.locationAddress;
                            const branchDesc = branch.description;
                            const wifiLocs = branch.wifiLocations || [];

                            return (
                                <View key={branchId || index} style={styles.branchCard}>
                                    <View style={styles.branchHeader}>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.branchName}>{branchName}</Text>
                                            {branch.branchCode && (
                                                <Text style={styles.branchCode}>Mã: {branch.branchCode}</Text>
                                            )}
                                            {branchAddress && (
                                                <View style={styles.branchMeta}>
                                                    <MapPin size={14} color="#64748b" />
                                                    <Text style={styles.branchMetaText}>{branchAddress}</Text>
                                                </View>
                                            )}
                                            {wifiLocs.length > 0 && (
                                                <Text style={styles.branchCode}>
                                                    BSSID: {wifiLocs[0].bssid || wifiLocs[0].wifibssid || wifiLocs[0].wifiBssid || 'Chưa có'}
                                                </Text>
                                            )}
                                        </View>
                                        <View style={styles.branchActions}>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => openEditModal(branch)}
                                            >
                                                <Edit2 size={18} color="#0d9488" />
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.actionButton}
                                                onPress={() => handleDelete(branch)}
                                            >
                                                <Trash2 size={18} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {branchDesc && (
                                        <Text style={styles.branchDescription}>{branchDesc}</Text>
                                    )}

                                    {wifiLocs.length > 0 && (
                                        <View style={styles.wifiSection}>
                                            <View style={styles.wifiHeader}>
                                                <Wifi size={14} color="#0d9488" />
                                                <Text style={styles.wifiHeaderText}>
                                                    WiFi Locations ({wifiLocs.length})
                                                </Text>
                                            </View>
                                            {wifiLocs.map((wifi, idx) => {
                                                const ssid = wifi.ssid || wifi.wifissid || wifi.wifiSsid;
                                                const bssid = wifi.bssid || wifi.wifibssid || wifi.wifiBssid;
                                                return (
                                                    <View key={wifi.id || wifi.wifiLocationId || idx} style={styles.wifiItem}>
                                                        <Text style={styles.wifiSSID}>{ssid}</Text>
                                                        <Text style={styles.wifiBSSID}>{bssid}</Text>
                                                        {wifi.description && (
                                                            <Text style={styles.wifiDesc}>{wifi.description}</Text>
                                                        )}
                                                    </View>
                                                );
                                            })}
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </ScrollView>
                )}

                {/* Modal Tạo/Sửa chi nhánh */}
                <Modal visible={modalVisible} animationType="slide" transparent onRequestClose={() => setModalVisible(false)}>
                    <KeyboardAvoidingView
                        behavior={Platform.OS === "ios" ? "padding" : "height"}
                        style={styles.modalOverlay}
                    >
                        <View style={styles.modalContent}>
                            <View style={styles.modalHeader}>
                                <Text style={styles.modalTitle}>
                                    {editMode ? "Chỉnh sửa chi nhánh" : "Thêm chi nhánh mới"}
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
                                <Text style={styles.label}>Tên chi nhánh *</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập tên chi nhánh"
                                    placeholderTextColor="#9ca3af"
                                    value={name}
                                    onChangeText={setName}
                                />

                                <Text style={styles.label}>Địa chỉ</Text>
                                <TextInput
                                    style={styles.input}
                                    placeholder="Nhập địa chỉ"
                                    placeholderTextColor="#9ca3af"
                                    value={address}
                                    onChangeText={setAddress}
                                />

                                <View style={styles.wifiLocationSection}>
                                    <View style={styles.wifiLocationHeader}>
                                        <Text style={styles.label}>WiFi Location</Text>
                                        <TouchableOpacity style={styles.addWifiButton} onPress={addWifiLocation}>
                                            <Plus size={16} color="#0d9488" />
                                            <Text style={styles.addWifiText}>Thêm WiFi</Text>
                                        </TouchableOpacity>
                                    </View>

                                    {wifiLocations.length === 0 && (
                                        <Text style={styles.emptyWifiText}>Chưa có WiFi location. Nhấn "Thêm WiFi" để thêm.</Text>
                                    )}

                                    {wifiLocations.map((wifi, index) => (
                                        <View key={index} style={styles.wifiLocationCard}>
                                            <View style={styles.wifiLocationInputs}>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>SSID *</Text>
                                                    <TextInput
                                                        style={[styles.input, styles.wifiInput]}
                                                        placeholder="Tên WiFi (VD: HUTECH_WIFI)"
                                                        placeholderTextColor="#9ca3af"
                                                        value={wifi.ssid || ""}
                                                        onChangeText={(text) => updateWifiLocation(index, "ssid", text)}
                                                    />
                                                </View>
                                                <View style={styles.inputGroup}>
                                                    <Text style={styles.inputLabel}>BSSID (MAC Address) *</Text>
                                                    <TextInput
                                                        style={[styles.input, styles.wifiInput]}
                                                        placeholder="VD: 00:11:22:33:44:55"
                                                        placeholderTextColor="#9ca3af"
                                                        value={wifi.bssid || ""}
                                                        onChangeText={(text) => updateWifiLocation(index, "bssid", text)}
                                                    />
                                                </View>
                                            </View>
                                            <TouchableOpacity
                                                style={styles.removeWifiButton}
                                                onPress={() => removeWifiLocation(index)}
                                            >
                                                <Trash2 size={18} color="#ef4444" />
                                            </TouchableOpacity>
                                        </View>
                                    ))}
                                </View>
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
    branchCard: {
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
    branchHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: 8,
    },
    branchName: {
        fontSize: 18,
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: 4,
    },
    branchCode: {
        fontSize: 12,
        color: "#64748b",
        marginBottom: 4,
    },
    branchMeta: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    branchMetaText: {
        fontSize: 14,
        color: "#64748b",
    },
    branchActions: {
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
    branchDescription: {
        fontSize: 14,
        color: "#475569",
        marginBottom: 12,
    },
    wifiSection: {
        marginTop: 12,
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: "#e5e7eb",
    },
    wifiHeader: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
    },
    wifiHeaderText: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0d9488",
    },
    wifiItem: {
        backgroundColor: "#f0fdfa",
        padding: 10,
        borderRadius: 8,
        marginBottom: 6,
    },
    wifiSSID: {
        fontSize: 14,
        fontWeight: "600",
        color: "#0f172a",
    },
    wifiBSSID: {
        fontSize: 12,
        color: "#64748b",
        marginTop: 2,
    },
    wifiDesc: {
        fontSize: 11,
        color: "#94a3b8",
        marginTop: 2,
        fontStyle: "italic",
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
        maxHeight: "90%",
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
        height: 80,
        textAlignVertical: "top",
    },
    wifiLocationSection: {
        marginTop: 8,
    },
    wifiLocationHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 12,
    },
    addWifiButton: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    addWifiText: {
        color: "#0d9488",
        fontWeight: "600",
        fontSize: 14,
    },
    wifiLocationCard: {
        flexDirection: "row",
        gap: 12,
        marginBottom: 16,
        padding: 16,
        backgroundColor: "#f0fdfa",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#ccfbf1",
    },
    wifiLocationInputs: {
        flex: 1,
    },
    inputGroup: {
        marginBottom: 12,
    },
    inputLabel: {
        fontSize: 12,
        fontWeight: "600",
        color: "#0f172a",
        marginBottom: 6,
    },
    wifiInput: {
        marginBottom: 0,
    },
    emptyWifiText: {
        fontSize: 14,
        color: "#94a3b8",
        textAlign: "center",
        paddingVertical: 20,
        fontStyle: "italic",
    },
    removeWifiButton: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#fee2e2",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 4,
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

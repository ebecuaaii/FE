import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { CalendarPlus } from "lucide-react-native";
import SidebarLayout from "../../components/SidebarLayout";

export default function ShiftRegistrationScreen() {
    const router = useRouter();

    return (
        <SidebarLayout title="Đăng ký lịch làm việc" activeKey="task">
            <View style={styles.container}>
                <View style={styles.content}>
                    <CalendarPlus size={64} color="#0d9488" />
                    <Text style={styles.title}>Đăng ký lịch làm việc</Text>
                    <Text style={styles.description}>
                        Tính năng đăng ký ca làm việc đang được phát triển.
                    </Text>
                    <Text style={styles.description}>Bạn sẽ có thể:</Text>
                    <View style={styles.featureList}>
                        <Text style={styles.featureItem}>Xem danh sách ca có sẵn</Text>
                        <Text style={styles.featureItem}>Chọn ca và ngày muốn đăng ký</Text>
                        <Text style={styles.featureItem}>Gửi yêu cầu đến Admin Manager</Text>
                        <Text style={styles.featureItem}>Theo dõi trạng thái yêu cầu</Text>
                        <Text style={styles.featureItem}>Hủy yêu cầu đang chờ duyệt</Text>
                    </View>
                    <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                        <Text style={styles.backButtonText}>Quay lại</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SidebarLayout>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#F4F9F7" },
    content: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32 },
    title: { fontSize: 24, fontWeight: "700", color: "#0f172a", marginTop: 24, marginBottom: 12, textAlign: "center" },
    description: { fontSize: 16, color: "#64748b", textAlign: "center", lineHeight: 24, marginBottom: 8 },
    featureList: { marginTop: 16, marginBottom: 32, alignSelf: "stretch", paddingHorizontal: 32 },
    featureItem: { fontSize: 14, color: "#475569", marginBottom: 8, lineHeight: 20 },
    backButton: { paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, backgroundColor: "#0d9488" },
    backButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});

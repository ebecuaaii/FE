import React, { useState } from "react";
import { Text, TextInput, ScrollView, TouchableOpacity, StyleSheet, View } from "react-native";
import {
  Search,
  Calendar,
  CalendarPlus,
  Clock,
  Smartphone,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Bell,
  Newspaper,
  FolderCode,
  FileText,
  Wallet,
  CalendarX,
  AlertCircle,
  RefreshCw,
} from "lucide-react-native";
import { Tabs, useRouter } from "expo-router";
import SidebarLayout from "../../../components/SidebarLayout";

export default function TaskScreen() {
  const router = useRouter();
  <Tabs.Screen
    name="task"
    options={{ headerShown: true, title: "Tác vụ" }}
  />
  const [activeTab, setActiveTab] = useState("all");
  const [expanded, setExpanded] = useState({
    work: true,
    checkin: true,
    salary: true,
    request: true,
    communication: true
  });
  type ExpandKey = "work" | "checkin" | "salary" | "request" | "communication";

  const toggle = (key: ExpandKey) => {
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <SidebarLayout title="Tác vụ" activeKey="task">
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>

        {/* Search */}
        <View style={styles.searchBox}>
          <Search size={20} color="#777" />
          <TextInput placeholder="Tìm kiếm tác vụ..." style={styles.searchInput} />
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {["Tất cả", "Lịch", "Chấm công", "Lương", "Truyền thông"].map((t, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setActiveTab(t)}
              style={[styles.tab, activeTab === t && styles.tabActive]}
            >
              <Text style={[styles.tabText, activeTab === t && styles.tabTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ----- SECTION: LỊCH LÀM VIỆC ----- */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggle("work")}>
          <Text style={styles.sectionTitle}>Lịch làm việc</Text>
          {expanded.work ? <ChevronUp /> : <ChevronDown />}
        </TouchableOpacity>

        {expanded.work && (
          <View style={styles.cardRow}>
            <TaskCard
              icon={<Calendar size={32} />}
              label="Lịch làm việc chung"
              onPress={() => router.push("/function/shift-schedule?tab=assignments&readOnly=true")}
            />
            <TaskCard
              icon={<CalendarPlus size={32} />}
              label="Đăng ký lịch làm việc"
              onPress={() => router.push("/function/weekly-schedule-requests")}
            />
          </View>
        )}

        {/* ----- SECTION: CHẤM CÔNG ----- */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggle("checkin")}>
          <Text style={styles.sectionTitle}>Chấm công</Text>
          {expanded.checkin ? <ChevronUp /> : <ChevronDown />}
        </TouchableOpacity>

        {expanded.checkin && (
          <View style={styles.cardRow}>
            <TaskCard
              icon={<Clock size={32} />}
              label="Bổ sung/ Sửa chấm công"
              onPress={() => router.push("/function/attendance-supplement")}
            />
            <TaskCard icon={<Smartphone size={32} />} label="Thiết bị chấm công" />
          </View>
        )}

        {/* ----- SECTION: LƯƠNG ----- */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggle("salary")}>
          <Text style={styles.sectionTitle}>Lương</Text>
          {expanded.salary ? <ChevronUp /> : <ChevronDown />}
        </TouchableOpacity>

        {expanded.salary && (
          <View style={styles.cardRow}>
            <TaskCard
              icon={<Wallet size={32} />}
              label="Bảng lương"
              onPress={() => router.push("/function/monthly-salary")}
            />
            <TaskCard
              icon={<DollarSign size={32} />}
              label="Hiệu quả làm việc"
              onPress={() => router.push("/function/work-performance")}
            />
            <TaskCard
              icon={<FileText size={32} />}
              label="Phiếu lương"
              onPress={() => router.push("/function/payslip")}
            />
          </View>
        )}
        {/* ----- SECTION: YÊU CẦU ----- */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggle("request")}>
          <Text style={styles.sectionTitle}>Yêu cầu</Text>
          {expanded.request ? <ChevronUp /> : <ChevronDown />}
        </TouchableOpacity>

        {expanded.request && (
          <View style={styles.cardRow}>
            <TaskCard
              icon={<CalendarX size={32} />}
              label="Xin nghỉ phép"
              onPress={() => router.push("/function/leave-request")}
            />
            <TaskCard
              icon={<AlertCircle size={32} />}
              label="Xin đi trễ"
              onPress={() => router.push("/function/late-request")}
            />
            <TaskCard
              icon={<RefreshCw size={32} />}
              label="Xin đổi ca"
              onPress={() => router.push("/function/shift-swap-request")}
            />
          </View>
        )}

        {/* ----- SECTION: TRUYỀN THÔNG NỘI BỘ ----- */}
        <TouchableOpacity style={styles.sectionHeader} onPress={() => toggle("communication")}>
          <Text style={styles.sectionTitle}>Truyển thông nội bộ</Text>
          {expanded.communication ? <ChevronUp /> : <ChevronDown />}
        </TouchableOpacity>

        {expanded.communication && (
          <View style={styles.cardRow}>
            <TaskCard icon={<Newspaper size={32} />} label="Tin tức" />
            <TaskCard icon={<Bell size={32} />} label="Thông báo" />
            <TaskCard icon={<FolderCode size={32} />} label="Nội quy" />
          </View>
        )}
      </ScrollView>
    </SidebarLayout>
  );
}

// ========================= COMPONENT CARD =========================
function TaskCard({ icon, label, iconColor = "#0d9488", onPress }: { icon: any; label: string; iconColor?: string; onPress?: () => void }) {
  const coloredIcon = React.cloneElement(icon, { color: iconColor });
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      {coloredIcon}
      <Text style={styles.cardText}>{label}</Text>
    </TouchableOpacity>
  );
}

// ========================= STYLES =========================
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#F4F9F7",
  },

  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
  },
  searchInput: { marginLeft: 8, flex: 1 },

  tabs: { flexDirection: "row", marginBottom: 16, flexWrap: "wrap" },
  tab: {
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#EAEAEA",
    marginRight: 8,
    marginBottom: 8,
  },
  tabActive: { backgroundColor: "#00C5A0" },
  tabText: { color: "#444" },
  tabTextActive: { color: "#fff" },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },

  cardRow: { flexDirection: "row", gap: 12, marginBottom: 8, flexWrap: "wrap" },

  card: {
    width: "47%",
    backgroundColor: "#fff",
    paddingVertical: 24,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
  },
  cardText: { marginTop: 8, fontWeight: "500", textAlign: "center", color: "#333" },
});

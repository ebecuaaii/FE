import React, { useEffect, useState, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
    Switch,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';

const SystemSettingsScreen = () => {
    const router = useRouter();
    const authContext = useContext(AuthContext);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [settings, setSettings] = useState({
        notifications: true,
        autoApproval: false,
        emailNotifications: true,
        smsNotifications: false,
        backupEnabled: true,
        maintenanceMode: false,
    });

    const user = authContext?.user;
    const userName = user?.fullname || user?.username || 'Admin';

    const onRefresh = async () => {
        setRefreshing(true);
        // Simulate loading settings
        setTimeout(() => {
            setRefreshing(false);
        }, 1000);
    };

    const toggleSetting = (key: keyof typeof settings) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
    };

    const systemCategories = [
        {
            id: '1',
            title: 'Quản lý danh mục',
            description: 'Cấu hình chi nhánh, phòng ban, chức vụ',
            icon: 'business-outline',
            color: '#3b82f6',
            items: [
                { name: 'Chi nhánh', route: '/adminfunction/branch-management' },
                { name: 'Phòng ban', route: '/adminfunction/department-management' },
                { name: 'Chức vụ', route: '/adminfunction/position-management' },
            ]
        },
        {
            id: '2',
            title: 'Cấu hình nhân viên',
            description: 'Thiết lập quy trình nhân viên',
            icon: 'people-outline',
            color: '#14b8a6',
            items: [
                { name: 'Mời nhân viên', route: '/adminfunction/employee-invitation' },
                { name: 'Danh sách nhân viên', route: '/adminfunction/employee-list' },
            ]
        },
        {
            id: '3',
            title: 'Cấu hình lương thưởng',
            description: 'Thiết lập hệ thống lương và thưởng phạt',
            icon: 'card-outline',
            color: '#f59e0b',
            items: [
                { name: 'Quản lý thưởng phạt', route: '/adminfunction/reward-penalty-manage' },
                { name: 'Tạo thưởng', route: '/adminfunction/create-reward' },
                { name: 'Tạo phạt', route: '/adminfunction/create-penalty' },
            ]
        },
        {
            id: '4',
            title: 'Cấu hình ca làm việc',
            description: 'Thiết lập lịch và ca làm việc',
            icon: 'time-outline',
            color: '#8b5cf6',
            items: [
                { name: 'Lịch làm việc', route: '/function/weekly-schedule' },
                { name: 'Quản lý ca làm', route: '/function/shift-schedule' },
            ]
        },
    ];

    const systemInfo = [
        { label: 'Phiên bản hệ thống', value: 'v2.1.0' },
        { label: 'Cơ sở dữ liệu', value: 'PostgreSQL 14.2' },
        { label: 'Máy chủ', value: 'AWS EC2' },
        { label: 'Cập nhật cuối', value: '15/12/2024' },
    ];

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.scrollContent}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#ec4899']}
                />
            }
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Cài đặt hệ thống</Text>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
                        <Ionicons name="refresh" size={20} color="#ec4899" />
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.content}>
                {/* Admin Info */}
                <View style={styles.adminInfoCard}>
                    <View style={styles.adminHeader}>
                        <View style={styles.adminAvatar}>
                            <Text style={styles.adminAvatarText}>
                                {userName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <View style={styles.adminDetails}>
                            <Text style={styles.adminName}>{userName}</Text>
                            <Text style={styles.adminRole}>Quản trị viên hệ thống</Text>
                        </View>
                        <View style={styles.adminBadge}>
                            <Ionicons name="shield-checkmark" size={16} color="#16a34a" />
                            <Text style={styles.adminBadgeText}>Admin</Text>
                        </View>
                    </View>
                </View>

                {/* System Settings */}
                <Text style={styles.sectionTitle}>Cài đặt chung</Text>
                <View style={styles.settingsCard}>
                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="notifications-outline" size={20} color="#6b7280" />
                            <Text style={styles.settingLabel}>Thông báo hệ thống</Text>
                        </View>
                        <Switch
                            value={settings.notifications}
                            onValueChange={() => toggleSetting('notifications')}
                            trackColor={{ false: '#f3f4f6', true: '#dcfce7' }}
                            thumbColor={settings.notifications ? '#16a34a' : '#9ca3af'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="checkmark-circle-outline" size={20} color="#6b7280" />
                            <Text style={styles.settingLabel}>Tự động duyệt đơn</Text>
                        </View>
                        <Switch
                            value={settings.autoApproval}
                            onValueChange={() => toggleSetting('autoApproval')}
                            trackColor={{ false: '#f3f4f6', true: '#dcfce7' }}
                            thumbColor={settings.autoApproval ? '#16a34a' : '#9ca3af'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="mail-outline" size={20} color="#6b7280" />
                            <Text style={styles.settingLabel}>Thông báo email</Text>
                        </View>
                        <Switch
                            value={settings.emailNotifications}
                            onValueChange={() => toggleSetting('emailNotifications')}
                            trackColor={{ false: '#f3f4f6', true: '#dcfce7' }}
                            thumbColor={settings.emailNotifications ? '#16a34a' : '#9ca3af'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="chatbubble-outline" size={20} color="#6b7280" />
                            <Text style={styles.settingLabel}>Thông báo SMS</Text>
                        </View>
                        <Switch
                            value={settings.smsNotifications}
                            onValueChange={() => toggleSetting('smsNotifications')}
                            trackColor={{ false: '#f3f4f6', true: '#dcfce7' }}
                            thumbColor={settings.smsNotifications ? '#16a34a' : '#9ca3af'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="cloud-upload-outline" size={20} color="#6b7280" />
                            <Text style={styles.settingLabel}>Sao lưu tự động</Text>
                        </View>
                        <Switch
                            value={settings.backupEnabled}
                            onValueChange={() => toggleSetting('backupEnabled')}
                            trackColor={{ false: '#f3f4f6', true: '#dcfce7' }}
                            thumbColor={settings.backupEnabled ? '#16a34a' : '#9ca3af'}
                        />
                    </View>

                    <View style={styles.settingItem}>
                        <View style={styles.settingLeft}>
                            <Ionicons name="construct-outline" size={20} color="#6b7280" />
                            <Text style={styles.settingLabel}>Chế độ bảo trì</Text>
                        </View>
                        <Switch
                            value={settings.maintenanceMode}
                            onValueChange={() => toggleSetting('maintenanceMode')}
                            trackColor={{ false: '#f3f4f6', true: '#fecaca' }}
                            thumbColor={settings.maintenanceMode ? '#dc2626' : '#9ca3af'}
                        />
                    </View>
                </View>

                {/* System Categories */}
                <Text style={styles.sectionTitle}>Cấu hình hệ thống</Text>
                <View style={styles.categoriesGrid}>
                    {systemCategories.map((category) => (
                        <View key={category.id} style={styles.categoryCard}>
                            <View style={styles.categoryHeader}>
                                <View style={[styles.categoryIcon, { backgroundColor: category.color + '20' }]}>
                                    <Ionicons name={category.icon as any} size={24} color={category.color} />
                                </View>
                                <Text style={styles.categoryTitle}>{category.title}</Text>
                            </View>
                            <Text style={styles.categoryDescription}>{category.description}</Text>
                            <View style={styles.categoryItems}>
                                {category.items.map((item, index) => (
                                    <TouchableOpacity
                                        key={index}
                                        style={styles.categoryItem}
                                        onPress={() => router.push(item.route as any)}
                                    >
                                        <Text style={styles.categoryItemText}>{item.name}</Text>
                                        <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    ))}
                </View>

                {/* System Information */}
                <Text style={styles.sectionTitle}>Thông tin hệ thống</Text>
                <View style={styles.systemInfoCard}>
                    <View style={styles.systemInfoHeader}>
                        <Ionicons name="information-circle-outline" size={24} color="#3b82f6" />
                        <Text style={styles.systemInfoTitle}>Chi tiết hệ thống</Text>
                    </View>
                    <View style={styles.systemInfoContent}>
                        {systemInfo.map((info, index) => (
                            <View key={index} style={styles.systemInfoRow}>
                                <Text style={styles.systemInfoLabel}>{info.label}:</Text>
                                <Text style={styles.systemInfoValue}>{info.value}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                    <TouchableOpacity
                        style={[styles.actionButton, styles.backupButton]}
                        onPress={() => Alert.alert('Sao lưu', 'Tính năng sao lưu đang phát triển')}
                    >
                        <Ionicons name="cloud-upload" size={20} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Sao lưu ngay</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionButton, styles.updateButton]}
                        onPress={() => Alert.alert('Cập nhật', 'Hệ thống đã được cập nhật lên phiên bản mới nhất')}
                    >
                        <Ionicons name="refresh-circle" size={20} color="#ffffff" />
                        <Text style={styles.actionButtonText}>Kiểm tra cập nhật</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    backButton: {
        padding: 8,
        marginLeft: -8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 16,
    },
    headerRight: {
        width: 40,
        alignItems: 'flex-end',
    },
    refreshButton: {
        padding: 8,
    },
    content: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
        marginTop: 8,
    },
    adminInfoCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    adminHeader: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    adminAvatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#ec4899',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    adminAvatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    adminDetails: {
        flex: 1,
    },
    adminName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    adminRole: {
        fontSize: 14,
        color: '#6b7280',
    },
    adminBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#dcfce7',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 12,
        gap: 4,
    },
    adminBadgeText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#16a34a',
    },
    settingsCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    settingItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f3f4f6',
    },
    settingLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    settingLabel: {
        fontSize: 16,
        color: '#1f2937',
        marginLeft: 12,
    },
    categoriesGrid: {
        gap: 16,
        marginBottom: 24,
    },
    categoryCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    categoryHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    categoryIcon: {
        width: 40,
        height: 40,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    categoryDescription: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 16,
    },
    categoryItems: {
        gap: 8,
    },
    categoryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
    },
    categoryItemText: {
        fontSize: 14,
        color: '#374151',
        fontWeight: '500',
    },
    systemInfoCard: {
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 12,
        marginBottom: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    systemInfoHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    systemInfoTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
        marginLeft: 12,
    },
    systemInfoContent: {
        gap: 12,
    },
    systemInfoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    systemInfoLabel: {
        fontSize: 14,
        color: '#6b7280',
    },
    systemInfoValue: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1f2937',
    },
    actionButtons: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        paddingVertical: 14,
        borderRadius: 12,
    },
    backupButton: {
        backgroundColor: '#3b82f6',
    },
    updateButton: {
        backgroundColor: '#16a34a',
    },
    actionButtonText: {
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
    },
});

export default SystemSettingsScreen;
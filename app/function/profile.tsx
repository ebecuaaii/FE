import React, { useContext, useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Mail, Phone, Briefcase, Building2, Shield, Camera, Calendar } from 'lucide-react-native';
import { AuthContext } from '../../context/AuthContext';
import { router } from 'expo-router';

export default function ProfileScreen() {
    const { user } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    const profileSections = [
        {
            title: 'Thông tin cơ bản',
            items: [
                { icon: <User size={20} color="#3b82f6" />, label: 'Họ và tên', value: user?.fullname || 'Chưa cập nhật' },
                { icon: <Mail size={20} color="#3b82f6" />, label: 'Email', value: user?.email || 'Chưa cập nhật' },
                { icon: <Phone size={20} color="#3b82f6" />, label: 'Số điện thoại', value: user?.phone || 'Chưa cập nhật' },
            ],
        },
        {
            title: 'Thông tin công việc',
            items: [
                { icon: <Briefcase size={20} color="#10b981" />, label: 'Chức vụ', value: user?.position || 'Chưa cập nhật' },
                { icon: <Building2 size={20} color="#10b981" />, label: 'Phòng ban', value: user?.department || 'Chưa cập nhật' },
                { icon: <Shield size={20} color="#10b981" />, label: 'Vai trò', value: user?.role || 'employee' },
            ],
        },
    ];

    const handleFaceRegistration = () => {
        router.push('/function/face-registration' as any);
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <LinearGradient
                colors={['#0d9488', '#14b8a6', '#5eead4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.header}
            >
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                            {user?.fullname?.charAt(0).toUpperCase() || user?.username?.charAt(0).toUpperCase() || 'U'}
                        </Text>
                    </View>
                </View>
                <Text style={styles.userName}>{user?.fullname || user?.username || 'User'}</Text>
                <Text style={styles.userId}>ID: {user?.id || 'N/A'}</Text>
            </LinearGradient>

            {/* Đăng ký khuôn mặt */}
            <View style={styles.content}>
                <TouchableOpacity
                    style={styles.faceRegistrationCard}
                    onPress={handleFaceRegistration}
                >
                    <View style={styles.faceIconContainer}>
                        <Camera size={32} color="#3b82f6" />
                    </View>
                    <View style={styles.faceTextContainer}>
                        <Text style={styles.faceTitle}>Đăng ký khuôn mặt</Text>
                        <Text style={styles.faceSubtitle}>
                            Đăng ký khuôn mặt để sử dụng tính năng chấm công tự động
                        </Text>
                    </View>
                    <Text style={styles.faceArrow}>›</Text>
                </TouchableOpacity>

                {/* Thông tin chi tiết */}
                {profileSections.map((section, index) => (
                    <View key={index} style={styles.section}>
                        <Text style={styles.sectionTitle}>{section.title}</Text>
                        <View style={styles.sectionCard}>
                            {section.items.map((item, itemIndex) => (
                                <View key={itemIndex}>
                                    <View style={styles.infoRow}>
                                        <View style={styles.infoIconContainer}>
                                            {item.icon}
                                        </View>
                                        <View style={styles.infoTextContainer}>
                                            <Text style={styles.infoLabel}>{item.label}</Text>
                                            <Text style={styles.infoValue}>{item.value}</Text>
                                        </View>
                                    </View>
                                    {itemIndex < section.items.length - 1 && (
                                        <View style={styles.divider} />
                                    )}
                                </View>
                            ))}
                        </View>
                    </View>
                ))}

                {/* Nút chỉnh sửa */}
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => Alert.alert('Thông báo', 'Chức năng chỉnh sửa thông tin đang phát triển')}
                >
                    <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        paddingTop: 40,
        paddingBottom: 32,
        alignItems: 'center',
    },
    avatarContainer: {
        marginBottom: 16,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#0d9488',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    userId: {
        fontSize: 14,
        color: '#ffffff',
        opacity: 0.9,
    },
    content: {
        padding: 20,
    },
    faceRegistrationCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#eff6ff',
        padding: 16,
        borderRadius: 16,
        marginBottom: 24,
        borderWidth: 2,
        borderColor: '#3b82f6',
    },
    faceIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    faceTextContainer: {
        flex: 1,
    },
    faceTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    faceSubtitle: {
        fontSize: 13,
        color: '#6b7280',
        lineHeight: 18,
    },
    faceArrow: {
        fontSize: 28,
        color: '#3b82f6',
        fontWeight: '300',
    },
    section: {
        marginBottom: 24,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 12,
    },
    sectionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
    },
    infoIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#f8fafc',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    infoTextContainer: {
        flex: 1,
    },
    infoLabel: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 16,
        fontWeight: '500',
        color: '#1f2937',
    },
    divider: {
        height: 1,
        backgroundColor: '#e5e7eb',
        marginVertical: 4,
    },
    editButton: {
        backgroundColor: '#3b82f6',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 20,
    },
    editButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
});

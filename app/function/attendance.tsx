import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { Clock, CheckCircle, History, LogIn, LogOut, Briefcase } from 'lucide-react-native';
import { attendanceService, TodayAttendance, TodayShift } from '../../services/attendanceService';
import { router } from 'expo-router';

export default function AttendanceScreen() {
    const [todayStatus, setTodayStatus] = useState<TodayAttendance | null>(null);
    const [todayShift, setTodayShift] = useState<TodayShift | null>(null);
    const [loadingStatus, setLoadingStatus] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoadingStatus(true);
            const [status, shift] = await Promise.all([
                attendanceService.getTodayStatus(),
                attendanceService.getTodayShift(),
            ]);
            setTodayStatus(status);
            setTodayShift(shift);
        } catch (error: any) {
            console.error('Lỗi khi tải dữ liệu:', error);
        } finally {
            setLoadingStatus(false);
        }
    };



    if (loadingStatus) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0d9488" />
                <Text style={styles.loadingText}>Đang tải...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Chấm công</Text>
                <Text style={styles.date}>{new Date().toLocaleDateString('vi-VN', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'numeric',
                    year: 'numeric'
                })}</Text>
            </View>

            {/* Ca làm việc hôm nay */}
            {todayShift ? (
                <View style={styles.shiftCard}>
                    <View style={styles.shiftHeader}>
                        <Briefcase size={20} color="#0d9488" />
                        <Text style={styles.shiftHeaderText}>Ca làm việc hôm nay</Text>
                    </View>
                    <View style={styles.shiftContent}>
                        <Text style={styles.shiftName}>{todayShift.shiftName}</Text>
                        <View style={styles.shiftTimeRow}>
                            <Clock size={16} color="#f59e0b" />
                            <Text style={styles.shiftTime}>
                                {todayShift.shiftStartTime.substring(0, 5)} - {todayShift.shiftEndTime.substring(0, 5)}
                            </Text>
                        </View>
                    </View>
                </View>
            ) : (
                <View style={styles.noShiftCard}>
                    <Briefcase size={24} color="#9ca3af" />
                    <Text style={styles.noShiftText}>Chưa có ca làm việc hôm nay</Text>
                </View>
            )}

            {/* Trạng thái hôm nay */}
            <View style={styles.statusCard}>
                <View style={styles.statusRow}>
                    <View style={styles.statusItem}>
                        <View style={[
                            styles.statusIconContainer,
                            todayStatus?.hasCheckedIn && styles.statusIconActive
                        ]}>
                            <CheckCircle
                                size={28}
                                color={todayStatus?.hasCheckedIn ? '#0d9488' : '#d1d5db'}
                            />
                        </View>
                        <Text style={styles.statusLabel}>Check-in</Text>
                        <Text style={[
                            styles.statusTime,
                            todayStatus?.hasCheckedIn && styles.statusTimeActive
                        ]}>
                            {todayStatus?.checkInTime
                                ? new Date(todayStatus.checkInTime).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                : '--:--'}
                        </Text>
                    </View>

                    <View style={styles.divider} />

                    <View style={styles.statusItem}>
                        <View style={[
                            styles.statusIconContainer,
                            todayStatus?.hasCheckedOut && styles.statusIconActiveOut
                        ]}>
                            <CheckCircle
                                size={28}
                                color={todayStatus?.hasCheckedOut ? '#f59e0b' : '#d1d5db'}
                            />
                        </View>
                        <Text style={styles.statusLabel}>Check-out</Text>
                        <Text style={[
                            styles.statusTime,
                            todayStatus?.hasCheckedOut && styles.statusTimeActiveOut
                        ]}>
                            {todayStatus?.checkOutTime
                                ? new Date(todayStatus.checkOutTime).toLocaleTimeString('vi-VN', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })
                                : '--:--'}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Nút chấm công */}
            <View style={styles.actionsContainer}>
                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        styles.checkInButton,
                        todayStatus?.hasCheckedIn && styles.checkInButtonDisabled
                    ]}
                    onPress={() => router.push('/function/checkin' as any)}
                    disabled={todayStatus?.hasCheckedIn}
                >
                    <Clock size={22} color="#fff" />
                    <Text style={styles.actionButtonText}>
                        {todayStatus?.hasCheckedIn ? 'Đã Check-in' : 'Check-in'}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[
                        styles.actionButton,
                        styles.checkOutButton,
                        (!todayStatus?.hasCheckedIn || todayStatus?.hasCheckedOut) && styles.checkOutButtonDisabled
                    ]}
                    onPress={() => router.push('/function/checkout' as any)}
                    disabled={!todayStatus?.hasCheckedIn || todayStatus?.hasCheckedOut}
                >
                    <Clock size={22} color="#fff" />
                    <Text style={styles.actionButtonText}>
                        {todayStatus?.hasCheckedOut ? 'Đã Check-out' : 'Check-out'}
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Nút xem lịch sử */}
            <TouchableOpacity
                style={styles.historyButton}
                onPress={() => router.push('/function/attendance-history' as any)}
            >
                <History size={20} color="#6b7280" />
                <Text style={styles.historyButtonText}>Xem lịch sử chấm công</Text>
            </TouchableOpacity>

            <View style={styles.bottomSpace} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 16,
        color: '#6b7280',
    },
    header: {
        padding: 20,
        paddingTop: 45,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    date: {
        fontSize: 13,
        color: '#6b7280',
    },
    shiftCard: {
        marginHorizontal: 20,
        marginTop: 20,
        padding: 16,
        backgroundColor: '#f0fdfa',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#0d9488',
    },
    shiftHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    shiftHeaderText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#0d9488',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    shiftContent: {
        gap: 8,
    },
    shiftName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    shiftTimeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    shiftTime: {
        fontSize: 15,
        fontWeight: '600',
        color: '#f59e0b',
    },
    noShiftCard: {
        marginHorizontal: 20,
        marginTop: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
        alignItems: 'center',
        gap: 8,
    },
    noShiftText: {
        fontSize: 14,
        color: '#9ca3af',
    },
    statusCard: {
        margin: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    statusRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    statusItem: {
        alignItems: 'center',
        flex: 1,
    },
    statusIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    statusIconActive: {
        backgroundColor: '#d1fae5',
    },
    statusIconActiveOut: {
        backgroundColor: '#fef3c7',
    },
    statusLabel: {
        fontSize: 13,
        color: '#6b7280',
        marginBottom: 4,
    },
    statusTime: {
        fontSize: 16,
        fontWeight: '600',
        color: '#9ca3af',
    },
    statusTimeActive: {
        color: '#0d9488',
    },
    statusTimeActiveOut: {
        color: '#f59e0b',
    },
    divider: {
        width: 1,
        height: 80,
        backgroundColor: '#e5e7eb',
    },
    actionsContainer: {
        paddingHorizontal: 20,
        gap: 12,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 18,
        borderRadius: 12,
        gap: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    checkInButton: {
        backgroundColor: '#0d9488',
    },
    checkInButtonDisabled: {
        backgroundColor: '#d1d5db',
        opacity: 0.6,
    },
    checkOutButton: {
        backgroundColor: '#d1d5db',
    },
    checkOutButtonDisabled: {
        backgroundColor: '#d1d5db',
        opacity: 0.6,
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    historyButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 20,
        marginTop: 24,
        padding: 14,
        backgroundColor: '#fff',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        gap: 8,
    },
    historyButtonText: {
        fontSize: 15,
        fontWeight: '500',
        color: '#6b7280',
    },
    bottomSpace: {
        height: 20,
    },
});

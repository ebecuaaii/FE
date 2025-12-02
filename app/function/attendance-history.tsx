import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, Clock, CheckCircle, XCircle } from 'lucide-react-native';
import { attendanceService, AttendanceRecord } from '../../services/attendanceService';

export default function AttendanceHistoryScreen() {
    const [loading, setLoading] = useState(true);
    const [records, setRecords] = useState<AttendanceRecord[]>([]);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    useEffect(() => {
        loadHistory();
    }, [selectedMonth]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const year = selectedMonth.getFullYear();
            const month = selectedMonth.getMonth();

            const fromDate = new Date(year, month, 1).toISOString().split('T')[0];
            const toDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

            const data = await attendanceService.getAttendanceHistory(fromDate, toDate);
            setRecords(data);
        } catch (error) {
            console.error('Lỗi khi tải lịch sử:', error);
        } finally {
            setLoading(false);
        }
    };

    const changeMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedMonth);
        if (direction === 'prev') {
            newDate.setMonth(newDate.getMonth() - 1);
        } else {
            newDate.setMonth(newDate.getMonth() + 1);
        }
        setSelectedMonth(newDate);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'present': return '#10b981';
            case 'late': return '#f59e0b';
            case 'early_leave': return '#f59e0b';
            case 'absent': return '#ef4444';
            default: return '#6b7280';
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'present': return 'Đúng giờ';
            case 'late': return 'Đi muộn';
            case 'early_leave': return 'Về sớm';
            case 'absent': return 'Vắng mặt';
            default: return status;
        }
    };

    return (
        <View style={styles.container}>
            {/* Header với chọn tháng */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.monthButton}
                    onPress={() => changeMonth('prev')}
                >
                    <Text style={styles.monthButtonText}>←</Text>
                </TouchableOpacity>

                <View style={styles.monthDisplay}>
                    <Calendar size={20} color="#3b82f6" />
                    <Text style={styles.monthText}>
                        Tháng {selectedMonth.getMonth() + 1}/{selectedMonth.getFullYear()}
                    </Text>
                </View>

                <TouchableOpacity
                    style={styles.monthButton}
                    onPress={() => changeMonth('next')}
                >
                    <Text style={styles.monthButtonText}>→</Text>
                </TouchableOpacity>
            </View>

            {/* Thống kê */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <CheckCircle size={24} color="#10b981" />
                    <Text style={styles.statNumber}>
                        {records.filter(r => r.status === 'present').length}
                    </Text>
                    <Text style={styles.statLabel}>Đúng giờ</Text>
                </View>

                <View style={styles.statCard}>
                    <Clock size={24} color="#f59e0b" />
                    <Text style={styles.statNumber}>
                        {records.filter(r => r.status === 'late' || r.status === 'early_leave').length}
                    </Text>
                    <Text style={styles.statLabel}>Muộn/Sớm</Text>
                </View>

                <View style={styles.statCard}>
                    <XCircle size={24} color="#ef4444" />
                    <Text style={styles.statNumber}>
                        {records.filter(r => r.status === 'absent').length}
                    </Text>
                    <Text style={styles.statLabel}>Vắng</Text>
                </View>
            </View>

            {/* Danh sách lịch sử */}
            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : (
                <ScrollView style={styles.recordsList}>
                    {records.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Calendar size={48} color="#d1d5db" />
                            <Text style={styles.emptyText}>Chưa có dữ liệu chấm công</Text>
                        </View>
                    ) : (
                        records.map((record) => (
                            <View key={record.id} style={styles.recordCard}>
                                <View style={styles.recordHeader}>
                                    <Text style={styles.recordDate}>
                                        {new Date(record.date).toLocaleDateString('vi-VN', {
                                            weekday: 'short',
                                            day: '2-digit',
                                            month: '2-digit',
                                        })}
                                    </Text>
                                    <View
                                        style={[
                                            styles.statusBadge,
                                            { backgroundColor: getStatusColor(record.status) + '20' }
                                        ]}
                                    >
                                        <Text
                                            style={[
                                                styles.statusText,
                                                { color: getStatusColor(record.status) }
                                            ]}
                                        >
                                            {getStatusText(record.status)}
                                        </Text>
                                    </View>
                                </View>

                                <View style={styles.recordTimes}>
                                    <View style={styles.timeItem}>
                                        <Text style={styles.timeLabel}>Vào:</Text>
                                        <Text style={styles.timeValue}>
                                            {record.checkInTime
                                                ? new Date(record.checkInTime).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : '--:--'}
                                        </Text>
                                    </View>

                                    <View style={styles.timeItem}>
                                        <Text style={styles.timeLabel}>Ra:</Text>
                                        <Text style={styles.timeValue}>
                                            {record.checkOutTime
                                                ? new Date(record.checkOutTime).toLocaleTimeString('vi-VN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })
                                                : '--:--'}
                                        </Text>
                                    </View>

                                    {record.workingHours !== undefined && (
                                        <View style={styles.timeItem}>
                                            <Text style={styles.timeLabel}>Giờ làm:</Text>
                                            <Text style={styles.timeValue}>
                                                {record.workingHours.toFixed(1)}h
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                        ))
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    monthButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
    },
    monthButtonText: {
        fontSize: 20,
        color: '#374151',
    },
    monthDisplay: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    monthText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1f2937',
        marginTop: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginTop: 4,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    recordsList: {
        flex: 1,
        padding: 16,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 48,
    },
    emptyText: {
        marginTop: 16,
        fontSize: 16,
        color: '#9ca3af',
    },
    recordCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    recordHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    recordDate: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    recordTimes: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    timeItem: {
        flex: 1,
    },
    timeLabel: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    timeValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
    },
});

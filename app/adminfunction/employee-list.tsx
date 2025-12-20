import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import employeeService, { Employee } from '../../services/employeeService';

const EmployeeListScreen = () => {
    const router = useRouter();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            setLoading(true);
            const data = await employeeService.getEmployees();
            setEmployees(data);
        } catch (error) {
            console.error('Error fetching employees:', error);
            Alert.alert('Lỗi', 'Không thể tải danh sách nhân viên');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchEmployees();
        setRefreshing(false);
    };

    const renderEmployee = ({ item }: { item: Employee }) => (
        <TouchableOpacity style={styles.employeeCard}>
            <View style={styles.employeeInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {(item.fullname || item.username || 'N')?.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <View style={styles.employeeDetails}>
                    <Text style={styles.employeeName}>
                        {item.fullname || item.username || 'Không có tên'}
                    </Text>
                    <Text style={styles.employeeEmail}>{item.email || 'Không có email'}</Text>
                    <View style={styles.employeeMeta}>
                        {item.branchName && (
                            <Text style={styles.branch}>{item.branchName}</Text>
                        )}
                        {item.departmentName && (
                            <Text style={styles.department}>{item.departmentName}</Text>
                        )}
                        {item.roleName && (
                            <Text style={styles.role}>{item.roleName}</Text>
                        )}
                    </View>
                </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#14b8a6" />
                <Text style={styles.loadingText}>Đang tải danh sách nhân viên...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => router.back()}
                >
                    <Ionicons name="arrow-back" size={24} color="#1f2937" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Danh sách nhân viên</Text>
                <View style={styles.headerRight}>
                    <Text style={styles.employeeCount}>
                        {employees.length} nhân viên
                    </Text>
                </View>
            </View>

            {/* Employee List */}
            <FlatList
                data={employees}
                renderItem={renderEmployee}
                keyExtractor={(item) => item.id?.toString() || item.employeeId?.toString() || Math.random().toString()}
                contentContainerStyle={styles.listContainer}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#0d9488']}
                    />
                }
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="people-outline" size={64} color="#9ca3af" />
                        <Text style={styles.emptyText}>Không có nhân viên nào</Text>
                    </View>
                }
            />
        </View>
    );
};

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
        marginTop: 16,
        fontSize: 16,
        color: '#6b7280',
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
        alignItems: 'flex-end',
    },
    employeeCount: {
        fontSize: 14,
        color: '#0d9488',
        fontWeight: '600',
    },
    listContainer: {
        padding: 20,
    },
    employeeCard: {
        backgroundColor: '#ffffff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    employeeInfo: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#0d9488',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    employeeDetails: {
        flex: 1,
    },
    employeeName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 4,
    },
    employeeEmail: {
        fontSize: 14,
        color: '#6b7280',
        marginBottom: 6,
    },
    employeeMeta: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
    },
    branch: {
        fontSize: 12,
        color: '#8b5cf6',
        backgroundColor: '#f3e8ff',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    department: {
        fontSize: 12,
        color: '#14b8a6',
        backgroundColor: '#dcfce7',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    role: {
        fontSize: 12,
        color: '#3b82f6',
        backgroundColor: '#dbeafe',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 8,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyText: {
        fontSize: 16,
        color: '#9ca3af',
        marginTop: 16,
    },
});

export default EmployeeListScreen;
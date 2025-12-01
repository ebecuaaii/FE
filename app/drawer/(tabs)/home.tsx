import React, { useEffect, useState, useContext } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from "react-native";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { AuthContext } from "../../../context/AuthContext";
import SidebarLayout from "../../../components/SidebarLayout";

type QuickActionType = {
    id: string;
    icon: string;
    title: string;
    subtitle: string;
    color: string;
};

const HomeScreen = () => {
    const authContext = useContext(AuthContext);
    const router = useRouter();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        setGreeting(getGreeting());
    }, []);

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Chào buổi sáng';
        if (hour < 18) return 'Chào buổi chiều';
        return 'Chào buổi tối';
    };

    const user = authContext?.user;
    const userName = user?.fullname || user?.username || 'User';
    const userDepartment = user?.department || 'Nhân viên';
    const userPosition = user?.position || '';

    const handleActionPress = (actionId: string) => {
        // TODO: Tạo các trang này sau
        switch (actionId) {
            case '1': // Chấm công
                router.push('/function/attendance');
                //alert('Chức năng chấm công đang phát triển');
                break;
            case '2': // Lịch làm việc
                router.push('/function/shift-schedule?tab=assignments&readOnly=true');
                break;
            case '3': // Đăng ký nghỉ
                // router.push('/leave-request');
                alert('Chức năng đăng ký nghỉ đang phát triển');
                break;
            case '4': // Kỳ lương
                // router.push('/salary');
                alert('Chức năng kỳ lương đang phát triển');
                break;
            case '5': // Bảng tin
                // router.push('/news');
                alert('Chức năng bảng tin đang phát triển');
                break;
        }
    };

    const quickActions: QuickActionType[] = [
        {
            id: '1',
            icon: '👤',
            title: 'Chấm công',
            subtitle: 'để bắt đầu công việc thôi nào!',
            color: '#0d9488',
        },
        {
            id: '2',
            icon: '💼',
            title: 'Lịch làm việc',
            subtitle: 'Xem lịch làm việc chung',
            color: '#0ea5e9',
        },
        {
            id: '3',
            icon: '🏖️',
            title: 'Đăng ký nghỉ',
            subtitle: 'Nghỉ ngày/ Nghỉ ca',
            color: '#f59e0b',
        },
        {
            id: '4',
            icon: '💰',
            title: 'Kỳ lương',
            subtitle: '01/11 - 30/11',
            color: '#10b981',
        },
        {
            id: '5',
            icon: '📰',
            title: 'Bảng tin',
            subtitle: 'Đang có 1 tin tức',
            color: '#6366f1',
        },
    ];

    return (
        <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
            {/* Header with Gradient Background */}
            <LinearGradient
                colors={['#0d9488', '#14b8a6', '#5eead4']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.headerWrapper}
            >
                <View style={styles.headerGradient}>
                    <View style={styles.headerCard}>
                        <View style={styles.headerContent}>
                            <View style={styles.headerLeft}>
                                <Text style={styles.greetingText}>{greeting}</Text>
                                <View style={styles.userInfo}>
                                    <Text style={styles.userName}>{userName}</Text>
                                    {userPosition && (
                                        <View style={styles.badge}>
                                            <Text style={styles.badgeText}>{userPosition}</Text>
                                        </View>
                                    )}
                                </View>
                                {userDepartment && (
                                    <Text style={styles.departmentText}>{userDepartment}</Text>
                                )}
                                <Text style={styles.motivationText}>Chúc bạn một ngày làm việc hiệu quả</Text>
                            </View>
                            <View style={styles.headerRight}>
                                <View style={styles.giftIcon}>
                                    <Text style={styles.giftEmoji}>🎁</Text>
                                </View>
                                <View style={styles.avatarContainer}>
                                    <View style={styles.avatar}>
                                        <Text style={styles.avatarText}>
                                            {userName.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Main Content */}
            <View style={styles.content}>
                {/* Quick Actions Grid */}
                <View style={styles.quickActionsGrid}>
                    {quickActions.map((action, index) => (
                        <TouchableOpacity
                            key={action.id}
                            style={[
                                styles.actionCard,
                                index === 0 && styles.actionCardFeatured,
                            ]}
                            onPress={() => handleActionPress(action.id)}
                        >
                            {index === 0 ? (
                                <LinearGradient
                                    colors={['#0d9488', '#14b8a6']}
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.featuredCardGradient}
                                >
                                    <View style={styles.iconContainer}>
                                        <Text style={styles.actionIconFeatured}>{action.icon}</Text>
                                    </View>
                                    <Text style={styles.actionTitleFeatured}>{action.title}</Text>
                                    <Text style={styles.actionSubtitleFeatured}>{action.subtitle}</Text>
                                </LinearGradient>
                            ) : (
                                <View style={styles.regularCard}>
                                    <View style={[styles.iconContainer, { backgroundColor: action.color + '20' }]}>
                                        <Text style={styles.actionIcon}>{action.icon}</Text>
                                    </View>
                                    <Text style={styles.actionTitle}>{action.title}</Text>
                                    <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                                    {action.id === '4' && (
                                        <Text style={styles.salaryAmount}>2,052,190 đ</Text>
                                    )}
                                </View>
                            )}
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tasks Section */}
                <View style={styles.tasksSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Công việc cần làm</Text>
                        <TouchableOpacity onPress={() => alert('Chức năng lịch sử đang phát triển')}>
                            <Text style={styles.seeAllText}>Xem lịch sử</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.emptyState}>
                        <Image
                            source={{ uri: 'https://cdn-icons-png.flaticon.com/512/4076/4076549.png' }}
                            style={styles.emptyStateImage}
                        />
                        <Text style={styles.emptyStateText}>Không có công việc nào</Text>
                        <Text style={styles.emptyStateSubtext}>Bạn đã hoàn thành tất cả công việc!</Text>
                    </View>
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
    headerWrapper: {
        paddingTop: 60,
        paddingBottom: 24,
        paddingHorizontal: 20,
    },
    headerGradient: {
        justifyContent: 'center',
    },
    headerCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    headerLeft: {
        flex: 1,
    },
    greetingText: {
        fontSize: 16,
        color: '#ffffff',
        opacity: 0.9,
        marginBottom: 8,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
        marginRight: 10,
    },
    badge: {
        backgroundColor: 'rgba(255, 255, 255, 0.25)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    badgeText: {
        color: '#ffffff',
        fontSize: 12,
        fontWeight: '600',
    },
    departmentText: {
        fontSize: 14,
        color: '#ffffff',
        opacity: 0.85,
        marginBottom: 4,
    },
    motivationText: {
        fontSize: 14,
        color: '#ffffff',
        opacity: 0.9,
    },
    headerRight: {
        alignItems: 'center',
    },
    giftIcon: {
        marginBottom: 10,
    },
    giftEmoji: {
        fontSize: 32,
    },
    avatarContainer: {
        position: 'relative',
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#ffffff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.5)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#0d9488',
    },
    content: {
        padding: 20,
    },
    quickActionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 24,
    },
    actionCard: {
        width: '48%',
        borderRadius: 16,
        overflow: 'hidden',
    },
    actionCardFeatured: {
        width: '100%',
    },
    featuredCardGradient: {
        padding: 20,
        minHeight: 140,
    },
    regularCard: {
        backgroundColor: '#ffffff',
        padding: 16,
        minHeight: 160,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    iconContainer: {
        width: 50,
        height: 50,
        borderRadius: 25,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    actionIcon: {
        fontSize: 24,
    },
    actionIconFeatured: {
        fontSize: 32,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 4,
    },
    actionTitleFeatured: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 4,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#6b7280',
        lineHeight: 18,
    },
    actionSubtitleFeatured: {
        fontSize: 14,
        color: '#ffffff',
        opacity: 0.9,
    },
    salaryAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#10b981',
        marginTop: 8,
    },
    tasksSection: {
        marginTop: 8,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    seeAllText: {
        fontSize: 14,
        color: '#0d9488',
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: 40,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    emptyStateImage: {
        width: 120,
        height: 120,
        marginBottom: 16,
        opacity: 0.6,
    },
    emptyStateText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#6b7280',
        marginBottom: 4,
    },
    emptyStateSubtext: {
        fontSize: 14,
        color: '#9ca3af',
    },
});

export default HomeScreen;
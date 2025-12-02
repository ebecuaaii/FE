import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView, Platform } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { X, Clock, MapPin, Wifi } from 'lucide-react-native';
import { attendanceService, TodayShift } from '../../services/attendanceService';
import { router } from 'expo-router';
import * as Network from 'expo-network';

interface WifiInfo {
    ssid: string;
    bssid: string;
}

export default function CheckInScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [loading, setLoading] = useState(false);
    const [shift, setShift] = useState<TodayShift | null>(null);
    const [loadingShift, setLoadingShift] = useState(true);
    const [wifiInfo, setWifiInfo] = useState<WifiInfo | null>(null);
    const [loadingWifi, setLoadingWifi] = useState(true);
    const cameraRef = useRef<CameraView>(null);

    useEffect(() => {
        loadTodayShift();
        loadWifiInfo();
    }, []);

    const loadTodayShift = async () => {
        try {
            setLoadingShift(true);
            const shiftData = await attendanceService.getTodayShift();
            setShift(shiftData);
        } catch (error) {
            console.error('Lỗi khi tải ca làm việc:', error);
        } finally {
            setLoadingShift(false);
        }
    };

    const loadWifiInfo = async () => {
        try {
            setLoadingWifi(true);

            // Kiểm tra xem có kết nối WiFi không
            const networkState = await Network.getNetworkStateAsync();

            if (networkState.type === Network.NetworkStateType.WIFI) {
                // Lấy thông tin WiFi (chỉ hoạt động trên Android)
                if (Platform.OS === 'android') {
                    const ipAddress = await Network.getIpAddressAsync();

                    // Trên Android, cần permission để lấy SSID và BSSID
                    // Tạm thời hiển thị IP, sau này có thể dùng native module để lấy SSID/BSSID
                    setWifiInfo({
                        ssid: 'WiFi Connected',
                        bssid: ipAddress || 'Unknown',
                    });
                } else {
                    // iOS không cho phép lấy thông tin WiFi dễ dàng
                    setWifiInfo({
                        ssid: 'WiFi Connected',
                        bssid: 'iOS Restricted',
                    });
                }
            } else {
                setWifiInfo(null);
            }
        } catch (error) {
            console.error('Lỗi khi lấy thông tin WiFi:', error);
            setWifiInfo(null);
        } finally {
            setLoadingWifi(false);
        }
    };

    const handleCheckIn = async () => {
        if (!cameraRef.current) return;

        // Kiểm tra WiFi trước khi check-in
        if (!wifiInfo) {
            Alert.alert(
                'Cần kết nối WiFi',
                'Bạn cần kết nối WiFi của công ty để chấm công',
                [{ text: 'OK' }]
            );
            return;
        }

        try {
            setLoading(true);
            const photo = await cameraRef.current.takePictureAsync({
                quality: 0.8,
                base64: false,
            });

            if (!photo?.uri) {
                Alert.alert('Lỗi', 'Không thể chụp ảnh');
                return;
            }

            // Gửi thông tin WiFi lên server để validate
            await attendanceService.checkIn(photo.uri, wifiInfo || undefined);

            Alert.alert(
                'Thành công',
                `Check-in thành công lúc ${new Date().toLocaleTimeString('vi-VN')}`,
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';
            Alert.alert('Lỗi', message);
        } finally {
            setLoading(false);
        }
    };

    const requestCameraPermission = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền camera để check-in');
                return false;
            }
        }
        return true;
    };

    useEffect(() => {
        requestCameraPermission();
    }, []);

    if (!permission?.granted) {
        return (
            <View style={styles.permissionContainer}>
                <Text style={styles.permissionText}>Cần quyền truy cập camera</Text>
                <TouchableOpacity style={styles.permissionButton} onPress={requestCameraPermission}>
                    <Text style={styles.permissionButtonText}>Cấp quyền</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Camera */}
            <View style={styles.cameraContainer}>
                <CameraView ref={cameraRef} style={styles.camera} facing="front">
                    <View style={styles.cameraOverlay}>
                        {/* Close button */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => router.back()}
                        >
                            <X size={24} color="#fff" />
                        </TouchableOpacity>

                        {/* Face frame */}
                        <View style={styles.faceFrameContainer}>
                            <View style={styles.faceFrame}>
                                <View style={[styles.corner, styles.topLeft]} />
                                <View style={[styles.corner, styles.topRight]} />
                                <View style={[styles.corner, styles.bottomLeft]} />
                                <View style={[styles.corner, styles.bottomRight]} />
                            </View>
                        </View>

                        <Text style={styles.instruction}>
                            Đưa khuôn mặt của bạn vào khung hình và{'\n'}bấm "Đồng ý"
                        </Text>
                    </View>
                </CameraView>
            </View>

            {/* Bottom sheet */}
            <View style={styles.bottomSheet}>
                <Text style={styles.title}>Check-in ca làm việc</Text>

                {/* Shift info */}
                {loadingShift ? (
                    <View style={styles.shiftLoading}>
                        <ActivityIndicator color="#0d9488" />
                    </View>
                ) : shift ? (
                    <View style={styles.shiftCard}>
                        <View style={styles.shiftRow}>
                            <Clock size={20} color="#0d9488" />
                            <Text style={styles.shiftText}>
                                {shift.shiftName} ({shift.shiftStartTime.substring(0, 5)} - {shift.shiftEndTime.substring(0, 5)})
                            </Text>
                        </View>
                    </View>
                ) : (
                    <View style={styles.noShiftCard}>
                        <Text style={styles.noShiftText}>Chọn ca làm việc</Text>
                    </View>
                )}

                {/* WiFi info */}
                <View style={[
                    styles.wifiCard,
                    !wifiInfo && styles.wifiCardError
                ]}>
                    <View style={styles.wifiHeader}>
                        <Wifi size={18} color={wifiInfo ? '#0d9488' : '#ef4444'} />
                        <Text style={[
                            styles.wifiHeaderText,
                            !wifiInfo && styles.wifiHeaderTextError
                        ]}>
                            {wifiInfo ? 'Kết nối WiFi' : 'Chưa kết nối WiFi'}
                        </Text>
                    </View>

                    {loadingWifi ? (
                        <ActivityIndicator size="small" color="#0d9488" style={{ marginTop: 8 }} />
                    ) : wifiInfo ? (
                        <>
                            <View style={styles.wifiRow}>
                                <Text style={styles.wifiLabel}>Tên WiFi</Text>
                                <Text style={styles.wifiValue}>{wifiInfo.ssid}</Text>
                            </View>
                            <View style={styles.wifiRow}>
                                <Text style={styles.wifiLabel}>Địa chỉ IP</Text>
                                <Text style={styles.wifiValue}>{wifiInfo.bssid}</Text>
                            </View>
                        </>
                    ) : (
                        <Text style={styles.wifiErrorText}>
                            Vui lòng kết nối WiFi công ty để chấm công
                        </Text>
                    )}
                </View>

                {/* Check-in button */}
                <TouchableOpacity
                    style={[styles.checkInButton, loading && styles.checkInButtonDisabled]}
                    onPress={handleCheckIn}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.checkInButtonText}>Đồng ý</Text>
                    )}
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    permissionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8fafc',
        padding: 20,
    },
    permissionText: {
        fontSize: 16,
        color: '#6b7280',
        marginBottom: 16,
        textAlign: 'center',
    },
    permissionButton: {
        backgroundColor: '#0d9488',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    permissionButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    cameraContainer: {
        flex: 1,
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    closeButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    faceFrameContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: 100,
    },
    faceFrame: {
        width: 250,
        height: 300,
        position: 'relative',
    },
    corner: {
        position: 'absolute',
        width: 40,
        height: 40,
        borderColor: '#fff',
    },
    topLeft: {
        top: 0,
        left: 0,
        borderTopWidth: 4,
        borderLeftWidth: 4,
        borderTopLeftRadius: 8,
    },
    topRight: {
        top: 0,
        right: 0,
        borderTopWidth: 4,
        borderRightWidth: 4,
        borderTopRightRadius: 8,
    },
    bottomLeft: {
        bottom: 0,
        left: 0,
        borderBottomWidth: 4,
        borderLeftWidth: 4,
        borderBottomLeftRadius: 8,
    },
    bottomRight: {
        bottom: 0,
        right: 0,
        borderBottomWidth: 4,
        borderRightWidth: 4,
        borderBottomRightRadius: 8,
    },
    instruction: {
        position: 'absolute',
        bottom: 420,
        left: 0,
        right: 0,
        textAlign: 'center',
        color: '#fff',
        fontSize: 15,
        lineHeight: 22,
        paddingHorizontal: 20,
    },
    bottomSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: 20,
        paddingBottom: 40,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: 16,
    },
    shiftLoading: {
        padding: 20,
        alignItems: 'center',
    },
    shiftCard: {
        backgroundColor: '#f0fdfa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#0d9488',
    },
    shiftRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    shiftText: {
        fontSize: 15,
        color: '#1f2937',
        fontWeight: '500',
    },
    noShiftCard: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderStyle: 'dashed',
    },
    noShiftText: {
        fontSize: 15,
        color: '#6b7280',
        textAlign: 'center',
    },
    wifiCard: {
        backgroundColor: '#f0fdfa',
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#0d9488',
    },
    wifiCardError: {
        backgroundColor: '#fef2f2',
        borderColor: '#ef4444',
    },
    wifiHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    wifiHeaderText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#0d9488',
    },
    wifiHeaderTextError: {
        color: '#ef4444',
    },
    wifiRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 6,
    },
    wifiLabel: {
        fontSize: 13,
        color: '#6b7280',
    },
    wifiValue: {
        fontSize: 14,
        color: '#1f2937',
        fontWeight: '500',
    },
    wifiErrorText: {
        fontSize: 13,
        color: '#ef4444',
        lineHeight: 18,
    },
    checkInButton: {
        backgroundColor: '#0d9488',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    checkInButtonDisabled: {
        opacity: 0.6,
    },
    checkInButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});

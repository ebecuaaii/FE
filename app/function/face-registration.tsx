import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Image } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Camera, XCircle, UserCheck, CheckCircle } from 'lucide-react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { attendanceService } from '../../services/attendanceService';
import { router } from 'expo-router';

export default function FaceRegistrationScreen() {
    const [permission, requestPermission] = useCameraPermissions();
    const [cameraActive, setCameraActive] = useState(false);
    const [loading, setLoading] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const cameraRef = useRef<CameraView>(null);

    const handleTakePicture = async () => {
        if (!cameraRef.current) return;

        try {
            setLoading(true);
            const photo = await cameraRef.current.takePictureAsync({
                quality: 1.0,
                base64: false,
                skipProcessing: false,
            });

            if (!photo?.uri) {
                Alert.alert('Lỗi', 'Không thể chụp ảnh');
                setLoading(false);
                return;
            }

            // Xử lý ảnh: flip horizontal (vì camera front bị mirror) và resize
            const manipulatedImage = await ImageManipulator.manipulateAsync(
                photo.uri,
                [
                    { flip: ImageManipulator.FlipType.Horizontal }, // Lật ảnh về đúng hướng
                    { resize: { width: 1024 } }, // Resize để giảm kích thước nhưng vẫn đủ rõ
                ],
                {
                    compress: 0.9, // Nén nhẹ để giữ chất lượng
                    format: ImageManipulator.SaveFormat.JPEG,
                }
            );

            console.log('📸 Image processed:', {
                original: photo.uri,
                processed: manipulatedImage.uri,
                width: manipulatedImage.width,
                height: manipulatedImage.height,
            });

            // Hiển thị preview ảnh đã xử lý
            setCapturedImage(manipulatedImage.uri);
            setLoading(false);
        } catch (error: any) {
            const message = error?.message || 'Có lỗi xảy ra khi chụp ảnh';
            Alert.alert('Lỗi', message);
            setLoading(false);
        }
    };

    const handleConfirmImage = async () => {
        if (!capturedImage) return;

        try {
            setLoading(true);
            await attendanceService.registerFace(capturedImage);

            Alert.alert(
                'Thành công',
                'Đăng ký khuôn mặt thành công! Bạn có thể bắt đầu chấm công.',
                [
                    {
                        text: 'OK',
                        onPress: () => router.back(),
                    },
                ]
            );
        } catch (error: any) {
            const message = error?.response?.data?.message || error?.message || 'Có lỗi xảy ra';

            // Hiển thị thông báo chi tiết hơn
            Alert.alert(
                'Không thể đăng ký khuôn mặt',
                message,
                [
                    {
                        text: 'Chụp lại',
                        onPress: () => {
                            setCapturedImage(null);
                        },
                    },
                    {
                        text: 'Hủy',
                        style: 'cancel',
                        onPress: () => {
                            setCapturedImage(null);
                            setCameraActive(false);
                        },
                    },
                ]
            );
        } finally {
            setLoading(false);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
    };

    const openCamera = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert('Cần quyền truy cập', 'Vui lòng cấp quyền camera để đăng ký khuôn mặt');
                return;
            }
        }
        setCameraActive(true);
    };

    if (cameraActive) {
        // Hiển thị preview ảnh đã chụp
        if (capturedImage) {
            return (
                <View style={styles.cameraContainer}>
                    <Image source={{ uri: capturedImage }} style={styles.previewImage} />
                    <View style={styles.previewOverlay}>
                        <Text style={styles.previewTitle}>Xem lại ảnh</Text>
                        <Text style={styles.previewInstruction}>
                            Kiểm tra khuôn mặt có rõ ràng không?{'\n'}
                            Ánh sáng có đủ không?
                        </Text>
                    </View>

                    <View style={styles.cameraControls}>
                        <TouchableOpacity
                            style={[styles.cameraButton, styles.cancelButton]}
                            onPress={handleRetake}
                            disabled={loading}
                        >
                            <XCircle size={24} color="#fff" />
                            <Text style={styles.cameraButtonText}>Chụp lại</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.cameraButton, styles.confirmButton]}
                            onPress={handleConfirmImage}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <>
                                    <CheckCircle size={24} color="#fff" />
                                    <Text style={styles.cameraButtonText}>Xác nhận</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        // Hiển thị camera
        return (
            <View style={styles.cameraContainer}>
                <CameraView ref={cameraRef} style={styles.camera} facing="front">
                    <View style={styles.cameraOverlay}>
                        <Text style={styles.cameraTitle}>Đăng ký khuôn mặt</Text>
                        <View style={styles.faceFrame} />
                        <Text style={styles.cameraInstruction}>
                            Đặt khuôn mặt vào khung hình{'\n'}
                            Đảm bảo ánh sáng đủ và nhìn thẳng vào camera{'\n'}
                            Không đeo khẩu trang hoặc kính đen
                        </Text>
                    </View>
                </CameraView>

                <View style={styles.cameraControls}>
                    <TouchableOpacity
                        style={[styles.cameraButton, styles.cancelButton]}
                        onPress={() => setCameraActive(false)}
                        disabled={loading}
                    >
                        <XCircle size={24} color="#fff" />
                        <Text style={styles.cameraButtonText}>Hủy</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.cameraButton, styles.captureButton]}
                        onPress={handleTakePicture}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <>
                                <Camera size={24} color="#fff" />
                                <Text style={styles.cameraButtonText}>Chụp</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <View style={styles.iconContainer}>
                    <UserCheck size={80} color="#0d9488" />
                </View>

                <Text style={styles.title}>Đăng ký khuôn mặt</Text>
                <Text style={styles.description}>
                    Để sử dụng tính năng chấm công tự động, bạn cần đăng ký khuôn mặt của mình.
                </Text>

                <View style={styles.instructionsCard}>
                    <Text style={styles.instructionsTitle}>Hướng dẫn:</Text>
                    <View style={styles.instructionItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.instructionText}>
                            Tìm nơi có ánh sáng đủ, tránh ngược sáng
                        </Text>
                    </View>
                    <View style={styles.instructionItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.instructionText}>
                            Nhìn thẳng vào camera, không đeo khẩu trang hoặc kính đen
                        </Text>
                    </View>
                    <View style={styles.instructionItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.instructionText}>
                            Đặt khuôn mặt vào giữa khung hình
                        </Text>
                    </View>
                    <View style={styles.instructionItem}>
                        <Text style={styles.bullet}>•</Text>
                        <Text style={styles.instructionText}>
                            Giữ yên và chụp ảnh rõ nét
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.startButton} onPress={openCamera}>
                    <Camera size={24} color="#fff" />
                    <Text style={styles.startButtonText}>Bắt đầu đăng ký</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.skipButton} onPress={() => router.back()}>
                    <Text style={styles.skipButtonText}>Để sau</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8fafc',
    },
    content: {
        flex: 1,
        padding: 24,
        justifyContent: 'center',
    },
    iconContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1f2937',
        textAlign: 'center',
        marginBottom: 12,
    },
    description: {
        fontSize: 16,
        color: '#6b7280',
        textAlign: 'center',
        lineHeight: 24,
        marginBottom: 32,
    },
    instructionsCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 32,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    instructionsTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1f2937',
        marginBottom: 16,
    },
    instructionItem: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    bullet: {
        fontSize: 16,
        color: '#0d9488',
        marginRight: 12,
        fontWeight: 'bold',
    },
    instructionText: {
        flex: 1,
        fontSize: 15,
        color: '#4b5563',
        lineHeight: 22,
    },
    startButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0d9488',
        padding: 16,
        borderRadius: 12,
        gap: 8,
        marginBottom: 12,
    },
    startButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    skipButton: {
        padding: 12,
        alignItems: 'center',
    },
    skipButtonText: {
        fontSize: 15,
        color: '#6b7280',
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: '#000',
    },
    camera: {
        flex: 1,
    },
    cameraOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    cameraTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 32,
    },
    faceFrame: {
        width: 250,
        height: 300,
        borderWidth: 3,
        borderColor: '#0d9488',
        borderRadius: 150,
        backgroundColor: 'transparent',
    },
    cameraInstruction: {
        marginTop: 32,
        fontSize: 16,
        color: '#fff',
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 24,
        lineHeight: 24,
    },
    cameraControls: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.8)',
    },
    cameraButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
        borderRadius: 12,
        gap: 8,
        minWidth: 120,
    },
    cancelButton: {
        backgroundColor: '#6b7280',
    },
    captureButton: {
        backgroundColor: '#0d9488',
    },
    cameraButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
    },
    previewImage: {
        flex: 1,
        width: '100%',
    },
    previewOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: 24,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    previewTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginBottom: 8,
    },
    previewInstruction: {
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
        lineHeight: 24,
    },
    confirmButton: {
        backgroundColor: '#10b981',
    },
});

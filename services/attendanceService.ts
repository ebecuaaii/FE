import api from '../api/axiosClient';

export interface AttendanceRecord {
    id: string;
    date: string;
    checkInTime?: string;
    checkOutTime?: string;
    status: 'present' | 'absent' | 'late' | 'early_leave';
    workingHours?: number;
}

export interface TodayAttendance {
    hasCheckedIn: boolean;
    hasCheckedOut: boolean;
    checkInTime?: string;
    checkOutTime?: string;
    date: string;
}

export interface TodayShift {
    id: number;
    shiftId: number;
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
    shiftDate: string;
    status: string;
}

export interface TodayShiftResponse {
    hasShift: boolean;
    shift?: TodayShift;
}

export const attendanceService = {
    // Đăng ký khuôn mặt lần đầu
    async registerFace(imageUri: string): Promise<any> {
        try {
            const formData = new FormData();

            // Đảm bảo format đúng cho server
            const filename = `face_${Date.now()}.jpg`;

            formData.append('image', {
                uri: imageUri,
                name: filename,
                type: 'image/jpeg',
            } as any);

            console.log('📸 Sending face registration:', {
                uri: imageUri,
                filename,
                type: 'image/jpeg'
            });

            const response = await api.post('/api/Attendance/register-face', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Accept': 'application/json',
                },
                transformRequest: (data) => data,
                timeout: 30000, // Tăng timeout lên 30s
            });

            console.log('✅ Face registration success:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ Face registration error:', {
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                data: error?.response?.data,
                message: error?.message,
                config: {
                    url: error?.config?.url,
                    method: error?.config?.method,
                },
            });
            throw error;
        }
    },

    // Check-in với thông tin WiFi
    async checkIn(imageUri: string, wifiInfo?: { ssid: string; bssid: string }): Promise<any> {
        const formData = new FormData();

        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('image', {
            uri: imageUri,
            name: `checkin.${fileType}`,
            type: `image/${fileType}`,
        } as any);

        // Thêm thông tin WiFi nếu có
        if (wifiInfo) {
            formData.append('wifiSSID', wifiInfo.ssid);
            formData.append('wifiBSSID', wifiInfo.bssid);
        }

        const response = await api.post('/api/Attendance/checkin', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
            },
            transformRequest: (data) => data,
        });
        return response.data;
    },

    // Check-out với thông tin WiFi
    async checkOut(imageUri: string, wifiInfo?: { ssid: string; bssid: string }): Promise<any> {
        const formData = new FormData();

        const uriParts = imageUri.split('.');
        const fileType = uriParts[uriParts.length - 1];

        formData.append('image', {
            uri: imageUri,
            name: `checkout.${fileType}`,
            type: `image/${fileType}`,
        } as any);

        // Thêm thông tin WiFi nếu có
        if (wifiInfo) {
            formData.append('wifiSSID', wifiInfo.ssid);
            formData.append('wifiBSSID', wifiInfo.bssid);
        }

        const response = await api.post('/api/Attendance/checkout', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                'Accept': 'application/json',
            },
            transformRequest: (data) => data,
        });
        return response.data;
    },

    // Xem trạng thái hôm nay
    async getTodayStatus(): Promise<TodayAttendance> {
        const response = await api.get('/api/Attendance/today');
        return response.data;
    },

    // Xem lịch sử chấm công
    async getAttendanceHistory(fromDate: string, toDate: string): Promise<AttendanceRecord[]> {
        const response = await api.get('/api/Attendance/my-attendance', {
            params: { fromDate, toDate },
        });
        return response.data;
    },

    // Lấy ca làm việc hôm nay
    async getTodayShift(): Promise<TodayShift | null> {
        try {
            const response = await api.get<TodayShiftResponse>('/api/Shifts/my-shift-today');
            if (response.data.hasShift && response.data.shift) {
                return response.data.shift;
            }
            return null;
        } catch (error) {
            console.log('No shift today or error:', error);
            return null;
        }
    },
};

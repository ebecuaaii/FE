import api from "../api/axiosClient";

export interface Branch {
    id: number;
    name: string;
}

export interface Shift {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
}

export interface AttendanceSupplement {
    id: number;
    userId: number;
    userName: string;
    branchId: number;
    branchName: string;
    date: string;
    shiftId: number;
    shiftName: string;
    checkInTime: string;
    checkOutTime: string;
    note: string;
    status: "Pending" | "Approved" | "Rejected";
    reviewedBy?: number;
    reviewedByName?: string;
    reviewedAt?: string;
    reviewNote?: string;
    createdAt: string;
}

export interface CreateAttendanceSupplementDto {
    branchId: number;
    date: string;
    shiftId: number;
    checkInTime: string;
    checkOutTime: string;
    note: string;
}

const attendanceSupplementService = {
    // Lấy danh sách chi nhánh
    getBranches: async () => {
        const response = await api.get<Branch[]>("/api/Branches");
        return response.data;
    },

    // Lấy danh sách ca làm việc
    getShifts: async () => {
        const response = await api.get<Shift[]>("/api/Shifts");
        return response.data;
    },

    // Tạo yêu cầu bổ sung chấm công
    create: async (data: CreateAttendanceSupplementDto) => {
        const response = await api.post<AttendanceSupplement>("/api/AttendanceSupplement", data);
        return response.data;
    },

    // Xem yêu cầu của mình
    getMy: async () => {
        const response = await api.get<AttendanceSupplement[]>("/api/AttendanceSupplement/my");
        return response.data;
    },

    // Xóa yêu cầu
    delete: async (id: number) => {
        await api.delete(`/api/AttendanceSupplement/${id}`);
    },
};

export default attendanceSupplementService;

import api from "../api/axiosClient";

export interface LeaveRequest {
    id: number;
    userId: number;
    userName: string;
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
    reviewedBy?: number;
    reviewedByName?: string;
    reviewedAt?: string;
    reviewNote?: string;
    createdAt: string;
}

export interface CreateLeaveRequestDto {
    leaveType: string;
    startDate: string;
    endDate: string;
    reason: string;
}

export interface ReviewLeaveRequestDto {
    status: "Approved" | "Rejected";
    reviewNote?: string;
}

const leaveRequestService = {
    // Tạo phiếu xin nghỉ
    create: async (data: CreateLeaveRequestDto) => {
        const response = await api.post<LeaveRequest>("/api/LeaveRequest", data);
        return response.data;
    },

    // Xem phiếu của mình
    getMy: async () => {
        const response = await api.get<LeaveRequest[]>("/api/LeaveRequest/my");
        return response.data;
    },

    // Xem phiếu chờ duyệt (Admin/Manager)
    getPending: async () => {
        const response = await api.get<LeaveRequest[]>("/api/LeaveRequest/pending");
        return response.data;
    },

    // Xem tất cả phiếu (Admin/Manager)
    getAll: async () => {
        const response = await api.get<LeaveRequest[]>("/api/LeaveRequest/all");
        return response.data;
    },

    // Duyệt/Từ chối (Admin/Manager)
    review: async (id: number, data: ReviewLeaveRequestDto) => {
        const response = await api.put(`/api/LeaveRequest/${id}/review`, data);
        return response.data;
    },

    // Hủy phiếu
    delete: async (id: number) => {
        await api.delete(`/api/LeaveRequest/${id}`);
    },
};

export default leaveRequestService;

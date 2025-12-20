import api from "../api/axiosClient";

export interface ShiftRequest {
    id: number;
    userId: number;
    userName: string;
    currentShiftId: number;
    currentShiftName: string;
    currentShiftDate: string;
    requestedShiftId: number;
    requestedShiftName: string;
    requestedShiftDate: string;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
    reviewedBy?: number;
    reviewedByName?: string;
    reviewedAt?: string;
    reviewNote?: string;
    createdAt: string;
}

export interface CreateShiftRequestDto {
    currentShiftId: number;
    requestedShiftId: number;
    reason: string;
}

export interface ReviewShiftRequestDto {
    status: "Approved" | "Rejected";
    reviewNote?: string;
}

const shiftRequestService = {
    // Tạo phiếu xin đổi ca
    create: async (data: CreateShiftRequestDto) => {
        const response = await api.post<ShiftRequest>("/api/ShiftRequest", data);
        return response.data;
    },

    // Xem phiếu của mình
    getMy: async () => {
        const response = await api.get<ShiftRequest[]>("/api/ShiftRequest/my");
        return response.data;
    },

    // Xem phiếu chờ duyệt (Admin/Manager)
    getPending: async () => {
        const response = await api.get<ShiftRequest[]>("/api/ShiftRequest/pending");
        return response.data;
    },

    // Xem tất cả phiếu (Admin/Manager)
    getAll: async () => {
        const response = await api.get<ShiftRequest[]>("/api/ShiftRequest/all");
        return response.data;
    },

    // Duyệt/Từ chối (Admin/Manager)
    review: async (id: number, data: ReviewShiftRequestDto) => {
        const response = await api.put(`/api/ShiftRequest/${id}/review`, data);
        return response.data;
    },

    // Hủy phiếu
    delete: async (id: number) => {
        await api.delete(`/api/ShiftRequest/${id}`);
    },
};

export default shiftRequestService;

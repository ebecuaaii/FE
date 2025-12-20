import api from "../api/axiosClient";

export interface LateRequest {
    id: number;
    userId: number;
    userName: string;
    date: string;
    expectedArrivalTime: string;
    reason: string;
    status: "Pending" | "Approved" | "Rejected";
    reviewedBy?: number;
    reviewedByName?: string;
    reviewedAt?: string;
    reviewNote?: string;
    createdAt: string;
}

export interface CreateLateRequestDto {
    date: string;
    expectedArrivalTime: string;
    reason: string;
}

export interface ReviewLateRequestDto {
    status: "Approved" | "Rejected";
    reviewNote?: string;
}

const lateRequestService = {
    // Tạo phiếu xin đi trễ
    create: async (data: CreateLateRequestDto) => {
        const response = await api.post<LateRequest>("/api/LateRequest", data);
        return response.data;
    },

    // Xem phiếu của mình
    getMy: async () => {
        const response = await api.get<LateRequest[]>("/api/LateRequest/my");
        return response.data;
    },

    // Xem phiếu chờ duyệt (Admin/Manager)
    getPending: async () => {
        const response = await api.get<LateRequest[]>("/api/LateRequest/pending");
        return response.data;
    },

    // Xem tất cả phiếu (Admin/Manager)
    getAll: async () => {
        const response = await api.get<LateRequest[]>("/api/LateRequest/all");
        return response.data;
    },

    // Duyệt/Từ chối (Admin/Manager)
    review: async (id: number, data: ReviewLateRequestDto) => {
        const response = await api.put(`/api/LateRequest/${id}/review`, data);
        return response.data;
    },

    // Hủy phiếu
    delete: async (id: number) => {
        await api.delete(`/api/LateRequest/${id}`);
    },
};

export default lateRequestService;

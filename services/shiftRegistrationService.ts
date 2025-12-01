import api from "../api/axiosClient";

// ========================= TYPES =========================
export type ShiftRegistration = {
    id: number;
    userId: number;
    userName?: string;
    fullName?: string;
    shiftId: number;
    shiftName?: string;
    shiftStartTime?: string;
    shiftEndTime?: string;
    requestedDate: string;
    reason?: string;
    status: "pending" | "approved" | "rejected";
    reviewedBy?: number;
    reviewedByName?: string;
    reviewNote?: string;
    createdAt?: string;
    reviewedAt?: string;
};

export type CreateRegistrationRequest = {
    shiftId: number;
    requestedDate: string;
    reason?: string;
};

export type ReviewRegistrationRequest = {
    registrationId: number;
    status: "approved" | "rejected";
    reviewNote?: string;
};

// ========================= NORMALIZERS =========================
const normalizeRegistration = (item: any): ShiftRegistration => {
    return {
        id: item?.id ?? 0,
        userId: item?.userId ?? 0,
        userName: item?.userName,
        fullName: item?.fullName,
        shiftId: item?.shiftId ?? 0,
        shiftName: item?.shiftName,
        shiftStartTime: item?.shiftStartTime,
        shiftEndTime: item?.shiftEndTime,
        requestedDate: item?.requestedDate ?? "",
        reason: item?.reason,
        status: item?.status ?? "pending",
        reviewedBy: item?.reviewedBy,
        reviewedByName: item?.reviewedByName,
        reviewNote: item?.reviewNote,
        createdAt: item?.createdAt,
        reviewedAt: item?.reviewedAt,
    };
};

const asArray = (payload: any): any[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.items)) return payload.items;
    if (Array.isArray(payload?.result)) return payload.result;
    return [];
};

// ========================= SERVICE =========================
export const shiftRegistrationService = {
    // POST /api/ShiftRegistrations - Tạo yêu cầu đăng ký ca (Employee)
    async createRegistration(data: CreateRegistrationRequest): Promise<ShiftRegistration> {
        const response = await api.post("/api/ShiftRegistrations", data);
        return normalizeRegistration(response.data);
    },

    // GET /api/ShiftRegistrations - Xem yêu cầu của mình (Employee)
    async getMyRegistrations(): Promise<ShiftRegistration[]> {
        const response = await api.get("/api/ShiftRegistrations");
        return asArray(response.data).map(normalizeRegistration);
    },

    // GET /api/ShiftRegistrations/{id} - Xem chi tiết yêu cầu
    async getRegistrationById(id: number): Promise<ShiftRegistration> {
        const response = await api.get(`/api/ShiftRegistrations/${id}`);
        return normalizeRegistration(response.data);
    },

    // DELETE /api/ShiftRegistrations/{id} - Hủy yêu cầu đang chờ (Employee)
    async deleteRegistration(id: number): Promise<void> {
        await api.delete(`/api/ShiftRegistrations/${id}`);
    },

    // GET /api/ShiftRegistrations/pending - Xem tất cả yêu cầu chờ duyệt (Admin/Manager)
    async getPendingRegistrations(): Promise<ShiftRegistration[]> {
        const response = await api.get("/api/ShiftRegistrations/pending");
        return asArray(response.data).map(normalizeRegistration);
    },

    // GET /api/ShiftRegistrations - Xem tất cả yêu cầu (Admin/Manager)
    async getAllRegistrations(): Promise<ShiftRegistration[]> {
        const response = await api.get("/api/ShiftRegistrations");
        return asArray(response.data).map(normalizeRegistration);
    },

    // POST /api/ShiftRegistrations/review - Duyệt/Từ chối yêu cầu (Admin/Manager)
    async reviewRegistration(data: ReviewRegistrationRequest): Promise<ShiftRegistration> {
        const response = await api.post("/api/ShiftRegistrations/review", data);
        return normalizeRegistration(response.data);
    },
};

export default shiftRegistrationService;

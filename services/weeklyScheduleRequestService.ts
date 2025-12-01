import api from "../api/axiosClient";

// ========================= TYPES =========================
export type WeeklyScheduleRequest = {
    id: number;
    userId: number;
    userName?: string;
    fullName?: string;
    shiftId: number;
    shiftName?: string;
    shiftStartTime?: string;
    shiftEndTime?: string;
    requestedDate: string;
    status?: string;
    note?: string;
    createdAt?: string;
};

export type CreateWeeklyScheduleRequest = {
    shiftId: number;
    requestedDate: string;
    note?: string;
};

// ========================= NORMALIZERS =========================
const normalizeRequest = (item: any): WeeklyScheduleRequest => {
    // Try different possible field names from backend
    const requestedDate =
        item?.requestedDate ||
        item?.RequestedDate ||
        item?.weekStartDate ||  // Backend trả về field này
        item?.WeekStartDate ||
        item?.date ||
        item?.Date ||
        "";
    const shiftId = item?.shiftId || item?.ShiftId || 0;

    // Try to get user name from various possible fields
    const fullName =
        item?.fullName ||
        item?.FullName ||
        item?.employeeName ||
        item?.EmployeeName ||
        item?.name ||
        item?.Name ||
        item?.user?.fullName ||
        item?.User?.FullName ||
        item?.user?.name ||
        item?.User?.Name;

    const userName =
        item?.userName ||
        item?.UserName ||
        item?.username ||
        item?.Username ||
        item?.user?.userName ||
        item?.User?.UserName;



    return {
        id: item?.id ?? item?.Id ?? 0,
        userId: item?.userId ?? item?.UserId ?? 0,
        userName: userName,
        fullName: fullName,
        shiftId: shiftId,
        shiftName: item?.shiftName ?? item?.ShiftName,
        shiftStartTime: item?.shiftStartTime ?? item?.ShiftStartTime,
        shiftEndTime: item?.shiftEndTime ?? item?.ShiftEndTime,
        requestedDate: requestedDate,
        status: item?.status ?? item?.Status,
        note: item?.note ?? item?.Note,
        createdAt: item?.createdAt ?? item?.CreatedAt,
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
export const weeklyScheduleRequestService = {
    // GET /api/WeeklyScheduleRequests - Lấy tất cả yêu cầu (Admin) hoặc của mình (Employee)
    async getRequests(): Promise<WeeklyScheduleRequest[]> {
        const response = await api.get("/api/WeeklyScheduleRequests");
        return asArray(response.data).map(normalizeRequest);
    },

    // GET /api/WeeklyScheduleRequests/{id} - Xem chi tiết yêu cầu
    async getRequestById(id: number): Promise<WeeklyScheduleRequest> {
        const response = await api.get(`/api/WeeklyScheduleRequests/${id}`);
        return normalizeRequest(response.data);
    },

    // POST /api/WeeklyScheduleRequests - Tạo yêu cầu đăng ký lịch
    async createRequest(data: CreateWeeklyScheduleRequest): Promise<WeeklyScheduleRequest> {
        const response = await api.post("/api/WeeklyScheduleRequests", data);
        return normalizeRequest(response.data);
    },

    // DELETE /api/WeeklyScheduleRequests/{id} - Xóa yêu cầu
    async deleteRequest(id: number): Promise<void> {
        await api.delete(`/api/WeeklyScheduleRequests/${id}`);
    },
};

export default weeklyScheduleRequestService;

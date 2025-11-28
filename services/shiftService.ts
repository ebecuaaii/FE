import api from "../api/axiosClient";

// ========================= TYPES =========================
export type Shift = {
    id: number;
    name: string;
    startTime: string;
    endTime: string;
    durationMinutes?: number;
    createdByName?: string;
    createdAt?: string;
};

export type ShiftAssignment = {
    id: number;
    userId: number;
    userName?: string;
    fullName?: string;
    shiftId: number;
    shiftName?: string;
    shiftStartTime?: string;
    shiftEndTime?: string;
    shiftDate: string;
    status?: string;
    createdAt?: string;
};

export type CreateShiftRequest = {
    name: string;
    startTime: string;
    endTime: string;
};

export type UpdateShiftRequest = {
    name: string;
    startTime: string;
    endTime: string;
};

export type AssignShiftRequest = {
    userId: number;
    shiftId: number;
    shiftDate: string;
    status?: string;
};

export type GetAssignmentsParams = {
    pageNumber?: number;
    pageSize?: number;
    fromDate?: string;
    toDate?: string;
    userId?: number;
    shiftId?: number;
    sortBy?: string;
    ascending?: boolean;
};

export type GetMyScheduleParams = {
    fromDate?: string;
    toDate?: string;
    sortBy?: string;
    ascending?: boolean;
};

// ========================= NORMALIZERS =========================
const normalizeShift = (item: any): Shift => {
    return {
        id: item?.id ?? 0,
        name: item?.name ?? "",
        startTime: item?.startTime ?? "",
        endTime: item?.endTime ?? "",
        durationMinutes: item?.durationMinutes,
        createdByName: item?.createdByName,
        createdAt: item?.createdAt,
    };
};

const normalizeAssignment = (item: any): ShiftAssignment => {
    return {
        id: item?.id ?? 0,
        userId: item?.userId ?? 0,
        userName: item?.userName,
        fullName: item?.fullName,
        shiftId: item?.shiftId ?? 0,
        shiftName: item?.shiftName,
        shiftStartTime: item?.shiftStartTime,
        shiftEndTime: item?.shiftEndTime,
        shiftDate: item?.shiftDate ?? "",
        status: item?.status,
        createdAt: item?.createdAt,
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
export const shiftService = {
    // GET /api/Shifts - Lấy danh sách tất cả ca làm việc
    async getShifts(): Promise<Shift[]> {
        const response = await api.get("/api/Shifts");
        return asArray(response.data).map(normalizeShift);
    },

    // GET /api/Shifts/{id} - Lấy thông tin ca làm việc theo ID
    async getShiftById(id: number): Promise<Shift> {
        const response = await api.get(`/api/Shifts/${id}`);
        return normalizeShift(response.data);
    },

    // POST /api/Shifts - Tạo ca làm việc mới
    async createShift(data: CreateShiftRequest): Promise<Shift> {
        const response = await api.post("/api/Shifts", data);
        return normalizeShift(response.data);
    },

    // PUT /api/Shifts/{id} - Cập nhật ca làm việc (Admin only)
    async updateShift(id: number, data: UpdateShiftRequest): Promise<Shift> {
        const response = await api.put(`/api/Shifts/${id}`, data);
        return normalizeShift(response.data);
    },

    // DELETE /api/Shifts/{id} - Xóa ca làm việc (Admin only)
    async deleteShift(id: number): Promise<void> {
        await api.delete(`/api/Shifts/${id}`);
    },

    // POST /api/Shifts/assign - Phân công ca làm việc cho nhân viên
    async assignShift(data: AssignShiftRequest): Promise<ShiftAssignment> {
        const response = await api.post("/api/Shifts/assign", data);
        return normalizeAssignment(response.data);
    },

    // GET /api/Shifts/assignments - Xem tất cả phân công ca làm việc
    async getAssignments(params?: GetAssignmentsParams): Promise<ShiftAssignment[]> {
        const response = await api.get("/api/Shifts/assignments", { params });
        return asArray(response.data).map(normalizeAssignment);
    },

    // GET /api/Shifts/assignments/{id} - Lấy thông tin assignment theo ID
    async getAssignmentById(id: number): Promise<ShiftAssignment> {
        const response = await api.get(`/api/Shifts/assignments/${id}`);
        return normalizeAssignment(response.data);
    },

    // DELETE /api/Shifts/assignments/{id} - Hủy phân công ca làm việc
    async deleteAssignment(id: number): Promise<void> {
        await api.delete(`/api/Shifts/assignments/${id}`);
    },

    // GET /api/Shifts/assignments với userId - Xem lịch làm việc cá nhân
    // Sử dụng /api/Shifts/assignments với userId filter thay vì /api/Shifts/my-schedule (không tồn tại)
    async getMySchedule(userId: number, params?: GetMyScheduleParams): Promise<ShiftAssignment[]> {
        const queryParams = {
            ...params,
            userId: userId,
        };
        const response = await api.get("/api/Shifts/assignments", { params: queryParams });
        return asArray(response.data).map(normalizeAssignment);
    },

    // GET /api/Shifts/assignments với userId - Xem lịch làm việc của user khác (Admin/Manager only)
    // Sử dụng /api/Shifts/assignments với userId filter thay vì /api/Shifts/user/{userId}/schedule (không tồn tại)
    async getUserSchedule(userId: number, params?: GetMyScheduleParams): Promise<ShiftAssignment[]> {
        const queryParams = {
            ...params,
            userId: userId,
        };
        const response = await api.get("/api/Shifts/assignments", { params: queryParams });
        return asArray(response.data).map(normalizeAssignment);
    },
};

export default shiftService;


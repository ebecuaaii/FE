import axiosClient from '../api/axiosClient';

export interface Position {
    id?: number;
    positionId?: number;
    name?: string;
    titlename?: string;
    titleName?: string;
    Titlename?: string;
    description?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

export interface CreatePositionRequest {
    titlename: string;
    description?: string;
}

export interface UpdatePositionRequest {
    titlename?: string;
    description?: string;
    isActive?: boolean;
}

// Helper function để normalize response data
const normalizePositions = (payload: any): Position[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;

    if (typeof payload === 'object') {
        if (payload?.data && Array.isArray(payload.data)) return payload.data;
        if (payload?.positions && Array.isArray(payload.positions)) return payload.positions;
        if (payload?.result && Array.isArray(payload.result)) return payload.result;
        if (payload?.items && Array.isArray(payload.items)) return payload.items;
    }

    return [];
};

const normalizePosition = (payload: any): Position => {
    if (!payload) return {} as Position;
    if (payload?.data && typeof payload.data === 'object') return payload.data;
    if (payload?.position && typeof payload.position === 'object') return payload.position;
    return payload;
};

export const positionService = {
    // Lấy tất cả chức danh
    getPositions: async (): Promise<Position[]> => {
        const response = await axiosClient.get('/api/Position');
        return normalizePositions(response.data);
    },

    // Lấy chi tiết 1 chức danh
    getPositionById: async (id: number): Promise<Position> => {
        const response = await axiosClient.get(`/api/Position/${id}`);
        return normalizePosition(response.data);
    },

    // Tạo chức danh mới (Admin only)
    createPosition: async (data: CreatePositionRequest): Promise<Position> => {
        const response = await axiosClient.post('/api/Position', data);
        return normalizePosition(response.data);
    },

    // Cập nhật chức danh (Admin only)
    updatePosition: async (id: number, data: UpdatePositionRequest): Promise<Position> => {
        const response = await axiosClient.put(`/api/Position/${id}`, data);
        return normalizePosition(response.data);
    },

    // Xóa chức danh (Admin only)
    deletePosition: async (id: number): Promise<void> => {
        await axiosClient.delete(`/api/Position/${id}`);
    },
};

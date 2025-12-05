import axiosClient from '../api/axiosClient';

export interface WiFiLocation {
    id?: number;
    wifiLocationId?: number;
    ssid?: string;
    wifissid?: string;
    wifiSsid?: string;
    bssid?: string;
    wifibssid?: string;
    wifiBssid?: string;
    locationname?: string;
    locationName?: string;
    description?: string;
    branchId?: number;
    branch_id?: number;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export interface Branch {
    id?: number;
    branchId?: number;
    name?: string;
    branchName?: string;
    branchCode?: string;
    address?: string;
    locationAddress?: string;
    description?: string;
    isActive?: boolean;
    wifiLocations?: WiFiLocation[];
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any; // Allow other fields from backend
}

export interface CreateBranchRequest {
    branchName: string;
    branchCode?: string;
    locationAddress?: string;
    description?: string;
    wifiLocations?: Omit<WiFiLocation, 'id'>[];
}

export interface UpdateBranchRequest {
    branchName?: string;
    branchCode?: string;
    locationAddress?: string;
    description?: string;
    isActive?: boolean;
    wifiLocations?: WiFiLocation[];
}

// Helper function để normalize response data
const normalizeBranches = (payload: any): Branch[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;

    if (typeof payload === 'object') {
        if (payload?.data && Array.isArray(payload.data)) return payload.data;
        if (payload?.branches && Array.isArray(payload.branches)) return payload.branches;
        if (payload?.result && Array.isArray(payload.result)) return payload.result;
        if (payload?.items && Array.isArray(payload.items)) return payload.items;
    }

    return [];
};

const normalizeBranch = (payload: any): Branch => {
    if (!payload) return {} as Branch;
    if (payload?.data && typeof payload.data === 'object') return payload.data;
    if (payload?.branch && typeof payload.branch === 'object') return payload.branch;
    return payload;
};

const normalizeWifiLocations = (payload: any): WiFiLocation[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;

    if (typeof payload === 'object') {
        if (payload?.data && Array.isArray(payload.data)) return payload.data;
        if (payload?.wifiLocations && Array.isArray(payload.wifiLocations)) return payload.wifiLocations;
        if (payload?.result && Array.isArray(payload.result)) return payload.result;
    }

    return [];
};

export const branchService = {
    // Admin: Lấy tất cả chi nhánh
    getBranches: async (): Promise<Branch[]> => {
        const response = await axiosClient.get('/api/branch');
        return normalizeBranches(response.data);
    },

    // Admin: Lấy chi tiết 1 chi nhánh
    getBranchById: async (id: number): Promise<Branch> => {
        const response = await axiosClient.get(`/api/branch/${id}`);
        return normalizeBranch(response.data);
    },

    // Admin: Tạo chi nhánh mới
    createBranch: async (data: CreateBranchRequest): Promise<Branch> => {
        const response = await axiosClient.post('/api/branch', data);
        return normalizeBranch(response.data);
    },

    // Admin: Cập nhật chi nhánh
    updateBranch: async (id: number, data: UpdateBranchRequest): Promise<Branch> => {
        const response = await axiosClient.put(`/api/branch/${id}`, data);
        return normalizeBranch(response.data);
    },

    // Admin: Xóa chi nhánh (soft delete)
    deleteBranch: async (id: number): Promise<void> => {
        await axiosClient.delete(`/api/branch/${id}`);
    },

    // Employee: Lấy danh sách WiFi locations được phép
    getWifiLocations: async (): Promise<WiFiLocation[]> => {
        const response = await axiosClient.get('/api/branch/wifi-locations');
        return normalizeWifiLocations(response.data);
    },
};

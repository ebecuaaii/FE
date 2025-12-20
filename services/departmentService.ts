import axiosClient from '../api/axiosClient';

export interface Department {
    id?: number;
    departmentId?: number;
    name?: string;
    departmentName?: string;
    description?: string;
    isActive?: boolean;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: any;
}

export interface CreateDepartmentRequest {
    departmentName: string;
    description?: string;
}

export interface UpdateDepartmentRequest {
    departmentName?: string;
    description?: string;
    isActive?: boolean;
}

// Helper function để normalize response data
const normalizeDepartments = (payload: any): Department[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;

    if (typeof payload === 'object') {
        if (payload?.data && Array.isArray(payload.data)) return payload.data;
        if (payload?.departments && Array.isArray(payload.departments)) return payload.departments;
        if (payload?.result && Array.isArray(payload.result)) return payload.result;
        if (payload?.items && Array.isArray(payload.items)) return payload.items;
    }

    return [];
};

const normalizeDepartment = (payload: any): Department => {
    if (!payload) return {} as Department;
    if (payload?.data && typeof payload.data === 'object') return payload.data;
    if (payload?.department && typeof payload.department === 'object') return payload.department;
    return payload;
};

export const departmentService = {
    // Lấy tất cả bộ phận
    getDepartments: async (): Promise<Department[]> => {
        const response = await axiosClient.get('/api/Department');
        return normalizeDepartments(response.data);
    },

    // Lấy chi tiết 1 bộ phận
    getDepartmentById: async (id: number): Promise<Department> => {
        const response = await axiosClient.get(`/api/Department/${id}`);
        return normalizeDepartment(response.data);
    },

    // Tạo bộ phận mới (Admin only)
    createDepartment: async (data: CreateDepartmentRequest): Promise<Department> => {
        console.log('Creating department with data:', JSON.stringify(data, null, 2));
        try {
            const response = await axiosClient.post('/api/Department', data);
            return normalizeDepartment(response.data);
        } catch (error: any) {
            console.error('Department creation error:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
                requestData: data
            });
            throw error;
        }
    },

    // Cập nhật bộ phận (Admin only)
    updateDepartment: async (id: number, data: UpdateDepartmentRequest): Promise<Department> => {
        const response = await axiosClient.put(`/api/Department/${id}`, data);
        return normalizeDepartment(response.data);
    },

    // Xóa bộ phận (Admin only)
    deleteDepartment: async (id: number): Promise<void> => {
        await axiosClient.delete(`/api/Department/${id}`);
    },

    // Lấy danh sách nhân viên trong bộ phận
    getDepartmentEmployees: async (id: number): Promise<any[]> => {
        const response = await axiosClient.get(`/api/Department/${id}/employees`);
        if (Array.isArray(response.data)) return response.data;
        if (response.data?.data && Array.isArray(response.data.data)) return response.data.data;
        return [];
    },
};

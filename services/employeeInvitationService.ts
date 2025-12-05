import axiosClient from '../api/axiosClient';

export interface EmployeeInvitation {
    id?: number;
    email: string;
    fullname: string;
    phone?: string;
    positionId?: number;
    departmentId?: number;
    branchId?: number;
    startDate?: string;
    workAddress?: string;
    employeeType?: string;
    status?: string;
    invitationCode?: string;
    createdAt?: string;
    [key: string]: any;
}

export interface CreateInvitationRequest {
    email: string;
    fullname: string;
    phone?: string;
    positionId?: number;
    departmentId?: number;
    branchId?: number;
    startDate?: string;
    workAddress?: string;
    employeeType?: string;
    salaryRate?: number; // Lương ca (Manager) hoặc lương theo giờ (Employee)
    baseSalary?: number; // Lương cứng (chỉ cho Manager)
}

const normalizeInvitations = (payload: any): EmployeeInvitation[] => {
    if (!payload) return [];
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    if (payload?.invitations && Array.isArray(payload.invitations)) return payload.invitations;
    return [];
};

const normalizeInvitation = (payload: any): EmployeeInvitation => {
    if (!payload) return {} as EmployeeInvitation;
    if (payload?.data && typeof payload.data === 'object') return payload.data;
    if (payload?.invitation && typeof payload.invitation === 'object') return payload.invitation;
    return payload;
};

export const employeeInvitationService = {
    // Tạo lời mời nhân viên
    createInvitation: async (data: CreateInvitationRequest): Promise<EmployeeInvitation> => {
        const response = await axiosClient.post('/api/EmployeeInvitation', data);
        return normalizeInvitation(response.data);
    },

    // Lấy danh sách lời mời
    getInvitations: async (): Promise<EmployeeInvitation[]> => {
        const response = await axiosClient.get('/api/EmployeeInvitation');
        return normalizeInvitations(response.data);
    },

    // Lấy chi tiết lời mời
    getInvitationById: async (id: number): Promise<EmployeeInvitation> => {
        const response = await axiosClient.get(`/api/EmployeeInvitation/${id}`);
        return normalizeInvitation(response.data);
    },

    // Xóa lời mời
    deleteInvitation: async (id: number): Promise<void> => {
        await axiosClient.delete(`/api/EmployeeInvitation/${id}`);
    },
};

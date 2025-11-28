import api from "../api/axiosClient";

export type Employee = {
    id?: string | number;
    employeeId?: string | number;
    fullname?: string;
    username?: string;
    email?: string;
    departmentName?: string;
    roleName?: string;
    PositionName?: string; // Có thể API trả về userPosition

    [key: string]: any; // Cho phép các field khác
};

const normalizeEmployees = (payload: any): Employee[] => {
    if (!payload) {
        return [];
    }

    if (Array.isArray(payload)) {
        return payload;
    }

    if (typeof payload === 'object') {
        if (payload?.data && Array.isArray(payload.data)) {
            return payload.data;
        }
        if (payload?.users && Array.isArray(payload.users)) {
            return payload.users;
        }
        if (payload?.employees && Array.isArray(payload.employees)) {
            return payload.employees;
        }
        if (payload?.result && Array.isArray(payload.result)) {
            return payload.result;
        }
        if (payload?.items && Array.isArray(payload.items)) {
            return payload.items;
        }
        if (payload?.value && Array.isArray(payload.value)) {
            return payload.value;
        }
    }

    return [];
};

export const employeeService = {
    async getEmployees(): Promise<Employee[]> {
        const response = await api.get("/api/Auth/users");
        return normalizeEmployees(response.data);
    },
};

export default employeeService;


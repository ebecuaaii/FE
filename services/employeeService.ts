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
    console.log("Normalize input payload type:", typeof payload, "isArray:", Array.isArray(payload));

    // Nếu là array trực tiếp
    if (Array.isArray(payload)) {
        console.log("Payload is array, length:", payload.length);
        return payload;
    }

    // Nếu là object, kiểm tra các key có thể có
    if (payload && typeof payload === 'object') {
        console.log("Payload keys:", Object.keys(payload));

        // Nếu có data array
        if (payload?.data && Array.isArray(payload.data)) {
            console.log("Found payload.data array, length:", payload.data.length);
            return payload.data;
        }

        // Nếu có users array
        if (payload?.users && Array.isArray(payload.users)) {
            console.log("Found payload.users array, length:", payload.users.length);
            return payload.users;
        }

        // Nếu có employees array
        if (payload?.employees && Array.isArray(payload.employees)) {
            console.log("Found payload.employees array, length:", payload.employees.length);
            return payload.employees;
        }

        // Nếu có result array
        if (payload?.result && Array.isArray(payload.result)) {
            console.log("Found payload.result array, length:", payload.result.length);
            return payload.result;
        }
    }

    console.warn("Could not normalize payload, returning empty array");
    return [];
};

export const employeeService = {
    async getEmployees(): Promise<Employee[]> {
        const response = await api.get("/api/Auth/users");
        console.log("API Response:", JSON.stringify(response.data, null, 2));
        const normalized = normalizeEmployees(response.data);
        console.log("Normalized data:", JSON.stringify(normalized, null, 2));
        return normalized;
    },
};

export default employeeService;


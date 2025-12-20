import api from "../api/axiosClient";

export interface Employee {
    id: number;
    fullname: string;
    email: string;
    branchId: number;
    branchName: string;
    departmentName: string;
    positionName: string;
}

export interface RewardPenalty {
    id: number;
    userId: number;
    userName: string;
    type: "Reward" | "Penalty";
    amount: number;
    reason: string;
    createdBy: number;
    createdByName: string;
    createdAt: string;
}

export interface CreateRewardPenaltyDto {
    userId: number;
    type: "Reward" | "Penalty";
    amount: number;
    reason: string;
}

const rewardPenaltyService = {
    // Lấy danh sách nhân viên (Admin/Manager)
    getEmployees: async (branchId?: number) => {
        const url = branchId
            ? `/api/RewardPenalty/employees?branchId=${branchId}`
            : `/api/RewardPenalty/employees`;
        const response = await api.get<Employee[]>(url);
        return response.data;
    },

    // Tạo phiếu thưởng/phạt (Admin/Manager)
    create: async (data: CreateRewardPenaltyDto) => {
        const response = await api.post<RewardPenalty>("/api/RewardPenalty", data);
        return response.data;
    },

    // Xem tất cả phiếu thưởng/phạt (Admin/Manager)
    getAll: async (params?: { month?: number; year?: number; type?: "Reward" | "Penalty" }) => {
        let url = "/api/RewardPenalty/all";
        const queryParams = new URLSearchParams();

        if (params?.month) queryParams.append("month", params.month.toString());
        if (params?.year) queryParams.append("year", params.year.toString());
        if (params?.type) queryParams.append("type", params.type);

        if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
        }

        const response = await api.get<RewardPenalty[]>(url);
        return response.data;
    },

    // Xem lịch sử thưởng/phạt của mình (Employee)
    getMy: async (params?: { month?: number; year?: number }) => {
        let url = "/api/RewardPenalty/my";
        const queryParams = new URLSearchParams();

        if (params?.month) queryParams.append("month", params.month.toString());
        if (params?.year) queryParams.append("year", params.year.toString());

        if (queryParams.toString()) {
            url += `?${queryParams.toString()}`;
        }

        const response = await api.get<RewardPenalty[]>(url);
        return response.data;
    },

    // Xóa phiếu thưởng/phạt (Admin/Manager)
    delete: async (id: number) => {
        await api.delete(`/api/RewardPenalty/${id}`);
    },

    // Xem chi tiết thưởng/phạt trong phiếu lương
    getSalaryRewardsPenalties: async (salaryId: number) => {
        const response = await api.get<RewardPenalty[]>(
            `/api/Salary/monthly/${salaryId}/rewards-penalties`
        );
        return response.data;
    },
};

export default rewardPenaltyService;

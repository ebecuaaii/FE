import api from "../api/axiosClient";

export interface AttendancePayroll {
    id: number;
    attendanceId: number;
    userId: number;
    date: string;
    shiftName: string;
    shiftStartTime: string;
    shiftEndTime: string;
    shiftDuration: number;
    shiftMultiplier: number;
    checkinTime: string;
    checkoutTime: string;
    hoursWorked: number;
    regularHours: number;
    overtimeHours: number;
    salaryRate: number;
    regularAmount: number;
    overtimeAmount: number;
    totalAmount: number;
}

export interface MonthlyPayroll {
    id: number;
    userId: number;
    month: number;
    year: number;
    baseSalary: number;
    totalShifts: number;
    totalHours: number;
    regularHours: number;
    overtimeHours: number;
    regularAmount: number;
    overtimeAmount: number;
    shiftSalary: number;
    bonusAmount: number;
    penaltyAmount: number;
    totalAmount: number;
    createdAt: string;
}

export interface PayrollDetail extends MonthlyPayroll {
    employeeName: string;
    employeeId: string;
    position: string;
    department: string;
    salaryRate: number;
    bonuses: {
        id: number;
        name: string;
        amount: number;
        date: string;
    }[];
    penalties: {
        id: number;
        name: string;
        amount: number;
        date: string;
    }[];
}

const payrollService = {
    // Lấy lương theo ngày của user
    getDailySalary: async (userId: number, fromDate: string, toDate: string) => {
        const response = await api.get<AttendancePayroll[]>(
            `/api/Salary/daily/user/${userId}?fromDate=${fromDate}&toDate=${toDate}`
        );
        return response.data;
    },

    // Lấy lương theo ngày của tất cả user trong 1 ngày (Admin/Manager)
    getDailySalaryByDate: async (date: string) => {
        const response = await api.get<AttendancePayroll[]>(
            `/api/Salary/daily/date/${date}`
        );
        return response.data;
    },

    // Lấy lương tháng của user
    getMonthlySalary: async (userId: number, month: number, year: number) => {
        const response = await api.get<PayrollDetail>(
            `/api/Salary/monthly/user/${userId}?month=${month}&year=${year}`
        );
        return response.data;
    },

    // Lấy lịch sử lương tháng của user
    getMonthlySalaries: async (userId: number, year?: number) => {
        const response = await api.get<MonthlyPayroll[]>(
            `/api/Salary/monthly/user/${userId}/history`
        );

        // Filter theo năm nếu có
        let data = response.data || [];
        if (year) {
            data = data.filter((payroll) => payroll.year === year);
        }

        return data;
    },

    // Lấy chi tiết phiếu lương 1 tháng (alias của getMonthlySalary)
    getPayslipDetail: async (userId: number, month: number, year: number) => {
        return payrollService.getMonthlySalary(userId, month, year);
    },

    // Tạo phiếu lương tháng (Admin/Manager)
    generatePayroll: async (userId: number, month: number, year: number) => {
        const response = await api.post("/api/Salary/monthly/generate", {
            userId,
            month,
            year,
        });
        return response.data;
    },

    // Lấy chi tiết thưởng/phạt trong phiếu lương
    getSalaryRewardsPenalties: async (salaryId: number) => {
        const response = await api.get(`/api/Salary/monthly/${salaryId}/rewards-penalties`);
        return response.data;
    },
};

export default payrollService;

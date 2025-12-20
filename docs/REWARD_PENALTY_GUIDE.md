# Hướng Dẫn Sử Dụng Hệ Thống Thưởng/Phạt - Frontend

## Tổng Quan

Hệ thống thưởng/phạt bao gồm 3 màn hình chính:

1. **Lịch sử Thưởng/Phạt** (Nhân viên) - `/function/reward-penalty-history`
2. **Quản lý Thưởng/Phạt** (Admin/Manager) - `/adminfunction/reward-penalty-manage`
3. **Phiếu lương** (Tất cả) - `/function/payslip` (đã tích hợp hiển thị thưởng/phạt)

## Cấu Trúc File

```
HRMCyberse/
├── services/
│   ├── rewardPenaltyService.ts      # Service API cho thưởng/phạt
│   └── payrollService.ts            # Service API cho lương (đã cập nhật)
├── app/
│   ├── function/
│   │   ├── reward-penalty-history.tsx   # Màn hình lịch sử (Employee)
│   │   ├── payslip.tsx                  # Phiếu lương (đã có sẵn)
│   │   └── monthly-salary.tsx           # Lương tháng (đã có sẵn)
│   └── adminfunction/
│       └── reward-penalty-manage.tsx    # Màn hình quản lý (Admin/Manager)
└── docs/
    └── REWARD_PENALTY_GUIDE.md          # File này
```

## 1. Service Layer

### rewardPenaltyService.ts

Service này cung cấp các API calls:

```typescript
// Lấy danh sách nhân viên (Admin/Manager)
getEmployees(branchId?: number): Promise<Employee[]>

// Tạo phiếu thưởng/phạt (Admin/Manager)
create(data: CreateRewardPenaltyDto): Promise<RewardPenalty>

// Xem tất cả phiếu (Admin/Manager)
getAll(params?: { month?, year?, type? }): Promise<RewardPenalty[]>

// Xem lịch sử của mình (Employee)
getMy(params?: { month?, year? }): Promise<RewardPenalty[]>

// Xóa phiếu (Admin/Manager)
delete(id: number): Promise<void>

// Xem chi tiết thưởng/phạt trong phiếu lương
getSalaryRewardsPenalties(salaryId: number): Promise<RewardPenalty[]>
```

### Interfaces

```typescript
interface Employee {
    id: number;
    fullname: string;
    email: string;
    branchId: number;
    branchName: string;
    departmentName: string;
    positionName: string;
}

interface RewardPenalty {
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

interface CreateRewardPenaltyDto {
    userId: number;
    type: "Reward" | "Penalty";
    amount: number;
    reason: string;
}
```

## 2. Màn Hình Lịch Sử Thưởng/Phạt (Nhân viên)

**File:** `app/function/reward-penalty-history.tsx`

### Tính Năng

- Xem lịch sử thưởng/phạt của bản thân
- Chọn tháng/năm để xem
- Lọc theo loại: Tất cả, Thưởng, Phạt
- Hiển thị tổng thưởng và tổng phạt trong tháng
- Xem chi tiết từng phiếu (số tiền, lý do, người tạo, thời gian)

### Cách Sử Dụng

1. Nhân viên truy cập màn hình
2. Chọn tháng/năm muốn xem
3. Sử dụng tabs để lọc: Tất cả / Thưởng / Phạt
4. Xem danh sách các phiếu thưởng/phạt

### UI Components

- **Month Selector**: Chọn tháng/năm với nút prev/next
- **Summary Cards**: Hiển thị tổng thưởng và tổng phạt
- **Filter Tabs**: Lọc theo loại (Tất cả/Thưởng/Phạt)
- **Record Cards**: Danh sách các phiếu với màu sắc phân biệt

## 3. Màn Hình Quản Lý Thưởng/Phạt (Admin/Manager)

**File:** `app/adminfunction/reward-penalty-manage.tsx`

### Tính Năng

- Xem tất cả phiếu thưởng/phạt của tất cả nhân viên
- Tạo phiếu thưởng/phạt mới
- Xóa phiếu thưởng/phạt
- Lọc theo tháng/năm và loại
- Hiển thị tổng thưởng và tổng phạt

### Quy Trình Tạo Phiếu

1. Admin/Manager nhấn nút FAB (+) ở góc dưới bên phải
2. Modal tạo phiếu hiển thị
3. Chọn nhân viên từ danh sách
4. Chọn loại: Thưởng hoặc Phạt
5. Nhập số tiền (phải > 0)
6. Nhập lý do (tối thiểu 5 ký tự)
7. Nhấn "Tạo phiếu"
8. Hệ thống tự động:
   - Lưu phiếu vào database
   - Gửi thông báo cho nhân viên
   - Reload danh sách

### Validation

- **userId**: Bắt buộc, phải chọn nhân viên
- **type**: Bắt buộc, chỉ "Reward" hoặc "Penalty"
- **amount**: Bắt buộc, phải > 0
- **reason**: Bắt buộc, tối thiểu 5 ký tự

### Xóa Phiếu

1. Nhấn icon thùng rác trên phiếu
2. Xác nhận xóa
3. Phiếu bị xóa khỏi database
4. Lưu ý: Nếu đã tạo phiếu lương, cần tạo lại để cập nhật

## 4. Tích Hợp Với Phiếu Lương

### Màn Hình Phiếu Lương

**File:** `app/function/payslip.tsx` (đã có sẵn, đã tích hợp)

Phiếu lương tự động hiển thị:

- **Tổng thưởng**: Cộng vào lương gộp (GrossSalary)
- **Tổng phạt**: Trừ ra khỏi lương thực nhận (NetSalary)
- **Chi tiết**: Danh sách từng khoản thưởng/phạt với tên và số tiền

### Công Thức Tính Lương

```
Lương gộp = Lương cơ bản + Lương ca + Tổng thưởng
Lương thực nhận = Lương gộp - Tổng phạt
```

## 5. Thông Báo

Khi Admin/Manager tạo phiếu thưởng/phạt, hệ thống backend tự động gửi thông báo:

### Phiếu Thưởng
- **Title**: "🎉 Bạn nhận được phiếu thưởng"
- **Message**: "Bạn được thưởng {amount} VNĐ. Lý do: {reason}"

### Phiếu Phạt
- **Title**: "⚠️ Bạn nhận được phiếu phạt"
- **Message**: "Bạn bị phạt {amount} VNĐ. Lý do: {reason}"

## 6. Cách Thêm Vào Navigation

### Cho Nhân Viên

Thêm vào menu hoặc drawer:

```typescript
{
    name: "Lịch sử Thưởng/Phạt",
    path: "/function/reward-penalty-history",
    icon: <Gift size={20} />
}
```

### Cho Admin/Manager

Thêm vào menu admin:

```typescript
{
    name: "Quản lý Thưởng/Phạt",
    path: "/adminfunction/reward-penalty-manage",
    icon: <Gift size={20} />
}
```

## 7. Styling

Tất cả màn hình sử dụng:

- **Primary Color**: #0d9488 (Teal)
- **Reward Color**: #10b981 (Green)
- **Penalty Color**: #ef4444 (Red)
- **Background**: #F4F9F7
- **Card**: White với shadow nhẹ
- **Border Radius**: 12-16px

## 8. Error Handling

Tất cả API calls đều có try-catch và hiển thị Alert khi lỗi:

```typescript
try {
    const data = await rewardPenaltyService.getMy({ month, year });
    setRecords(data);
} catch (error: any) {
    Alert.alert("Lỗi", error?.response?.data?.message || "Không thể tải dữ liệu");
}
```

## 9. Testing

### Test Cases

1. **Nhân viên xem lịch sử**
   - Chọn tháng/năm khác nhau
   - Lọc theo loại
   - Kiểm tra tổng thưởng/phạt đúng

2. **Admin tạo phiếu thưởng**
   - Chọn nhân viên
   - Nhập số tiền và lý do
   - Kiểm tra thông báo gửi đến nhân viên
   - Kiểm tra phiếu xuất hiện trong danh sách

3. **Admin tạo phiếu phạt**
   - Tương tự phiếu thưởng

4. **Admin xóa phiếu**
   - Xóa phiếu
   - Kiểm tra không còn trong danh sách

5. **Tích hợp phiếu lương**
   - Tạo phiếu thưởng/phạt
   - Tạo phiếu lương tháng
   - Kiểm tra số tiền đúng trong phiếu lương

## 10. Troubleshooting

### Không tải được danh sách nhân viên
- Kiểm tra quyền Admin/Manager
- Kiểm tra API endpoint `/api/RewardPenalty/employees`

### Không tạo được phiếu
- Kiểm tra validation (amount > 0, reason >= 5 ký tự)
- Kiểm tra quyền Admin/Manager
- Kiểm tra userId có tồn tại

### Thưởng/phạt không hiển thị trong phiếu lương
- Kiểm tra tháng/năm của phiếu thưởng/phạt
- Tạo lại phiếu lương để cập nhật

## 11. Future Enhancements

- Export phiếu lương PDF
- Thống kê thưởng/phạt theo quý, năm
- Biểu đồ thưởng/phạt
- Lọc theo chi nhánh, phòng ban
- Tìm kiếm nhân viên
- Bulk create (tạo nhiều phiếu cùng lúc)

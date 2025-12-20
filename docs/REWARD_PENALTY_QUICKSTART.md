# Quick Start - Hệ Thống Thưởng/Phạt

## Files Đã Tạo

### 1. Service
- `services/rewardPenaltyService.ts` - API service cho thưởng/phạt

### 2. Screens
- `app/function/reward-penalty-history.tsx` - Màn hình lịch sử (Employee)
- `app/adminfunction/reward-penalty-manage.tsx` - Màn hình quản lý (Admin/Manager)

### 3. Documentation
- `docs/REWARD_PENALTY_GUIDE.md` - Hướng dẫn chi tiết
- `docs/REWARD_PENALTY_QUICKSTART.md` - File này

## Cách Thêm Vào App

### 1. Thêm vào Navigation/Menu

**Cho Nhân viên:**
```typescript
import { Gift } from "lucide-react-native";

// Thêm vào menu
{
    title: "Lịch sử Thưởng/Phạt",
    path: "/function/reward-penalty-history",
    icon: <Gift size={20} color="#0d9488" />
}
```

**Cho Admin/Manager:**
```typescript
{
    title: "Quản lý Thưởng/Phạt",
    path: "/adminfunction/reward-penalty-manage",
    icon: <Gift size={20} color="#0d9488" />
}
```

### 2. Import Service

```typescript
import rewardPenaltyService from "../../services/rewardPenaltyService";
```

## API Endpoints Sử Dụng

```
GET  /api/RewardPenalty/employees          # Lấy danh sách nhân viên
POST /api/RewardPenalty                    # Tạo phiếu thưởng/phạt
GET  /api/RewardPenalty/all                # Xem tất cả (Admin/Manager)
GET  /api/RewardPenalty/my                 # Xem của mình (Employee)
DELETE /api/RewardPenalty/{id}             # Xóa phiếu
GET  /api/Salary/monthly/{id}/rewards-penalties  # Chi tiết trong phiếu lương
```

## Quy Trình Sử Dụng

### Admin/Manager Tạo Phiếu Thưởng

1. Vào màn hình "Quản lý Thưởng/Phạt"
2. Nhấn nút (+) góc dưới bên phải
3. Chọn nhân viên
4. Chọn "Thưởng"
5. Nhập số tiền: 500000
6. Nhập lý do: "Hoàn thành xuất sắc dự án"
7. Nhấn "Tạo phiếu"
8. ✅ Nhân viên nhận thông báo

### Nhân Viên Xem Lịch Sử

1. Vào màn hình "Lịch sử Thưởng/Phạt"
2. Chọn tháng/năm
3. Xem danh sách thưởng/phạt
4. Lọc theo loại nếu cần

### Xem Trong Phiếu Lương

1. Vào "Lương theo tháng"
2. Chọn tháng
3. Xem phiếu lương
4. Thưởng/phạt tự động hiển thị trong chi tiết

## Validation Rules

- **Số tiền**: Phải > 0
- **Lý do**: Tối thiểu 5 ký tự
- **Nhân viên**: Phải chọn
- **Loại**: Reward hoặc Penalty

## Màu Sắc

- 🎉 **Thưởng**: #10b981 (Green)
- ⚠️ **Phạt**: #ef4444 (Red)
- **Primary**: #0d9488 (Teal)

## Thông Báo

Khi tạo phiếu, nhân viên tự động nhận thông báo:
- Thưởng: "🎉 Bạn nhận được phiếu thưởng"
- Phạt: "⚠️ Bạn nhận được phiếu phạt"

## Testing

```bash
# Test tạo phiếu thưởng
POST /api/RewardPenalty
{
    "userId": 3,
    "type": "Reward",
    "amount": 500000,
    "reason": "Hoàn thành xuất sắc dự án"
}

# Test xem lịch sử
GET /api/RewardPenalty/my?month=12&year=2024
```

## Troubleshooting

**Lỗi "Không tìm thấy nhân viên"**
- Kiểm tra userId có tồn tại
- Kiểm tra nhân viên isActive = true

**Không hiển thị trong phiếu lương**
- Kiểm tra tháng/năm khớp nhau
- Tạo lại phiếu lương để cập nhật

**Không tạo được phiếu**
- Kiểm tra quyền Admin/Manager
- Kiểm tra validation (amount > 0, reason >= 5 ký tự)

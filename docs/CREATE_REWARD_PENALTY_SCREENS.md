# Hướng Dẫn Sử Dụng Màn Hình Tạo Thưởng/Phạt

## Tổng Quan

Đã tạo 2 màn hình riêng biệt cho Admin/Manager để tạo phiếu thưởng và phạt:

1. **Tạo Phiếu Thưởng** - `/adminfunction/create-reward`
2. **Tạo Phiếu Phạt** - `/adminfunction/create-penalty`

## 1. Màn Hình Tạo Phiếu Thưởng

**File:** `app/adminfunction/create-reward.tsx`

### Tính Năng

- Form tạo phiếu thưởng đơn giản, dễ sử dụng
- Tìm kiếm và chọn nhân viên
- Nhập số tiền thưởng với preview định dạng tiền tệ
- Nhập lý do thưởng với đếm ký tự
- Xem trước thông tin trước khi tạo
- Validation đầy đủ
- Thông báo thành công với 2 lựa chọn: Tạo tiếp hoặc Xem danh sách

### UI Components

#### Header Card
- Icon Gift màu xanh lá
- Tiêu đề "Tạo Phiếu Thưởng"
- Mô tả ngắn gọn

#### Form
1. **Chọn nhân viên**
   - Nút chọn với icon Users
   - Hiển thị thông tin nhân viên đã chọn
   - Modal danh sách với tìm kiếm

2. **Số tiền**
   - Input số
   - Preview định dạng tiền tệ màu xanh lá
   - Validation > 0

3. **Lý do**
   - TextArea 4 dòng
   - Đếm ký tự
   - Validation >= 5 ký tự

4. **Preview Card**
   - Hiển thị khi đủ thông tin
   - Background màu xanh nhạt
   - Tóm tắt thông tin sẽ tạo

5. **Buttons**
   - Nút Hủy (quay lại)
   - Nút Tạo phiếu thưởng (màu xanh lá)

### Quy Trình Sử Dụng

```
1. Admin vào màn hình "Tạo Phiếu Thưởng"
   ↓
2. Nhấn "Chọn nhân viên"
   ↓
3. Tìm kiếm và chọn nhân viên từ danh sách
   ↓
4. Nhập số tiền thưởng (VD: 500000)
   ↓
5. Nhập lý do (VD: "Hoàn thành xuất sắc dự án tháng 12")
   ↓
6. Xem preview thông tin
   ↓
7. Nhấn "Tạo phiếu thưởng"
   ↓
8. Chọn "Tạo tiếp" hoặc "Xem danh sách"
```

### Màu Sắc

- **Primary**: #10b981 (Green)
- **Background Icon**: #d1fae5 (Light Green)
- **Preview Card**: #f0fdf4 (Very Light Green)
- **Border**: #86efac (Green)

## 2. Màn Hình Tạo Phiếu Phạt

**File:** `app/adminfunction/create-penalty.tsx`

### Tính Năng

- Form tạo phiếu phạt với cảnh báo rõ ràng
- Tìm kiếm và chọn nhân viên
- Nhập số tiền phạt với preview định dạng tiền tệ
- Nhập lý do phạt với đếm ký tự
- Xem trước thông tin trước khi tạo
- **Xác nhận 2 lần** trước khi tạo (quan trọng!)
- Validation đầy đủ
- Thông báo thành công với 2 lựa chọn

### UI Components

#### Header Card
- Icon AlertCircle màu đỏ
- Tiêu đề "Tạo Phiếu Phạt"
- Mô tả ngắn gọn

#### Warning Card
- Background màu vàng nhạt
- Icon cảnh báo
- Text: "Lưu ý: Phiếu phạt sẽ được trừ vào lương tháng của nhân viên"

#### Form
Tương tự màn hình thưởng nhưng:
- Màu sắc đỏ thay vì xanh
- Preview card màu đỏ nhạt
- Số tiền hiển thị với dấu trừ (-)

#### Confirmation Dialog
- Hiển thị khi nhấn "Tạo phiếu phạt"
- Yêu cầu xác nhận lại
- Style "destructive" (màu đỏ)

### Quy Trình Sử Dụng

```
1. Admin vào màn hình "Tạo Phiếu Phạt"
   ↓
2. Đọc cảnh báo về việc trừ lương
   ↓
3. Nhấn "Chọn nhân viên"
   ↓
4. Tìm kiếm và chọn nhân viên từ danh sách
   ↓
5. Nhập số tiền phạt (VD: 200000)
   ↓
6. Nhập lý do (VD: "Đi muộn 3 lần trong tháng")
   ↓
7. Xem preview thông tin
   ↓
8. Nhấn "Tạo phiếu phạt"
   ↓
9. XÁC NHẬN lại trong dialog
   ↓
10. Chọn "Tạo tiếp" hoặc "Xem danh sách"
```

### Màu Sắc

- **Primary**: #ef4444 (Red)
- **Background Icon**: #fee2e2 (Light Red)
- **Preview Card**: #fef2f2 (Very Light Red)
- **Border**: #fca5a5 (Red)
- **Warning Card**: #fffbeb (Yellow)

## 3. Modal Chọn Nhân Viên (Chung)

### Tính Năng

- Danh sách tất cả nhân viên
- Tìm kiếm theo tên, email, phòng ban
- Hiển thị đầy đủ thông tin:
  - Họ tên
  - Chức vụ - Phòng ban
  - Chi nhánh
- Scroll được khi danh sách dài
- Đóng modal khi chọn hoặc nhấn X

### UI

- Slide từ dưới lên
- Header với tiêu đề và nút đóng
- Search bar ở đầu
- Danh sách nhân viên có border phân cách
- Empty state khi không tìm thấy

## 4. Validation Rules

### Chung cho cả 2 màn hình

| Field | Rule | Message |
|-------|------|---------|
| Nhân viên | Bắt buộc | "Vui lòng chọn nhân viên" |
| Số tiền | > 0 | "Số tiền phải lớn hơn 0" |
| Lý do | >= 5 ký tự | "Lý do phải có ít nhất 5 ký tự" |

## 5. Cách Thêm Vào Navigation

### Option 1: Thêm vào Admin Menu

```typescript
// Trong file menu admin
const adminMenuItems = [
    {
        title: "Tạo Phiếu Thưởng",
        path: "/adminfunction/create-reward",
        icon: <Gift size={20} color="#10b981" />,
        description: "Tạo phiếu thưởng cho nhân viên"
    },
    {
        title: "Tạo Phiếu Phạt",
        path: "/adminfunction/create-penalty",
        icon: <AlertCircle size={20} color="#ef4444" />,
        description: "Tạo phiếu phạt cho vi phạm"
    },
    {
        title: "Quản lý Thưởng/Phạt",
        path: "/adminfunction/reward-penalty-manage",
        icon: <List size={20} color="#0d9488" />,
        description: "Xem tất cả phiếu thưởng/phạt"
    }
];
```

### Option 2: Thêm vào Manager Task Screen

```typescript
// Trong file manager-task.tsx
import { Gift, AlertCircle } from "lucide-react-native";

const taskCards = [
    {
        title: "Tạo Phiếu Thưởng",
        icon: <Gift size={32} color="#10b981" />,
        color: "#10b981",
        route: "/adminfunction/create-reward"
    },
    {
        title: "Tạo Phiếu Phạt",
        icon: <AlertCircle size={32} color="#ef4444" />,
        color: "#ef4444",
        route: "/adminfunction/create-penalty"
    }
];
```

### Option 3: Floating Action Button

```typescript
// Thêm FAB vào màn hình quản lý
<TouchableOpacity 
    style={styles.fabReward}
    onPress={() => router.push("/adminfunction/create-reward")}
>
    <Gift size={24} color="#fff" />
</TouchableOpacity>

<TouchableOpacity 
    style={styles.fabPenalty}
    onPress={() => router.push("/adminfunction/create-penalty")}
>
    <AlertCircle size={24} color="#fff" />
</TouchableOpacity>
```

## 6. So Sánh Với Màn Hình Quản Lý

| Feature | Create Reward/Penalty | Manage Screen |
|---------|----------------------|---------------|
| Mục đích | Tạo phiếu mới | Xem và quản lý tất cả |
| Form | Đầy đủ, chi tiết | Modal nhanh |
| Preview | Có | Không |
| Search | Trong modal chọn NV | Không |
| Filter | Không | Có (tháng/năm/loại) |
| Delete | Không | Có |
| Target | Tạo 1 phiếu | Quản lý nhiều phiếu |

## 7. User Experience

### Ưu Điểm

1. **Tách biệt rõ ràng**: 2 màn hình riêng, không nhầm lẫn
2. **Visual cues**: Màu sắc phân biệt (xanh/đỏ)
3. **Preview**: Xem trước trước khi tạo
4. **Search**: Tìm nhân viên nhanh
5. **Validation**: Kiểm tra đầy đủ
6. **Confirmation**: Xác nhận 2 lần cho phạt
7. **Success options**: Chọn tạo tiếp hoặc xem danh sách

### Best Practices

1. **Phiếu Thưởng**: Nhanh, dễ dàng, khuyến khích tạo
2. **Phiếu Phạt**: Cảnh báo, xác nhận, thận trọng
3. **Form**: Đơn giản, không quá nhiều field
4. **Feedback**: Thông báo rõ ràng sau mỗi action

## 8. Testing Checklist

### Test Tạo Phiếu Thưởng

- [ ] Chọn nhân viên từ danh sách
- [ ] Tìm kiếm nhân viên hoạt động
- [ ] Nhập số tiền > 0
- [ ] Nhập lý do >= 5 ký tự
- [ ] Preview hiển thị đúng
- [ ] Tạo thành công
- [ ] Thông báo hiển thị
- [ ] Chọn "Tạo tiếp" reset form
- [ ] Chọn "Xem danh sách" chuyển màn hình

### Test Tạo Phiếu Phạt

- [ ] Warning card hiển thị
- [ ] Chọn nhân viên từ danh sách
- [ ] Nhập số tiền > 0
- [ ] Nhập lý do >= 5 ký tự
- [ ] Preview hiển thị đúng với dấu trừ
- [ ] Confirmation dialog hiển thị
- [ ] Hủy confirmation không tạo
- [ ] Xác nhận tạo thành công
- [ ] Thông báo hiển thị

### Test Validation

- [ ] Không chọn nhân viên → Lỗi
- [ ] Số tiền = 0 → Lỗi
- [ ] Số tiền âm → Lỗi
- [ ] Lý do < 5 ký tự → Lỗi
- [ ] Lý do rỗng → Lỗi

### Test Modal Chọn Nhân Viên

- [ ] Danh sách hiển thị đầy đủ
- [ ] Tìm kiếm theo tên
- [ ] Tìm kiếm theo email
- [ ] Tìm kiếm theo phòng ban
- [ ] Chọn nhân viên đóng modal
- [ ] Nhấn X đóng modal
- [ ] Empty state khi không tìm thấy

## 9. API Integration

### Endpoints Sử Dụng

```typescript
// Lấy danh sách nhân viên
GET /api/RewardPenalty/employees

// Tạo phiếu thưởng
POST /api/RewardPenalty
{
    "userId": 3,
    "type": "Reward",
    "amount": 500000,
    "reason": "Hoàn thành xuất sắc dự án"
}

// Tạo phiếu phạt
POST /api/RewardPenalty
{
    "userId": 3,
    "type": "Penalty",
    "amount": 200000,
    "reason": "Đi muộn 3 lần trong tháng"
}
```

## 10. Troubleshooting

### Không tải được danh sách nhân viên
- Kiểm tra quyền Admin/Manager
- Kiểm tra API endpoint
- Xem console log lỗi

### Không tạo được phiếu
- Kiểm tra validation
- Kiểm tra network request
- Xem response error message

### Modal không đóng
- Kiểm tra state showEmployeeModal
- Kiểm tra onRequestClose

### Preview không hiển thị
- Kiểm tra điều kiện: selectedEmployee && amount && reason.length >= 5
- Kiểm tra state updates

## 11. Future Enhancements

- [ ] Bulk create (tạo nhiều phiếu cùng lúc)
- [ ] Template lý do thường dùng
- [ ] Lịch sử tạo phiếu gần đây
- [ ] Thống kê nhanh (tổng thưởng/phạt tháng này)
- [ ] Upload file đính kèm
- [ ] Gửi email thông báo
- [ ] Export PDF phiếu thưởng/phạt

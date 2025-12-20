# Hướng Dẫn Sử Dụng Hệ Thống Yêu Cầu (Request System)

## Tổng Quan

Hệ thống yêu cầu bao gồm 3 loại phiếu cho nhân viên:

1. **Phiếu Xin Nghỉ Phép** (Leave Request) - `/function/leave-request`
2. **Phiếu Xin Đi Trễ** (Late Request) - `/function/late-request`
3. **Phiếu Xin Đổi Ca** (Shift Swap Request) - `/function/shift-swap-request`

## Cấu Trúc Files

```
HRMCyberse/
├── services/
│   ├── leaveRequestService.ts       # Service API cho xin nghỉ phép
│   ├── lateRequestService.ts        # Service API cho xin đi trễ
│   └── shiftRequestService.ts       # Service API cho xin đổi ca
├── app/function/
│   ├── leave-request.tsx            # Màn hình xin nghỉ phép
│   ├── late-request.tsx             # Màn hình xin đi trễ
│   └── shift-swap-request.tsx       # Màn hình xin đổi ca
└── docs/
    └── REQUEST_SCREENS_GUIDE.md     # File này
```

## 1. Phiếu Xin Nghỉ Phép (Leave Request)

### API Endpoints

```
POST   /api/LeaveRequest              # Tạo phiếu
GET    /api/LeaveRequest/my           # Xem phiếu của mình
GET    /api/LeaveRequest/pending      # Xem phiếu chờ duyệt (Admin/Manager)
GET    /api/LeaveRequest/all          # Xem tất cả (Admin/Manager)
PUT    /api/LeaveRequest/{id}/review  # Duyệt/Từ chối (Admin/Manager)
DELETE /api/LeaveRequest/{id}         # Hủy phiếu
```

### Tính Năng

- Chọn loại nghỉ phép: Nghỉ phép, Nghỉ ốm, Nghỉ việc riêng, Nghỉ không lương
- Chọn ngày bắt đầu và kết thúc
- Tự động tính số ngày nghỉ
- Nhập lý do (tối thiểu 10 ký tự)
- Xem danh sách phiếu đã tạo
- Hủy phiếu đang chờ duyệt
- Xem trạng thái: Chờ duyệt, Đã duyệt, Từ chối
- Xem ghi chú duyệt từ Admin/Manager

### Quy Trình Sử Dụng

```
1. Nhân viên vào màn hình "Phiếu Xin Nghỉ Phép"
   ↓
2. Nhấn "Tạo phiếu"
   ↓
3. Chọn loại nghỉ phép
   ↓
4. Chọn ngày bắt đầu (Date Picker)
   ↓
5. Chọn ngày kết thúc (Date Picker)
   ↓
6. Xem số ngày nghỉ tự động tính
   ↓
7. Nhập lý do (>= 10 ký tự)
   ↓
8. Nhấn "Tạo phiếu"
   ↓
9. Chờ Admin/Manager duyệt
```

### Validation

- **Loại nghỉ phép**: Bắt buộc
- **Ngày bắt đầu**: Bắt buộc
- **Ngày kết thúc**: Bắt buộc, phải >= ngày bắt đầu
- **Lý do**: Bắt buộc, >= 10 ký tự

### UI Components

- **Header**: Tiêu đề + số lượng phiếu + nút "Tạo phiếu"
- **Empty State**: Icon Calendar + text hướng dẫn
- **Request Card**: 
  - Loại nghỉ phép + Status badge
  - Từ ngày - Đến ngày
  - Số ngày nghỉ (badge màu xanh)
  - Lý do
  - Ghi chú duyệt (nếu có)
  - Thời gian tạo + nút Hủy (nếu Pending)
- **Create Modal**:
  - Chọn loại (4 buttons)
  - Date pickers cho từ ngày/đến ngày
  - Preview số ngày
  - TextArea lý do
  - Đếm ký tự

### Màu Sắc

- **Primary**: #0d9488 (Teal)
- **Icon**: Calendar
- **Status Colors**: 
  - Pending: #f59e0b (Orange)
  - Approved: #10b981 (Green)
  - Rejected: #ef4444 (Red)

## 2. Phiếu Xin Đi Trễ (Late Request)

### API Endpoints

```
POST   /api/LateRequest              # Tạo phiếu
GET    /api/LateRequest/my           # Xem phiếu của mình
GET    /api/LateRequest/pending      # Xem phiếu chờ duyệt (Admin/Manager)
GET    /api/LateRequest/all          # Xem tất cả (Admin/Manager)
PUT    /api/LateRequest/{id}/review  # Duyệt/Từ chối (Admin/Manager)
DELETE /api/LateRequest/{id}         # Hủy phiếu
```

### Tính Năng

- Chọn ngày xin đi trễ
- Chọn giờ dự kiến đến (Time Picker)
- Nhập lý do (tối thiểu 10 ký tự)
- Xem danh sách phiếu đã tạo
- Hủy phiếu đang chờ duyệt
- Xem trạng thái và ghi chú duyệt

### Quy Trình Sử Dụng

```
1. Nhân viên vào màn hình "Phiếu Xin Đi Trễ"
   ↓
2. Nhấn "Tạo phiếu"
   ↓
3. Chọn ngày (Date Picker)
   ↓
4. Chọn giờ dự kiến đến (Time Picker, 24h format)
   ↓
5. Nhập lý do (>= 10 ký tự)
   ↓
6. Nhấn "Tạo phiếu"
   ↓
7. Chờ Admin/Manager duyệt
```

### Validation

- **Ngày**: Bắt buộc
- **Giờ dự kiến đến**: Bắt buộc
- **Lý do**: Bắt buộc, >= 10 ký tự

### UI Components

- **Header**: Tiêu đề + số lượng phiếu + nút "Tạo phiếu" (màu cam)
- **Request Card**:
  - Icon Clock + "Xin đi trễ" + Status badge
  - Ngày
  - Giờ dự kiến đến
  - Lý do
  - Ghi chú duyệt (nếu có)
  - Footer với thời gian tạo + nút Hủy
- **Create Modal**:
  - Date picker cho ngày
  - Time picker cho giờ
  - TextArea lý do
  - Đếm ký tự

### Màu Sắc

- **Primary**: #f59e0b (Orange)
- **Icon**: Clock
- **Status Colors**: Giống Leave Request

## 3. Phiếu Xin Đổi Ca (Shift Swap Request)

### API Endpoints

```
POST   /api/ShiftRequest              # Tạo phiếu
GET    /api/ShiftRequest/my           # Xem phiếu của mình
GET    /api/ShiftRequest/pending      # Xem phiếu chờ duyệt (Admin/Manager)
GET    /api/ShiftRequest/all          # Xem tất cả (Admin/Manager)
PUT    /api/ShiftRequest/{id}/review  # Duyệt/Từ chối (Admin/Manager)
DELETE /api/ShiftRequest/{id}         # Hủy phiếu
```

### API Bổ Sung (Cần có)

```
GET /api/Schedule/my                      # Lấy lịch làm việc của mình
GET /api/Schedule/shift/{id}/employees    # Lấy danh sách nhân viên trong ca
```

### Tính Năng

- Xem lịch làm việc của mình
- Chọn ca muốn đổi
- Xem danh sách nhân viên khác trong ca đó
- Chọn người muốn đổi ca
- Nhập lý do đổi ca
- Gửi yêu cầu đến người được chọn
- Xem danh sách yêu cầu đã gửi
- Hủy yêu cầu đang chờ

### Quy Trình Sử Dụng

```
1. Nhân viên vào màn hình "Phiếu Xin Đổi Ca"
   ↓
2. Nhấn "Tạo yêu cầu"
   ↓
3. Modal hiển thị lịch làm việc của mình
   ↓
4. Chọn ca muốn đổi
   ↓
5. Modal hiển thị danh sách nhân viên trong ca đó
   ↓
6. Chọn người muốn đổi ca
   ↓
7. Modal xác nhận hiển thị:
   - Ca của bạn
   - Đổi với: [Tên nhân viên]
   ↓
8. Nhập lý do (>= 10 ký tự)
   ↓
9. Nhấn "Gửi yêu cầu"
   ↓
10. Chờ người được chọn chấp nhận/từ chối
```

### Validation

- **Ca hiện tại**: Bắt buộc
- **Người muốn đổi**: Bắt buộc
- **Lý do**: Bắt buộc, >= 10 ký tự

### UI Components

- **Header**: Tiêu đề + số lượng yêu cầu + nút "Tạo yêu cầu" (màu tím)
- **Request Card**:
  - Icon RefreshCw + "Đổi ca" + Status badge
  - Ca hiện tại (card màu xám nhạt)
  - Icon mũi tên đổi
  - Ca muốn đổi (card màu xám nhạt)
  - Lý do
  - Ghi chú duyệt (nếu có)
  - Footer với thời gian + nút Hủy
- **Select Shift Modal**:
  - Danh sách ca làm việc của mình
  - Mỗi item: Icon Calendar + Tên ca + Ngày + Giờ
- **Select Employee Modal**:
  - Danh sách nhân viên trong ca đã chọn
  - Mỗi item: Icon Users + Tên + Chức vụ + Phòng ban
- **Confirm Modal**:
  - Preview ca của bạn (card xanh nhạt)
  - Preview người đổi (card xanh nhạt)
  - TextArea lý do
  - Đếm ký tự

### Màu Sắc

- **Primary**: #8b5cf6 (Purple)
- **Icon**: RefreshCw
- **Status Colors**: Giống Leave Request

## 4. Chung Cho Cả 3 Màn Hình

### Status Badge

Tất cả 3 màn hình đều có status badge với 3 trạng thái:

| Status | Icon | Color | Text |
|--------|------|-------|------|
| Pending | Clock | #f59e0b | Chờ duyệt |
| Approved | CheckCircle | #10b981 | Đã duyệt |
| Rejected | XCircle | #ef4444 | Từ chối |

### Empty State

Khi chưa có phiếu/yêu cầu:
- Icon lớn (48px) màu xám nhạt
- Text chính: "Chưa có [loại phiếu]"
- Text phụ: "Nhấn 'Tạo phiếu' để tạo phiếu mới"

### Delete/Cancel

- Chỉ hiển thị nút Hủy khi status = "Pending"
- Confirmation dialog trước khi hủy
- Style destructive (màu đỏ)

### Date/Time Pickers

- Sử dụng `@react-native-community/datetimepicker`
- Date picker: mode="date", display="default"
- Time picker: mode="time", is24Hour={true}

## 5. Cách Thêm Vào Navigation

### Thêm vào Home Screen (Employee)

```typescript
import { Calendar, Clock, RefreshCw } from "lucide-react-native";

const requestCards = [
    {
        title: "Xin nghỉ phép",
        icon: <Calendar size={32} color="#0d9488" />,
        route: "/function/leave-request"
    },
    {
        title: "Xin đi trễ",
        icon: <Clock size={32} color="#f59e0b" />,
        route: "/function/late-request"
    },
    {
        title: "Xin đổi ca",
        icon: <RefreshCw size={32} color="#8b5cf6" />,
        route: "/function/shift-swap-request"
    }
];
```

### Thêm vào Drawer Menu

```typescript
{
    section: "Yêu cầu",
    items: [
        { title: "Xin nghỉ phép", path: "/function/leave-request", icon: "calendar" },
        { title: "Xin đi trễ", path: "/function/late-request", icon: "clock" },
        { title: "Xin đổi ca", path: "/function/shift-swap-request", icon: "refresh-cw" }
    ]
}
```

## 6. Dependencies

Cần cài đặt package cho Date/Time Picker:

```bash
npm install @react-native-community/datetimepicker
```

hoặc

```bash
yarn add @react-native-community/datetimepicker
```

## 7. Testing Checklist

### Test Leave Request

- [ ] Tạo phiếu với 4 loại nghỉ phép khác nhau
- [ ] Chọn ngày bắt đầu và kết thúc
- [ ] Kiểm tra tính số ngày đúng
- [ ] Validation lý do >= 10 ký tự
- [ ] Validation ngày kết thúc >= ngày bắt đầu
- [ ] Xem danh sách phiếu
- [ ] Hủy phiếu Pending
- [ ] Không hủy được phiếu Approved/Rejected

### Test Late Request

- [ ] Chọn ngày
- [ ] Chọn giờ (24h format)
- [ ] Validation lý do >= 10 ký tự
- [ ] Tạo phiếu thành công
- [ ] Xem danh sách phiếu
- [ ] Hủy phiếu Pending

### Test Shift Swap Request

- [ ] Xem lịch làm việc của mình
- [ ] Chọn ca muốn đổi
- [ ] Xem danh sách nhân viên trong ca
- [ ] Chọn người muốn đổi
- [ ] Preview thông tin đúng
- [ ] Validation lý do >= 10 ký tự
- [ ] Gửi yêu cầu thành công
- [ ] Xem danh sách yêu cầu
- [ ] Hủy yêu cầu Pending

## 8. API Response Examples

### Leave Request Response

```json
{
    "id": 1,
    "userId": 3,
    "userName": "Nguyễn Văn A",
    "leaveType": "Nghỉ phép",
    "startDate": "2024-12-10",
    "endDate": "2024-12-12",
    "reason": "Về quê thăm gia đình",
    "status": "Pending",
    "createdAt": "2024-12-06T10:00:00Z"
}
```

### Late Request Response

```json
{
    "id": 1,
    "userId": 3,
    "userName": "Nguyễn Văn A",
    "date": "2024-12-07",
    "expectedArrivalTime": "09:30",
    "reason": "Đưa con đi khám bệnh",
    "status": "Pending",
    "createdAt": "2024-12-06T10:00:00Z"
}
```

### Shift Request Response

```json
{
    "id": 1,
    "userId": 3,
    "userName": "Nguyễn Văn A",
    "currentShiftId": 10,
    "currentShiftName": "Ca sáng",
    "currentShiftDate": "2024-12-10",
    "requestedShiftId": 15,
    "requestedShiftName": "Ca chiều",
    "requestedShiftDate": "2024-12-10",
    "reason": "Có việc gia đình buổi sáng",
    "status": "Pending",
    "createdAt": "2024-12-06T10:00:00Z"
}
```

## 9. Troubleshooting

### Date Picker không hiển thị
- Kiểm tra đã cài `@react-native-community/datetimepicker`
- Kiểm tra import đúng
- Kiểm tra state showDatePicker

### Không tải được danh sách
- Kiểm tra API endpoint
- Kiểm tra token authentication
- Xem console log lỗi

### Không tạo được phiếu
- Kiểm tra validation
- Kiểm tra network request
- Xem response error message

### Shift Swap: Không có danh sách ca
- Kiểm tra API `/api/Schedule/my` có hoạt động
- Kiểm tra user có ca làm việc chưa

### Shift Swap: Không có nhân viên trong ca
- Kiểm tra API `/api/Schedule/shift/{id}/employees`
- Kiểm tra ca đã có nhân viên được assign chưa

## 10. Future Enhancements

- [ ] Push notification khi phiếu được duyệt/từ chối
- [ ] Filter theo trạng thái (Pending/Approved/Rejected)
- [ ] Filter theo tháng/năm
- [ ] Export danh sách phiếu
- [ ] Thống kê số ngày nghỉ còn lại
- [ ] Calendar view cho phiếu nghỉ
- [ ] Bulk create (tạo nhiều phiếu cùng lúc)
- [ ] Template lý do thường dùng
- [ ] Upload file đính kèm (giấy khám bệnh, v.v.)

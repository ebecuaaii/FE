# Cập Nhật Màn Hình Yêu Cầu - Flow Mới

## Thay Đổi

Đã cập nhật 2 màn hình để user chọn ca từ lịch làm việc trước khi tạo phiếu:

1. **Phiếu Xin Nghỉ Phép** (`leave-request.tsx`)
2. **Phiếu Xin Đi Trễ** (`late-request.tsx`)

## Flow Mới

### 1. Phiếu Xin Nghỉ Phép

```
User nhấn "Tạo phiếu"
   ↓
Modal hiển thị lịch làm việc của user
   ↓
User chọn ca muốn xin nghỉ
   ↓
Modal tạo phiếu hiển thị với:
   - Thông tin ca đã chọn (card màu xanh nhạt)
   - Chọn loại nghỉ phép
   - Chọn từ ngày/đến ngày (mặc định = ngày ca)
   - Nhập lý do
   ↓
Tạo phiếu thành công
```

### 2. Phiếu Xin Đi Trễ

```
User nhấn "Tạo phiếu"
   ↓
Modal hiển thị lịch làm việc của user
   ↓
User chọn ca muốn xin đi trễ
   ↓
Modal tạo phiếu hiển thị với:
   - Thông tin ca đã chọn (card màu vàng nhạt)
   - Giờ dự kiến đến (mặc định = giờ bắt đầu ca)
   - Nhập lý do
   ↓
Tạo phiếu thành công
```

## API Cần Có

```
GET /api/Schedule/my
```

**Response:**
```json
[
    {
        "id": 1,
        "shiftName": "Ca sáng",
        "date": "2024-12-10",
        "startTime": "08:00",
        "endTime": "12:00"
    },
    {
        "id": 2,
        "shiftName": "Ca chiều",
        "date": "2024-12-11",
        "startTime": "13:00",
        "endTime": "17:00"
    }
]
```

## UI Components Mới

### Select Shift Modal

**Leave Request (màu xanh):**
- Header: "Chọn ca muốn xin nghỉ"
- Danh sách ca với icon Calendar màu #0d9488
- Mỗi item: Tên ca + Ngày + Giờ

**Late Request (màu cam):**
- Header: "Chọn ca muốn xin đi trễ"
- Danh sách ca với icon Calendar màu #f59e0b
- Mỗi item: Tên ca + Ngày + Giờ

### Selected Shift Card

**Leave Request:**
```tsx
<View style={styles.selectedShiftCard}>
    <Text style={styles.selectedShiftLabel}>Ca làm việc:</Text>
    <Text style={styles.selectedShiftName}>Ca sáng</Text>
    <Text style={styles.selectedShiftDate}>10/12/2024 • 08:00 - 12:00</Text>
</View>
```
- Background: #ecfeff (xanh nhạt)
- Border: #67e8f9

**Late Request:**
```tsx
<View style={styles.selectedShiftCard}>
    <Text style={styles.selectedShiftLabel}>Ca làm việc:</Text>
    <Text style={styles.selectedShiftName}>Ca sáng</Text>
    <Text style={styles.selectedShiftDate}>10/12/2024 • 08:00 - 12:00</Text>
</View>
```
- Background: #fffbeb (vàng nhạt)
- Border: #fcd34d

## Styles Mới

```typescript
shiftItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
},
shiftItemInfo: {
    flex: 1,
},
shiftItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f172a",
    marginBottom: 4,
},
shiftItemDate: {
    fontSize: 13,
    color: "#6b7280",
},
selectedShiftCard: {
    backgroundColor: "#ecfeff", // hoặc #fffbeb cho late request
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#67e8f9", // hoặc #fcd34d cho late request
},
selectedShiftLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0e7490", // hoặc #92400e cho late request
    marginBottom: 6,
},
selectedShiftName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0f172a",
    marginBottom: 4,
},
selectedShiftDate: {
    fontSize: 14,
    color: "#6b7280",
},
```

## Lợi Ích

1. **UX tốt hơn**: User chọn ca từ lịch thay vì nhập ngày thủ công
2. **Giảm lỗi**: Không thể chọn ngày không có ca
3. **Context rõ ràng**: Hiển thị thông tin ca đang xin nghỉ/đi trễ
4. **Consistent**: Cả 3 loại phiếu đều có flow tương tự

## Cài Đặt

Cần cài package cho Date/Time Picker:

```bash
npm install @react-native-community/datetimepicker
```

## Testing

### Test Leave Request

- [ ] Nhấn "Tạo phiếu"
- [ ] Modal lịch làm việc hiển thị
- [ ] Chọn ca
- [ ] Modal tạo phiếu hiển thị với thông tin ca
- [ ] Ngày mặc định = ngày ca
- [ ] Có thể thay đổi ngày
- [ ] Tạo phiếu thành công

### Test Late Request

- [ ] Nhấn "Tạo phiếu"
- [ ] Modal lịch làm việc hiển thị
- [ ] Chọn ca
- [ ] Modal tạo phiếu hiển thị với thông tin ca
- [ ] Giờ mặc định = giờ bắt đầu ca
- [ ] Có thể thay đổi giờ
- [ ] Tạo phiếu thành công

### Test Empty State

- [ ] Không có ca làm việc
- [ ] Modal hiển thị "Không có ca làm việc"

## Troubleshooting

### Không tải được lịch làm việc
- Kiểm tra API `/api/Schedule/my` hoạt động
- Kiểm tra user có ca làm việc chưa
- Xem console log lỗi

### Selected shift card không hiển thị
- Kiểm tra selectedShift state
- Kiểm tra conditional rendering

### Date/Time picker lỗi
- Kiểm tra đã cài `@react-native-community/datetimepicker`
- Kiểm tra import đúng

## So Sánh Flow Cũ vs Mới

| Aspect | Flow Cũ | Flow Mới |
|--------|---------|----------|
| Chọn ngày | Nhập thủ công | Chọn từ lịch làm việc |
| Context | Không rõ | Hiển thị thông tin ca |
| Validation | Có thể chọn ngày không có ca | Chỉ chọn ca có trong lịch |
| UX | Phức tạp | Đơn giản, trực quan |
| Steps | 1 modal | 2 modals (chọn ca → tạo phiếu) |

## Kết Luận

Flow mới giúp user dễ dàng tạo phiếu xin nghỉ/đi trễ hơn bằng cách chọn trực tiếp từ lịch làm việc của mình, giảm thiểu lỗi và cải thiện trải nghiệm người dùng.

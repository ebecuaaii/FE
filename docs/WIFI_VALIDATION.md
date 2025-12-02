# Hướng dẫn cấu hình WiFi Validation cho Backend

## Tổng quan
App sẽ gửi thông tin WiFi (SSID và BSSID) lên server khi check-in/check-out. Backend cần validate xem nhân viên có đang ở vị trí cho phép không.

## API Changes

### 1. Check-in API
**Endpoint:** `POST /api/Attendance/checkin`

**Request (multipart/form-data):**
```
- image: File (ảnh khuôn mặt)
- wifiSSID: string (tên WiFi, optional)
- wifiBSSID: string (địa chỉ MAC của WiFi, optional)
```

**Response:**
```json
{
  "success": true,
  "message": "Check-in thành công",
  "checkInTime": "2025-12-02T08:30:00Z"
}
```

**Error Response (WiFi không hợp lệ):**
```json
{
  "success": false,
  "message": "Bạn không ở vị trí cho phép chấm công"
}
```

### 2. Check-out API
**Endpoint:** `POST /api/Attendance/checkout`

**Request (multipart/form-data):**
```
- image: File (ảnh khuôn mặt)
- wifiSSID: string (tên WiFi, optional)
- wifiBSSID: string (địa chỉ MAC của WiFi, optional)
```

## Database Schema

### Bảng: CompanyWiFiLocations
Lưu danh sách WiFi được phép của công ty/chi nhánh

```sql
CREATE TABLE CompanyWiFiLocations (
    Id INT PRIMARY KEY IDENTITY(1,1),
    CompanyId INT NOT NULL,
    BranchId INT NULL,
    LocationName NVARCHAR(200) NOT NULL,
    WifiSSID NVARCHAR(100) NOT NULL,
    WifiBSSID NVARCHAR(50) NOT NULL,
    IsActive BIT DEFAULT 1,
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    
    FOREIGN KEY (CompanyId) REFERENCES Companies(Id),
    FOREIGN KEY (BranchId) REFERENCES Branches(Id)
);
```

**Ví dụ dữ liệu:**
```sql
INSERT INTO CompanyWiFiLocations (CompanyId, BranchId, LocationName, WifiSSID, WifiBSSID)
VALUES 
    (1, 1, 'Văn phòng HN - Tầng 3', 'COMPANY_WIFI_HN', '00:11:22:33:44:55'),
    (1, 1, 'Văn phòng HN - Tầng 4', 'COMPANY_WIFI_HN', '00:11:22:33:44:66'),
    (1, 2, 'Văn phòng HCM', 'COMPANY_WIFI_HCM', '00:11:22:33:44:77');
```

## Backend Logic

### Validation Flow

```csharp
public async Task<bool> ValidateWiFiLocation(int userId, string wifiSSID, string wifiBSSID)
{
    // 1. Lấy thông tin công ty của user
    var user = await _userRepository.GetByIdAsync(userId);
    if (user == null) return false;
    
    // 2. Kiểm tra WiFi có trong danh sách cho phép không
    var allowedWifi = await _context.CompanyWiFiLocations
        .Where(w => w.CompanyId == user.CompanyId 
                 && w.IsActive == true
                 && (w.WifiBSSID == wifiBSSID || w.WifiSSID == wifiSSID))
        .FirstOrDefaultAsync();
    
    return allowedWifi != null;
}
```

### Check-in Controller Example

```csharp
[HttpPost("checkin")]
public async Task<IActionResult> CheckIn(
    [FromForm] IFormFile image,
    [FromForm] string? wifiSSID,
    [FromForm] string? wifiBSSID)
{
    var userId = GetCurrentUserId();
    
    // Validate WiFi nếu có thông tin
    if (!string.IsNullOrEmpty(wifiBSSID))
    {
        var isValidLocation = await _attendanceService.ValidateWiFiLocation(
            userId, 
            wifiSSID, 
            wifiBSSID
        );
        
        if (!isValidLocation)
        {
            return BadRequest(new { 
                success = false, 
                message = "Bạn không ở vị trí cho phép chấm công" 
            });
        }
    }
    
    // Tiếp tục xử lý nhận diện khuôn mặt và check-in
    // ...
}
```

## Cấu hình cho Admin

### API quản lý WiFi locations

**1. Lấy danh sách WiFi:**
```
GET /api/Admin/wifi-locations
```

**2. Thêm WiFi mới:**
```
POST /api/Admin/wifi-locations
Body: {
  "locationName": "Văn phòng HN - Tầng 5",
  "wifiSSID": "COMPANY_WIFI_HN",
  "wifiBSSID": "00:11:22:33:44:88",
  "branchId": 1
}
```

**3. Xóa/Vô hiệu hóa WiFi:**
```
DELETE /api/Admin/wifi-locations/{id}
```

## Lưu ý

1. **BSSID là quan trọng nhất**: SSID có thể bị giả mạo, nhưng BSSID (địa chỉ MAC) khó giả mạo hơn
2. **Cho phép nhiều BSSID**: Một công ty có thể có nhiều Access Point với cùng SSID
3. **Fallback**: Nếu app không gửi WiFi info (iOS restrictions), có thể cho phép check-in nhưng đánh dấu cần review
4. **Logging**: Lưu lại thông tin WiFi mỗi lần check-in/out để audit

## Testing

### Test cases:
1. ✅ Check-in với WiFi hợp lệ → Success
2. ❌ Check-in với WiFi không hợp lệ → Error
3. ⚠️ Check-in không có WiFi info → Success nhưng cần review
4. ✅ Check-in với BSSID đúng nhưng SSID khác → Success (ưu tiên BSSID)

## Tương lai

Có thể mở rộng thêm:
- GPS location validation
- Geofencing
- Time-based restrictions
- Multiple validation methods (WiFi + GPS)

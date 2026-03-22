# MODULE: AUDIT (LỊCH SỬ THAY ĐỔI)

## 1. Nghiệp vụ & Giao diện
- **Vị trí hiển thị:** Embed (nhúng) vào khu vực dưới cùng hoặc bên cột phải của `TaskDetailModal` (thuộc module Task).
- **Quyền hiển thị:** Bất kỳ ai xem được Task thì xem được lịch sử của Task đó.

## 2. Chi tiết UI Elements
- **Phần Tiêu đề:** "Hoạt động / Lịch sử thay đổi".
- **Dòng thời gian (Timeline):**
    - Cấu trúc list dọc, có một đường kẻ chỉ nhỏ nối giữa các item để tạo cảm giác dòng thời gian.
    - Fetch data ngầm bằng `GET /api/audit-logs?entityType=TASK&entityId={taskId}`.
    - **Empty State:** "Chưa có lịch sử thay đổi nào".
- **Giao diện 1 Item (AuditItem):**
    - Hiển thị thời gian `createdAt` (Format: `HH:mm dd/MM/yyyy` bằng màu chữ xám, nhỏ).
    - Dòng tiêu đề hành động: 
        - Action `CREATED`: `[Tên Actor]` đã tạo công việc này.
        - Action `DELETED`: `[Tên Actor]` đã xóa công việc này (Thường không hiển thị ở UI vì task đã bị xóa).
        - Action `UPDATED`: `[Tên Actor]` đã cập nhật công việc.
    - **Hiển thị khác biệt (Diff):** - FE cần parse JSON string từ `oldValue` và `newValue`.
        - So sánh các field (`title`, `status`, `priority`, `assigneeId`).
        - In ra màn hình các thay đổi. Ví dụ thiết kế UI: 
            - Trạng thái: `TODO` ➔ `IN_PROGRESS`.
            - Mức độ ưu tiên: `MEDIUM` ➔ `HIGH`.

## 3. Lỗi & Cảnh báo
- Bắt lỗi nếu `actor` trả về `null` (do user đã bị xóa khỏi hệ thống), hiển thị text: `"Người dùng ẩn"` hoặc `"Unknown User"`.

## 4. API & Types

    type AuditAction = 'CREATED' | 'UPDATED' | 'DELETED';

    interface AuditLog {
        id: string;
        action: AuditAction;
        actor: { id: string; fullName: string } | null;
        createdAt: string;
        oldValue: string | null;  // Chuỗi JSON: "{\"status\":\"TODO\"...}"
        newValue: string | null;  // Chuỗi JSON
    }
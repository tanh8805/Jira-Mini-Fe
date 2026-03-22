# MODULE: TASKS (BẢNG KANBAN & CÔNG VIỆC)

## 1. Navbar & Sidebar Layout

- **Sử dụng Layout:** `PrivateLayout`.
- **Project Sidebar:** Khi vào `/projects/:projectId/...`, hiển thị thanh menu bên trái:
  - Bảng công việc (Đang active).
  - Thành viên.
  - Cài đặt (Chỉ hiện nếu là OWNER).

## 2. Project Board - Bảng công việc (`/projects/:projectId/tasks`)

- **UI Elements (Phần Header):**
  - Tiêu đề: Tên dự án > "Bảng công việc".
  - Nút "+ Tạo công việc" (Primary color, nằm góc phải trên).
  - **Bộ lọc (Filters Bar):**
    - Dropdown 1: `Trạng thái` (Tất cả, TODO, IN_PROGRESS, DONE).
    - Dropdown 2: `Ưu tiên` (Tất cả, LOW, MEDIUM, HIGH).
    - Dropdown 3: `Người phụ trách` (Select list lấy từ danh sách Project Members).
- **UI Elements (Phần Kanban Board):**
  - Chia làm 3 cột bằng nhau, có background màu xám nhạt:
    - Cột 1: `CẦN LÀM (TODO)`
    - Cột 2: `ĐANG THỰC HIỆN (IN_PROGRESS)`
    - Cột 3: `HOÀN THÀNH (DONE)`
  - **Empty State (Cột rỗng):** Hiện chữ mờ "Chưa có công việc nào".
  - **Thẻ công việc (TaskCard):**
    - Card nền trắng, có shadow nhẹ.
    - Hiển thị Title (Cắt bớt nếu quá 2 dòng).
    - Icon/Badge `Priority`: LOW (Xanh lá), MEDIUM (Vàng), HIGH (Đỏ).
    - Icon Avatar hoặc Tên người phụ trách (Nằm góc dưới bên phải card).
  - **Thao tác Kéo thả (Drag & Drop):**
    - Kéo thẻ từ cột này sang cột khác.
    - Nhả chuột -> Tự động gọi API `PUT /api/projects/:projectId/tasks/:taskId` để cập nhật field `status`.
    - Cập nhật UI ngay lập tức (Optimistic Update) để trải nghiệm mượt mà, nếu gọi API lỗi thì hoàn tác kéo thẻ về vị trí cũ và hiện Toast báo lỗi.

## 3. Task Modal (Tạo & Chỉnh sửa công việc)

- **Trạng thái 1: Modal "Tạo công việc"**
  - Input: `Tiêu đề` (bắt buộc, max 100 ký tự).
  - Textarea: `Mô tả` (optional, max 2000 ký tự).
  - Select: `Độ ưu tiên` (LOW, MEDIUM, HIGH - mặc định MEDIUM).
  - Select: `Người phụ trách` (Lấy từ list members, optional).
  - _Lưu ý:_ Ẩn field trạng thái, mặc định submit sẽ là TODO. Bấm "Tạo" gọi `POST /api/projects/:projectId/tasks`.
- **Trạng thái 2: Drawer/Modal "Chi tiết công việc" (Mở khi click vào TaskCard)**
  - Form y hệt lúc tạo, nhưng có data điền sẵn và có thêm Select `Trạng thái` để chuyển đổi thủ công.
  - Cột bên phải (hoặc bên dưới form) là khu vực hiển thị **Lịch sử thay đổi (Audit)**.
  - Button: "Lưu thay đổi" (Gọi `PUT`).
  - Button: "Xóa công việc" (Màu đỏ). Bấm vào hiện Popup Confirm "Bạn có chắc chắn muốn xóa?". Đồng ý -> Gọi API `DELETE` -> Đóng modal, xóa card khỏi UI.

## 4. API & Types

### 4.1 PUT `/api/projects/{projectId}/tasks/{taskId}` — Cập nhật task (partial update)

- **Auth:** Bearer Token
- **Request Body:** Tất cả fields đều optional, chỉ gửi field cần thay đổi.

  {
  "title": "Fix login bug v2",
  "description": "Updated...",
  "status": "DONE",
  "priority": "MEDIUM",
  "assigneeId": "uuid"
  }

- **Validation/Rule:**
  - Task phải thuộc đúng `projectId` trong URL.
  - Nếu gửi `assigneeId` thì user đó phải là member của project.
  - `title` tối đa 100 ký tự.
  - `description` tối đa 2000 ký tự.
  - Sau khi cập nhật, hệ thống tự động ghi AuditLog với `action = UPDATED` (bao gồm `oldValue` và `newValue`).
- **Response thành công:** `200 OK`, trả về object Task (cùng schema với create).
- **Responses lỗi:**
  - `400 Bad Request`: `assigneeId` không phải member, `title` vượt giới hạn, dữ liệu không hợp lệ.
  - `401 Unauthorized`: Chưa đăng nhập.
  - `403 Forbidden`: Không phải member của project.
  - `404 Not Found`: Project hoặc Task không tồn tại, hoặc task không thuộc project này.

### 4.2 DELETE `/api/projects/{projectId}/tasks/{taskId}` — Xóa task (hard delete)

- **Auth:** Bearer Token
- **Rule:**
  - Task phải thuộc đúng `projectId` trong URL.
  - Hard delete, không thể khôi phục sau khi xóa.
  - Sau khi xóa, hệ thống tự động ghi AuditLog với `action = DELETED`.
- **Response thành công:** `204 No Content` (không có response body).
- **Responses lỗi:**
  - `401 Unauthorized`: Chưa đăng nhập.
  - `403 Forbidden`: Không phải member của project.
  - `404 Not Found`: Project hoặc Task không tồn tại, hoặc task không thuộc project này.

### 4.3 Task Enums

- `TaskStatus`: `TODO` | `IN_PROGRESS` | `DONE`
- `TaskPriority`: `LOW` | `MEDIUM` | `HIGH`

  type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
  type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

  interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  projectId: string;
  assigneeId?: string;
  assigneeName?: string;
  }

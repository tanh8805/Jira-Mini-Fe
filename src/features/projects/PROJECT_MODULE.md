# MODULE: PROJECTS (QUẢN LÝ DỰ ÁN)

## 1. Navbar & Layout
- **Sử dụng Layout:** `PrivateLayout` (Dành cho user đã đăng nhập).
- **Navbar (Topbar):** Nằm trên cùng của mọi trang Private.
    - **Góc trái:** Logo "Jira Mini" (Click vào luôn quay về `/projects`).
    - **Góc phải:** Dropdown User Profile (Hiển thị Email hoặc Tên). Khi click xổ ra menu có nút "Đăng xuất" (Gọi API logout & xóa token).

## 2. Dashboard - Danh sách dự án (`/projects`)
- **UI Elements:**
    - Tiêu đề trang: "Các dự án của tôi".
    - Button: "+ Tạo dự án mới" (Nằm góc phải trên cùng).
    - **Empty State:** Nếu API trả về mảng rỗng -> Hiện hình ảnh minh họa mờ và text "Bạn chưa tham gia dự án nào".
    - **Grid List:** Nếu có data, render danh sách `ProjectCard`.
        - **ProjectCard:** Thẻ bo góc có viền. Hiển thị `name` (chữ to, in đậm), `description` (text xám, cắt bớt nếu quá dài), và ngày tạo `createdAt` (format dd/MM/yyyy).
        - Hover vào thẻ có hiệu ứng nổi lên. Click vào thẻ -> Điều hướng sang `/projects/:projectId/tasks`.
- **Modal "Tạo dự án mới":**
    - Input: `Tên dự án` (bắt buộc, max 100 ký tự).
    - Textarea: `Mô tả` (optional, max 2000 ký tự).
    - Nút "Hủy" và "Lưu". Submit gọi `POST /api/projects`. Thành công -> Đóng Modal, fetch lại list.

## 3. Project Settings (`/projects/:projectId/settings`)
- **Quyền hiển thị:** Chỉ user có role `OWNER` mới thấy tab này ở Sidebar.
- **UI Elements:**
    - Tiêu đề: "Cài đặt dự án".
    - Cấu trúc Form (giống lúc tạo nhưng hiển thị data cũ):
        - Input `Tên dự án`.
        - Textarea `Mô tả`.
    - Nút "Lưu thay đổi" (Primary color). Bấm lưu gọi `PUT /api/projects/:projectId`.

## 4. Project Members (`/projects/:projectId/members`)
- **Quyền hiển thị:** Mọi member đều thấy list, nhưng thao tác Thêm chỉ dành cho `OWNER` và `MANAGER`.
- **UI Elements:**
    - Tiêu đề: "Thành viên dự án".
    - Button "+ Thêm thành viên" (Chỉ hiện nếu là OWNER/MANAGER).
    - **Table (Bảng dữ liệu):**
        - Cột 1: STT hoặc Avatar mặc định.
        - Cột 2: Tên thành viên (`user.fullName`).
        - Cột 3: Email.
        - Cột 4: Vai trò (Badge màu sắc để phân biệt: OWNER (Đỏ), MANAGER (Cam), MEMBER (Xanh)).
- **Modal "Thêm thành viên":**
    - Input: `Email` (type email, bắt buộc).
    - Select/Dropdown: `Vai trò` (chọn OWNER, MANAGER, hoặc MEMBER).
    - Nút "Hủy" và "Thêm". Submit gọi `POST /api/projects/:projectId/members`. Bắt lỗi 409 nếu user đã có trong project.

## 5. API & Types

    type ProjectRole = 'OWNER' | 'MANAGER' | 'MEMBER';

    interface Project {
        id: string;
        name: string;
        description?: string;
        createdAt: string;
    }
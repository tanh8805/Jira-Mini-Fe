# MODULE: AUTH (XÁC THỰC)

## 1. Nghiệp vụ & Giao diện
- **Sử dụng Layout:** `AuthLayout` (Background màu xám nhạt/trơn, Form được đặt trong một Card trắng, căn giữa màn hình).

- **Trang Đăng nhập (`/login`):**
    - **UI Elements:**
        - Tiêu đề: "Đăng nhập Jira Mini".
        - Input 1: `Email` (type: email, placeholder: "Nhập email").
        - Input 2: `Password` (type: password, có icon mắt để ẩn/hiện mật khẩu).
        - Button: "Đăng nhập" (Primary color, full width, disable/hiện spinner khi đang gọi API).
        - Link điều hướng: "Chưa có tài khoản? Đăng ký ngay" -> Click chuyển sang `/register`.
    - **Logic:** Submit gọi `POST /api/auth/login`. Thành công -> Lưu token, redirect `/projects`. Thất bại (401) -> Báo đỏ dưới form.

- **Trang Đăng ký (`/register`):**
    - **UI Elements:**
        - Tiêu đề: "Tạo tài khoản mới".
        - Input 1: `Họ và tên` (type: text, bắt buộc).
        - Input 2: `Email` (type: email, bắt buộc).
        - Input 3: `Mật khẩu` (type: password).
        - Input 4: `Xác nhận mật khẩu` (type: password).
        - Button: "Đăng ký" (Primary color, full width).
        - Link điều hướng: "Đã có tài khoản? Đăng nhập" -> Click chuyển sang `/login`.
    - **Logic:** Submit gọi `POST /api/auth/register`. Thành công -> Toast xanh, redirect `/login`. Thất bại (409) -> Báo đỏ lỗi trùng email.

## 2. API & Types

    interface AuthResponse {
        message: string;
        accessToken: string;
        refreshToken: string;
    }
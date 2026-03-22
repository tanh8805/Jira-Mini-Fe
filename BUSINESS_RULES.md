# GLOBAL BUSINESS RULES — JIRA MINI FRONTEND

## 1. Authentication & Token Flow (Luồng xác thực)
- **Cơ chế Token:** Sử dụng `accessToken` (sống ngắn) và `refreshToken` (sống dài). FE lưu token vào LocalStorage/State.
- **Silent Refresh (Làm mới ngầm):**
    - Axios Interceptors đính kèm header `Authorization: Bearer <accessToken>` vào mọi request (trừ Auth).
    - Khi API trả lỗi `401 Unauthorized` (Token expired):
        1. Tạm giữ (queue) các request đang bị lỗi.
        2. Gọi ngầm API `POST /api/auth/refresh` bằng `refreshToken`.
        3. Có token mới -> Gắn vào các request đang bị giữ và gọi lại (retry).
        4. Nếu quá trình refresh thất bại -> Xóa token, điều hướng user về `/login`.

## 2. Role-Based Access Control (Phân quyền UI)
Dựa vào Role của User trong Project để render UI:
- **OWNER:** Thấy tab/nút "Cài đặt Project", "Thêm thành viên", và có quyền thao tác Task.
- **MANAGER:** Bị ẨN "Cài đặt Project". Vẫn thấy "Thêm thành viên" và thao tác Task.
- **MEMBER:** Bị ẨN "Cài đặt Project" và "Thêm thành viên". Chỉ thao tác Task.

## 3. Global Validations & Error Handling
- **Validate:** Email đúng chuẩn, Password > 6 ký tự. Text input không được rỗng, max 100 ký tự. Description max 2000 ký tự.
- **Xử lý lỗi (Toast Notification):**
    - `400`: Lỗi validate (Bôi đỏ input).
    - `403`: Báo "Bạn không có quyền thực hiện hành động này".
    - `404`: Báo "Dữ liệu không tồn tại".
    - `409`: Lỗi trùng lặp (VD: Email đã tồn tại) -> Báo đỏ form input.
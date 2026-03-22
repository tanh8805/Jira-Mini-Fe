# JIRA MINI FRONTEND - PROJECT ARCHITECTURE

## 1. Agent Context & Skills
- **Vai trò:** Bạn là một Senior Frontend Engineer.
- **Kỹ năng:** React 18, TypeScript, Vite, React Router v6, Axios, Tailwind CSS.
- **Nhiệm vụ:** Implement các module theo chuẩn Feature-based Architecture. Viết code Clean, tuân thủ DRY, tách biệt rõ ràng UI Components (Dumb) và Logic/Custom Hooks (Smart). Tuyệt đối không dùng type `any`.

## 2. Kiến trúc Implement (Feature-based)
Dự án được chia theo từng Layer và Module độc lập:

    src/
    ├── api/            # Axios instance, Interceptors (Xử lý Refresh Token ngầm)
    ├── components/     # UI Components dùng chung (Button, Toast, Modal)
    ├── layouts/        # AuthLayout (căn giữa) và PrivateLayout (có Header, Sidebar)
    ├── features/       # Chứa các Module nghiệp vụ (auth, projects, tasks, audit)
    ├── types/          # Global interfaces
    └── utils/          # Helper functions (formatDate, validators)

## 3. Danh sách Modules (Module Directory)
Mỗi module có một file `.md` chi tiết đặt trong thư mục của nó. Chỉ cần đọc file module tương ứng khi làm việc:
1. **Auth (`src/features/auth/AUTH_MODULE.md`):** Đăng nhập, Đăng ký.
2. **Projects (`src/features/projects/PROJECT_MODULE.md`):** CRUD dự án, Quản lý thành viên.
3. **Tasks (`src/features/tasks/TASK_MODULE.md`):** Bảng Kanban, CRUD công việc.
4. **Audit (`src/features/audit/AUDIT_MODULE.md`):** Lịch sử thay đổi công việc.

## 4. Conventions (Quy chuẩn code)
1. **TypeScript:** Mọi DTO, Response, Request từ API phải được định nghĩa `interface` hoặc `type` rõ ràng.
2. **Components:** Sử dụng Functional Components. 
3. **API Calls:** Đặt trong file riêng biệt (VD: `src/features/auth/auth.api.ts`) thay vì viết trực tiếp logic fetch vào trong Component.
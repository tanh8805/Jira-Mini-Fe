import { useState } from "react";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
} from "react-router-dom";
import toast from "react-hot-toast";
import { getAccessToken } from "../api/axiosClient";
import { getUserDisplayLabel, logoutApi } from "../features/auth/auth.api";

function PrivateLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const isAuthenticated = Boolean(getAccessToken());

  const profileLabel = getUserDisplayLabel();

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const onLogout = async () => {
    try {
      await logoutApi();
    } catch {
      toast.error("Không thể đăng xuất. Vui lòng thử lại.");
    } finally {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="text-lg font-semibold text-gray-900 hover:text-blue-700"
            >
              Jira Mini
            </Link>

            <nav className="hidden items-center gap-2 sm:flex">
              <Link
                to="/"
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
              >
                Trang chủ
              </Link>
              <Link
                to="/about"
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
              >
                About
              </Link>
              <Link
                to="/contact"
                className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
              >
                Contact
              </Link>
              <Link
                to="/projects"
                className="ml-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Vào dự án
              </Link>
            </nav>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsProfileOpen((current) => !current)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              <span className="max-w-45 truncate">{profileLabel}</span>
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 011.08 1.04l-4.25 4.51a.75.75 0 01-1.08 0l-4.25-4.51a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>

            {isProfileOpen ? (
              <div className="absolute right-0 z-20 mt-2 w-44 rounded-lg border border-gray-200 bg-white p-1 shadow-lg">
                <button
                  type="button"
                  onClick={onLogout}
                  className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 transition hover:bg-red-50"
                >
                  Đăng xuất
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </header>

      <main className="flex-1 py-5">
        <div key={location.pathname} className="workspace-page-enter">
          <Outlet />
        </div>
      </main>

      <p className="pointer-events-none fixed bottom-2 right-4 text-[11px] text-gray-400">
        © 2026 Jira Mini
      </p>
    </div>
  );
}

export default PrivateLayout;

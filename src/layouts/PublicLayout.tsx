import { Link, Outlet } from "react-router-dom";
import { getAccessToken } from "../api/axiosClient";
import SiteFooter from "../components/SiteFooter";

function PublicLayout() {
  const isAuthenticated = Boolean(getAccessToken());

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            to="/"
            className="text-lg font-semibold text-gray-900 hover:text-blue-700"
          >
            Jira Mini
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              to="/"
              className="rounded-md px-3 py-1.5 text-sm text-gray-600 transition hover:bg-gray-100"
            >
              Home
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

            {isAuthenticated ? (
              <Link
                to="/projects"
                className="ml-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Go to projects
              </Link>
            ) : (
              <Link
                to="/login"
                className="ml-1 rounded-md bg-blue-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  );
}

export default PublicLayout;

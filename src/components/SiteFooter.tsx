import { Link } from "react-router-dom";

function SiteFooter() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-lg font-semibold text-gray-900">Jira Mini</p>
          <p className="mt-2 max-w-sm text-sm text-gray-600">
            Nền tảng quản lý dự án gọn nhẹ, tối ưu cho teamwork hiện đại.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <div>
            <p className="text-sm font-semibold text-gray-900">Liên kết</p>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/" className="hover:text-blue-700">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-blue-700">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-blue-700">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-gray-900">Pháp lý</p>
            <ul className="mt-2 space-y-2 text-sm text-gray-600">
              <li>
                <Link to="/terms" className="hover:text-blue-700">
                  Điều khoản
                </Link>
              </li>
              <li>
                <a
                  href="https://github.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-blue-700"
                >
                  GitHub Repo
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100 px-4 py-3 text-center text-xs text-gray-500 sm:px-6">
        Copyright © 2026 Jira Mini.
      </div>
    </footer>
  );
}

export default SiteFooter;

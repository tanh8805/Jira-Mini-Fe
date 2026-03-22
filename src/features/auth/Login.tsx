import axios from "axios";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { loginApi, setUserDisplayLabel } from "./auth.api";

type LoginFormValues = {
  email: string;
  password: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const onSubmit = async (values: LoginFormValues) => {
    setServerError("");

    try {
      await loginApi({
        email: values.email.trim(),
        password: values.password,
      });

      setUserDisplayLabel(values.email.trim());

      navigate("/projects", { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setServerError("Email hoặc mật khẩu không đúng");
        return;
      }

      setServerError("Đăng nhập thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="rounded-xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900">
        Đăng nhập Jira Mini
      </h1>

      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            placeholder="Nhập email"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            {...register("email", {
              required: "Email là bắt buộc",
              maxLength: {
                value: 100,
                message: "Email không được vượt quá 100 ký tự",
              },
              pattern: {
                value: emailPattern,
                message: "Email không đúng định dạng",
              },
            })}
          />
          {errors.email ? (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          ) : null}
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Mật khẩu
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-11 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              {...register("password", {
                required: "Mật khẩu là bắt buộc",
                minLength: {
                  value: 7,
                  message: "Mật khẩu phải lớn hơn 6 ký tự",
                },
                maxLength: {
                  value: 100,
                  message: "Mật khẩu không được vượt quá 100 ký tự",
                },
              })}
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              {showPassword ? (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-5 0-9.27-3.11-11-8 1-2.71 2.79-4.91 5-6.34" />
                  <path d="M1 1l22 22" />
                  <path d="M9.53 9.53A3.5 3.5 0 0 0 12 15.5a3.5 3.5 0 0 0 2.47-5.97" />
                  <path d="M14.47 14.47L9.53 9.53" />
                  <path d="M21 12a10.94 10.94 0 0 0-3.52-4.92" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        {serverError ? (
          <p className="text-sm font-medium text-red-600">{serverError}</p>
        ) : null}
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Chưa có tài khoản?{" "}
        <Link
          to="/register"
          className="font-medium text-blue-600 hover:underline"
        >
          Đăng ký ngay
        </Link>
      </p>
    </div>
  );
}

export default Login;

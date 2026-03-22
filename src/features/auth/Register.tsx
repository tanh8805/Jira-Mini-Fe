import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { registerApi } from "./auth.api";

type RegisterFormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type SubmitState = "idle" | "loading" | "success";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const registerFormVariants: Variants = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.055,
      delayChildren: 0.04,
    },
  },
};

const registerFieldVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.985 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 240,
      damping: 24,
    },
  },
};

function Register() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] =
    useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>();

  const fullNameValue = watch("fullName");
  const emailValue = watch("email");
  const passwordValue = watch("password");
  const confirmPasswordValue = watch("confirmPassword");

  const isWorking = isSubmitting || submitState === "loading";

  const onSubmit = async (values: RegisterFormValues) => {
    setServerError("");
    setSubmitState("loading");

    try {
      await registerApi({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
      });

      setSubmitState("success");

      await new Promise((resolve) => {
        window.setTimeout(resolve, 500);
      });

      navigate("/login", { replace: true });
    } catch (error: unknown) {
      setSubmitState("idle");

      if (axios.isAxiosError(error) && error.response?.status === 409) {
        setError("email", {
          type: "server",
          message: "Email đã tồn tại",
        });
        return;
      }

      setServerError("Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h1 className="mb-2 text-center text-xl font-semibold text-gray-900 sm:text-2xl">
        Tạo tài khoản mới
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Đăng ký nhanh để bắt đầu quản lý dự án chuyên nghiệp hơn.
      </p>

      <motion.form
        className="space-y-4"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        variants={registerFormVariants}
        initial="hidden"
        animate="show"
      >
        <motion.div
          variants={registerFieldVariants}
          className={`auth-field-wrap ${
            focusedField && focusedField !== "fullName" ? "auth-dimmed" : ""
          }`}
        >
          <div className="auth-input-shell">
            <input
              id="fullName"
              type="text"
              placeholder=" "
              disabled={isWorking}
              onFocus={() => setFocusedField("fullName")}
              className="w-full rounded-xl bg-transparent px-3 pt-5 pb-2.5 text-sm outline-none"
              {...register("fullName", {
                required: "Họ và tên là bắt buộc",
                maxLength: {
                  value: 100,
                  message: "Họ và tên không được vượt quá 100 ký tự",
                },
                validate: (value) =>
                  value.trim().length > 0 || "Họ và tên không được để trống",
                onBlur: () => setFocusedField(null),
              })}
            />
            <label
              htmlFor="fullName"
              className={`auth-floating-label ${
                focusedField === "fullName" || Boolean(fullNameValue)
                  ? "auth-floating-label-active"
                  : ""
              }`}
            >
              Họ và tên
            </label>
          </div>

          <AnimatePresence>
            {errors.fullName ? (
              <motion.p
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="mt-1 text-sm text-red-600"
              >
                {errors.fullName.message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={registerFieldVariants}
          className={`auth-field-wrap ${
            focusedField && focusedField !== "email" ? "auth-dimmed" : ""
          }`}
        >
          <div className="auth-input-shell">
            <input
              id="email"
              type="email"
              placeholder=" "
              disabled={isWorking}
              onFocus={() => setFocusedField("email")}
              className="w-full rounded-xl bg-transparent px-3 pt-5 pb-2.5 text-sm outline-none"
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
                onBlur: () => setFocusedField(null),
              })}
            />
            <label
              htmlFor="email"
              className={`auth-floating-label ${
                focusedField === "email" || Boolean(emailValue)
                  ? "auth-floating-label-active"
                  : ""
              }`}
            >
              Email
            </label>
          </div>

          <AnimatePresence>
            {errors.email ? (
              <motion.p
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="mt-1 text-sm text-red-600"
              >
                {errors.email.message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={registerFieldVariants}
          className={`auth-field-wrap ${
            focusedField && focusedField !== "password" ? "auth-dimmed" : ""
          }`}
        >
          <div className="auth-input-shell">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder=" "
              disabled={isWorking}
              onFocus={() => setFocusedField("password")}
              className="w-full rounded-xl bg-transparent px-3 pt-5 pb-2.5 pr-11 text-sm outline-none"
              {...register("password", {
                required: "Mật khẩu là bắt buộc",
                minLength: {
                  value: 6,
                  message: "Mật khẩu phải có ít nhất 6 ký tự",
                },
                maxLength: {
                  value: 100,
                  message: "Mật khẩu không được vượt quá 100 ký tự",
                },
                onBlur: () => setFocusedField(null),
              })}
            />
            <label
              htmlFor="password"
              className={`auth-floating-label ${
                focusedField === "password" || Boolean(passwordValue)
                  ? "auth-floating-label-active"
                  : ""
              }`}
            >
              Mật khẩu
            </label>
            <button
              type="button"
              disabled={isWorking}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <motion.path
                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"
                  animate={{ opacity: showPassword ? 0.4 : 1 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="12"
                  cy="12"
                  r="3"
                  animate={{
                    scale: showPassword ? 0.6 : 1,
                    opacity: showPassword ? 0.35 : 1,
                  }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
                <motion.path
                  d="M3 3l18 18"
                  initial={false}
                  animate={{
                    pathLength: showPassword ? 1 : 0,
                    opacity: showPassword ? 1 : 0,
                  }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                />
              </motion.svg>
            </button>
          </div>

          <AnimatePresence>
            {errors.password ? (
              <motion.p
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="mt-1 text-sm text-red-600"
              >
                {errors.password.message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <motion.div
          variants={registerFieldVariants}
          className={`auth-field-wrap ${
            focusedField && focusedField !== "confirmPassword"
              ? "auth-dimmed"
              : ""
          }`}
        >
          <div className="auth-input-shell">
            <input
              id="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder=" "
              disabled={isWorking}
              onFocus={() => setFocusedField("confirmPassword")}
              className="w-full rounded-xl bg-transparent px-3 pt-5 pb-2.5 pr-11 text-sm outline-none"
              {...register("confirmPassword", {
                required: "Vui lòng xác nhận mật khẩu",
                validate: (value) =>
                  value === passwordValue || "Mật khẩu không khớp",
                onBlur: () => setFocusedField(null),
              })}
            />
            <label
              htmlFor="confirmPassword"
              className={`auth-floating-label ${
                focusedField === "confirmPassword" ||
                Boolean(confirmPasswordValue)
                  ? "auth-floating-label-active"
                  : ""
              }`}
            >
              Xác nhận mật khẩu
            </label>
            <button
              type="button"
              disabled={isWorking}
              onClick={() => setShowConfirmPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-gray-700"
              aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
            >
              <motion.svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <motion.path
                  d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"
                  animate={{ opacity: showConfirmPassword ? 0.4 : 1 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
                <motion.circle
                  cx="12"
                  cy="12"
                  r="3"
                  animate={{
                    scale: showConfirmPassword ? 0.6 : 1,
                    opacity: showConfirmPassword ? 0.35 : 1,
                  }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                />
                <motion.path
                  d="M3 3l18 18"
                  initial={false}
                  animate={{
                    pathLength: showConfirmPassword ? 1 : 0,
                    opacity: showConfirmPassword ? 1 : 0,
                  }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                />
              </motion.svg>
            </button>
          </div>

          <AnimatePresence>
            {errors.confirmPassword ? (
              <motion.p
                initial={{ opacity: 0, y: -4, height: 0 }}
                animate={{ opacity: 1, y: 0, height: "auto" }}
                exit={{ opacity: 0, y: -4, height: 0 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="mt-1 text-sm text-red-600"
              >
                {errors.confirmPassword.message}
              </motion.p>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <motion.div variants={registerFieldVariants}>
          <motion.button
            type="submit"
            disabled={isWorking || submitState === "success"}
            animate={{
              width: submitState === "idle" ? "100%" : 56,
              borderRadius: submitState === "idle" ? 12 : 999,
            }}
            transition={{ duration: 0.28, ease: "easeInOut" }}
            className="auth-liquid-button relative mx-auto flex h-12 w-full items-center justify-center bg-blue-600 px-4 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed"
          >
            <AnimatePresence mode="wait" initial={false}>
              {submitState === "idle" ? (
                <motion.span
                  key="register-text"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  Đăng ký
                </motion.span>
              ) : null}

              {submitState === "loading" ? (
                <motion.span
                  key="register-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, rotate: 360 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.9,
                    ease: "linear",
                  }}
                  className="inline-flex h-5 w-5 rounded-full border-2 border-white/40 border-t-white"
                />
              ) : null}

              {submitState === "success" ? (
                <motion.span
                  key="register-success"
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: [1, 1.18, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.32, ease: "easeOut" }}
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500"
                >
                  <svg
                    viewBox="0 0 20 20"
                    className="h-3.5 w-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    aria-hidden="true"
                  >
                    <path d="M4 10.5l3.2 3.2L16 5.8" />
                  </svg>
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.button>
        </motion.div>

        <AnimatePresence>
          {serverError ? (
            <motion.p
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="text-sm font-medium text-red-600"
            >
              {serverError}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </motion.form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Đã có tài khoản?{" "}
        <Link to="/login" className="font-medium text-blue-600 hover:underline">
          Đăng nhập
        </Link>
      </p>
    </div>
  );
}

export default Register;

import axios from "axios";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { loginApi, setUserDisplayLabel } from "./auth.api";

type LoginFormValues = {
  email: string;
  password: string;
};

type SubmitState = "idle" | "loading" | "success";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function Login() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>("idle");
  const [shouldShake, setShouldShake] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>();

  const emailValue = watch("email");
  const passwordValue = watch("password");

  const isWorking = isSubmitting || submitState === "loading";

  const onSubmit = async (values: LoginFormValues) => {
    setServerError("");
    setSubmitState("loading");

    try {
      await loginApi({
        email: values.email.trim(),
        password: values.password,
      });

      setUserDisplayLabel(values.email.trim());
      setSubmitState("success");

      await new Promise((resolve) => {
        window.setTimeout(resolve, 440);
      });

      navigate("/", { replace: true });
    } catch (error: unknown) {
      setSubmitState("idle");

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        setServerError("Incorrect email or password");
        setShouldShake(true);
        window.setTimeout(() => setShouldShake(false), 360);
        return;
      }

      setServerError("Sign-in failed. Please try again.");
      setShouldShake(true);
      window.setTimeout(() => setShouldShake(false), 360);
    }
  };

  return (
    <div className="w-full rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-200 sm:p-8">
      <h1 className="mb-2 text-center text-xl font-semibold text-gray-900 sm:text-2xl">
        Sign in to Jira Mini
      </h1>
      <p className="mb-6 text-center text-sm text-gray-500">
        Welcome back to your workspace.
      </p>

      <form
        className={`space-y-4 ${shouldShake ? "auth-form-shake" : ""}`}
        onSubmit={handleSubmit(onSubmit)}
        noValidate
      >
        <div
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
                required: "Email is required",
                maxLength: {
                  value: 100,
                  message: "Email must not exceed 100 characters",
                },
                pattern: {
                  value: emailPattern,
                  message: "Invalid email format",
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
        </div>

        <div
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
                required: "Password is required",
                minLength: {
                  value: 7,
                  message: "Password must be at least 7 characters",
                },
                maxLength: {
                  value: 100,
                  message: "Password must not exceed 100 characters",
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
              Password
            </label>
            <button
              type="button"
              disabled={isWorking}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex w-10 items-center justify-center text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? "Hide password" : "Show password"}
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
        </div>

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
                key="login-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Sign in
              </motion.span>
            ) : null}

            {submitState === "loading" ? (
              <motion.span
                key="login-loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, rotate: 360 }}
                exit={{ opacity: 0 }}
                transition={{ repeat: Infinity, duration: 0.9, ease: "linear" }}
                className="inline-flex h-5 w-5 rounded-full border-2 border-white/40 border-t-white"
              />
            ) : null}

            {submitState === "success" ? (
              <motion.span
                key="login-success"
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
      </form>

      <p className="mt-5 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link
          to="/register"
          className="font-medium text-blue-600 hover:underline"
        >
          Register now
        </Link>
      </p>
    </div>
  );
}

export default Login;

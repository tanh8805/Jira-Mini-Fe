import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getAccessToken } from "../api/axiosClient";
import RevealOnScroll from "../components/RevealOnScroll";

type ContactFormValues = {
  fullName: string;
  email: string;
  subject: string;
  message: string;
};

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function ContactPage() {
  const isAuthenticated = Boolean(getAccessToken());
  const [isSending, setIsSending] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    defaultValues: {
      fullName: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async () => {
    setIsSending(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSending(false);
    reset();
    toast.success("Đã gửi tin nhắn thành công");
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <RevealOnScroll>
        <section className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            Contact
          </h1>
          <p className="mx-auto mt-3 max-w-2xl text-gray-600">
            Hãy để lại lời nhắn, chúng tôi sẽ phản hồi trong 24h.
          </p>
        </section>
      </RevealOnScroll>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RevealOnScroll className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200">
          <div className="space-y-4">
            <article className="card-lift flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M4 5h16v14H4z" />
                  <path d="M4 7l8 6 8-6" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Email</p>
                <p className="text-sm text-gray-600">bui058277@gmail.com</p>
              </div>
            </article>

            <article className="card-lift flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.88.33 1.74.62 2.56a2 2 0 0 1-.45 2.11L8 9.77a16 16 0 0 0 6.23 6.23l1.38-1.28a2 2 0 0 1 2.11-.45c.82.29 1.68.5 2.56.62A2 2 0 0 1 22 16.92z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Hotline</p>
                <p className="text-sm text-gray-600">+84 33 280 1818</p>
              </div>
            </article>

            <article className="card-lift flex items-start gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4">
              <div className="rounded-lg bg-blue-100 p-2 text-blue-700">
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                >
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 1 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Văn phòng</p>
                <p className="text-sm text-gray-600">Hà Nội</p>
              </div>
            </article>
          </div>

          {!isAuthenticated ? (
            <div className="mt-6">
              <Link
                to="/login"
                className="btn-gradient inline-flex rounded-lg px-4 py-2 text-sm font-semibold text-white"
              >
                Vào ứng dụng
              </Link>
            </div>
          ) : null}
        </RevealOnScroll>

        <RevealOnScroll
          className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200"
          delayMs={90}
        >
          <h2 className="text-xl font-semibold text-gray-900">Gửi tin nhắn</h2>
          <form className="mt-4 space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                className="mb-1 block text-sm font-medium text-gray-700"
                htmlFor="fullName"
              >
                Họ tên
              </label>
              <input
                id="fullName"
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                {...register("fullName", {
                  required: "Họ tên là bắt buộc",
                  maxLength: { value: 100, message: "Tối đa 100 ký tự" },
                })}
              />
              {errors.fullName ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.fullName.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-gray-700"
                htmlFor="email"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: emailPattern,
                    message: "Email không đúng định dạng",
                  },
                  maxLength: { value: 100, message: "Tối đa 100 ký tự" },
                })}
              />
              {errors.email ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-gray-700"
                htmlFor="subject"
              >
                Tiêu đề
              </label>
              <input
                id="subject"
                type="text"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                {...register("subject", {
                  required: "Tiêu đề là bắt buộc",
                  maxLength: { value: 100, message: "Tối đa 100 ký tự" },
                })}
              />
              {errors.subject ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.subject.message}
                </p>
              ) : null}
            </div>

            <div>
              <label
                className="mb-1 block text-sm font-medium text-gray-700"
                htmlFor="message"
              >
                Nội dung lời nhắn
              </label>
              <textarea
                id="message"
                rows={5}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                {...register("message", {
                  required: "Nội dung là bắt buộc",
                  maxLength: { value: 2000, message: "Tối đa 2000 ký tự" },
                })}
              />
              {errors.message ? (
                <p className="mt-1 text-sm text-red-600">
                  {errors.message.message}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={isSending}
              className="btn-gradient inline-flex min-w-[130px] items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
            >
              {isSending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                  Đang gửi...
                </>
              ) : (
                "Gửi tin nhắn"
              )}
            </button>
          </form>
        </RevealOnScroll>
      </section>

      <RevealOnScroll className="mt-8 overflow-hidden rounded-2xl bg-white p-2 shadow-sm ring-1 ring-gray-200">
        <iframe
          title="Hanoi map"
          src="https://www.google.com/maps?q=Hanoi&output=embed"
          className="h-[280px] w-full rounded-xl"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </RevealOnScroll>
    </main>
  );
}

export default ContactPage;

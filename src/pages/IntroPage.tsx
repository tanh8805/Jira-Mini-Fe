import { Link } from "react-router-dom";
import { easeOut, motion } from "framer-motion";
import { getAccessToken } from "../api/axiosClient";
import RevealOnScroll from "../components/RevealOnScroll";

const heroContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const heroItem = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const featureContainer = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.02,
    },
  },
};

const featureItem = {
  hidden: { opacity: 0, y: 18, boxShadow: "0 0 0 rgba(0,0,0,0)" },
  visible: {
    opacity: 1,
    y: 0,
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
  },
};

function IntroPage() {
  const isAuthenticated = Boolean(getAccessToken());

  return (
    <main className="relative overflow-hidden bg-linear-to-b from-blue-50 via-white to-white">
      <div className="hero-orb hero-orb-left" />
      <div className="hero-orb hero-orb-right" />

      <section className="mx-auto grid min-h-[88vh] w-full max-w-6xl grid-cols-1 items-center gap-10 px-6 py-14 lg:grid-cols-2">
        <motion.div
          className="lg:pr-6"
          variants={heroContainer}
          initial="hidden"
          animate="visible"
        >
          <motion.span
            variants={heroItem}
            transition={{ duration: 0.24, ease: easeOut }}
            className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700"
          >
            Jira Mini Workspace
          </motion.span>
          <motion.h1
            variants={heroItem}
            transition={{ duration: 0.24, ease: easeOut }}
            className="mt-4 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl"
          >
            Quản lý dự án gọn nhẹ cho đội nhóm vừa và nhỏ
          </motion.h1>
          <motion.p
            variants={heroItem}
            transition={{ duration: 0.24, ease: easeOut }}
            className="mt-4 text-base text-gray-600 sm:text-lg"
          >
            Theo dõi công việc theo Kanban, phân vai thành viên theo dự án, và
            lưu lịch sử thay đổi đầy đủ để cả team luôn đồng bộ.
          </motion.p>

          <motion.div
            variants={heroItem}
            transition={{ duration: 0.24, ease: easeOut }}
            className="mt-8 flex flex-wrap items-center gap-3"
          >
            <Link
              to={isAuthenticated ? "/projects" : "/login"}
              className="btn-gradient rounded-lg px-5 py-3 text-sm font-semibold text-white"
            >
              {isAuthenticated ? "Vào dự án" : "Bắt đầu ngay"}
            </Link>
            <Link
              to="/about"
              className="card-lift rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Tìm hiểu thêm
            </Link>
            <Link
              to="/contact"
              className="card-lift rounded-lg border border-gray-300 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Liên hệ
            </Link>
          </motion.div>
        </motion.div>

        <RevealOnScroll delayMs={120}>
          <div className="relative mx-auto max-w-xl animate-float-slow rounded-2xl border border-blue-200 bg-white p-4 shadow-2xl shadow-blue-100/70">
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
            </div>
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <div className="mb-3 text-sm font-semibold text-slate-700">
                Dashboard Mockup
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-700">TODO</p>
                  <div className="mt-2 space-y-2">
                    <div className="h-6 rounded bg-blue-50" />
                    <div className="h-6 rounded bg-blue-50" />
                  </div>
                </div>
                <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-700">
                    IN_PROGRESS
                  </p>
                  <div className="mt-2 space-y-2">
                    <div className="h-6 rounded bg-amber-50" />
                    <div className="h-6 rounded bg-amber-50" />
                  </div>
                </div>
                <div className="rounded-lg bg-white p-3 shadow-sm ring-1 ring-slate-200">
                  <p className="text-xs font-semibold text-slate-700">DONE</p>
                  <div className="mt-2 space-y-2">
                    <div className="h-6 rounded bg-green-50" />
                    <div className="h-6 rounded bg-green-50" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </RevealOnScroll>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <RevealOnScroll>
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            Tính năng nổi bật
          </h2>
        </RevealOnScroll>

        <motion.div
          className="space-y-10"
          variants={featureContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div
            variants={featureItem}
            transition={{ duration: 0.28, ease: easeOut }}
          >
            <RevealOnScroll className="grid items-center gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 md:grid-cols-2">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Kanban Board kéo thả mượt mà
                </h3>
                <p className="mt-2 text-gray-600">
                  Chuyển trạng thái công việc bằng kéo-thả với cập nhật tức thì,
                  giúp team luôn theo dõi tiến độ real-time.
                </p>
              </div>
              <div className="rounded-xl bg-linear-to-br from-blue-100 to-indigo-100 p-6">
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
                  <div className="rounded-lg bg-white p-3 text-center">
                    TODO
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center">
                    IN PROGRESS
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center">
                    DONE
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </motion.div>

          <motion.div
            variants={featureItem}
            transition={{ duration: 0.28, ease: easeOut }}
          >
            <RevealOnScroll className="grid items-center gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 md:grid-cols-2">
              <div className="order-2 rounded-xl bg-linear-to-br from-emerald-100 to-cyan-100 p-6 md:order-1">
                <div className="grid grid-cols-3 gap-2 text-xs font-semibold text-slate-700">
                  <div className="rounded-lg bg-white p-3 text-center">
                    OWNER
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center">
                    MANAGER
                  </div>
                  <div className="rounded-lg bg-white p-3 text-center">
                    MEMBER
                  </div>
                </div>
              </div>
              <div className="order-1 md:order-2">
                <h3 className="text-2xl font-semibold text-gray-900">
                  Phân quyền Project rõ ràng
                </h3>
                <p className="mt-2 text-gray-600">
                  Vai trò theo dự án giúp kiểm soát thao tác tạo/sửa/xóa và tăng
                  mức an toàn khi cộng tác nhiều thành viên.
                </p>
              </div>
            </RevealOnScroll>
          </motion.div>

          <motion.div
            variants={featureItem}
            transition={{ duration: 0.28, ease: easeOut }}
          >
            <RevealOnScroll className="grid items-center gap-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-200 md:grid-cols-2">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Audit Trail minh bạch
                </h3>
                <p className="mt-2 text-gray-600">
                  Theo dõi đầy đủ lịch sử thay đổi task theo timeline để truy
                  vết nhanh và làm việc minh bạch hơn.
                </p>
              </div>
              <div className="rounded-xl bg-linear-to-br from-violet-100 to-fuchsia-100 p-6">
                <div className="space-y-2 text-xs text-slate-700">
                  <div className="rounded-lg bg-white p-3">
                    09:15 - Trạng thái: TODO ➔ IN_PROGRESS
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    09:22 - Priority: MEDIUM ➔ HIGH
                  </div>
                  <div className="rounded-lg bg-white p-3">
                    09:41 - Assignee: Lan ➔ Nam
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          </motion.div>
        </motion.div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-16">
        <RevealOnScroll>
          <h2 className="mb-4 text-center text-3xl font-bold text-gray-900">
            Công nghệ sử dụng
          </h2>
          <p className="mb-6 text-center text-gray-600">
            Frontend & backend stack cho khả năng mở rộng và triển khai linh
            hoạt.
          </p>
        </RevealOnScroll>

        <div className="tech-marquee rounded-2xl border border-gray-200 bg-white p-4">
          <div className="tech-track">
            {[
              "React",
              "TypeScript",
              "Tailwind CSS",
              "Spring Boot",
              "PostgreSQL",
              "Docker",
              "Redis",
              "Nginx",
            ].map((tech) => (
              <span key={`tech-a-${tech}`} className="tech-pill">
                {tech}
              </span>
            ))}
            {[
              "React",
              "TypeScript",
              "Tailwind CSS",
              "Spring Boot",
              "PostgreSQL",
              "Docker",
              "Redis",
              "Nginx",
            ].map((tech) => (
              <span key={`tech-b-${tech}`} className="tech-pill">
                {tech}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-6 pb-20">
        <RevealOnScroll className="rounded-2xl bg-linear-to-r from-blue-700 to-indigo-700 p-8 text-white shadow-lg">
          <div className="flex flex-col items-start justify-between gap-5 md:flex-row md:items-center">
            <div>
              <h3 className="text-2xl font-bold">
                Sẵn sàng tối ưu hóa quy trình của bạn chưa?
              </h3>
              <p className="mt-2 text-blue-100">
                Bắt đầu với Jira Mini và đưa toàn bộ dự án của bạn vào một quy
                trình thống nhất.
              </p>
            </div>

            <Link
              to={isAuthenticated ? "/projects" : "/login"}
              className="rounded-lg bg-white px-5 py-3 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Bắt đầu ngay miễn phí
            </Link>
          </div>
        </RevealOnScroll>
      </section>
    </main>
  );
}

export default IntroPage;

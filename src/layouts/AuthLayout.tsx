import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";

const getRouteOrder = (pathName: string): number => {
  if (pathName.includes("register")) {
    return 1;
  }

  return 0;
};

function AuthLayout() {
  const location = useLocation();
  const previousOrderRef = useRef<number>(getRouteOrder(location.pathname));

  const currentOrder = getRouteOrder(location.pathname);
  const direction = currentOrder > previousOrderRef.current ? 1 : -1;

  useEffect(() => {
    previousOrderRef.current = currentOrder;
  }, [currentOrder]);

  return (
    <div className="grid min-h-screen grid-cols-1 bg-white lg:grid-cols-10">
      <main className="relative flex items-start justify-center overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:col-span-4 lg:items-center lg:px-10 lg:py-10">
        <div className="w-full max-w-md">
          <div className="relative mb-5 overflow-hidden rounded-2xl lg:hidden">
            <motion.div
              className="auth-gradient-mesh absolute inset-0"
              animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
              transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
            />
            <div className="relative z-10 border border-white/40 bg-white/20 px-4 py-5 backdrop-blur-xl">
              <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">
                Jira Mini Workspace
              </p>
              <p className="mt-2 text-sm font-semibold leading-relaxed text-white">
                Đồng bộ đội nhóm và quản lý task mượt mà trên mọi thiết bị.
              </p>
            </div>
          </div>

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={location.pathname}
              custom={direction}
              initial={{ opacity: 0, x: direction * 26 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: direction * -26 }}
              transition={{ duration: 0.24, ease: "easeInOut" }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <aside className="relative hidden overflow-hidden lg:col-span-6 lg:block">
        <motion.div
          className="absolute inset-0 auth-gradient-mesh"
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
        />

        <motion.div
          className="auth-floating-orb absolute -left-14 top-12 h-52 w-52 rounded-full bg-blue-300/35 blur-3xl"
          animate={{ y: [0, -20, 0], x: [0, 14, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="auth-floating-orb absolute bottom-10 right-4 h-64 w-64 rounded-full bg-indigo-300/35 blur-3xl"
          animate={{ y: [0, 16, 0], x: [0, -12, 0] }}
          transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
        />

        <div className="relative z-10 flex h-full items-center justify-center p-12">
          <motion.article
            className="max-w-md rounded-3xl border border-white/45 bg-white/20 p-8 text-white shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.38, ease: "easeOut" }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-white/80">
              Jira Mini Workspace
            </p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">
              Cộng tác liền mạch.
              <br />
              Quản lý dự án tinh gọn.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/90">
              “Nhóm mạnh không phải nhóm đông, mà là nhóm đồng bộ.”
            </p>

            <div className="mt-6 rounded-2xl border border-white/35 bg-white/15 p-4">
              <p className="text-xs text-white/75">Đã đồng hành cùng</p>
              <p className="mt-1 text-2xl font-bold">10,000+ dự án</p>
              <p className="text-sm text-white/85">
                và hàng nghìn team làm việc hiệu quả mỗi ngày.
              </p>
            </div>
          </motion.article>
        </div>
      </aside>
    </div>
  );
}

export default AuthLayout;

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
  const isRegisterRoute = currentOrder === 1;
  const panelSpring = { type: "spring", stiffness: 180, damping: 24 } as const;
  const formSpring = { type: "spring", stiffness: 230, damping: 26 } as const;

  useEffect(() => {
    previousOrderRef.current = currentOrder;
  }, [currentOrder]);

  return (
    <>
      <div className="grid min-h-screen grid-cols-1 bg-white lg:hidden">
        <main className="relative flex items-start justify-center overflow-hidden px-4 py-6 sm:px-6 sm:py-8">
          <div className="w-full max-w-md">
            <div className="relative mb-5 overflow-hidden rounded-2xl">
              <motion.div
                className="auth-gradient-mesh absolute inset-0"
                animate={{
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{ duration: 24, repeat: Infinity, ease: "linear" }}
              />
              <div className="relative z-10 border border-white/40 bg-white/20 px-4 py-5 backdrop-blur-xl">
                <p className="text-[11px] uppercase tracking-[0.2em] text-white/80">
                  Jira Mini Workspace
                </p>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-white">
                  Keep teams aligned and manage tasks smoothly on any device.
                </p>
              </div>
            </div>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={location.pathname}
                custom={direction}
                initial={{ opacity: 0, x: direction * 22 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction * -22 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      <div className="hidden min-h-screen overflow-hidden bg-white lg:block">
        <div className="flex h-screen w-full">
          <motion.section
            layout
            transition={panelSpring}
            className={`relative w-1/2 overflow-hidden ${
              isRegisterRoute ? "order-1" : "order-2"
            }`}
          >
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
                key={`brand-${location.pathname}`}
                className="max-w-md rounded-3xl border border-white/45 bg-white/20 p-8 text-white shadow-2xl backdrop-blur-xl"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.32, ease: "easeOut" }}
              >
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0 }}
                  className="text-xs uppercase tracking-[0.24em] text-white/80"
                >
                  Jira Mini Workspace
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.02 }}
                  className="mt-4 text-3xl font-semibold leading-tight"
                >
                  Seamless collaboration.
                  <br />
                  Lean project management.
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.04 }}
                  className="mt-4 text-sm leading-relaxed text-white/90"
                >
                  “Strong teams are not the biggest teams, but the most aligned
                  ones.”
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, delay: 0.06 }}
                  className="mt-6 rounded-2xl border border-white/35 bg-white/15 p-4"
                >
                  <p className="text-xs text-white/75">Trusted by</p>
                  <p className="mt-1 text-2xl font-bold">10,000+ projects</p>
                  <p className="text-sm text-white/85">
                    and thousands of teams working effectively every day.
                  </p>
                </motion.div>
              </motion.article>
            </div>
          </motion.section>

          <motion.section
            layout
            transition={panelSpring}
            className={`flex w-1/2 items-center justify-center bg-white px-10 py-10 ${
              isRegisterRoute ? "order-2" : "order-1"
            }`}
          >
            <div className="w-full max-w-md">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={location.pathname}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 64, scale: 0.94 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: direction * -48, scale: 0.98 }}
                  transition={{
                    opacity: { duration: 0.14, ease: "easeOut" },
                    x: formSpring,
                    scale: { type: "spring", stiffness: 210, damping: 21 },
                  }}
                >
                  <Outlet />
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}

export default AuthLayout;

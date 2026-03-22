import { motion } from "framer-motion";
import type { ReactNode } from "react";

type RevealOnScrollProps = {
  children: ReactNode;
  className?: string;
  delayMs?: number;
};

function RevealOnScroll({
  children,
  className,
  delayMs = 0,
}: RevealOnScrollProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.16 }}
      transition={{
        duration: 0.28,
        ease: "easeOut",
        delay: delayMs / 1000,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default RevealOnScroll;

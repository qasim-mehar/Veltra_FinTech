"use client";

import { motion, useReducedMotion } from "motion/react";
import type { ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  y?: number;
  blur?: boolean;
  once?: boolean;
  className?: string;
};

const EASE = [0.22, 1, 0.36, 1] as const;

export default function Reveal({
  children,
  delay = 0,
  y = 28,
  blur = true,
  once = true,
  className,
}: RevealProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      data-reveal=""
      className={
        className ? `will-change-transform ${className}` : "will-change-transform"
      }
      initial={{
        opacity: 0,
        y,
        scale: 0.985,
        ...(blur ? { filter: "blur(6px)" } : {}),
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        scale: 1,
        ...(blur ? { filter: "blur(0px)" } : {}),
      }}
      transition={
        reduceMotion
          ? { duration: 0 }
          : { duration: 0.8, delay, ease: EASE }
      }
      viewport={{ once, margin: "-12% 0px" }}
    >
      {children}
    </motion.div>
  );
}

"use client";

import { ReactNode } from "react";
import { motion } from "framer-motion";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  hoverLift?: boolean;
  hoverGlow?: boolean;
  onClick?: () => void;
}

export function AnimatedCard({
  children,
  className = "",
  delay = 0,
  hoverLift = true,
  hoverGlow = true,
  onClick,
}: AnimatedCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
      whileHover={
        hoverLift
          ? {
              y: -4,
              transition: { duration: 0.2 },
            }
          : undefined
      }
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        glass relative overflow-hidden
        ${hoverLift ? "card-hover-lift" : ""}
        ${hoverGlow ? "card-hover-glow" : ""}
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

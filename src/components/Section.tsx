"use client";

import { motion } from "framer-motion";

interface SectionProps {
  label?: string;
  color?: "orange" | "green" | "cyan" | "red";
  children: React.ReactNode;
  className?: string;
}

const colorMap: Record<string, string> = {
  orange: "border-nerv-orange/30",
  green: "border-nerv-green/30",
  cyan: "border-nerv-cyan/30",
  red: "border-nerv-red/30",
};

const labelColorMap: Record<string, string> = {
  orange: "text-nerv-orange",
  green: "text-nerv-green",
  cyan: "text-nerv-cyan",
  red: "text-nerv-red",
};

export default function Section({ label, color = "orange", children, className = "" }: SectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`border ${colorMap[color]} ${className}`}
    >
      {label && (
        <div className={`px-4 py-2 border-b ${colorMap[color]}`}>
          <span className={`font-nerv-mono text-[10px] tracking-[0.2em] uppercase ${labelColorMap[color]}`}>
            {label}
          </span>
        </div>
      )}
      {children}
    </motion.div>
  );
}

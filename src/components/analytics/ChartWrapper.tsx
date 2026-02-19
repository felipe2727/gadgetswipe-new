"use client";

import { motion } from "framer-motion";

interface ChartWrapperProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function ChartWrapper({ title, children, className = "" }: ChartWrapperProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`rounded-2xl bg-bg-card border border-border p-5 ${className}`}
    >
      <h3 className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">
        {title}
      </h3>
      {children}
    </motion.div>
  );
}

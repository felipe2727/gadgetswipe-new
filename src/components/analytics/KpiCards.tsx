"use client";

import { motion } from "framer-motion";
import { Users, MousePointerClick, Star, Clock } from "lucide-react";
import { formatDuration } from "@/lib/utils";

interface KpiCardsProps {
  totalUsers: number;
  totalSwipes: number;
  superPercent: string;
  avgSessionMs: number;
}

const kpis = [
  { key: "totalUsers", label: "Total Users", icon: Users, color: "text-accent" },
  { key: "totalSwipes", label: "Total Swipes", icon: MousePointerClick, color: "text-success" },
  { key: "superPercent", label: "Super Like %", icon: Star, color: "text-super" },
  { key: "avgSessionMs", label: "Avg Session", icon: Clock, color: "text-text-primary" },
] as const;

export function KpiCards({ totalUsers, totalSwipes, superPercent, avgSessionMs }: KpiCardsProps) {
  const values: Record<string, string> = {
    totalUsers: totalUsers.toLocaleString(),
    totalSwipes: totalSwipes.toLocaleString(),
    superPercent: `${superPercent}%`,
    avgSessionMs: formatDuration(avgSessionMs),
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.key}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1, duration: 0.4 }}
          className="rounded-2xl bg-bg-card border border-border p-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <kpi.icon size={18} className={kpi.color} />
            <span className="text-xs font-medium text-text-secondary uppercase tracking-wide">
              {kpi.label}
            </span>
          </div>
          <p className="text-2xl font-bold text-text-primary">
            {values[kpi.key]}
          </p>
        </motion.div>
      ))}
    </div>
  );
}

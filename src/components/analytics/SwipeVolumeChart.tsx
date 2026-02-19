"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ChartWrapper } from "./ChartWrapper";

interface SwipeVolumeChartProps {
  data: Array<{ day: string; total: number; right: number; left: number; super: number }>;
}

export function SwipeVolumeChart({ data }: SwipeVolumeChartProps) {
  return (
    <ChartWrapper title="Swipe Volume Over Time">
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
          <XAxis
            dataKey="day"
            tick={{ fill: "#8888A0", fontSize: 12 }}
            tickFormatter={(v) => new Date(v).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          />
          <YAxis tick={{ fill: "#8888A0", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C1C24",
              border: "1px solid #2A2A35",
              borderRadius: "8px",
              color: "#F0F0F5",
            }}
          />
          <Area
            type="monotone"
            dataKey="total"
            stroke="#6C5CE7"
            fill="url(#colorTotal)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ChartWrapper } from "./ChartWrapper";

interface SourcePerformanceChartProps {
  data: Array<{ source: string; likeRate: number }>;
}

export function SourcePerformanceChart({ data }: SourcePerformanceChartProps) {
  return (
    <ChartWrapper title="Source Performance (Like Rate %)">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
          <XAxis dataKey="source" tick={{ fill: "#8888A0", fontSize: 12 }} />
          <YAxis tick={{ fill: "#8888A0", fontSize: 12 }} unit="%" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C1C24",
              border: "1px solid #2A2A35",
              borderRadius: "8px",
              color: "#F0F0F5",
            }}
            formatter={(value: number | undefined) => [`${value ?? 0}%`, "Like Rate"]}
          />
          <Bar dataKey="likeRate" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

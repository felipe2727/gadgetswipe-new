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

interface ViewDurationChartProps {
  data: Array<{ direction: string; avgMs: number }>;
}

export function ViewDurationChart({ data }: ViewDurationChartProps) {
  return (
    <ChartWrapper title="Avg View Duration by Direction">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
          <XAxis dataKey="direction" tick={{ fill: "#8888A0", fontSize: 12 }} />
          <YAxis
            tick={{ fill: "#8888A0", fontSize: 12 }}
            tickFormatter={(v) => `${(v / 1000).toFixed(1)}s`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C1C24",
              border: "1px solid #2A2A35",
              borderRadius: "8px",
              color: "#F0F0F5",
            }}
            formatter={(value: number | undefined) => [`${((value ?? 0) / 1000).toFixed(1)}s`, "Avg Duration"]}
          />
          <Bar dataKey="avgMs" fill="#FFD700" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

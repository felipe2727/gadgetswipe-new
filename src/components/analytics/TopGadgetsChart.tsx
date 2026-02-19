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

interface TopGadgetsChartProps {
  data: Array<{ title: string; likes: number; views: number }>;
}

export function TopGadgetsChart({ data }: TopGadgetsChartProps) {
  return (
    <ChartWrapper title="Top 10 Most Liked Gadgets">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
          <XAxis type="number" tick={{ fill: "#8888A0", fontSize: 12 }} />
          <YAxis
            type="category"
            dataKey="title"
            tick={{ fill: "#8888A0", fontSize: 11 }}
            width={140}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C1C24",
              border: "1px solid #2A2A35",
              borderRadius: "8px",
              color: "#F0F0F5",
            }}
          />
          <Bar dataKey="likes" fill="#6C5CE7" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

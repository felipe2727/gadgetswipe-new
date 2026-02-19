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

interface CategoryPopularityChartProps {
  data: Array<{ name: string; value: number }>;
}

export function CategoryPopularityChart({ data }: CategoryPopularityChartProps) {
  return (
    <ChartWrapper title="Category Popularity">
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
          <XAxis
            dataKey="name"
            tick={{ fill: "#8888A0", fontSize: 11 }}
            angle={-35}
            textAnchor="end"
            height={60}
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
          <Bar dataKey="value" fill="#00D26A" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

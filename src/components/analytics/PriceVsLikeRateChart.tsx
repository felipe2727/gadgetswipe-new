"use client";

import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ChartWrapper } from "./ChartWrapper";

interface PriceVsLikeRateChartProps {
  data: Array<{ title: string; price: number; likeRate: number }>;
}

export function PriceVsLikeRateChart({ data }: PriceVsLikeRateChartProps) {
  return (
    <ChartWrapper title="Price vs. Like Rate">
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
          <XAxis
            dataKey="price"
            name="Price"
            unit="$"
            tick={{ fill: "#8888A0", fontSize: 12 }}
          />
          <YAxis
            dataKey="likeRate"
            name="Like Rate"
            unit="%"
            tick={{ fill: "#8888A0", fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C1C24",
              border: "1px solid #2A2A35",
              borderRadius: "8px",
              color: "#F0F0F5",
            }}
          />
          <Scatter data={data} fill="#6C5CE7" />
        </ScatterChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

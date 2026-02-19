"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from "recharts";
import { ChartWrapper } from "./ChartWrapper";

interface ConversionFunnelProps {
  data: Array<{ stage: string; value: number }>;
}

const FUNNEL_COLORS = ["#6C5CE7", "#00D26A", "#FFD700"];

export function ConversionFunnel({ data }: ConversionFunnelProps) {
  return (
    <ChartWrapper title="Conversion Funnel" className="lg:col-span-2">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
          <XAxis dataKey="stage" tick={{ fill: "#8888A0", fontSize: 12 }} />
          <YAxis tick={{ fill: "#8888A0", fontSize: 12 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C1C24",
              border: "1px solid #2A2A35",
              borderRadius: "8px",
              color: "#F0F0F5",
            }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={FUNNEL_COLORS[index % FUNNEL_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

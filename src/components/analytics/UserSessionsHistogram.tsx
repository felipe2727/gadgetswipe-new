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

interface UserSessionsHistogramProps {
  data: Array<{ sessions: string; users: number }>;
}

export function UserSessionsHistogram({ data }: UserSessionsHistogramProps) {
  return (
    <ChartWrapper title="Sessions per User">
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2A2A35" />
          <XAxis
            dataKey="sessions"
            tick={{ fill: "#8888A0", fontSize: 12 }}
            label={{
              value: "Sessions",
              position: "insideBottom",
              offset: -5,
              fill: "#8888A0",
            }}
          />
          <YAxis
            tick={{ fill: "#8888A0", fontSize: 12 }}
            label={{
              value: "Users",
              angle: -90,
              position: "insideLeft",
              fill: "#8888A0",
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C1C24",
              border: "1px solid #2A2A35",
              borderRadius: "8px",
              color: "#F0F0F5",
            }}
          />
          <Bar dataKey="users" fill="#00D26A" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

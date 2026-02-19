"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartWrapper } from "./ChartWrapper";

interface SwipeDirectionDonutProps {
  data: Array<{ name: string; value: number; color: string }>;
}

export function SwipeDirectionDonut({ data }: SwipeDirectionDonutProps) {
  return (
    <ChartWrapper title="Swipe Direction Distribution">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "#1C1C24",
              border: "1px solid #2A2A35",
              borderRadius: "8px",
              color: "#F0F0F5",
            }}
          />
          <Legend
            wrapperStyle={{ color: "#8888A0" }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartWrapper>
  );
}

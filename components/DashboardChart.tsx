"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";

interface Props {
  data: any[];
}

export default function DashboardChart({ data }: Props) {
  const [lineType, setLineType] = useState<
    "monotone" | "linear" | "step" | "stepBefore" | "stepAfter"
  >("monotone");

  return (
    <div className="w-full">
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={lineType}
          onChange={(e) => setLineType(e.target.value as any)}
          className="rounded-lg border px-3 py-2"
        >
          <option value="monotone">Monotone (Smooth)</option>
          <option value="linear">Linear</option>
          <option value="step">Step</option>
          <option value="stepBefore">Step Before</option>
          <option value="stepAfter">Step After</option>
        </select>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="bulan" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type={lineType}
              dataKey="pemasukan"
              stroke="#22c55e"
              strokeWidth={3}
            />

            <Line
              type={lineType}
              dataKey="pengeluaran"
              stroke="#ef4444"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
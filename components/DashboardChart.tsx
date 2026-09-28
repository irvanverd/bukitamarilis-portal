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

  const formatThousand = (value: number) => {
    return Number(value) / 1000;
  };

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

            <XAxis
              dataKey="bulan"
              tick={{
                fontSize: 12,
              }}
            />

            <YAxis
              tick={{
                fontSize: 12,
              }}
              tickFormatter={formatThousand}
              label={{
                value: "Ribu",
                angle: -90,
                position: "insideLeft",
                style: {
                  fontSize: 12,
                },
              }}
            />

            <Tooltip
              formatter={(value: any) => {
                return [
                  `${(Number(value) / 1000).toLocaleString("id-ID")}`,
                  "",
                ];
              }}
            />

            <Legend
              wrapperStyle={{
                fontSize: 13,
              }}
            />

            <Line
              type={lineType}
              dataKey="pemasukan"
              name="Pemasukan"
              stroke="#22c55e"
              strokeWidth={3}
            />

            <Line
              type={lineType}
              dataKey="pengeluaran"
              name="Pengeluaran"
              stroke="#ef4444"
              strokeWidth={3}
            />

            <Line
              type={lineType}
              dataKey="saldo"
              name="Saldo"
              stroke="#3b82f6"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
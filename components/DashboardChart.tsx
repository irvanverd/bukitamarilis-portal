"use client";

import { useMemo, useState } from "react";
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

  /**
   * Pastikan data selalu array dan
   * nilai angka benar-benar Number.
   */
  const chartData = useMemo(() => {
    if (!Array.isArray(data)) {
      console.warn("DashboardChart: data bukan array", data);
      return [];
    }

    const result = data.map((item) => ({
      ...item,

      bulan: String(item?.bulan ?? ""),

      pemasukan: Number(item?.pemasukan ?? 0),
      pengeluaran: Number(item?.pengeluaran ?? 0),
      saldo: Number(item?.saldo ?? 0),
    }));

    console.log("DashboardChart DATA =", result);

    return result;
  }, [data]);

  const formatThousand = (value: number) => {
    return (Number(value) / 1000).toLocaleString("id-ID");
  };

  return (
    <div className="w-full">
      {/* =========================
          CONTROL
      ========================== */}
      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={lineType}
          onChange={(e) =>
            setLineType(
              e.target.value as
                | "monotone"
                | "linear"
                | "step"
                | "stepBefore"
                | "stepAfter"
            )
          }
          className="rounded-lg border bg-background px-3 py-2 text-sm"
        >
          <option value="monotone">Monotone (Smooth)</option>
          <option value="linear">Linear</option>
          <option value="step">Step</option>
          <option value="stepBefore">Step Before</option>
          <option value="stepAfter">Step After</option>
        </select>
      </div>

      {/* =========================
          EMPTY STATE
      ========================== */}
      {chartData.length === 0 ? (
        <div className="flex h-[400px] w-full items-center justify-center rounded-lg border">
          <p className="text-sm text-muted-foreground">
            Belum ada data grafik.
          </p>
        </div>
      ) : (
        /* =========================
           CHART
        ========================== */
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{
                top: 10,
                right: 20,
                left: 10,
                bottom: 10,
              }}
            >
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
                formatter={(value: any, name: any) => {
                  const number = Number(value);

                  return [
                    `${(number / 1000).toLocaleString("id-ID")} Ribu`,
                    name,
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
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />

              <Line
                type={lineType}
                dataKey="pengeluaran"
                name="Pengeluaran"
                stroke="#ef4444"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />

              <Line
                type={lineType}
                dataKey="saldo"
                name="Saldo"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
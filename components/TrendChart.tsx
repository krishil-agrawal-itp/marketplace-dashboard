"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatNumber, formatUsd } from "@/lib/status";

export interface TrendPoint {
  date: string;
  [key: string]: string | number;
}

export type TrendFormat = "number" | "usd" | "raw";

/** Zinc grayscale series palette from DESIGN.md charts section */
const ZINC_SERIES = ["#18181B", "#525252", "#A3A3A3", "#737373", "#D4D4D8"];

function formatValue(value: number, format: TrendFormat): string {
  switch (format) {
    case "usd":
      return formatUsd(value);
    case "number":
      return formatNumber(value);
    case "raw":
    default:
      return String(value);
  }
}

export function TrendChart({
  data,
  series,
  format = "number",
}: {
  data: TrendPoint[];
  series: { key: string; label: string; color?: string }[];
  format?: TrendFormat;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (data.length === 0) {
    return <p className="type-caption py-8 text-center">No trend data.</p>;
  }

  if (!mounted) {
    return <div className="h-56 w-full animate-pulse rounded-xl bg-zinc-50" />;
  }

  return (
    <div className="h-56 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid
            vertical={false}
            strokeDasharray="3 3"
            stroke="var(--divider)"
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--text-secondary)", fontWeight: 600 }}
            tickFormatter={(v: string) => v.slice(5)}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 12, fill: "var(--text-disabled)" }}
            tickFormatter={(v: number) => formatValue(v, format)}
            width={56}
          />
          <Tooltip
            formatter={(value) =>
              typeof value === "number" ? formatValue(value, format) : value
            }
            labelFormatter={(l) => String(l)}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
            }}
            cursor={{ stroke: "rgba(0,0,0,0.08)" }}
          />
          <Legend wrapperStyle={{ fontSize: 12, fontWeight: 600 }} />
          {series.map((s, i) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color ?? ZINC_SERIES[i % ZINC_SERIES.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{
                r: 4,
                fill: s.color ?? ZINC_SERIES[i % ZINC_SERIES.length],
              }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

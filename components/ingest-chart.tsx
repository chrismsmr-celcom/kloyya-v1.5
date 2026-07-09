"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ingestSeries } from "@/lib/demo-data";

/**
 * One series, so no legend and no categorical palette — the title names it.
 * Magnitude over time reads as a sequential single hue, which here is the
 * brand violet. Grid and axes stay recessive; the hover layer carries the
 * numbers so no point needs a printed label.
 */
export function IngestChart() {
  return (
    <div className="h-[190px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={ingestSeries}
          margin={{ top: 8, right: 4, bottom: 0, left: -18 }}
        >
          <defs>
            <linearGradient id="ingest-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c5cff" stopOpacity={0.32} />
              <stop offset="70%" stopColor="#2a6ff6" stopOpacity={0.06} />
              <stop offset="100%" stopColor="#2a6ff6" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            vertical={false}
            stroke="rgba(237,234,246,0.06)"
            strokeDasharray="0"
          />
          <XAxis
            dataKey="day"
            tickLine={false}
            axisLine={false}
            tick={{ fill: "#6b6880", fontSize: 11, fontFamily: "var(--font-mono)" }}
            dy={6}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: "#6b6880", fontSize: 11, fontFamily: "var(--font-mono)" }}
            tickFormatter={(v: number) => `${(v / 1000).toFixed(1)}k`}
          />
          <Tooltip
            cursor={{ stroke: "rgba(124,92,255,0.45)", strokeWidth: 1 }}
            content={<ChartTooltip />}
          />
          <Area
            type="monotone"
            dataKey="items"
            stroke="#7c5cff"
            strokeWidth={2}
            fill="url(#ingest-fill)"
            activeDot={{
              r: 4,
              fill: "#7c5cff",
              stroke: "#12121a",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

type TooltipProps = {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
};

function ChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass !rounded-lg px-3 py-2">
      <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-paper-faint">
        {label}
      </p>
      <p className="mt-1 text-[13.5px] text-paper">
        {payload[0].value.toLocaleString()}{" "}
        <span className="text-paper-dim">items</span>
      </p>
    </div>
  );
}

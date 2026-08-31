"use client";

import { Card, CardHeader } from "@/components/ui/card";
import { StatTile } from "@/components/ui/stat-tile";
import { useDemoStore } from "@/lib/store";
import { trend } from "@/lib/demo-data";
import { Clock, DollarSign, ListChecks, TimerReset } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const icons = [Clock, DollarSign, ListChecks, TimerReset];

export default function OutcomesPage() {
  const { outcomes } = useDemoStore();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6">
        <div className="text-xs font-medium uppercase tracking-wider text-muted">
          North star
        </div>

        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
          Outcome Reporting
        </h1>

        <p className="mt-1 text-sm text-muted">
          Optimize for completed outcomes, not AI-generated activity.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {outcomes.map((o, i) => {
          const Icon = icons[i % icons.length];

          return (
            <StatTile
              key={o.id}
              label={o.label}
              value={o.value}
              detail={o.detail}
              icon={Icon}
              tone="good"
            />
          );
        })}
      </div>

      {outcomes.length === 0 && (
        <Card className="mt-6">
          <div className="py-8 text-center text-sm text-muted">
            No outcome data is available yet.
          </div>
        </Card>
      )}

      <Card className="mt-6">
        <CardHeader
          title="Issues resolved vs. delay minutes"
          subtitle="Last 7 days"
        />

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trend}
              margin={{
                top: 8,
                right: 12,
                left: -18,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient
                  id="resolved"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#4f7cff"
                    stopOpacity={0.35}
                  />
                  <stop
                    offset="100%"
                    stopColor="#4f7cff"
                    stopOpacity={0}
                  />
                </linearGradient>

                <linearGradient
                  id="delay"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="#e25b52"
                    stopOpacity={0.25}
                  />
                  <stop
                    offset="100%"
                    stopColor="#e25b52"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="#232428"
                vertical={false}
              />

              <XAxis
                dataKey="day"
                stroke="#8a8b91"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#8a8b91"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />

              <Tooltip
                contentStyle={{
                  background: "#1a1b1f",
                  border: "1px solid #232428",
                  borderRadius: 6,
                  fontSize: 12,
                }}
              />

              <Area
                type="monotone"
                dataKey="resolved"
                stroke="#4f7cff"
                fill="url(#resolved)"
                strokeWidth={1.5}
                name="Issues resolved"
              />

              <Area
                type="monotone"
                dataKey="delayMinutes"
                stroke="#e25b52"
                fill="url(#delay)"
                strokeWidth={1.5}
                name="Avg delay (min)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="mt-4">
        <CardHeader title="Why this matters" />

        <p className="text-sm leading-relaxed text-muted">
          Kloyya measures how much money, time and downtime it saves or
          prevents — not just how many actions the AI generated. Every
          outcome links back to the issue, recommendation and action that
          produced it, so the number is always explainable.
        </p>
      </Card>
    </div>
  );
}

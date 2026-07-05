"use client";

import { CourseTrend } from "@/lib/types";
import { motion } from "framer-motion";
import {
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Area,
  AreaChart,
} from "recharts";

interface CourseTrendsProps {
  trends: CourseTrend[];
}

// Palette (recharts needs literal colors, not CSS vars)
const QUALITY = "#A9762A"; // ochre
const DIFFICULTY = "#4B4641"; // warm charcoal

type ChartPoint = {
  year: number;
  quality: number;
  difficulty: number;
  reviews: number;
};

// Module-scoped so it keeps a stable identity across renders. Recharts injects
// active/payload/label; chartData is passed in explicitly.
function CustomTooltip({
  active,
  payload,
  label,
  chartData,
}: {
  active?: boolean;
  payload?: Array<{ value: number; dataKey: string; color: string }>;
  label?: number;
  chartData: ChartPoint[];
}) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-border bg-card p-3 shadow-soft-md">
        <p className="text-foreground font-medium mb-2">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey === "quality" ? "Quality" : "Difficulty"}:{" "}
            <span className="font-medium">{entry.value?.toFixed(2)}</span>
          </p>
        ))}
        <p className="text-muted-foreground text-xs mt-2">
          {chartData.find((d) => d.year === label)?.reviews} reviews
        </p>
      </div>
    );
  }
  return null;
}

function AnimatedDot(props: { cx?: number; cy?: number; fill?: string; index?: number }) {
  const { cx, cy, fill, index = 0 } = props;
  if (cx === undefined || cy === undefined) return null;

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={3.5}
      fill={fill}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        delay: 0.4 + index * 0.08,
        type: "spring",
        stiffness: 300,
        damping: 15,
      }}
    />
  );
}

export function CourseTrends({ trends }: CourseTrendsProps) {
  // Sort by year
  const sortedTrends = [...trends].sort((a, b) => a.year - b.year);

  // Only show years with meaningful data
  const chartData = sortedTrends
    .filter((t) => t.review_count >= 3)
    .map((t) => ({
      year: t.year,
      quality: t.avg_quality,
      difficulty: t.avg_difficulty,
      reviews: t.review_count,
    }));

  if (chartData.length < 2) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, duration: 0.4 }}
      className="rounded-xl border border-border bg-card p-6 shadow-soft"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={QUALITY} stopOpacity={0.22} />
                <stop offset="100%" stopColor={QUALITY} stopOpacity={0} />
              </linearGradient>
              <linearGradient id="difficultyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={DIFFICULTY} stopOpacity={0.14} />
                <stop offset="100%" stopColor={DIFFICULTY} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(51,48,43,0.08)"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              stroke="#DAD3BD"
              tick={{ fill: "#6F6959", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "#DAD3BD" }}
            />
            <YAxis
              domain={[0, 5]}
              stroke="#DAD3BD"
              tick={{ fill: "#6F6959", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip chartData={chartData} />} />
            <Area
              type="monotone"
              dataKey="quality"
              stroke={QUALITY}
              strokeWidth={2}
              fill="url(#qualityGradient)"
              dot={(props) => <AnimatedDot {...props} fill={QUALITY} />}
              activeDot={{ r: 5, fill: QUALITY }}
            />
            <Area
              type="monotone"
              dataKey="difficulty"
              stroke={DIFFICULTY}
              strokeWidth={2}
              fill="url(#difficultyGradient)"
              dot={(props) => <AnimatedDot {...props} fill={DIFFICULTY} />}
              activeDot={{ r: 5, fill: DIFFICULTY }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: QUALITY }} />
          <span className="text-muted-foreground text-sm">Quality</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ background: DIFFICULTY }} />
          <span className="text-muted-foreground text-sm">Difficulty</span>
        </div>
      </div>

      {/* Yearly breakdown */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {chartData.slice(-6).map((d, index) => (
          <motion.div
            key={d.year}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.06 }}
            className="rounded-lg bg-secondary p-3 text-center"
          >
            <p className="text-muted-foreground text-xs">{d.year}</p>
            <p className="font-display text-foreground font-medium">{d.quality?.toFixed(1)}</p>
            <p className="text-muted-foreground text-xs">{d.reviews} reviews</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

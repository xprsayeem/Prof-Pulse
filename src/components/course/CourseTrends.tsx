"use client";

import { CourseTrend } from "@/lib/types";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface CourseTrendsProps {
  trends: CourseTrend[];
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass p-6"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis
              dataKey="year"
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            />
            <YAxis
              domain={[0, 5]}
              stroke="rgba(255,255,255,0.5)"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(0,0,0,0.9)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
              }}
              labelStyle={{ color: "white" }}
              itemStyle={{ color: "white" }}
              formatter={(value: number, name: string) => [
                value?.toFixed(2),
                name === "quality" ? "Quality" : "Difficulty",
              ]}
              labelFormatter={(year) => `Year: ${year}`}
            />
            <Line
              type="monotone"
              dataKey="quality"
              stroke="#004C9B"
              strokeWidth={2}
              dot={{ fill: "#004C9B", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="difficulty"
              stroke="#FFDC00"
              strokeWidth={2}
              dot={{ fill: "#FFDC00", strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-blue" />
          <span className="text-white/50 text-sm">Quality</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-brand-gold" />
          <span className="text-white/50 text-sm">Difficulty</span>
        </div>
      </div>

      {/* Yearly breakdown */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {chartData.slice(-6).map((d) => (
          <div key={d.year} className="bg-white/5 rounded-lg p-3 text-center">
            <p className="text-white/40 text-xs">{d.year}</p>
            <p className="text-white font-semibold">{d.quality?.toFixed(1)}</p>
            <p className="text-white/30 text-xs">{d.reviews} reviews</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
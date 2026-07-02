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
  Area,
  AreaChart,
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

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: number }) => {
    if (active && payload && payload.length) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-black/95 border border-white/20 rounded-lg p-3 backdrop-blur-xl"
        >
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.dataKey === "quality" ? "Quality" : "Difficulty"}:{" "}
              <span className="font-medium">{entry.value?.toFixed(2)}</span>
            </p>
          ))}
          <p className="text-white/40 text-xs mt-2">
            {chartData.find(d => d.year === label)?.reviews} reviews
          </p>
        </motion.div>
      );
    }
    return null;
  };

  // Custom animated dot
  const AnimatedDot = (props: { cx?: number; cy?: number; fill?: string; index?: number }) => {
    const { cx, cy, fill, index = 0 } = props;
    if (cx === undefined || cy === undefined) return null;

    return (
      <motion.circle
        cx={cx}
        cy={cy}
        r={4}
        fill={fill}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          delay: 0.5 + index * 0.1,
          type: "spring",
          stiffness: 300,
          damping: 15,
        }}
        style={{ filter: `drop-shadow(0 0 4px ${fill})` }}
      />
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3, duration: 0.5 }}
      className="glass p-6"
    >
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="qualityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#004C9B" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#004C9B" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="difficultyGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#FFDC00" stopOpacity={0.2} />
                <stop offset="100%" stopColor="#FFDC00" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />
            <XAxis
              dataKey="year"
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              tickLine={false}
              axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
            />
            <YAxis
              domain={[0, 5]}
              stroke="rgba(255,255,255,0.3)"
              tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 12 }}
              tickLine={false}
              axisLine={false}
              width={30}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="quality"
              stroke="#004C9B"
              strokeWidth={2}
              fill="url(#qualityGradient)"
              dot={(props) => <AnimatedDot {...props} fill="#004C9B" />}
              activeDot={{
                r: 6,
                fill: "#004C9B",
                stroke: "rgba(0, 76, 155, 0.3)",
                strokeWidth: 8,
              }}
            />
            <Area
              type="monotone"
              dataKey="difficulty"
              stroke="#FFDC00"
              strokeWidth={2}
              fill="url(#difficultyGradient)"
              dot={(props) => <AnimatedDot {...props} fill="#FFDC00" />}
              activeDot={{
                r: 6,
                fill: "#FFDC00",
                stroke: "rgba(255, 220, 0, 0.3)",
                strokeWidth: 8,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-6 mt-4">
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-3 h-3 rounded-full bg-brand-blue" style={{ boxShadow: "0 0 8px rgba(0, 76, 155, 0.5)" }} />
          <span className="text-white/50 text-sm">Quality</span>
        </motion.div>
        <motion.div
          className="flex items-center gap-2"
          whileHover={{ scale: 1.05 }}
        >
          <div className="w-3 h-3 rounded-full bg-brand-gold" style={{ boxShadow: "0 0 8px rgba(255, 220, 0, 0.5)" }} />
          <span className="text-white/50 text-sm">Difficulty</span>
        </motion.div>
      </div>

      {/* Yearly breakdown */}
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
        {chartData.slice(-6).map((d, index) => (
          <motion.div
            key={d.year}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + index * 0.1 }}
            whileHover={{ y: -2, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
            className="bg-white/5 rounded-lg p-3 text-center transition-colors"
          >
            <p className="text-white/40 text-xs">{d.year}</p>
            <p className="text-white font-semibold">{d.quality?.toFixed(1)}</p>
            <p className="text-white/30 text-xs">{d.reviews} reviews</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

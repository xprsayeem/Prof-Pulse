"use client";

import { motion } from "framer-motion";
import { MessageSquare, Users, BookOpen, TrendingUp } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { Sparkline } from "@/components/ui/sparkline";

interface LiveStatsProps {
  totalReviews: number;
  totalProfessors: number;
  totalCourses: number;
  totalDepartments: number;
}

export function LiveStats({
  totalReviews,
  totalProfessors,
  totalCourses,
  totalDepartments,
}: LiveStatsProps) {
  const stats = [
    {
      label: "Reviews Analyzed",
      value: totalReviews,
      icon: MessageSquare,
      color: "text-brand-blue",
      bgColor: "bg-brand-blue/10",
      sparkColor: "#004C9B",
      // Simulated growth trend
      trend: [65, 70, 75, 82, 88, 95, 100],
    },
    {
      label: "Professors",
      value: totalProfessors,
      icon: Users,
      color: "text-brand-gold",
      bgColor: "bg-brand-gold/10",
      sparkColor: "#FFDC00",
      trend: [60, 68, 72, 78, 85, 92, 100],
    },
    {
      label: "Courses",
      value: totalCourses,
      icon: BookOpen,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
      sparkColor: "#34d399",
      trend: [55, 62, 70, 78, 85, 92, 100],
    },
    {
      label: "Departments",
      value: totalDepartments,
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
      sparkColor: "#a78bfa",
      trend: [80, 85, 88, 92, 95, 98, 100],
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 * index, duration: 0.5 }}
          whileHover={{ y: -4 }}
          className="glass glass-hover p-6 text-center group cursor-default"
        >
          <motion.div
            className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-3`}
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </motion.div>

          <p className="text-stat text-white mb-1">
            <AnimatedCounter value={stat.value} />
          </p>

          <p className="text-white/50 text-sm mb-3">{stat.label}</p>

          {/* Sparkline showing growth trend */}
          <div className="flex justify-center opacity-50 group-hover:opacity-100 transition-opacity duration-300">
            <Sparkline
              data={stat.trend}
              width={80}
              height={24}
              strokeWidth={1.5}
              color={stat.sparkColor}
            />
          </div>
        </motion.div>
      ))}
    </div>
  );
}

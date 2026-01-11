"use client";

import { motion } from "framer-motion";
import { MessageSquare, Users, BookOpen, TrendingUp } from "lucide-react";

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
      value: totalReviews.toLocaleString(),
      icon: MessageSquare,
      color: "text-brand-blue",
      bgColor: "bg-brand-blue/10",
    },
    {
      label: "Professors",
      value: totalProfessors.toLocaleString(),
      icon: Users,
      color: "text-brand-gold",
      bgColor: "bg-brand-gold/10",
    },
    {
      label: "Courses",
      value: totalCourses.toLocaleString(),
      icon: BookOpen,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Departments",
      value: totalDepartments.toLocaleString(),
      icon: TrendingUp,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
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
          className="glass glass-hover p-6 text-center"
        >
          <div
            className={`inline-flex p-3 rounded-xl ${stat.bgColor} mb-3`}
          >
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <p className="text-2xl md:text-3xl font-bold text-white mb-1">
            {stat.value}
          </p>
          <p className="text-white/50 text-sm">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
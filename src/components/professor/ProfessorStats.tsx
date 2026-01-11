"use client";

import { motion } from "framer-motion";
import { Star, BookOpen, Calendar, ThumbsUp } from "lucide-react";

interface ProfessorStatsProps {
  totalReviews: number;
  avgQuality: number;
  avgDifficulty: number;
  avgWouldTakeAgain: number | null;
  totalCourses: number;
  mostRecentYear: number;
}

export function ProfessorStats({
  totalReviews,
  avgQuality,
  avgDifficulty,
  avgWouldTakeAgain,
  totalCourses,
  mostRecentYear,
}: ProfessorStatsProps) {
  const getQualityLabel = (quality: number) => {
    if (quality >= 4.5) return "Excellent";
    if (quality >= 4.0) return "Very Good";
    if (quality >= 3.5) return "Good";
    if (quality >= 3.0) return "Average";
    if (quality >= 2.5) return "Below Average";
    return "Poor";
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty >= 4.5) return "Very Hard";
    if (difficulty >= 4.0) return "Hard";
    if (difficulty >= 3.0) return "Moderate";
    if (difficulty >= 2.0) return "Easy";
    return "Very Easy";
  };

  const stats = [
    {
      label: "Overall Rating",
      value: avgQuality?.toFixed(1) || "N/A",
      subtext: getQualityLabel(avgQuality),
      icon: Star,
      color: "text-brand-blue",
      bgColor: "bg-brand-blue/10",
    },
    {
      label: "Difficulty Level",
      value: avgDifficulty?.toFixed(1) || "N/A",
      subtext: getDifficultyLabel(avgDifficulty),
      icon: BookOpen,
      color: "text-brand-gold",
      bgColor: "bg-brand-gold/10",
    },
    {
      label: "Would Take Again",
      value: avgWouldTakeAgain !== null ? `${avgWouldTakeAgain.toFixed(0)}%` : "N/A",
      subtext: `Based on ${totalReviews} reviews`,
      icon: ThumbsUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Last Active",
      value: mostRecentYear > 0 ? mostRecentYear.toString() : "N/A",
      subtext: `${totalCourses} course${totalCourses !== 1 ? "s" : ""} taught`,
      icon: Calendar,
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
          className="glass p-4"
        >
          <div className={`inline-flex p-2 rounded-lg ${stat.bgColor} mb-2`}>
            <stat.icon className={`w-4 h-4 ${stat.color}`} />
          </div>
          <p className="text-xl font-bold text-white">{stat.value}</p>
          <p className="text-white/50 text-sm">{stat.label}</p>
          {stat.subtext && (
            <p className="text-white/30 text-xs mt-1">{stat.subtext}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}
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
    if (quality >= 4.0) return "Very good";
    if (quality >= 3.5) return "Good";
    if (quality >= 3.0) return "Average";
    if (quality >= 2.5) return "Below average";
    return "Poor";
  };

  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty >= 4.5) return "Very hard";
    if (difficulty >= 4.0) return "Hard";
    if (difficulty >= 3.0) return "Moderate";
    if (difficulty >= 2.0) return "Easy";
    return "Very easy";
  };

  const stats = [
    {
      label: "Overall rating",
      value: avgQuality?.toFixed(1) || "N/A",
      subtext: getQualityLabel(avgQuality),
      icon: Star,
      accent: true,
    },
    {
      label: "Difficulty level",
      value: avgDifficulty?.toFixed(1) || "N/A",
      subtext: getDifficultyLabel(avgDifficulty),
      icon: BookOpen,
      accent: false,
    },
    {
      label: "Would take again",
      value: avgWouldTakeAgain !== null ? `${avgWouldTakeAgain.toFixed(0)}%` : "N/A",
      subtext: `Based on ${totalReviews} reviews`,
      icon: ThumbsUp,
      accent: false,
    },
    {
      label: "Last active",
      value: mostRecentYear > 0 ? mostRecentYear.toString() : "N/A",
      subtext: `${totalCourses} course${totalCourses !== 1 ? "s" : ""} taught`,
      icon: Calendar,
      accent: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 * index, duration: 0.4 }}
          className="rounded-xl border border-border bg-card p-4 shadow-soft"
        >
          <stat.icon className="mb-2 h-4 w-4 text-muted-foreground" />
          <p
            className={`font-display text-2xl font-medium ${
              stat.accent ? "text-brand" : "text-foreground"
            }`}
          >
            {stat.value}
          </p>
          <p className="text-muted-foreground text-sm">{stat.label}</p>
          {stat.subtext && (
            <p className="text-muted-foreground/80 text-xs mt-1">{stat.subtext}</p>
          )}
        </motion.div>
      ))}
    </div>
  );
}

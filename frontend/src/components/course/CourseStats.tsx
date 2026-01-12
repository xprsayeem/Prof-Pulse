"use client";

import { Course } from "@/lib/types";
import { motion } from "framer-motion";
import { ThumbsUp, Award, Calendar, BarChart3 } from "lucide-react";

interface CourseStatsProps {
  course: Course;
}

export function CourseStats({ course }: CourseStatsProps) {
  // Parse grade distribution
  let gradeData: { grade: string; count: number }[] = [];
  if (course.grade_distribution) {
    try {
      const parsed = JSON.parse(course.grade_distribution);
      
      // Normalize grade names (group variations together)
      const normalizeGrade = (grade: string): string => {
        const normalized = grade.toLowerCase().replace(/_/g, " ").trim();
        
        if (normalized === "not sure yet") return "Not sure yet";
        if (normalized === "rather not say") return "Rather not say";
        if (normalized === "audit/no grade" || normalized === "audit no grade") return "Audit/No Grade";
        if (normalized === "drop/withdrawal" || normalized === "drop withdrawal") return "Drop/Withdrawal";
        
        // Return original for actual grades (preserve case like "A+", "B-")
        return grade;
      };

      // Group by normalized grade
      const gradeMap = new Map<string, number>();
      Object.entries(parsed).forEach(([grade, count]) => {
        if (!grade || grade === "null") return;

        const normalizedGrade = normalizeGrade(grade);

        if (normalizedGrade.toLowerCase() === "incomplete") return;

        gradeMap.set(
          normalizedGrade,
          (gradeMap.get(normalizedGrade) || 0) + (count as number)
        );
      });

      // Define sort order: actual grades first, special options at bottom
      const gradeOrder = [
        "A+", "A", "A-", 
        "B+", "B", "B-", 
        "C+", "C", "C-", 
        "D+", "D", "D-", 
        "F",
        // Special options at the bottom
        "Drop/Withdrawal",
        "Audit/No Grade",
        "Not sure yet",
        "Rather not say",
      ];

      gradeData = Array.from(gradeMap.entries())
        .map(([grade, count]) => ({ grade, count }))
        .sort((a, b) => {
          const indexA = gradeOrder.indexOf(a.grade);
          const indexB = gradeOrder.indexOf(b.grade);
          // If not in order array, put at the very end
          const orderA = indexA === -1 ? 999 : indexA;
          const orderB = indexB === -1 ? 999 : indexB;
          return orderA - orderB;
        });
    } catch {
      gradeData = [];
    }
  }

  const totalGrades = gradeData.reduce((sum, g) => sum + g.count, 0);

  const stats = [
    {
      label: "Would Take Again",
      value: course.would_take_again_pct
        ? `${course.would_take_again_pct.toFixed(0)}%`
        : "N/A",
      icon: ThumbsUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-400/10",
    },
    {
      label: "Recent Quality",
      value: course.recent_avg_quality?.toFixed(1) || "N/A",
      subtext: course.recent_reviews ? `${course.recent_reviews} reviews from the past 2 years` : undefined,
      icon: Award,
      color: "text-brand-blue",
      bgColor: "bg-brand-blue/10",
    },
    {
      label: "First Reviewed",
      value: course.first_reviewed
        ? new Date(course.first_reviewed).getFullYear().toString()
        : "N/A",
      icon: Calendar,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      label: "Last Reviewed",
      value: course.last_reviewed
        ? new Date(course.last_reviewed).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "N/A",
      icon: Calendar,
      color: "text-brand-gold",
      bgColor: "bg-brand-gold/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick stats */}
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

        {/* Grade distribution */}
        {gradeData.length > 0 && (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="glass p-6"
        >
            <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-brand-blue" />
            <h3 className="text-lg font-semibold text-white">Grade Distribution</h3>
            <span className="text-white/30 text-sm">({totalGrades} reported)</span>
            </div>

            <div className="space-y-2">
            {gradeData.map((g) => {
                const percentage = totalGrades > 0 ? (g.count / totalGrades) * 100 : 0;
                const isHighGrade = ["A+", "A", "A-"].includes(g.grade);
                
                // Abbreviate long labels
                const displayLabel = (() => {
                switch (g.grade) {
                    case "Not sure yet":
                    return "N/A";
                    case "Incomplete":
                    return "INC";
                    case "Rather not say":
                    return "N/S";
                    case "Audit/No Grade":
                    return "AUD";
                    case "Drop/Withdrawal":
                    return "W";
                    default:
                    return g.grade;
                }
                })();

                return (
                <div key={g.grade} className="flex items-center gap-3">
                    <span 
                    className="w-10 text-white/70 text-sm font-medium shrink-0"
                    title={g.grade}
                    >
                    {displayLabel}
                    </span>
                    <div className="flex-1 h-6 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${
                        isHighGrade ? "bg-brand-blue" : "bg-white/20"
                        }`}
                    />
                    </div>
                    <span className="w-12 text-right text-white/50 text-sm shrink-0">
                    {percentage.toFixed(0)}%
                    </span>
                </div>
                );
            })}
            </div>
        </motion.div>
        )}
    </div>
  );
}
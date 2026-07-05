"use client";

import { Course } from "@/lib/types";
import { motion } from "framer-motion";
import { ThumbsUp, Award, Calendar, BarChart3 } from "lucide-react";
import { useState } from "react";

interface CourseStatsProps {
  course: Course;
}

export function CourseStats({ course }: CourseStatsProps) {
  const [hoveredGrade, setHoveredGrade] = useState<string | null>(null);

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
      label: "Would take again",
      displayValue: course.would_take_again_pct
        ? `${course.would_take_again_pct.toFixed(0)}%`
        : "N/A",
      icon: ThumbsUp,
      accent: true,
    },
    {
      label: "Recent quality",
      displayValue: course.recent_avg_quality?.toFixed(1) || "N/A",
      subtext: course.recent_reviews ? `${course.recent_reviews} reviews, past 2 years` : undefined,
      icon: Award,
      accent: false,
    },
    {
      label: "First reviewed",
      displayValue: course.first_reviewed
        ? new Date(course.first_reviewed).getFullYear().toString()
        : "N/A",
      icon: Calendar,
      accent: false,
    },
    {
      label: "Last reviewed",
      displayValue: course.last_reviewed
        ? new Date(course.last_reviewed).toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
        : "N/A",
      icon: Calendar,
      accent: false,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Quick stats */}
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
              {stat.displayValue}
            </p>
            <p className="text-muted-foreground text-sm">{stat.label}</p>
            {stat.subtext && (
              <p className="text-muted-foreground/80 text-xs mt-1">{stat.subtext}</p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Grade distribution */}
      {gradeData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="rounded-xl border border-border bg-card p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-brand" />
            <h3 className="font-display text-lg text-foreground">Grade distribution</h3>
            <span className="text-muted-foreground text-sm">({totalGrades} reported)</span>
          </div>

          <div className="space-y-2">
            {gradeData.map((g, index) => {
              const percentage = totalGrades > 0 ? (g.count / totalGrades) * 100 : 0;
              const isHighGrade = ["A+", "A", "A-"].includes(g.grade);
              const isHovered = hoveredGrade === g.grade;

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
                <div
                  key={g.grade}
                  className="flex items-center gap-3 cursor-default"
                  onMouseEnter={() => setHoveredGrade(g.grade)}
                  onMouseLeave={() => setHoveredGrade(null)}
                >
                  <span
                    className="w-10 text-foreground/80 text-sm font-medium shrink-0"
                    title={g.grade}
                  >
                    {displayLabel}
                  </span>
                  <div className="relative flex-1 h-6 bg-secondary rounded-md overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.15 + index * 0.04, duration: 0.7, ease: "easeOut" }}
                      className={`h-full rounded-md transition-colors ${
                        isHighGrade ? "bg-brand" : "bg-muted-foreground/45"
                      } ${isHovered ? "brightness-110" : ""}`}
                    />
                    {isHovered && (
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-foreground text-background px-2 py-1 rounded text-xs whitespace-nowrap z-10">
                        {g.count} students
                      </div>
                    )}
                  </div>
                  <span className="w-12 text-right text-muted-foreground text-sm shrink-0 tabular-nums">
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

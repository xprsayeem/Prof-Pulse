"use client";

import { Course } from "@/lib/types";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, GitCompare } from "lucide-react";
import Link from "next/link";
import { getLiberalCategory, getLiberalLabel } from "@/lib/liberals";

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const getTrendIcon = () => {
    switch (course.trend) {
      case "improving":
        return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case "declining":
        return <TrendingDown className="w-5 h-5 text-red-400" />;
      default:
        return <Minus className="w-5 h-5 text-white/50" />;
    }
  };

  const liberalCategory = getLiberalCategory(course.course_code);

  const getTrendLabel = () => {
    switch (course.trend) {
      case "improving":
        return "Improving";
      case "declining":
        return "Declining";
      default:
        return "Stable";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Navigation row */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to search</span>
        </Link>

        <Link
          href={`/compare?mode=courses&items=${course.course_code}`}
          className="inline-flex items-center gap-2 text-white/50 hover:text-brand-blue transition-colors"
        >
          <GitCompare className="w-4 h-4" />
          <span>Compare</span>
        </Link>
      </div>

      {/* Course title */}
      <div className="glass p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {course.course_code}
            </h1>
            <div className="flex items-center gap-2 mt-2">
              {liberalCategory && (
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  liberalCategory === "lower"
                    ? "bg-purple-400/20 text-purple-400"
                    : "bg-cyan-400/20 text-cyan-400"
                }`}>
                  {getLiberalLabel(liberalCategory)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/50">
                {course.total_reviews.toLocaleString()} reviews
              </span>
              <span className="text-white/30">•</span>
              <span className="text-white/50">
                {course.total_professors} professor{course.total_professors !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Quality badge */}
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-blue">
                {course.avg_quality?.toFixed(1) || "N/A"}
              </div>
              <div className="text-white/50 text-sm">Quality</div>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-gold">
                {course.avg_difficulty?.toFixed(1) || "N/A"}
              </div>
              <div className="text-white/50 text-sm">Difficulty</div>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div className="flex flex-col items-center">
              {getTrendIcon()}
              <div className="text-white/50 text-sm">{getTrendLabel()}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
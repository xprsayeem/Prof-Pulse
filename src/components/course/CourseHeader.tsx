"use client";

import { Course } from "@/lib/types";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Minus } from "lucide-react";
import Link from "next/link";

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
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search</span>
      </Link>

      {/* Course title */}
      <div className="glass p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {course.course_code}
            </h1>
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
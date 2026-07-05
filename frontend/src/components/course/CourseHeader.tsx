"use client";

import { Course } from "@/lib/types";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, Minus, GitCompare } from "lucide-react";
import Link from "next/link";
import { getLiberalCategory, getLiberalLabel } from "@/lib/liberals";
import { getSubjectName } from "@/lib/courses";

interface CourseHeaderProps {
  course: Course;
}

export function CourseHeader({ course }: CourseHeaderProps) {
  const getTrendIcon = () => {
    switch (course.trend) {
      case "improving":
        return <TrendingUp className="w-5 h-5 text-brand" />;
      case "declining":
        return <TrendingDown className="w-5 h-5 text-destructive" />;
      default:
        return <Minus className="w-5 h-5 text-muted-foreground" />;
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
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Navigation row */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to search</span>
        </Link>

        <Link
          href={`/compare?mode=courses&items=${course.course_code}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand transition-colors"
        >
          <GitCompare className="w-4 h-4" />
          <span>Compare</span>
        </Link>
      </div>

      {/* Course title */}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-4xl tracking-tight text-foreground">
                {course.course_code}
              </h1>
              {liberalCategory && (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
                  {getLiberalLabel(liberalCategory)}
                </span>
              )}
            </div>
            <p className="mt-1 text-muted-foreground">{getSubjectName(course.course_code)}</p>
            <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
              <span>{course.total_reviews.toLocaleString()} reviews</span>
              <span className="text-border">•</span>
              <span>
                {course.total_professors} professor{course.total_professors !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Quality / difficulty / trend */}
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="font-display text-3xl font-medium text-brand">
                {course.avg_quality?.toFixed(1) || "N/A"}
              </div>
              <div className="text-muted-foreground text-sm">Quality</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="font-display text-3xl font-medium text-foreground">
                {course.avg_difficulty?.toFixed(1) || "N/A"}
              </div>
              <div className="text-muted-foreground text-sm">Difficulty</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="flex flex-col items-center gap-1">
              {getTrendIcon()}
              <div className="text-muted-foreground text-sm">{getTrendLabel()}</div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

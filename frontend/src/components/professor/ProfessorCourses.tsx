"use client";

import { CourseProfessor } from "@/lib/types";
import { motion } from "framer-motion";
import { Star, Users, TrendingUp } from "lucide-react";
import Link from "next/link";

interface ProfessorCoursesProps {
  courses: CourseProfessor[];
}

export function ProfessorCourses({ courses }: ProfessorCoursesProps) {
  // Sort by most reviews
  const sortedCourses = [...courses].sort(
    (a, b) => b.section_reviews - a.section_reviews
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {sortedCourses.map((course, index) => (
        <motion.div
          key={course.course_code}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(index * 0.04, 0.3), duration: 0.4 }}
        >
          <Link href={`/course/${course.course_code}`}>
            <div className="h-full rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-soft-md">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-medium text-foreground">
                  {course.course_code}
                </h3>
                {course.quality_rank === 1 && course.professors_teaching_course > 1 && (
                  <div className="flex items-center gap-1 rounded-full bg-brand/15 px-2 py-1 text-xs font-medium text-brand">
                    <Star className="w-3 h-3" />
                    #1 for this course
                  </div>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                <div>
                  <p className="font-display text-xl font-medium text-brand">
                    {course.prof_avg_quality?.toFixed(1) || "N/A"}
                  </p>
                  <p className="text-muted-foreground text-xs">Quality</p>
                </div>
                <div>
                  <p className="font-display text-xl font-medium text-foreground">
                    {course.prof_avg_difficulty?.toFixed(1) || "N/A"}
                  </p>
                  <p className="text-muted-foreground text-xs">Difficulty</p>
                </div>
                <div>
                  <p className="font-display text-xl font-medium text-foreground">
                    {course.prof_would_take_again_pct
                      ? `${course.prof_would_take_again_pct.toFixed(0)}%`
                      : "N/A"}
                  </p>
                  <p className="text-muted-foreground text-xs">Retake</p>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{course.section_reviews} reviews</span>
                </div>
                {course.most_recent_year && (
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    <span>{course.most_recent_year}</span>
                  </div>
                )}
              </div>

              {course.professors_teaching_course > 1 && (
                <div className="mt-3 pt-3 border-t border-border">
                  <p className="text-muted-foreground text-xs">
                    Ranked #{course.quality_rank} of {course.professors_teaching_course} professors
                  </p>
                </div>
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
}

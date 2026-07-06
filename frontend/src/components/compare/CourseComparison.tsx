"use client";

import { Course, BirdCourse, CourseProfessor } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Trophy, TrendingDown, ThumbsUp, Users, Star, ExternalLink } from "lucide-react";

interface CourseComparisonProps {
  selectedCodes: string[];
  courses: Course[];
  birdCourses: BirdCourse[];
  professors: CourseProfessor[];
}

interface CompareMetric {
  label: string;
  getValue: (course: Course, bird?: BirdCourse) => number | null;
  format: (value: number | null) => string;
  higherIsBetter: boolean;
  icon: React.ElementType;
}

export function CourseComparison({
  selectedCodes,
  courses,
  birdCourses,
  professors,
}: CourseComparisonProps) {
  const selectedCourses = selectedCodes
    .map((code) => courses.find((c) => c.course_code === code))
    .filter(Boolean) as Course[];

  const getBirdCourse = (code: string) =>
    birdCourses.find((b) => b.course_code === code);

  const getTopProfessor = (code: string) => {
    const profs = professors.filter((p) => p.course_code === code);
    if (profs.length === 0) return null;

    const currentYear = new Date().getFullYear();
    return profs.sort((a, b) => {
      const scoreA = calculateProfScore(a, currentYear);
      const scoreB = calculateProfScore(b, currentYear);
      return scoreB - scoreA;
    })[0];
  };

  const calculateProfScore = (prof: CourseProfessor, currentYear: number) => {
    const yearsAgo = prof.most_recent_year ? currentYear - prof.most_recent_year : 20;
    const recency = Math.max(0, 100 - yearsAgo * 10);
    const quality = prof.prof_avg_quality ? (prof.prof_avg_quality / 5) * 100 : 50;
    const sample = Math.min(100, 20 + Math.log10((prof.section_reviews || 0) + 1) * 40);
    return recency * 0.4 + quality * 0.35 + sample * 0.25;
  };

  const metrics: CompareMetric[] = [
    { label: "Quality", getValue: (c) => c.avg_quality, format: (v) => v?.toFixed(1) || "N/A", higherIsBetter: true, icon: Star },
    { label: "Difficulty", getValue: (c) => c.avg_difficulty, format: (v) => v?.toFixed(1) || "N/A", higherIsBetter: false, icon: TrendingDown },
    { label: "Would retake", getValue: (c) => c.would_take_again_pct, format: (v) => (v ? `${v.toFixed(0)}%` : "N/A"), higherIsBetter: true, icon: ThumbsUp },
    { label: "Bird score", getValue: (c, b) => b?.bird_score || null, format: (v) => v?.toFixed(0) || "N/A", higherIsBetter: true, icon: Trophy },
    { label: "A rate", getValue: (c, b) => b?.a_rate || null, format: (v) => (v ? `${v.toFixed(0)}%` : "N/A"), higherIsBetter: true, icon: Trophy },
    { label: "Reviews", getValue: (c) => c.total_reviews, format: (v) => v?.toLocaleString() || "0", higherIsBetter: true, icon: Users },
  ];

  // Find winner for each metric
  const getWinner = (metric: CompareMetric): string | null => {
    const values = selectedCourses.map((c) => ({
      code: c.course_code,
      value: metric.getValue(c, getBirdCourse(c.course_code)),
    }));

    const validValues = values.filter((v) => v.value !== null);
    if (validValues.length < 2) return null;

    const sorted = [...validValues].sort((a, b) => {
      if (metric.higherIsBetter) {
        return (b.value || 0) - (a.value || 0);
      }
      return (a.value || 0) - (b.value || 0);
    });

    if (sorted[0].value === sorted[1].value) return null;
    return sorted[0].code;
  };

  // Calculate comparison bar widths
  const getBarWidth = (metric: CompareMetric, course: Course): number => {
    const values = selectedCourses.map((c) => ({
      code: c.course_code,
      value: metric.getValue(c, getBirdCourse(c.course_code)),
    }));

    const validValues = values.filter((v) => v.value !== null).map((v) => v.value as number);
    if (validValues.length === 0) return 0;

    const value = metric.getValue(course, getBirdCourse(course.course_code));
    if (value === null) return 0;

    const max = Math.max(...validValues);
    const min = Math.min(...validValues);
    const range = max - min || 1;

    if (metric.higherIsBetter) {
      return ((value - min) / range) * 100;
    } else {
      return ((max - value) / range) * 100;
    }
  };

  return (
    <div className="space-y-6">
      {/* Course cards header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCourses.length}, 1fr)` }}>
        {selectedCourses.map((course, index) => (
          <motion.div
            key={course.course_code}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-xl border border-border bg-card p-4 text-center shadow-soft"
          >
            <Link href={`/course/${course.course_code}`} className="group/link">
              <h3 className="font-display text-xl text-foreground group-hover/link:text-brand transition-colors flex items-center justify-center gap-2">
                {course.course_code}
                <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm mt-1">
              {course.total_reviews.toLocaleString()} reviews
            </p>
          </motion.div>
        ))}
      </div>

      {/* Metrics comparison */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-soft">
        {metrics.map((metric, i) => {
          const winner = getWinner(metric);
          return (
            <div
              key={metric.label}
              className={`grid gap-4 p-4 ${i !== metrics.length - 1 ? "border-b border-border" : ""}`}
              style={{ gridTemplateColumns: `repeat(${selectedCourses.length}, 1fr)` }}
            >
              {selectedCourses.map((course, courseIndex) => {
                const bird = getBirdCourse(course.course_code);
                const value = metric.getValue(course, bird);
                const isWinner = winner === course.course_code;
                const barWidth = getBarWidth(metric, course);

                return (
                  <div
                    key={course.course_code}
                    className={`text-center p-3 rounded-lg transition-colors relative overflow-hidden ${
                      isWinner ? "bg-brand/10" : "hover:bg-accent"
                    }`}
                  >
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-brand/40 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ delay: 0.2 + courseIndex * 0.08, duration: 0.5, ease: "easeOut" }}
                    />

                    <div className="flex items-center justify-center gap-2 mb-1">
                      <metric.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">{metric.label}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <p className={`font-display text-2xl font-medium tabular-nums ${isWinner ? "text-brand" : "text-foreground"}`}>
                        {metric.format(value)}
                      </p>
                      <AnimatePresence>
                        {isWinner && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.2 }}
                          >
                            <Trophy className="w-5 h-5 text-brand" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Top professor for each */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
        <h4 className="text-muted-foreground text-sm mb-4 text-center">Top professor</h4>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCourses.length}, 1fr)` }}>
          {selectedCourses.map((course) => {
            const topProf = getTopProfessor(course.course_code);
            return (
              <div key={course.course_code} className="text-center">
                {topProf ? (
                  <Link href={`/professor/${topProf.professor_id}`} className="group">
                    <p className="text-foreground font-medium group-hover:text-brand transition-colors">
                      {topProf.professor_name}
                    </p>
                    <p className="text-muted-foreground text-sm">
                      {topProf.prof_avg_quality?.toFixed(1) || "N/A"} quality · {topProf.section_reviews} reviews
                    </p>
                  </Link>
                ) : (
                  <p className="text-muted-foreground">No data</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

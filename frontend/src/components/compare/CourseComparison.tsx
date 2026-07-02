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
  color: string;
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
    {
      label: "Quality",
      getValue: (c) => c.avg_quality,
      format: (v) => v?.toFixed(1) || "N/A",
      higherIsBetter: true,
      icon: Star,
      color: "text-brand-blue",
    },
    {
      label: "Difficulty",
      getValue: (c) => c.avg_difficulty,
      format: (v) => v?.toFixed(1) || "N/A",
      higherIsBetter: false,
      icon: TrendingDown,
      color: "text-brand-gold",
    },
    {
      label: "Would Retake",
      getValue: (c) => c.would_take_again_pct,
      format: (v) => (v ? `${v.toFixed(0)}%` : "N/A"),
      higherIsBetter: true,
      icon: ThumbsUp,
      color: "text-emerald-400",
    },
    {
      label: "Bird Score",
      getValue: (c, b) => b?.bird_score || null,
      format: (v) => v?.toFixed(0) || "N/A",
      higherIsBetter: true,
      icon: Trophy,
      color: "text-purple-400",
    },
    {
      label: "A Rate",
      getValue: (c, b) => b?.a_rate || null,
      format: (v) => (v ? `${v.toFixed(0)}%` : "N/A"),
      higherIsBetter: true,
      icon: Trophy,
      color: "text-emerald-400",
    },
    {
      label: "Reviews",
      getValue: (c) => c.total_reviews,
      format: (v) => v?.toLocaleString() || "0",
      higherIsBetter: true,
      icon: Users,
      color: "text-white/60",
    },
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

    // Only return winner if there's a clear difference
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
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -2 }}
            className="glass p-4 text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <Link href={`/course/${course.course_code}`} className="relative z-10 group/link">
              <h3 className="text-xl font-bold text-white group-hover/link:text-brand-blue transition-colors flex items-center justify-center gap-2">
                {course.course_code}
                <ExternalLink className="w-4 h-4 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </h3>
            </Link>
            <p className="text-white/50 text-sm mt-1 relative z-10">
              {course.total_reviews.toLocaleString()} reviews
            </p>
          </motion.div>
        ))}
      </div>

      {/* Metrics comparison */}
      <div className="glass overflow-hidden">
        {metrics.map((metric, i) => {
          const winner = getWinner(metric);
          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.05 }}
              className={`grid gap-4 p-4 ${i !== metrics.length - 1 ? "border-b border-white/10" : ""}`}
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
                    className={`text-center p-3 rounded-lg transition-all duration-300 relative overflow-hidden ${
                      isWinner ? "bg-brand-blue/10" : "hover:bg-white/5"
                    }`}
                  >
                    {/* Comparison bar background */}
                    <motion.div
                      className="absolute bottom-0 left-0 h-1 bg-brand-blue/30 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${barWidth}%` }}
                      transition={{ delay: 0.4 + courseIndex * 0.1, duration: 0.6, ease: "easeOut" }}
                    />

                    <div className="flex items-center justify-center gap-2 mb-1 relative z-10">
                      <metric.icon className={`w-4 h-4 ${metric.color}`} />
                      <span className="text-white/50 text-sm">{metric.label}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2 relative z-10">
                      <p className={`text-2xl font-bold tabular-nums ${isWinner ? "text-brand-blue" : "text-white"}`}>
                        {metric.format(value)}
                      </p>
                      <AnimatePresence>
                        {isWinner && (
                          <motion.div
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{
                              type: "spring",
                              stiffness: 500,
                              damping: 15,
                              delay: 0.3,
                            }}
                          >
                            <Trophy className="w-5 h-5 text-brand-gold" style={{ filter: "drop-shadow(0 0 4px rgba(255, 220, 0, 0.5))" }} />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                );
              })}
            </motion.div>
          );
        })}
      </div>

      {/* Top professor for each */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass p-4"
      >
        <h4 className="text-white/60 text-sm mb-4 text-center">Top Professor</h4>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedCourses.length}, 1fr)` }}>
          {selectedCourses.map((course, index) => {
            const topProf = getTopProfessor(course.course_code);
            return (
              <motion.div
                key={course.course_code}
                className="text-center"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
              >
                {topProf ? (
                  <Link href={`/professor/${topProf.professor_id}`} className="group">
                    <p className="text-white font-medium group-hover:text-brand-blue transition-colors">
                      {topProf.professor_name}
                    </p>
                    <p className="text-white/50 text-sm">
                      {topProf.prof_avg_quality?.toFixed(1) || "N/A"} quality - {topProf.section_reviews} reviews
                    </p>
                  </Link>
                ) : (
                  <p className="text-white/40">No data</p>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

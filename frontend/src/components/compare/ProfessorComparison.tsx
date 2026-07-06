"use client";

import { CourseProfessor } from "@/lib/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Star, TrendingDown, ThumbsUp, BookOpen, ExternalLink } from "lucide-react";

interface ProfessorComparisonProps {
  selectedIds: string[];
  professors: CourseProfessor[];
}

export function ProfessorComparison({
  selectedIds,
  professors,
}: ProfessorComparisonProps) {
  // Aggregate stats across all courses for each professor
  const getProfessorStats = (profId: string) => {
    const records = professors.filter((p) => p.professor_id === profId);
    if (records.length === 0) return null;

    const totalReviews = records.reduce((sum, p) => sum + p.section_reviews, 0);
    const avgQuality =
      records.reduce((sum, p) => sum + (p.prof_avg_quality || 0) * p.section_reviews, 0) /
      totalReviews;
    const avgDifficulty =
      records.reduce((sum, p) => sum + (p.prof_avg_difficulty || 0) * p.section_reviews, 0) /
      totalReviews;

    const recordsWithWTA = records.filter((p) => p.prof_would_take_again_pct !== null);
    const avgWouldTakeAgain =
      recordsWithWTA.length > 0
        ? recordsWithWTA.reduce(
            (sum, p) => sum + (p.prof_would_take_again_pct || 0) * p.section_reviews,
            0
          ) / recordsWithWTA.reduce((sum, p) => sum + p.section_reviews, 0)
        : null;

    return {
      name: records[0].professor_name,
      department: records[0].department,
      totalReviews,
      avgQuality,
      avgDifficulty,
      avgWouldTakeAgain,
      courseCount: records.length,
      courses: records.sort((a, b) => b.section_reviews - a.section_reviews).slice(0, 5),
    };
  };

  const selectedProfs = selectedIds
    .map((id) => ({ id, stats: getProfessorStats(id) }))
    .filter((p) => p.stats !== null) as { id: string; stats: NonNullable<ReturnType<typeof getProfessorStats>> }[];

  const metrics = [
    { label: "Quality", getValue: (s: NonNullable<ReturnType<typeof getProfessorStats>>) => s.avgQuality, format: (v: number | null) => v?.toFixed(1) || "N/A", higherIsBetter: true, icon: Star },
    { label: "Difficulty", getValue: (s: NonNullable<ReturnType<typeof getProfessorStats>>) => s.avgDifficulty, format: (v: number | null) => v?.toFixed(1) || "N/A", higherIsBetter: false, icon: TrendingDown },
    { label: "Would retake", getValue: (s: NonNullable<ReturnType<typeof getProfessorStats>>) => s.avgWouldTakeAgain, format: (v: number | null) => (v ? `${v.toFixed(0)}%` : "N/A"), higherIsBetter: true, icon: ThumbsUp },
    { label: "Courses", getValue: (s: NonNullable<ReturnType<typeof getProfessorStats>>) => s.courseCount, format: (v: number | null) => v?.toString() || "0", higherIsBetter: true, icon: BookOpen },
  ];

  const getWinner = (getValue: (s: NonNullable<ReturnType<typeof getProfessorStats>>) => number | null, higherIsBetter: boolean) => {
    const values = selectedProfs.map((p) => ({
      id: p.id,
      value: getValue(p.stats),
    }));

    const validValues = values.filter((v) => v.value !== null);
    if (validValues.length < 2) return null;

    const sorted = [...validValues].sort((a, b) => {
      if (higherIsBetter) return (b.value || 0) - (a.value || 0);
      return (a.value || 0) - (b.value || 0);
    });

    if (sorted[0].value === sorted[1].value) return null;
    return sorted[0].id;
  };

  return (
    <div className="space-y-6">
      {/* Professor cards header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedProfs.length}, 1fr)` }}>
        {selectedProfs.map(({ id, stats }, index) => (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="rounded-xl border border-border bg-card p-4 text-center shadow-soft"
          >
            <Link href={`/professor/${id}`} className="group">
              <h3 className="font-display text-xl text-foreground group-hover:text-brand transition-colors flex items-center justify-center gap-2">
                {stats.name}
                <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </h3>
            </Link>
            <p className="text-muted-foreground text-sm mt-1">{stats.department}</p>
            <p className="text-muted-foreground text-xs mt-1">
              {stats.totalReviews.toLocaleString()} reviews
            </p>
          </motion.div>
        ))}
      </div>

      {/* Metrics comparison */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-soft">
        {metrics.map((metric, i) => {
          const winner = getWinner(metric.getValue, metric.higherIsBetter);
          return (
            <div
              key={metric.label}
              className={`grid gap-4 p-4 ${i !== metrics.length - 1 ? "border-b border-border" : ""}`}
              style={{ gridTemplateColumns: `repeat(${selectedProfs.length}, 1fr)` }}
            >
              {selectedProfs.map(({ id, stats }) => {
                const value = metric.getValue(stats);
                const isWinner = winner === id;

                return (
                  <div
                    key={id}
                    className={`text-center p-3 rounded-lg transition-colors ${
                      isWinner ? "bg-brand/10" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <metric.icon className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground text-sm">{metric.label}</span>
                    </div>
                    <p className={`font-display text-2xl font-medium ${isWinner ? "text-brand" : "text-foreground"}`}>
                      {metric.format(value)}
                      {isWinner && <Trophy className="w-4 h-4 inline ml-2 text-brand" />}
                    </p>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Top courses for each */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-soft">
        <h4 className="text-muted-foreground text-sm mb-4 text-center">Top courses</h4>
        <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedProfs.length}, 1fr)` }}>
          {selectedProfs.map(({ id, stats }) => (
            <div key={id} className="space-y-2">
              {stats.courses.map((course) => (
                <Link
                  key={course.course_code}
                  href={`/course/${course.course_code}`}
                  className="block rounded-lg bg-secondary hover:bg-accent p-2 transition-colors"
                >
                  <p className="text-foreground font-medium text-sm">{course.course_code}</p>
                  <p className="text-muted-foreground text-xs">
                    {course.prof_avg_quality?.toFixed(1)} quality • {course.section_reviews} reviews
                  </p>
                </Link>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

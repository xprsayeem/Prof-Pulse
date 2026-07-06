"use client";

import { Course, CourseProfessor } from "@/lib/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { Trophy, Star, TrendingDown, ThumbsUp, Users, Calendar, ExternalLink } from "lucide-react";

interface CourseProfessorComparisonProps {
  courseCode: string;
  selectedIds: string[];
  professors: CourseProfessor[];
  course?: Course;
}

export function CourseProfessorComparison({
  courseCode,
  selectedIds,
  professors,
  course,
}: CourseProfessorComparisonProps) {
  const courseProfs = professors.filter((p) => p.course_code === courseCode);
  const selectedProfs = selectedIds
    .map((id) => courseProfs.find((p) => p.professor_id === id))
    .filter(Boolean) as CourseProfessor[];

  const metrics = [
    { label: "Quality", getValue: (p: CourseProfessor) => p.prof_avg_quality, format: (v: number | null) => v?.toFixed(1) || "N/A", higherIsBetter: true, icon: Star },
    { label: "Difficulty", getValue: (p: CourseProfessor) => p.prof_avg_difficulty, format: (v: number | null) => v?.toFixed(1) || "N/A", higherIsBetter: false, icon: TrendingDown },
    { label: "Would retake", getValue: (p: CourseProfessor) => p.prof_would_take_again_pct, format: (v: number | null) => (v ? `${v.toFixed(0)}%` : "N/A"), higherIsBetter: true, icon: ThumbsUp },
    { label: "Reviews", getValue: (p: CourseProfessor) => p.section_reviews, format: (v: number | null) => v?.toString() || "0", higherIsBetter: true, icon: Users },
    { label: "Last taught", getValue: (p: CourseProfessor) => p.most_recent_year, format: (v: number | null) => v?.toString() || "N/A", higherIsBetter: true, icon: Calendar },
  ];

  const getWinner = (getValue: (p: CourseProfessor) => number | null, higherIsBetter: boolean) => {
    const values = selectedProfs.map((p) => ({
      id: p.professor_id,
      value: getValue(p),
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
      {/* Course header */}
      <div className="text-center">
        <Link href={`/course/${courseCode}`} className="group inline-block">
          <h3 className="font-display text-2xl text-foreground group-hover:text-brand transition-colors">
            Comparing professors for {courseCode}
            <ExternalLink className="w-5 h-5 inline ml-2 opacity-0 group-hover:opacity-100 transition-opacity" />
          </h3>
        </Link>
        {course && (
          <p className="text-muted-foreground mt-1">
            {course.total_reviews} total reviews • {course.avg_quality?.toFixed(1)} avg quality
          </p>
        )}
      </div>

      {/* Professor cards header */}
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedProfs.length}, 1fr)` }}>
        {selectedProfs.map((prof, index) => {
          const isActive = prof.most_recent_year && prof.most_recent_year >= new Date().getFullYear() - 2;
          return (
            <motion.div
              key={prof.professor_id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              className="rounded-xl border border-border bg-card p-4 text-center shadow-soft"
            >
              <Link href={`/professor/${prof.professor_id}`} className="group">
                <h3 className="font-display text-xl text-foreground group-hover:text-brand transition-colors flex items-center justify-center gap-2">
                  {prof.professor_name}
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
              </Link>
              <div className="flex items-center justify-center gap-2 mt-1">
                {isActive && (
                  <span className="rounded-full border border-border px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    Active
                  </span>
                )}
                <span className="text-muted-foreground text-sm">{prof.section_reviews} reviews</span>
              </div>
            </motion.div>
          );
        })}
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
              {selectedProfs.map((prof) => {
                const value = metric.getValue(prof);
                const isWinner = winner === prof.professor_id;

                return (
                  <div
                    key={prof.professor_id}
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
    </div>
  );
}

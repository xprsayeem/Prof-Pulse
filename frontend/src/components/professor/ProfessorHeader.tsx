"use client";

import { CourseProfessor } from "@/lib/types";
import { motion } from "framer-motion";
import { ArrowLeft, User, GitCompare } from "lucide-react";
import Link from "next/link";

interface ProfessorHeaderProps {
  professor: CourseProfessor;
  totalReviews: number;
  avgQuality: number;
  avgDifficulty: number;
  avgWouldTakeAgain: number | null;
  totalCourses: number;
}

export function ProfessorHeader({
  professor,
  totalReviews,
  avgQuality,
  avgDifficulty,
  avgWouldTakeAgain,
  totalCourses,
}: ProfessorHeaderProps) {
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
          href={`/compare?mode=professors&items=${professor.professor_id}`}
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-brand transition-colors"
        >
          <GitCompare className="w-4 h-4" />
          <span>Compare</span>
        </Link>
      </div>

      {/* Professor header */}
      <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand/12">
              <User className="h-8 w-8 text-brand" />
            </div>
            <div>
              <h1 className="font-display text-4xl tracking-tight text-foreground">
                {professor.professor_name}
              </h1>
              <p className="text-muted-foreground text-lg">{professor.department}</p>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>{totalReviews.toLocaleString()} reviews</span>
                <span className="text-border">•</span>
                <span>
                  {totalCourses} course{totalCourses !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center gap-5">
            <div className="text-center">
              <div className="font-display text-3xl font-medium text-brand">
                {avgQuality?.toFixed(1) || "N/A"}
              </div>
              <div className="text-muted-foreground text-sm">Quality</div>
            </div>
            <div className="h-12 w-px bg-border" />
            <div className="text-center">
              <div className="font-display text-3xl font-medium text-foreground">
                {avgDifficulty?.toFixed(1) || "N/A"}
              </div>
              <div className="text-muted-foreground text-sm">Difficulty</div>
            </div>
            {avgWouldTakeAgain !== null && (
              <>
                <div className="h-12 w-px bg-border" />
                <div className="text-center">
                  <div className="font-display text-3xl font-medium text-foreground">
                    {avgWouldTakeAgain.toFixed(0)}%
                  </div>
                  <div className="text-muted-foreground text-sm">Would retake</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

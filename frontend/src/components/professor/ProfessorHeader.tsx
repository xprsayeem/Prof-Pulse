"use client";

import { CourseProfessor } from "@/lib/types";
import { motion } from "framer-motion";
import { ArrowLeft, User } from "lucide-react";
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

      {/* Professor header */}
      <div className="glass p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* Avatar placeholder */}
            <div className="w-16 h-16 rounded-full bg-brand-gold/20 flex items-center justify-center">
              <User className="w-8 h-8 text-brand-gold" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">
                {professor.professor_name}
              </h1>
              <p className="text-white/50 text-lg">{professor.department}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-white/40 text-sm">
                  {totalReviews.toLocaleString()} reviews
                </span>
                <span className="text-white/30">•</span>
                <span className="text-white/40 text-sm">
                  {totalCourses} course{totalCourses !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </div>

          {/* Stats badges */}
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-blue">
                {avgQuality?.toFixed(1) || "N/A"}
              </div>
              <div className="text-white/50 text-sm">Quality</div>
            </div>
            <div className="h-12 w-px bg-white/10" />
            <div className="text-center">
              <div className="text-3xl font-bold text-brand-gold">
                {avgDifficulty?.toFixed(1) || "N/A"}
              </div>
              <div className="text-white/50 text-sm">Difficulty</div>
            </div>
            {avgWouldTakeAgain !== null && (
              <>
                <div className="h-12 w-px bg-white/10" />
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">
                    {avgWouldTakeAgain.toFixed(0)}%
                  </div>
                  <div className="text-white/50 text-sm">Would Retake</div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
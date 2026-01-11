"use client";

import { CourseProfessor } from "@/lib/types";
import { motion } from "framer-motion";
import { Star, TrendingUp, Users } from "lucide-react";
import Link from "next/link";

interface CourseProfessorsProps {
  professors: CourseProfessor[];
}

export function CourseProfessors({ professors }: CourseProfessorsProps) {
  const currentYear = new Date().getFullYear();

  // Score-based sorting that balances recency, quality, and sample size
  const sortedProfessors = [...professors].sort((a, b) => {
    const scoreA = calculateProfessorScore(a, currentYear);
    const scoreB = calculateProfessorScore(b, currentYear);
    return scoreB - scoreA;
  });

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {sortedProfessors.map((prof, index) => {
        const isTopPick = index === 0 && sortedProfessors.length > 1;
        const isActive = prof.most_recent_year && prof.most_recent_year >= currentYear - 2;

        return (
          <motion.div
            key={prof.professor_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * index, duration: 0.5 }}
          >
            <Link href={`/professor/${prof.professor_id}`}>
              <div className="glass glass-hover p-5 h-full">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-white">
                      {prof.professor_name}
                    </h3>
                    <p className="text-white/50 text-sm">{prof.department}</p>
                  </div>

                  <div className="flex gap-2">
                    {isTopPick && (
                      <div className="flex items-center gap-1 bg-brand-gold/20 text-brand-gold px-2 py-1 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3" />
                        Top Pick
                      </div>
                    )}
                    {isActive && (
                      <div className="flex items-center gap-1 bg-emerald-400/20 text-emerald-400 px-2 py-1 rounded-full text-xs font-medium">
                        Active
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-2xl font-bold text-brand-blue">
                      {prof.prof_avg_quality?.toFixed(1) || "N/A"}
                    </p>
                    <p className="text-white/40 text-xs">Quality</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-brand-gold">
                      {prof.prof_avg_difficulty?.toFixed(1) || "N/A"}
                    </p>
                    <p className="text-white/40 text-xs">Difficulty</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">
                      {prof.prof_would_take_again_pct
                        ? `${prof.prof_would_take_again_pct.toFixed(0)}%`
                        : "N/A"}
                    </p>
                    <p className="text-white/40 text-xs">Would Retake</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-white/40">
                    <Users className="w-4 h-4" />
                    <span>{prof.section_reviews} reviews</span>
                  </div>
                  {prof.most_recent_year && (
                    <div className={`flex items-center gap-1 ${
                      isActive ? "text-emerald-400" : "text-white/40"
                    }`}>
                      <TrendingUp className="w-4 h-4" />
                      <span>Last taught {prof.most_recent_year}</span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          </motion.div>
        );
      })}
    </div>
  );
}

/**
 * Calculate a composite score for professor ranking
 * Factors:
 * - Recency (40%): Heavily favor professors who taught recently
 * - Quality (35%): Their average rating
 * - Sample size (25%): More reviews = more reliable
 */
function calculateProfessorScore(prof: CourseProfessor, currentYear: number): number {
  // Recency score (0-100)
  // Full points if taught this year, decays over time
  const yearsAgo = prof.most_recent_year ? currentYear - prof.most_recent_year : 20;
  const recencyScore = Math.max(0, 100 - yearsAgo * 10); // Lose 10 points per year, floor at 0

  // Quality score (0-100)
  // Based on their rating (1-5 scale -> 0-100)
  const qualityScore = prof.prof_avg_quality ? (prof.prof_avg_quality / 5) * 100 : 50;

  // Sample size score (0-100)
  // Diminishing returns: 1 review = 20, 5 reviews = 60, 10+ reviews = ~90-100
  const reviewCount = prof.section_reviews || 0;
  const sampleScore = Math.min(100, 20 + Math.log10(reviewCount + 1) * 40);

  // Weighted combination
  const finalScore = 
    recencyScore * 0.40 +
    qualityScore * 0.35 +
    sampleScore * 0.25;

  return finalScore;
}
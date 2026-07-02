"use client";

import { BirdCourse } from "@/lib/types";
import Link from "next/link";
import { User, Award, TrendingDown, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";
import { getLiberalCategory, getLiberalLabel } from "@/lib/liberals";
import { ProgressRing } from "@/components/ui/progress-ring";

interface BirdCourseCardProps {
  course: BirdCourse;
  rank: number;
}

// Tag display names and colors
const TAG_CONFIG: Record<string, { label: string; color: string }> = {
  "graded by few things": { label: "Few Assessments", color: "bg-emerald-400/20 text-emerald-400" },
  "extra credit": { label: "Extra Credit", color: "bg-brand-gold/20 text-brand-gold" },
  "clear grading criteria": { label: "Clear Grading", color: "bg-brand-blue/20 text-brand-blue" },
  "online savvy": { label: "Online Friendly", color: "bg-purple-400/20 text-purple-400" },
  "gives good feedback": { label: "Good Feedback", color: "bg-cyan-400/20 text-cyan-400" },
  "accessible outside class": { label: "Accessible", color: "bg-teal-400/20 text-teal-400" },
  "amazing lectures": { label: "Great Lectures", color: "bg-pink-400/20 text-pink-400" },
  "caring": { label: "Caring", color: "bg-rose-400/20 text-rose-400" },
  "inspirational": { label: "Inspirational", color: "bg-amber-400/20 text-amber-400" },
  "hilarious": { label: "Hilarious", color: "bg-orange-400/20 text-orange-400" },
  "respected": { label: "Respected", color: "bg-indigo-400/20 text-indigo-400" },
  "tough grader": { label: "Tough Grader", color: "bg-red-400/20 text-red-400" },
  "get ready to read": { label: "Heavy Reading", color: "bg-red-400/20 text-red-400" },
  "lots of homework": { label: "Lots of Homework", color: "bg-red-400/20 text-red-400" },
  "test heavy": { label: "Test Heavy", color: "bg-orange-400/20 text-orange-400" },
  "lecture heavy": { label: "Lecture Heavy", color: "bg-slate-400/20 text-slate-400" },
  "participation matters": { label: "Participation", color: "bg-yellow-400/20 text-yellow-400" },
  "group projects": { label: "Group Projects", color: "bg-slate-400/20 text-slate-400" },
  "skip class? you won't pass.": { label: "Must Attend", color: "bg-red-400/20 text-red-400" },
  "so many papers": { label: "Many Papers", color: "bg-red-400/20 text-red-400" },
  "beware of pop quizzes": { label: "Pop Quizzes", color: "bg-orange-400/20 text-orange-400" },
};

function getTagConfig(tag: string) {
  const key = tag.toLowerCase();
  return TAG_CONFIG[key] || { label: tag, color: "bg-white/10 text-white/60" };
}

// Get color for bird score
function getScoreColor(score: number): string {
  if (score >= 80) return "#34d399"; // emerald-400
  if (score >= 70) return "#FFDC00"; // brand-gold
  if (score >= 60) return "#004C9B"; // brand-blue
  return "rgba(255, 255, 255, 0.6)";
}

export function BirdCourseCard({ course, rank }: BirdCourseCardProps) {
  const liberalCategory = getLiberalCategory(course.course_code);
  // Determine if verified bird (high confidence + high score)
  const isVerifiedBird = course.confidence >= 0.9 && course.bird_score >= 70 && course.a_rate >= 60;

  // Get tags
  const tags = [course.top_tag_1, course.top_tag_2, course.top_tag_3].filter(Boolean) as string[];

  // Difficulty label
  const getDifficultyLabel = (diff: number) => {
    if (diff <= 1.5) return "Very Easy";
    if (diff <= 2.0) return "Easy";
    if (diff <= 2.5) return "Moderate";
    if (diff <= 3.0) return "Somewhat Hard";
    return "Hard";
  };

  return (
    <Link href={`/course/${course.course_code}`}>
      <motion.div
        className="glass p-5 h-full relative overflow-hidden group"
        whileHover={{
          y: -4,
          boxShadow: "0 20px 40px -15px rgba(0, 0, 0, 0.5), 0 0 30px -10px rgba(0, 76, 155, 0.2)",
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        {/* Hover gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Header row */}
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white/40 text-sm font-medium">#{rank}</span>
              <h3 className="text-xl font-bold text-white">{course.course_code}</h3>
              {isVerifiedBird && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 15, delay: 0.2 }}
                  className="flex items-center gap-1 bg-emerald-400/20 text-emerald-400 px-2 py-0.5 rounded-full text-xs font-medium"
                >
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </motion.div>
              )}
            </div>
            <p className="text-white/50 text-sm">{course.department}</p>
          </div>

          {liberalCategory && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
              liberalCategory === "lower"
                ? "bg-purple-400/20 text-purple-400"
                : "bg-cyan-400/20 text-cyan-400"
            }`}>
              {getLiberalLabel(liberalCategory)}
            </span>
          )}

          {/* Bird Score Progress Ring */}
          <ProgressRing
            value={course.bird_score}
            max={100}
            size={70}
            strokeWidth={5}
            color={getScoreColor(course.bird_score)}
            label="Bird"
          />
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-4 relative z-10">
          <div className="text-center">
            <p className="text-lg font-semibold text-brand-blue">{course.a_rate.toFixed(0)}%</p>
            <p className="text-white/40 text-xs">A Rate</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-brand-gold">{course.avg_difficulty.toFixed(1)}</p>
            <p className="text-white/40 text-xs">Difficulty</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white">
              {course.would_take_again_pct ? `${course.would_take_again_pct.toFixed(0)}%` : "N/A"}
            </p>
            <p className="text-white/40 text-xs">Retake</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-white/70">{course.total_reviews}</p>
            <p className="text-white/40 text-xs">Reviews</p>
          </div>
        </div>

        {/* Difficulty indicator with shimmer */}
        <div className="flex items-center gap-2 mb-4 relative z-10">
          <TrendingDown className="w-4 h-4 text-emerald-400" />
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden bar-shimmer">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((5 - course.avg_difficulty) / 4) * 100}%` }}
              transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-emerald-400 to-brand-gold rounded-full"
            />
          </div>
          <span className="text-white/50 text-xs">{getDifficultyLabel(course.avg_difficulty)}</span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4 relative z-10">
            {tags.map((tag, index) => {
              const config = getTagConfig(tag);
              return (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 * index }}
                  className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}
                >
                  {config.label}
                </motion.span>
              );
            })}
          </div>
        )}

        {/* Top professor */}
        {course.top_professor_name && (
          <div className="pt-3 border-t border-white/10 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-2">
              <motion.div
                className="p-1.5 rounded-full bg-brand-gold/20"
                whileHover={{ scale: 1.1, rotate: 10 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <User className="w-3 h-3 text-brand-gold" />
              </motion.div>
              <div>
                <p className="text-white text-sm font-medium">{course.top_professor_name}</p>
                <p className="text-white/40 text-xs">Top Pick</p>
              </div>
            </div>
            {course.top_professor_quality && (
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-brand-gold" />
                <span className="text-white/70 text-sm">
                  {course.top_professor_quality.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </Link>
  );
}

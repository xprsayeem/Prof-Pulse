"use client";

import { BirdCourse, Course } from "@/lib/types";
import { LiberalCourse } from "@/lib/liberals";
import Link from "next/link";
import { Star, TrendingDown, BarChart3, MessageSquare } from "lucide-react";

interface LiberalCourseCardProps {
  liberal: LiberalCourse;
  bird?: BirdCourse;
  course?: Course;
}

export function LiberalCourseCard({ liberal, bird, course }: LiberalCourseCardProps) {
  const hasData = !!(bird || course);
  const quality = bird?.avg_quality ?? course?.avg_quality;
  const difficulty = bird?.avg_difficulty ?? course?.avg_difficulty;
  const reviews = bird?.total_reviews ?? course?.total_reviews ?? 0;
  const birdScore = bird?.bird_score;

  const content = (
    <div className={`glass p-4 h-full ${hasData ? "glass-hover" : "opacity-60"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-white">{liberal.code}</h3>
            <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
              liberal.level === "lower"
                ? "bg-purple-400/20 text-purple-400"
                : "bg-cyan-400/20 text-cyan-400"
            }`}>
              {liberal.level === "lower" ? "LL" : "UL"}
            </span>
          </div>
          <p className="text-white/50 text-sm leading-tight mt-1">{liberal.title}</p>
        </div>

        {/* Bird score */}
        {birdScore && (
          <div className="text-right shrink-0">
            <div className={`text-lg font-bold ${
              birdScore >= 70 ? "text-emerald-400" :
              birdScore >= 55 ? "text-brand-gold" :
              "text-white/60"
            }`}>
              {birdScore.toFixed(0)}
            </div>
            <div className="text-white/30 text-[10px]">Bird</div>
          </div>
        )}
      </div>

      {/* Stats row */}
      {hasData ? (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/5">
          {quality && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-brand-blue" />
              <span className="text-white/70 text-xs">{quality.toFixed(1)}</span>
            </div>
          )}
          {difficulty && (
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-brand-gold" />
              <span className="text-white/70 text-xs">{difficulty.toFixed(1)}</span>
            </div>
          )}
          {bird?.a_rate && (
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-emerald-400" />
              <span className="text-white/70 text-xs">{bird.a_rate.toFixed(0)}% A</span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <MessageSquare className="w-3 h-3 text-white/30" />
            <span className="text-white/40 text-xs">{reviews}</span>
          </div>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-white/5">
          <p className="text-white/30 text-xs">No reviews yet</p>
        </div>
      )}
    </div>
  );

  if (hasData) {
    return <Link href={`/course/${liberal.code}`}>{content}</Link>;
  }

  return content;
}
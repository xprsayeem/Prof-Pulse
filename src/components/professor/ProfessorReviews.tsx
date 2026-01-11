"use client";

import { Review } from "@/lib/types";
import { motion } from "framer-motion";
import { useState } from "react";
import { MessageSquare, ThumbsUp, ThumbsDown, Calendar, BookOpen, Award } from "lucide-react";

interface ProfessorReviewsProps {
  reviews: Review[];
}

export function ProfessorReviews({ reviews }: ProfessorReviewsProps) {
  const [filter, setFilter] = useState<"all" | "positive" | "critical">("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [visibleCount, setVisibleCount] = useState(10);

  // Get unique courses for filter
  const courses = Array.from(new Set(reviews.map((r) => r.course_code).filter(Boolean)));

  // Calculate quality score (average of clarity and helpful)
  const getQuality = (r: Review) => ((r.clarity_rating || 0) + (r.helpful_rating || 0)) / 2;

  // Filter reviews
  const filteredReviews = reviews
    .filter((r) => {
      if (filter === "positive") return getQuality(r) >= 4;
      if (filter === "critical") return getQuality(r) < 3;
      return true;
    })
    .filter((r) => {
      if (courseFilter === "all") return true;
      return r.course_code === courseFilter;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const visibleReviews = filteredReviews.slice(0, visibleCount);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return "text-white/40";
    if (grade.startsWith("A")) return "text-emerald-400";
    if (grade.startsWith("B")) return "text-brand-blue";
    if (grade.startsWith("C")) return "text-brand-gold";
    return "text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Sentiment filter */}
        <div className="flex gap-2">
          {[
            { value: "all", label: "All Reviews" },
            { value: "positive", label: "Positive" },
            { value: "critical", label: "Critical" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? "bg-brand-blue text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Course filter */}
        {courses.length > 1 && (
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="px-4 py-2 rounded-lg bg-neutral-900 text-white border border-white/10 text-sm focus:outline-none focus:border-brand-blue/50"
          >
            <option value="all" className="bg-neutral-900 text-white">
              All Courses
            </option>
            {courses.map((course) => (
              <option key={course} value={course} className="bg-neutral-900 text-white">
                {course}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Results count */}
      <p className="text-white/40 text-sm">
        Showing {visibleReviews.length} of {filteredReviews.length} reviews
      </p>

      {/* Reviews list */}
      <div className="space-y-4">
        {visibleReviews.map((review, index) => (
          <motion.div
            key={review.review_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.03 * index, duration: 0.4 }}
            className="glass p-5"
          >
            {/* Header row */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {/* Quality score */}
              <div className="flex items-center gap-2">
                <div
                  className={`text-lg font-bold ${
                    getQuality(review) >= 4
                      ? "text-emerald-400"
                      : getQuality(review) >= 3
                      ? "text-brand-gold"
                      : "text-red-400"
                  }`}
                >
                  {getQuality(review).toFixed(1)}
                </div>
                <span className="text-white/30 text-sm">quality</span>
              </div>

              <div className="h-4 w-px bg-white/10" />

              {/* Difficulty */}
              <div className="flex items-center gap-2">
                <div className="text-lg font-bold text-brand-gold">
                  {review.difficulty_rating?.toFixed(1) || "N/A"}
                </div>
                <span className="text-white/30 text-sm">difficulty</span>
              </div>

              <div className="h-4 w-px bg-white/10" />

              {/* Course */}
              {review.course_code && (
                <div className="flex items-center gap-1 text-white/50 text-sm">
                  <BookOpen className="w-4 h-4" />
                  <span>{review.course_code}</span>
                </div>
              )}

              {/* Date */}
              <div className="flex items-center gap-1 text-white/40 text-sm ml-auto">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(review.date)}</span>
              </div>
            </div>

            {/* Comment */}
            <p className="text-white/80 leading-relaxed mb-4">{review.comment}</p>

            {/* Footer row */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {/* Would take again */}
              {review.would_take_again !== null && (
                <div className="flex items-center gap-1">
                  {review.would_take_again === 1 ? (
                    <ThumbsUp className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className="text-white/50">
                    {review.would_take_again === 1 ? "Would take again" : "Would not take again"}
                  </span>
                </div>
              )}

              {/* Grade */}
              {review.grade && (
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-white/40" />
                  <span className={getGradeColor(review.grade)}>Grade: {review.grade}</span>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load more button */}
      {visibleCount < filteredReviews.length && (
        <div className="text-center">
          <button
            onClick={() => setVisibleCount((c) => c + 10)}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
          >
            Load More Reviews ({filteredReviews.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Empty state */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/50">No reviews match your filters</p>
        </div>
      )}
    </div>
  );
}
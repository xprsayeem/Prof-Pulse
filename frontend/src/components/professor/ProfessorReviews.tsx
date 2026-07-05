"use client";

import { Review } from "@/lib/types";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
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
    if (!grade) return "text-muted-foreground";
    if (grade.startsWith("A")) return "text-brand";
    if (grade.startsWith("F")) return "text-destructive";
    return "text-foreground";
  };

  const qualityColor = (q: number) =>
    q >= 4 ? "text-brand" : q >= 3 ? "text-foreground" : "text-destructive";

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {/* Sentiment filter */}
        <div className="flex gap-2">
          {[
            { value: "all", label: "All reviews" },
            { value: "positive", label: "Positive" },
            { value: "critical", label: "Critical" },
          ].map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value as typeof filter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === option.value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
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
            className="px-4 py-2 rounded-lg bg-card text-foreground border border-border text-sm focus:outline-none focus:border-brand"
          >
            <option value="all">All courses</option>
            {courses.map((course) => (
              <option key={course} value={course}>
                {course}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Results count */}
      <p className="text-muted-foreground text-sm">
        Showing {visibleReviews.length} of {filteredReviews.length} reviews
      </p>

      {/* Reviews list */}
      <div className="space-y-4">
        {visibleReviews.map((review, index) => (
          <motion.div
            key={review.review_id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(0.03 * index, 0.3), duration: 0.4 }}
            className="rounded-xl border border-border bg-card p-5 shadow-soft"
          >
            {/* Header row */}
            <div className="flex flex-wrap items-center gap-4 mb-4">
              {/* Quality score */}
              <div className="flex items-center gap-2">
                <div className={`text-lg font-medium ${qualityColor(getQuality(review))}`}>
                  {getQuality(review).toFixed(1)}
                </div>
                <span className="text-muted-foreground text-sm">quality</span>
              </div>

              <div className="h-4 w-px bg-border" />

              {/* Difficulty */}
              <div className="flex items-center gap-2">
                <div className="text-lg font-medium text-foreground">
                  {review.difficulty_rating?.toFixed(1) || "N/A"}
                </div>
                <span className="text-muted-foreground text-sm">difficulty</span>
              </div>

              <div className="h-4 w-px bg-border" />

              {/* Course */}
              {review.course_code && (
                <Link
                  href={`/course/${review.course_code}`}
                  className="flex items-center gap-1 text-muted-foreground text-sm hover:text-brand transition-colors"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{review.course_code}</span>
                </Link>
              )}

              {/* Date */}
              <div className="flex items-center gap-1 text-muted-foreground text-sm ml-auto">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(review.date)}</span>
              </div>
            </div>

            {/* Comment */}
            <p className="text-foreground/90 leading-relaxed mb-4">{review.comment}</p>

            {/* Footer row */}
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {/* Would take again */}
              {review.would_take_again !== null && (
                <div className="flex items-center gap-1">
                  {review.would_take_again === 1 ? (
                    <ThumbsUp className="w-4 h-4 text-brand" />
                  ) : (
                    <ThumbsDown className="w-4 h-4 text-destructive" />
                  )}
                  <span className="text-muted-foreground">
                    {review.would_take_again === 1 ? "Would take again" : "Would not take again"}
                  </span>
                </div>
              )}

              {/* Grade */}
              {review.grade && (
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4 text-muted-foreground" />
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
            className="px-6 py-3 rounded-xl border border-border bg-card text-foreground shadow-soft transition-colors hover:bg-accent"
          >
            Load more reviews ({filteredReviews.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Empty state */}
      {filteredReviews.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
          <p className="text-muted-foreground">No reviews match your filters</p>
        </div>
      )}
    </div>
  );
}

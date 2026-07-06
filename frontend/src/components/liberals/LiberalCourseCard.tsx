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
    <div
      className={`h-full rounded-xl border border-border bg-card p-4 shadow-soft ${
        hasData ? "transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-soft-md" : "opacity-70"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-medium text-foreground">{liberal.code}</h3>
            <span className="rounded bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground">
              {liberal.level === "lower" ? "LL" : "UL"}
            </span>
          </div>
          <p className="text-muted-foreground text-sm leading-tight mt-1">{liberal.title}</p>
        </div>

        {/* Bird score */}
        {birdScore && (
          <div className="text-right shrink-0">
            <div
              className={`font-display text-lg font-medium ${
                birdScore >= 70 ? "text-brand" : birdScore >= 55 ? "text-foreground" : "text-muted-foreground"
              }`}
            >
              {birdScore.toFixed(0)}
            </div>
            <div className="text-muted-foreground text-[10px]">Bird</div>
          </div>
        )}
      </div>

      {/* Stats row */}
      {hasData ? (
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-border">
          {quality && (
            <div className="flex items-center gap-1">
              <Star className="w-3 h-3 text-brand" />
              <span className="text-foreground text-xs">{quality.toFixed(1)}</span>
            </div>
          )}
          {difficulty && (
            <div className="flex items-center gap-1">
              <TrendingDown className="w-3 h-3 text-muted-foreground" />
              <span className="text-foreground text-xs">{difficulty.toFixed(1)}</span>
            </div>
          )}
          {bird?.a_rate && (
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3 text-brand" />
              <span className="text-foreground text-xs">{bird.a_rate.toFixed(0)}% A</span>
            </div>
          )}
          <div className="flex items-center gap-1 ml-auto">
            <MessageSquare className="w-3 h-3 text-muted-foreground" />
            <span className="text-muted-foreground text-xs">{reviews}</span>
          </div>
        </div>
      ) : (
        <div className="mt-3 pt-3 border-t border-border">
          <p className="text-muted-foreground text-xs">No reviews yet</p>
        </div>
      )}
    </div>
  );

  if (hasData) {
    return <Link href={`/course/${liberal.code}`}>{content}</Link>;
  }

  return content;
}

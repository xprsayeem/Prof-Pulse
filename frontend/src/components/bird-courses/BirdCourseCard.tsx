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

type Tone = "pos" | "neg" | "neu";

// Tag display names + tone (positive / negative / neutral)
const TAG_CONFIG: Record<string, { label: string; tone: Tone }> = {
  "graded by few things": { label: "Few assessments", tone: "pos" },
  "extra credit": { label: "Extra credit", tone: "pos" },
  "clear grading criteria": { label: "Clear grading", tone: "pos" },
  "online savvy": { label: "Online friendly", tone: "pos" },
  "gives good feedback": { label: "Good feedback", tone: "pos" },
  "accessible outside class": { label: "Accessible", tone: "pos" },
  "amazing lectures": { label: "Great lectures", tone: "pos" },
  "caring": { label: "Caring", tone: "pos" },
  "inspirational": { label: "Inspirational", tone: "pos" },
  "hilarious": { label: "Hilarious", tone: "pos" },
  "respected": { label: "Respected", tone: "pos" },
  "participation matters": { label: "Participation", tone: "neu" },
  "lecture heavy": { label: "Lecture heavy", tone: "neu" },
  "group projects": { label: "Group projects", tone: "neu" },
  "tough grader": { label: "Tough grader", tone: "neg" },
  "get ready to read": { label: "Heavy reading", tone: "neg" },
  "lots of homework": { label: "Lots of homework", tone: "neg" },
  "test heavy": { label: "Test heavy", tone: "neg" },
  "skip class? you won't pass.": { label: "Must attend", tone: "neg" },
  "so many papers": { label: "Many papers", tone: "neg" },
  "beware of pop quizzes": { label: "Pop quizzes", tone: "neg" },
};

const TONE_CLASS: Record<Tone, string> = {
  pos: "bg-brand/12 text-brand",
  neg: "bg-destructive/12 text-destructive",
  neu: "bg-secondary text-muted-foreground",
};

function getTagConfig(tag: string) {
  const key = tag.toLowerCase();
  return TAG_CONFIG[key] || { label: tag, tone: "neu" as Tone };
}

// Bird score ring color
function getScoreColor(score: number): string {
  if (score >= 80) return "#A9762A"; // ochre
  if (score >= 65) return "#8C7A54"; // taupe
  return "#A39B86"; // muted
}

export function BirdCourseCard({ course, rank }: BirdCourseCardProps) {
  const liberalCategory = getLiberalCategory(course.course_code);
  const isVerifiedBird = course.confidence >= 0.9 && course.bird_score >= 70 && course.a_rate >= 60;

  const tags = [course.top_tag_1, course.top_tag_2, course.top_tag_3].filter(Boolean) as string[];

  const getDifficultyLabel = (diff: number) => {
    if (diff <= 1.5) return "Very easy";
    if (diff <= 2.0) return "Easy";
    if (diff <= 2.5) return "Moderate";
    if (diff <= 3.0) return "Somewhat hard";
    return "Hard";
  };

  return (
    <Link href={`/course/${course.course_code}`}>
      <div className="group h-full rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-soft-md">
        {/* Header row */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-muted-foreground text-sm font-medium">#{rank}</span>
              <h3 className="text-xl font-medium text-foreground">{course.course_code}</h3>
              {isVerifiedBird && (
                <span className="flex items-center gap-1 rounded-full bg-brand/15 px-2 py-0.5 text-xs font-medium text-brand">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <p className="text-muted-foreground text-sm">{course.department}</p>
            {liberalCategory && (
              <span className="mt-2 inline-block rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                {getLiberalLabel(liberalCategory)}
              </span>
            )}
          </div>

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
        <div className="grid grid-cols-4 gap-3 mb-4">
          <div className="text-center">
            <p className="font-display text-lg font-medium text-brand">{course.a_rate.toFixed(0)}%</p>
            <p className="text-muted-foreground text-xs">A rate</p>
          </div>
          <div className="text-center">
            <p className="font-display text-lg font-medium text-foreground">{course.avg_difficulty.toFixed(1)}</p>
            <p className="text-muted-foreground text-xs">Difficulty</p>
          </div>
          <div className="text-center">
            <p className="font-display text-lg font-medium text-foreground">
              {course.would_take_again_pct ? `${course.would_take_again_pct.toFixed(0)}%` : "N/A"}
            </p>
            <p className="text-muted-foreground text-xs">Retake</p>
          </div>
          <div className="text-center">
            <p className="font-display text-lg font-medium text-muted-foreground">{course.total_reviews}</p>
            <p className="text-muted-foreground text-xs">Reviews</p>
          </div>
        </div>

        {/* Difficulty indicator */}
        <div className="flex items-center gap-2 mb-4">
          <TrendingDown className="w-4 h-4 text-brand" />
          <div className="flex-1 h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${((5 - course.avg_difficulty) / 4) * 100}%` }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="h-full bg-brand rounded-full"
            />
          </div>
          <span className="text-muted-foreground text-xs">{getDifficultyLabel(course.avg_difficulty)}</span>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {tags.map((tag) => {
              const config = getTagConfig(tag);
              return (
                <span
                  key={tag}
                  className={`rounded-full px-2 py-1 text-xs font-medium ${TONE_CLASS[config.tone]}`}
                >
                  {config.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Top professor */}
        {course.top_professor_name && (
          <div className="pt-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-brand/12 p-1.5">
                <User className="w-3 h-3 text-brand" />
              </div>
              <div>
                <p className="text-foreground text-sm font-medium">{course.top_professor_name}</p>
                <p className="text-muted-foreground text-xs">Top pick</p>
              </div>
            </div>
            {course.top_professor_quality && (
              <div className="flex items-center gap-1">
                <Award className="w-4 h-4 text-brand" />
                <span className="text-foreground text-sm">
                  {course.top_professor_quality.toFixed(1)}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}

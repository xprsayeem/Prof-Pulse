"use client";

import { useState, useMemo } from "react";
import { BirdCourse, Course } from "@/lib/types";
import { LIBERAL_COURSES, LiberalCourse } from "@/lib/liberals";
import { LiberalCourseCard } from "./LiberalCourseCard";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

interface LiberalsListProps {
  birdCourses: BirdCourse[];
  courses: Course[];
}

type LevelFilter = "all" | "lower" | "upper";
type DataFilter = "all" | "has_reviews" | "no_reviews";
type SortOption = "code" | "bird_score" | "difficulty" | "quality";

export function LiberalsList({ birdCourses, courses }: LiberalsListProps) {
  const [level, setLevel] = useState<LevelFilter>("all");
  const [dataFilter, setDataFilter] = useState<DataFilter>("all");
  const [sortBy, setSortBy] = useState<SortOption>("bird_score");
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(30);

  const birdMap = useMemo(() => {
    const map = new Map<string, BirdCourse>();
    birdCourses.forEach((b) => map.set(b.course_code, b));
    return map;
  }, [birdCourses]);

  const courseMap = useMemo(() => {
    const map = new Map<string, Course>();
    courses.forEach((c) => map.set(c.course_code, c));
    return map;
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let result: LiberalCourse[] = [...LIBERAL_COURSES];

    if (level !== "all") {
      result = result.filter((c) => c.level === level);
    }

    if (search.length >= 2) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) => c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)
      );
    }

    if (dataFilter === "has_reviews") {
      result = result.filter((c) => birdMap.has(c.code) || courseMap.has(c.code));
    } else if (dataFilter === "no_reviews") {
      result = result.filter((c) => !birdMap.has(c.code) && !courseMap.has(c.code));
    }

    result.sort((a, b) => {
      const birdA = birdMap.get(a.code);
      const birdB = birdMap.get(b.code);
      const courseA = courseMap.get(a.code);
      const courseB = courseMap.get(b.code);

      switch (sortBy) {
        case "bird_score": {
          const scoreA = birdA?.bird_score ?? -1;
          const scoreB = birdB?.bird_score ?? -1;
          if (scoreA === scoreB) return a.code.localeCompare(b.code);
          return scoreB - scoreA;
        }
        case "difficulty": {
          const diffA = birdA?.avg_difficulty ?? courseA?.avg_difficulty ?? 99;
          const diffB = birdB?.avg_difficulty ?? courseB?.avg_difficulty ?? 99;
          if (diffA === diffB) return a.code.localeCompare(b.code);
          return diffA - diffB;
        }
        case "quality": {
          const qualA = birdA?.avg_quality ?? courseA?.avg_quality ?? -1;
          const qualB = birdB?.avg_quality ?? courseB?.avg_quality ?? -1;
          if (qualA === qualB) return a.code.localeCompare(b.code);
          return qualB - qualA;
        }
        case "code":
        default:
          return a.code.localeCompare(b.code);
      }
    });

    return result;
  }, [level, dataFilter, sortBy, search, birdMap, courseMap]);

  const visibleCourses = filteredCourses.slice(0, visibleCount);

  const withData = filteredCourses.filter(
    (c) => birdMap.has(c.code) || courseMap.has(c.code)
  ).length;

  const selectClass =
    "bg-card text-foreground border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand";

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-soft space-y-4">
        {/* Level toggles */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: `All (${LIBERAL_COURSES.length})` },
              { id: "lower", label: `Lower level (${LIBERAL_COURSES.filter((c) => c.level === "lower").length})` },
              { id: "upper", label: `Upper level (${LIBERAL_COURSES.filter((c) => c.level === "upper").length})` },
            ] as const
          ).map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setLevel(option.id);
                setVisibleCount(30);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                level === option.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Second row: search, data filter, sort */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(30);
              }}
              placeholder="Search by code or title..."
              className="w-full bg-card text-foreground placeholder:text-muted-foreground pl-10 pr-4 py-2 rounded-lg border border-border focus:border-brand focus:outline-none text-sm"
            />
          </div>

          <select
            value={dataFilter}
            onChange={(e) => {
              setDataFilter(e.target.value as DataFilter);
              setVisibleCount(30);
            }}
            className={selectClass}
          >
            <option value="all">All courses</option>
            <option value="has_reviews">Has reviews ({withData})</option>
            <option value="no_reviews">No reviews</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className={selectClass}
          >
            <option value="bird_score">Bird score</option>
            <option value="difficulty">Easiest first</option>
            <option value="quality">Highest quality</option>
            <option value="code">Course code</option>
          </select>

          <span className="text-muted-foreground text-sm ml-auto">
            {filteredCourses.length} courses
          </span>
        </div>
      </div>

      {/* Course list */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {visibleCourses.map((liberal, index) => (
          <motion.div
            key={liberal.code}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.02, 0.3), duration: 0.3 }}
          >
            <LiberalCourseCard
              liberal={liberal}
              bird={birdMap.get(liberal.code)}
              course={courseMap.get(liberal.code)}
            />
          </motion.div>
        ))}
      </div>

      {/* Load more */}
      {visibleCount < filteredCourses.length && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((c) => c + 30)}
            className="px-6 py-3 rounded-xl border border-border bg-card text-foreground shadow-soft transition-colors hover:bg-accent"
          >
            Load more ({filteredCourses.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {filteredCourses.length === 0 && (
        <div className="text-center py-16">
          <p className="text-muted-foreground text-lg">No courses match your filters</p>
        </div>
      )}
    </div>
  );
}

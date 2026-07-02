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

  // Build lookup maps
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

  // Filter and sort
  const filteredCourses = useMemo(() => {
    let result: LiberalCourse[] = [...LIBERAL_COURSES];

    // Level filter
    if (level !== "all") {
      result = result.filter((c) => c.level === level);
    }

    // Search
    if (search.length >= 2) {
      const q = search.toLowerCase();
      result = result.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q)
      );
    }

    // Data filter
    if (dataFilter === "has_reviews") {
      result = result.filter((c) => birdMap.has(c.code) || courseMap.has(c.code));
    } else if (dataFilter === "no_reviews") {
      result = result.filter((c) => !birdMap.has(c.code) && !courseMap.has(c.code));
    }

    // Sort
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

  // Counts
  const withData = filteredCourses.filter(
    (c) => birdMap.has(c.code) || courseMap.has(c.code)
  ).length;

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass p-4 space-y-4">
        {/* Level toggles */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: "all", label: `All (${LIBERAL_COURSES.length})` },
              { id: "lower", label: `Lower Level (${LIBERAL_COURSES.filter((c) => c.level === "lower").length})` },
              { id: "upper", label: `Upper Level (${LIBERAL_COURSES.filter((c) => c.level === "upper").length})` },
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
                  ? "bg-brand-blue text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Second row: search, data filter, sort */}
        <div className="flex flex-wrap gap-4 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setVisibleCount(30);
              }}
              placeholder="Search by code or title..."
              className="w-full bg-white/5 text-white placeholder:text-white/40 pl-10 pr-4 py-2 rounded-lg border border-white/10 focus:border-brand-blue/50 focus:outline-none text-sm"
            />
          </div>

          {/* Data filter */}
          <select
            value={dataFilter}
            onChange={(e) => {
              setDataFilter(e.target.value as DataFilter);
              setVisibleCount(30);
            }}
            className="bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue/50"
          >
            <option value="all" className="bg-neutral-900">All Courses</option>
            <option value="has_reviews" className="bg-neutral-900">Has Reviews ({withData})</option>
            <option value="no_reviews" className="bg-neutral-900">No Reviews</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue/50"
          >
            <option value="bird_score" className="bg-neutral-900">Bird Score</option>
            <option value="difficulty" className="bg-neutral-900">Easiest First</option>
            <option value="quality" className="bg-neutral-900">Highest Quality</option>
            <option value="code" className="bg-neutral-900">Course Code</option>
          </select>

          <span className="text-white/40 text-sm ml-auto">
            {filteredCourses.length} courses
          </span>
        </div>
      </div>

      {/* Course list */}
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {visibleCourses.map((liberal, index) => (
          <motion.div
            key={liberal.code}
            initial={{ opacity: 0, y: 15 }}
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
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
          >
            Load More ({filteredCourses.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {filteredCourses.length === 0 && (
        <div className="text-center py-16">
          <p className="text-white/50 text-lg">No courses match your filters</p>
        </div>
      )}
    </div>
  );
}
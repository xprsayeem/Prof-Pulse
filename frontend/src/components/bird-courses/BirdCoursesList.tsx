"use client";

import { useState, useMemo } from "react";
import { BirdCourse } from "@/lib/types";
import { getLiberalCategory } from "@/lib/liberals";
import { BirdCourseCard } from "./BirdCourseCard";
import { motion } from "framer-motion";
import { Filter, SortAsc } from "lucide-react";

interface BirdCoursesListProps {
  courses: BirdCourse[];
  departments: string[];
}

type SortOption = "bird_score" | "a_rate" | "difficulty" | "reviews";
type LiberalFilter = "all" | "lower" | "upper" | "any_liberal";

export function BirdCoursesList({ courses, departments }: BirdCoursesListProps) {
  const [department, setDepartment] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("bird_score");
  const [liberalFilter, setLiberalFilter] = useState<LiberalFilter>("all");
  const [visibleCount, setVisibleCount] = useState(20);

  const filteredAndSorted = useMemo(() => {
    let result = [...courses];

    // Filter by department
    if (department !== "all") {
      result = result.filter((c) => c.department === department);
    }

    // Filter by liberal category
    if (liberalFilter !== "all") {
      result = result.filter((c) => {
        const category = getLiberalCategory(c.course_code);
        if (liberalFilter === "any_liberal") return category !== null;
        return category === liberalFilter;
      });
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "bird_score":
          return b.bird_score - a.bird_score;
        case "a_rate":
          return b.a_rate - a.a_rate;
        case "difficulty":
          return a.avg_difficulty - b.avg_difficulty;
        case "reviews":
          return b.total_reviews - a.total_reviews;
        default:
          return 0;
      }
    });

    return result;
  }, [courses, department, sortBy, liberalFilter]);

  const visibleCourses = filteredAndSorted.slice(0, visibleCount);

  // Count liberals for display
  const liberalCounts = useMemo(() => {
    let lower = 0;
    let upper = 0;
    const filtered = department === "all" ? courses : courses.filter((c) => c.department === department);
    filtered.forEach((c) => {
      const cat = getLiberalCategory(c.course_code);
      if (cat === "lower") lower++;
      if (cat === "upper") upper++;
    });
    return { lower, upper, total: lower + upper };
  }, [courses, department]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass p-4 space-y-4">
        {/* Top row: department + sort */}
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-white/40" />
            <select
              value={department}
              onChange={(e) => {
                setDepartment(e.target.value);
                setVisibleCount(20);
              }}
              className="bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue/50"
            >
              <option value="all" className="bg-neutral-900">All Departments</option>
              {departments.map((dept) => (
                <option key={dept} value={dept} className="bg-neutral-900">
                  {dept}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <SortAsc className="w-4 h-4 text-white/40" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue/50"
            >
              <option value="bird_score" className="bg-neutral-900">Bird Score</option>
              <option value="a_rate" className="bg-neutral-900">A Rate</option>
              <option value="difficulty" className="bg-neutral-900">Easiest First</option>
              <option value="reviews" className="bg-neutral-900">Most Reviews</option>
            </select>
          </div>

          <div className="ml-auto text-white/40 text-sm">
            {filteredAndSorted.length} courses
          </div>
        </div>

        {/* Liberal filter buttons */}
        <div className="flex flex-wrap gap-2">
          {[
            { id: "all" as const, label: "All Courses" },
            { id: "any_liberal" as const, label: `All Liberals (${liberalCounts.total})` },
            { id: "lower" as const, label: `Lower Liberal (${liberalCounts.lower})` },
            { id: "upper" as const, label: `Upper Liberal (${liberalCounts.upper})` },
          ].map((option) => (
            <button
              key={option.id}
              onClick={() => {
                setLiberalFilter(option.id);
                setVisibleCount(20);
              }}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                liberalFilter === option.id
                  ? "bg-brand-blue text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {visibleCourses.map((course, index) => (
          <motion.div
            key={course.course_code}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(index * 0.03, 0.3), duration: 0.4 }}
          >
            <BirdCourseCard
              course={course}
              rank={department === "all" && liberalFilter === "all" ? course.bird_rank : index + 1}
            />
          </motion.div>
        ))}
      </div>

      {/* Load more */}
      {visibleCount < filteredAndSorted.length && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount((c) => c + 20)}
            className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl transition-colors"
          >
            Load More ({filteredAndSorted.length - visibleCount} remaining)
          </button>
        </div>
      )}

      {/* Empty state */}
      {filteredAndSorted.length === 0 && (
        <div className="text-center py-16">
          <p className="text-white/50 text-lg">No bird courses found with these filters</p>
        </div>
      )}
    </div>
  );
}
"use client";

import { useState, useMemo } from "react";
import { BirdCourse } from "@/lib/types";
import { BirdCourseCard } from "./BirdCourseCard";
import { motion } from "framer-motion";
import { Filter, SortAsc } from "lucide-react";

interface BirdCoursesListProps {
  courses: BirdCourse[];
  departments: string[];
}

type SortOption = "bird_score" | "a_rate" | "difficulty" | "reviews";

export function BirdCoursesList({ courses, departments }: BirdCoursesListProps) {
  const [department, setDepartment] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortOption>("bird_score");
  const [visibleCount, setVisibleCount] = useState(20);

  const filteredAndSorted = useMemo(() => {
    let result = [...courses];

    // Filter by department
    if (department !== "all") {
      result = result.filter((c) => c.department === department);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case "bird_score":
          return b.bird_score - a.bird_score;
        case "a_rate":
          return b.a_rate - a.a_rate;
        case "difficulty":
          return a.avg_difficulty - b.avg_difficulty; // Lower is better
        case "reviews":
          return b.total_reviews - a.total_reviews;
        default:
          return 0;
      }
    });

    return result;
  }, [courses, department, sortBy]);

  const visibleCourses = filteredAndSorted.slice(0, visibleCount);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="glass p-4 flex flex-wrap gap-4 items-center">
        {/* Department filter */}
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
            <option value="all" className="bg-neutral-900 text-white">
            All Departments
            </option>
            {departments.map((dept) => (
            <option
                key={dept}
                value={dept}
                className="bg-neutral-900 text-white"
            >
                {dept}
            </option>
            ))}
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <SortAsc className="w-4 h-4 text-white/40" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-white/5 text-white border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-brand-blue/50"
          >
            <option value="bird_score" className="bg-neutral-900 text-white">
            Bird Score
            </option>
            <option value="a_rate" className="bg-neutral-900 text-white">
            A Rate
            </option>
            <option value="difficulty" className="bg-neutral-900 text-white">
            Easiest First
            </option>
            <option value="reviews" className="bg-neutral-900 text-white">
            Most Reviews
            </option>
          </select>
        </div>

        {/* Results count */}
        <div className="ml-auto text-white/40 text-sm">
          {filteredAndSorted.length} courses
          {department !== "all" && ` in ${department}`}
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
              rank={department === "all" ? course.bird_rank : course.dept_bird_rank}
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
          <p className="text-white/50 text-lg">No bird courses found in this department</p>
        </div>
      )}
    </div>
  );
}
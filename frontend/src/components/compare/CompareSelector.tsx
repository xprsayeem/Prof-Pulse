"use client";

import { useState, useMemo } from "react";
import { Course, CourseProfessor } from "@/lib/types";
import { Search, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CompareSelectorProps {
  mode: "courses" | "professors" | "course-professors";
  selectedItems: string[];
  courseFilter: string | null;
  courses: Course[];
  professors: CourseProfessor[];
  allProfessors: CourseProfessor[];
  onAddItem: (item: string) => void;
  onRemoveItem: (item: string) => void;
  onCourseFilterChange: (course: string | null) => void;
}

export function CompareSelector({
  mode,
  selectedItems,
  courseFilter,
  courses,
  professors,
  allProfessors,
  onAddItem,
  onRemoveItem,
  onCourseFilterChange,
}: CompareSelectorProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  // Get professors filtered by course if in course-professors mode
  const availableProfessors = useMemo(() => {
    if (mode === "course-professors" && courseFilter) {
      return allProfessors.filter((p) => p.course_code === courseFilter);
    }
    return professors;
  }, [mode, courseFilter, professors, allProfessors]);

  // Search suggestions
  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();

    if (mode === "courses") {
      return courses
        .filter(
          (c) =>
            c.course_code.toLowerCase().includes(q) &&
            !selectedItems.includes(c.course_code)
        )
        .slice(0, 6)
        .map((c) => ({
          id: c.course_code,
          label: c.course_code,
          sublabel: `${c.total_reviews} reviews • ${c.avg_quality?.toFixed(1) || "N/A"} quality`,
        }));
    } else {
      return availableProfessors
        .filter(
          (p) =>
            p.professor_name.toLowerCase().includes(q) &&
            !selectedItems.includes(p.professor_id)
        )
        .slice(0, 6)
        .map((p) => ({
          id: p.professor_id,
          label: p.professor_name,
          sublabel: mode === "course-professors" ? `${p.section_reviews} reviews for ${p.course_code}` : p.department,
        }));
    }
  }, [query, mode, courses, availableProfessors, selectedItems]);

  // Get display names for selected items
  const getSelectedLabel = (id: string) => {
    if (mode === "courses") {
      return id;
    }
    const prof = professors.find((p) => p.professor_id === id);
    return prof?.professor_name || id;
  };

  return (
    <div className="glass p-6 space-y-4">
      {/* Course filter for course-professors mode */}
      {mode === "course-professors" && (
        <div className="mb-4">
          <label className="block text-white/60 text-sm mb-2">
            Select a course first:
          </label>
          <select
            value={courseFilter || ""}
            onChange={(e) => onCourseFilterChange(e.target.value || null)}
            className="w-full md:w-64 px-4 py-2 rounded-lg bg-white/5 text-white border border-white/10 text-sm focus:outline-none focus:border-brand-blue/50"
          >
            <option value="" className="bg-neutral-900">Choose a course...</option>
            {courses.map((c) => (
              <option key={c.course_code} value={c.course_code} className="bg-neutral-900">
                {c.course_code}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected items */}
      <div className="flex flex-wrap gap-2">
        {selectedItems.map((item) => (
          <motion.div
            key={item}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex items-center gap-2 bg-brand-blue/20 text-brand-blue px-3 py-1.5 rounded-full"
          >
            <span className="font-medium">{getSelectedLabel(item)}</span>
            <button
              onClick={() => onRemoveItem(item)}
              className="hover:bg-brand-blue/20 rounded-full p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
        {selectedItems.length < 4 && (mode !== "course-professors" || courseFilter) && (
          <span className="text-white/30 text-sm py-1.5">
            {selectedItems.length === 0
              ? `Add ${mode === "courses" ? "courses" : "professors"} to compare`
              : `${4 - selectedItems.length} more slots available`}
          </span>
        )}
      </div>

      {/* Search input */}
      {selectedItems.length < 4 && (mode !== "course-professors" || courseFilter) && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              placeholder={`Search ${mode === "courses" ? "courses" : "professors"}...`}
              className="w-full bg-white/5 text-white placeholder:text-white/40 pl-10 pr-4 py-3 rounded-lg border border-white/10 focus:border-brand-blue/50 focus:outline-none"
            />
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {isOpen && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-lg overflow-hidden z-50"
              >
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => {
                      onAddItem(s.id);
                      setQuery("");
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 transition-colors text-left"
                  >
                    <div>
                      <p className="text-white font-medium">{s.label}</p>
                      <p className="text-white/50 text-sm">{s.sublabel}</p>
                    </div>
                    <Plus className="w-4 h-4 text-white/40" />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
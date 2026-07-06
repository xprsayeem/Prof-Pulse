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

  // In "professors in course" mode the first step is picking the course.
  const pickingCourse = mode === "course-professors" && !courseFilter;

  // Professors available to add (scoped to the chosen course when applicable).
  const availableProfessors = useMemo(() => {
    if (mode === "course-professors" && courseFilter) {
      return allProfessors.filter((p) => p.course_code === courseFilter);
    }
    return professors;
  }, [mode, courseFilter, professors, allProfessors]);

  // Search suggestions — courses when picking a course or in course mode,
  // professors otherwise.
  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();

    if (pickingCourse || mode === "courses") {
      return courses
        .filter(
          (c) =>
            c.course_code.toLowerCase().includes(q) &&
            (pickingCourse || !selectedItems.includes(c.course_code))
        )
        .slice(0, 6)
        .map((c) => ({
          id: c.course_code,
          label: c.course_code,
          sublabel: `${c.total_reviews} reviews • ${c.avg_quality?.toFixed(1) || "N/A"} quality`,
        }));
    }

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
        sublabel:
          mode === "course-professors"
            ? `${p.section_reviews} reviews for ${p.course_code}`
            : p.department,
      }));
  }, [query, mode, pickingCourse, courses, availableProfessors, selectedItems]);

  const getSelectedLabel = (id: string) => {
    if (mode === "courses") return id;
    const prof = professors.find((p) => p.professor_id === id);
    return prof?.professor_name || id;
  };

  const handleSelect = (id: string) => {
    if (pickingCourse) {
      onCourseFilterChange(id);
    } else {
      onAddItem(id);
    }
    setQuery("");
    setIsOpen(false);
  };

  const showSearch =
    pickingCourse || (selectedItems.length < 4 && (mode !== "course-professors" || !!courseFilter));

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-soft space-y-4">
      {/* Chosen course indicator (course-professors mode) */}
      {mode === "course-professors" && courseFilter && (
        <div className="flex items-center justify-between rounded-lg bg-secondary px-4 py-2">
          <span className="text-sm text-muted-foreground">
            Comparing professors in{" "}
            <span className="font-medium text-foreground">{courseFilter}</span>
          </span>
          <button
            onClick={() => onCourseFilterChange(null)}
            className="text-sm text-brand hover:underline"
          >
            Change course
          </button>
        </div>
      )}

      {/* Prompt when picking a course */}
      {pickingCourse && (
        <p className="text-muted-foreground text-sm">
          Search for a course to compare its professors:
        </p>
      )}

      {/* Selected items (only once we're adding, not while picking a course) */}
      {!pickingCourse && (
        <div className="flex flex-wrap gap-2">
          {selectedItems.map((item) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex items-center gap-2 bg-brand/15 text-brand px-3 py-1.5 rounded-full"
            >
              <span className="font-medium">{getSelectedLabel(item)}</span>
              <button
                onClick={() => onRemoveItem(item)}
                className="hover:bg-brand/20 rounded-full p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
          {selectedItems.length < 4 && (
            <span className="text-muted-foreground text-sm py-1.5">
              {selectedItems.length === 0
                ? `Add ${mode === "courses" ? "courses" : "professors"} to compare`
                : `${4 - selectedItems.length} more slots available`}
            </span>
          )}
        </div>
      )}

      {/* Search */}
      {showSearch && (
        <div className="relative">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={() => setIsOpen(true)}
              onBlur={() => setTimeout(() => setIsOpen(false), 200)}
              placeholder={
                pickingCourse
                  ? "Search for a course..."
                  : `Search ${mode === "courses" ? "courses" : "professors"}...`
              }
              className="w-full bg-card text-foreground placeholder:text-muted-foreground pl-10 pr-4 py-3 rounded-lg border border-border focus:border-brand focus:outline-none"
            />
          </div>

          {/* Suggestions dropdown */}
          <AnimatePresence>
            {isOpen && suggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-lg overflow-hidden z-50 shadow-soft-md"
              >
                {suggestions.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect(s.id)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-accent transition-colors text-left"
                  >
                    <div>
                      <p className="text-foreground font-medium">{s.label}</p>
                      <p className="text-muted-foreground text-sm">{s.sublabel}</p>
                    </div>
                    <Plus className="w-4 h-4 text-muted-foreground" />
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

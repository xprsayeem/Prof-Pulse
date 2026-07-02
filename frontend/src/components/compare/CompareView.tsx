"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Course, CourseProfessor, BirdCourse } from "@/lib/types";
import { CompareSelector } from "./CompareSelector";
import { CourseComparison } from "./CourseComparison";
import { ProfessorComparison } from "./ProfessorComparison";
import { CourseProfessorComparison } from "./CourseProfessorComparison";
import { GitCompare, BookOpen, User, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CompareViewProps {
  initialMode: string;
  initialItems: string[];
  initialCourseFilter: string | null;
  courses: Course[];
  professors: CourseProfessor[];
  birdCourses: BirdCourse[];
}

type CompareMode = "courses" | "professors" | "course-professors";

export function CompareView({
  initialMode,
  initialItems,
  initialCourseFilter,
  courses,
  professors,
  birdCourses,
}: CompareViewProps) {
  const router = useRouter();
  const [mode, setMode] = useState<CompareMode>(initialMode as CompareMode);
  const [selectedItems, setSelectedItems] = useState<string[]>(initialItems);
  const [courseFilter, setCourseFilter] = useState<string | null>(initialCourseFilter);

  // Get unique professors
  const uniqueProfessors = useMemo(() => {
    return Array.from(
      new Map(professors.map((p) => [p.professor_id, p])).values()
    );
  }, [professors]);

  // Update URL when selections change
  const updateURL = (newMode: CompareMode, newItems: string[], newCourse: string | null) => {
    const params = new URLSearchParams();
    params.set("mode", newMode);
    if (newItems.length > 0) {
      params.set("items", newItems.join(","));
    }
    if (newCourse) {
      params.set("course", newCourse);
    }
    router.replace(`/compare?${params.toString()}`, { scroll: false });
  };

  const handleModeChange = (newMode: CompareMode) => {
    setMode(newMode);
    setSelectedItems([]);
    setCourseFilter(null);
    updateURL(newMode, [], null);
  };

  const handleAddItem = (item: string) => {
    if (selectedItems.includes(item) || selectedItems.length >= 4) return;
    const newItems = [...selectedItems, item];
    setSelectedItems(newItems);
    updateURL(mode, newItems, courseFilter);
  };

  const handleRemoveItem = (item: string) => {
    const newItems = selectedItems.filter((i) => i !== item);
    setSelectedItems(newItems);
    updateURL(mode, newItems, courseFilter);
  };

  const handleCourseFilterChange = (course: string | null) => {
    setCourseFilter(course);
    setSelectedItems([]);
    updateURL(mode, [], course);
  };

  const modes = [
    { id: "courses" as const, label: "Courses", icon: BookOpen },
    { id: "professors" as const, label: "Professors", icon: User },
    { id: "course-professors" as const, label: "Professors in Course", icon: Users },
  ];

  return (
    <div className="space-y-8">
      {/* Mode selector with animated indicator */}
      <div className="flex flex-wrap justify-center gap-2 relative">
        {modes.map((m) => (
          <motion.button
            key={m.id}
            onClick={() => handleModeChange(m.id)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              mode === m.id
                ? "text-white"
                : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {mode === m.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-brand-blue rounded-lg"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 35,
                }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <m.icon className="w-4 h-4" />
              {m.label}
            </span>
          </motion.button>
        ))}
      </div>

      {/* Selector */}
      <CompareSelector
        mode={mode}
        selectedItems={selectedItems}
        courseFilter={courseFilter}
        courses={courses}
        professors={uniqueProfessors}
        allProfessors={professors}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onCourseFilterChange={handleCourseFilterChange}
      />

      {/* Comparison view */}
      <AnimatePresence mode="wait">
        {selectedItems.length >= 2 ? (
          <motion.div
            key="comparison"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-8"
          >
            {mode === "courses" && (
              <CourseComparison
                selectedCodes={selectedItems}
                courses={courses}
                birdCourses={birdCourses}
                professors={professors}
              />
            )}
            {mode === "professors" && (
              <ProfessorComparison
                selectedIds={selectedItems}
                professors={professors}
              />
            )}
            {mode === "course-professors" && courseFilter && (
              <CourseProfessorComparison
                courseCode={courseFilter}
                selectedIds={selectedItems}
                professors={professors}
                course={courses.find((c) => c.course_code === courseFilter)}
              />
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16"
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <GitCompare className="w-16 h-16 text-white/20 mx-auto mb-4" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-white/50 text-lg"
            >
              Select at least 2 {mode === "courses" ? "courses" : "professors"} to compare
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/30 text-sm mt-2"
            >
              Use the search above to add items
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

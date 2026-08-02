"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Course,
  CourseProfessor,
  BirdCourse,
  CourseIndex,
  ProfessorIndex,
} from "@/lib/types";
import {
  getCoursesIndex,
  getProfessorsIndex,
  getCourse,
  getProfessorsForCourse,
  getProfessorRecords,
  getBirdCourses,
} from "@/lib/api";
import { CompareSelector } from "./CompareSelector";
import { CourseComparison } from "./CourseComparison";
import { ProfessorComparison } from "./ProfessorComparison";
import { CourseProfessorComparison } from "./CourseProfessorComparison";
import { GitCompare, BookOpen, User, Users, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type CompareMode = "courses" | "professors" | "course-professors";

export function CompareView() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mode, setMode] = useState<CompareMode>(
    (searchParams.get("mode") as CompareMode) || "courses"
  );
  const [selectedItems, setSelectedItems] = useState<string[]>(
    searchParams.get("items")?.split(",").filter(Boolean) || []
  );
  const [courseFilter, setCourseFilter] = useState<string | null>(
    searchParams.get("course") || null
  );

  // Search indexes — small, whole-file, loaded once (browser → S3).
  const [courseIndex, setCourseIndex] = useState<CourseIndex[]>([]);
  const [professorIndex, setProfessorIndex] = useState<ProfessorIndex[]>([]);

  // Detail shards, accumulated on demand as items are selected.
  const [courseMap, setCourseMap] = useState<Map<string, Course>>(new Map());
  const [courseProfsMap, setCourseProfsMap] = useState<Map<string, CourseProfessor[]>>(
    new Map()
  );
  const [profRecordsMap, setProfRecordsMap] = useState<Map<string, CourseProfessor[]>>(
    new Map()
  );
  const [birdCourses, setBirdCourses] = useState<BirdCourse[]>([]);
  const [birdLoaded, setBirdLoaded] = useState(false);

  // Load the search indexes once.
  useEffect(() => {
    let active = true;
    getCoursesIndex().then((d) => active && setCourseIndex(d));
    getProfessorsIndex().then((d) => active && setProfessorIndex(d));
    return () => {
      active = false;
    };
  }, []);

  // Bird scores are only needed for course-vs-course comparison; fetch once.
  useEffect(() => {
    if (mode !== "courses" || birdLoaded) return;
    let active = true;
    getBirdCourses().then((d) => {
      if (!active) return;
      setBirdCourses(d);
      setBirdLoaded(true);
    });
    return () => {
      active = false;
    };
  }, [mode, birdLoaded]);

  // Track which shards we've already requested so we fetch each at most once.
  const requested = useRef<Set<string>>(new Set());

  const loadCourse = (code: string) => {
    if (requested.current.has(`c:${code}`)) return;
    requested.current.add(`c:${code}`);
    getCourse(code).then((c) => {
      if (c) setCourseMap((m) => new Map(m).set(code, c));
    });
    getProfessorsForCourse(code).then((ps) =>
      setCourseProfsMap((m) => new Map(m).set(code, ps))
    );
  };

  const loadProfessor = (id: string) => {
    if (requested.current.has(`p:${id}`)) return;
    requested.current.add(`p:${id}`);
    getProfessorRecords(id).then((rs) =>
      setProfRecordsMap((m) => new Map(m).set(id, rs))
    );
  };

  // Fetch whatever the current selection needs.
  useEffect(() => {
    if (mode === "courses") {
      selectedItems.forEach(loadCourse);
    } else if (mode === "professors") {
      selectedItems.forEach(loadProfessor);
    } else if (mode === "course-professors" && courseFilter) {
      loadCourse(courseFilter);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, selectedItems, courseFilter]);

  // Update URL when selections change (keeps comparisons shareable).
  const updateURL = (newMode: CompareMode, newItems: string[], newCourse: string | null) => {
    const params = new URLSearchParams();
    params.set("mode", newMode);
    if (newItems.length > 0) params.set("items", newItems.join(","));
    if (newCourse) params.set("course", newCourse);
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

  // Assemble the arrays the comparison components expect from the shards we hold.
  const selectedCourses = useMemo(
    () => selectedItems.map((code) => courseMap.get(code)).filter(Boolean) as Course[],
    [selectedItems, courseMap]
  );
  const courseModeProfessors = useMemo(
    () => selectedItems.flatMap((code) => courseProfsMap.get(code) ?? []),
    [selectedItems, courseProfsMap]
  );
  const professorRecords = useMemo(
    () => selectedItems.flatMap((id) => profRecordsMap.get(id) ?? []),
    [selectedItems, profRecordsMap]
  );
  const filterCourseProfs = useMemo(
    () => (courseFilter ? courseProfsMap.get(courseFilter) ?? [] : []),
    [courseFilter, courseProfsMap]
  );

  // Whether every selected item's data has arrived (so we don't flash a partial view).
  const comparisonReady = useMemo(() => {
    if (mode === "courses") {
      return (
        birdLoaded &&
        selectedItems.every((code) => courseMap.has(code) && courseProfsMap.has(code))
      );
    }
    if (mode === "professors") {
      return selectedItems.every((id) => profRecordsMap.has(id));
    }
    // course-professors
    return !!courseFilter && courseProfsMap.has(courseFilter);
  }, [mode, selectedItems, courseMap, courseProfsMap, profRecordsMap, birdLoaded, courseFilter]);

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
                ? "text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {mode === m.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 bg-primary rounded-lg"
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
        courseIndex={courseIndex}
        professorIndex={professorIndex}
        courseProfs={filterCourseProfs}
        onAddItem={handleAddItem}
        onRemoveItem={handleRemoveItem}
        onCourseFilterChange={handleCourseFilterChange}
      />

      {/* Comparison view. Loading sits outside AnimatePresence so its mode="wait"
          only ever swaps the comparison and empty states. */}
      {selectedItems.length >= 2 && !comparisonReady ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="w-6 h-6 animate-spin mb-3" />
          <p className="text-sm">Loading comparison…</p>
        </div>
      ) : (
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
                  courses={selectedCourses}
                  birdCourses={birdCourses}
                  professors={courseModeProfessors}
                />
              )}
              {mode === "professors" && (
                <ProfessorComparison
                  selectedIds={selectedItems}
                  professors={professorRecords}
                />
              )}
              {mode === "course-professors" && courseFilter && (
                <CourseProfessorComparison
                  courseCode={courseFilter}
                  selectedIds={selectedItems}
                  professors={filterCourseProfs}
                  course={courseMap.get(courseFilter)}
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
              <GitCompare className="w-16 h-16 text-muted-foreground/40 mx-auto mb-4" />
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground text-lg"
            >
              Select at least 2 {mode === "courses" ? "courses" : "professors"} to compare
            </motion.p>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-muted-foreground/70 text-sm mt-2"
            >
              Use the search above to add items
            </motion.p>
          </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

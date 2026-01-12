"use client";

import { useState, useMemo, useRef } from "react";
import { Search, BookOpen, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Course, CourseProfessor } from "@/lib/types";

interface SearchBarProps {
  courses: Course[];
  professors: CourseProfessor[];
}

interface Suggestion {
  type: "course" | "professor";
  label: string;
  sublabel: string;
  href: string;
}

export function SearchBar({ courses, professors }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Get unique professors
  const uniqueProfessors = useMemo(() => {
    return Array.from(
      new Map(professors.map((p) => [p.professor_id, p])).values()
    );
  }, [professors]);

  // Compute suggestions as derived state
  const suggestions = useMemo(() => {
    if (query.length < 2) {
      return [];
    }

    const q = query.toLowerCase();
    const results: Suggestion[] = [];

    // Search courses
    const matchingCourses = courses
      .filter((c) => c.course_code.toLowerCase().includes(q))
      .slice(0, 5)
      .map((c) => ({
        type: "course" as const,
        label: c.course_code,
        sublabel: `${c.total_reviews} reviews • ${c.avg_quality?.toFixed(1) || "N/A"} quality`,
        href: `/course/${c.course_code}`,
      }));

    // Search professors
    const matchingProfs = uniqueProfessors
      .filter((p) => p.professor_name.toLowerCase().includes(q))
      .slice(0, 5)
      .map((p) => ({
        type: "professor" as const,
        label: p.professor_name,
        sublabel: p.department,
        href: `/professor/${p.professor_id}`,
      }));

    results.push(...matchingCourses, ...matchingProfs);
    return results.slice(0, 8);
  }, [query, courses, uniqueProfessors]);

  // Handle opening/closing based on suggestions
  const showDropdown = isOpen && suggestions.length > 0;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setSelectedIndex(0);
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter" && suggestions[selectedIndex]) {
      router.push(suggestions[selectedIndex].href);
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="glass glow-blue p-1">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsOpen(true)}
            onBlur={() => setTimeout(() => setIsOpen(false), 200)}
            placeholder="Search courses or professors..."
            className="w-full bg-white/5 text-white placeholder:text-white/40 pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:border-brand-blue/50 focus:bg-white/10 transition-all duration-300 text-lg"
          />
        </div>
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-black/95 backdrop-blur-xl border border-white/10 rounded-2xl overflow-hidden z-50"
          >
            {suggestions.map((suggestion, index) => (
              <motion.button
                key={`${suggestion.type}-${suggestion.label}`}
                onClick={() => {
                  router.push(suggestion.href);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
                  index === selectedIndex
                    ? "bg-brand-blue/20"
                    : "hover:bg-white/5"
                }`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                <div
                  className={`p-2 rounded-lg ${
                    suggestion.type === "course"
                      ? "bg-brand-blue/20 text-brand-blue"
                      : "bg-brand-gold/20 text-brand-gold"
                  }`}
                >
                  {suggestion.type === "course" ? (
                    <BookOpen className="w-4 h-4" />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">
                    {suggestion.label}
                  </p>
                  <p className="text-white/50 text-sm truncate">
                    {suggestion.sublabel}
                  </p>
                </div>
                <span className="text-white/30 text-xs uppercase">
                  {suggestion.type}
                </span>
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
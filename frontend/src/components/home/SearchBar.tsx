"use client";

import { useState, useMemo, useRef } from "react";
import { Search, BookOpen, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { CourseIndex, ProfessorIndex } from "@/lib/types";
import { getSubjectName } from "@/lib/courses";
import { getLiberalTitle } from "@/lib/liberals";

interface SearchBarProps {
  courses: CourseIndex[];
  professors: ProfessorIndex[];
}

interface Suggestion {
  type: "course" | "professor";
  label: string;
  sublabel: string;
  href: string;
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="text-muted-foreground text-sm mr-2">Searching</span>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-brand rounded-full"
          animate={{
            y: [0, -4, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export function SearchBar({ courses, professors }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

    // Search courses by code, subject name, or (for liberals) course title.
    // Most-reviewed matches first so popular courses surface at the top.
    const matchingCourses = courses
      .filter((c) => {
        const title = getLiberalTitle(c.course_code);
        const subject = getSubjectName(c.course_code);
        return `${c.course_code} ${subject} ${title ?? ""}`
          .toLowerCase()
          .includes(q);
      })
      .sort((a, b) => b.total_reviews - a.total_reviews)
      .slice(0, 5)
      .map((c) => {
        const context = getLiberalTitle(c.course_code) ?? getSubjectName(c.course_code);
        return {
          type: "course" as const,
          label: c.course_code,
          sublabel: `${context} · ${c.total_reviews} reviews`,
          href: `/course/${c.course_code}`,
        };
      });

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
  const showDropdown = isOpen && (suggestions.length > 0 || isTyping);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(0);
    setIsOpen(true);

    // Show typing indicator briefly
    if (value.length >= 2) {
      setIsTyping(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 300);
    } else {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => (i - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      if (suggestions[selectedIndex]) {
        router.push(suggestions[selectedIndex].href);
        setIsOpen(false);
      } else if (/^[a-z]{2,4}\d{2,4}$/i.test(query.trim())) {
        // Full course code typed with no dropdown match (e.g. a course that
        // has no reviews yet) — go to the course page, which shows an
        // informative not-found if it truly doesn't exist.
        router.push(`/course/${query.trim().toUpperCase()}`);
        setIsOpen(false);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const hints = useMemo(() => {
    const sampleCourses = courses.slice(0, 2).map((c) => c.course_code);
    const sampleProfs = uniqueProfessors
      .slice(0, 2)
      .map((p) => p.professor_name.split(" ").pop() || p.professor_name);
    return [...sampleCourses, ...sampleProfs].slice(0, 4);
  }, [courses, uniqueProfessors]);

  const handleHintClick = (hint: string) => {
    setQuery(hint);
    setIsOpen(true);
    inputRef.current?.focus();
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="Search courses or professors..."
          className="w-full bg-card text-foreground placeholder:text-muted-foreground pl-12 pr-4 py-3.5 rounded-xl border border-border shadow-soft focus:border-brand focus:outline-none transition-colors text-base"
        />
      </div>

      {/* Search hints */}
      <div className="relative z-0 mt-4 flex flex-wrap justify-center gap-2">
        <span className="text-muted-foreground text-sm">Try:</span>
        {hints.map((hint) => (
          <button
            key={hint}
            type="button"
            onClick={() => handleHintClick(hint)}
            className="text-sm text-muted-foreground hover:text-foreground bg-secondary hover:bg-accent px-3 py-1 rounded-full transition-colors"
          >
            {hint}
          </button>
        ))}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full left-0 right-0 mt-2 bg-popover border border-border rounded-xl overflow-hidden shadow-md z-50"
          >
            {isTyping && suggestions.length === 0 ? (
              <TypingIndicator />
            ) : (
              suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.type}-${suggestion.label}`}
                  onClick={() => {
                    router.push(suggestion.href);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative ${
                    index === selectedIndex ? "bg-accent" : "hover:bg-accent/60"
                  }`}
                >
                  {index === selectedIndex && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-brand" />
                  )}

                  <div
                    className={`p-2 rounded-lg ${
                      suggestion.type === "course"
                        ? "bg-brand/10 text-brand"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {suggestion.type === "course" ? (
                      <BookOpen className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-foreground font-medium truncate">
                      {suggestion.label}
                    </p>
                    <p className="text-muted-foreground text-sm truncate">
                      {suggestion.sublabel}
                    </p>
                  </div>

                  <span className="text-muted-foreground text-xs uppercase tracking-wider">
                    {suggestion.type}
                  </span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

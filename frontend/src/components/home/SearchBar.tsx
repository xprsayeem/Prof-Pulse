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

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <span className="text-white/40 text-sm mr-2">Searching</span>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 bg-brand-blue rounded-full"
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

    // Search courses
    const matchingCourses = courses
      .filter((c) => c.course_code.toLowerCase().includes(q))
      .slice(0, 5)
      .map((c) => ({
        type: "course" as const,
        label: c.course_code,
        sublabel: `${c.total_reviews} reviews - ${c.avg_quality?.toFixed(1) || "N/A"} quality`,
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
    } else if (e.key === "Enter" && suggestions[selectedIndex]) {
      router.push(suggestions[selectedIndex].href);
      setIsOpen(false);
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
            className="w-full bg-white/5 text-white placeholder:text-white/40 pl-12 pr-4 py-4 rounded-xl border border-white/10 focus:border-brand-blue/50 focus:bg-white/10 transition-all duration-300 text-lg input-glow"
          />
        </div>
      </div>

      {/* Search hints */}
      <div className="relative z-0 mt-4 flex flex-wrap justify-center gap-2">
        <span className="text-white/30 text-sm">Try:</span>
        {hints.map((hint) => (
          <button
            key={hint}
            type="button"
            onClick={() => handleHintClick(hint)}
            className="text-sm text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition-all duration-300 btn-interactive"
          >
            {hint}
          </button>
        ))}
      </div>

      {/* Suggestions Dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className="absolute top-full left-0 right-0 mt-2 bg-neutral-900 border border-white/10 rounded-2xl overflow-hidden z-50"
          >
            {isTyping && suggestions.length === 0 ? (
              <TypingIndicator />
            ) : (
              suggestions.map((suggestion, index) => (
                <motion.button
                  key={`${suggestion.type}-${suggestion.label}`}
                  onClick={() => {
                    router.push(suggestion.href);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-all duration-200 group relative ${
                    index === selectedIndex
                      ? "bg-brand-blue/20"
                      : "hover:bg-white/5"
                  }`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  {/* Left accent border on hover */}
                  <motion.div
                    className={`absolute left-0 top-0 bottom-0 w-0.5 bg-brand-blue ${
                      index === selectedIndex ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    }`}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: index === selectedIndex ? 1 : 0 }}
                    whileHover={{ scaleY: 1 }}
                    transition={{ duration: 0.2 }}
                  />

                  <motion.div
                    className={`p-2 rounded-lg ${
                      suggestion.type === "course"
                        ? "bg-brand-blue/20 text-brand-blue"
                        : "bg-brand-gold/20 text-brand-gold"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    {suggestion.type === "course" ? (
                      <BookOpen className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate group-hover:translate-x-1 transition-transform duration-200">
                      {suggestion.label}
                    </p>
                    <p className="text-white/50 text-sm truncate">
                      {suggestion.sublabel}
                    </p>
                  </div>

                  <span className="text-white/30 text-xs uppercase tracking-wider">
                    {suggestion.type}
                  </span>
                </motion.button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

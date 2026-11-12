"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LoaderCircle, RefreshCw, Search } from "lucide-react";
import {
  getCourse,
  getProfessorsForCourse,
  getTrendsForCourse,
} from "@/lib/api";
import type { Course, CourseProfessor, CourseTrend } from "@/lib/types";
import { getSubjectName } from "@/lib/courses";
import { getLiberalTitle } from "@/lib/liberals";
import { CourseHeader } from "@/components/course/CourseHeader";
import { CourseStats } from "@/components/course/CourseStats";
import { CourseProfessors } from "@/components/course/CourseProfessors";
import { CourseTrends } from "@/components/course/CourseTrends";

type CoursePageState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | {
      status: "ready";
      course: Course;
      professors: CourseProfessor[];
      trends: CourseTrend[];
    };

function getCourseCode(pathname: string): string {
  const [, route, code] = pathname.split("/");
  if (route !== "course" || !code) return "";

  try {
    return decodeURIComponent(code).toUpperCase();
  } catch {
    return "";
  }
}

export function CoursePageClient() {
  const pathname = usePathname();
  const courseCode = useMemo(() => getCourseCode(pathname), [pathname]);
  const [requestId, setRequestId] = useState(0);
  const [state, setState] = useState<CoursePageState>({ status: "loading" });

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setRequestId((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    if (!courseCode) {
      return () => {
        active = false;
      };
    }

    Promise.all([
      getCourse(courseCode),
      getProfessorsForCourse(courseCode),
      getTrendsForCourse(courseCode),
    ])
      .then(([course, professors, trends]) => {
        if (!active) return;

        if (!course) {
          setState({ status: "not-found" });
          return;
        }

        setState({ status: "ready", course, professors, trends });
      })
      .catch(() => {
        if (active) setState({ status: "error" });
      });

    return () => {
      active = false;
    };
  }, [courseCode, requestId]);

  useEffect(() => {
    if (state.status !== "ready") return;

    const subject = getSubjectName(state.course.course_code);
    const liberalTitle = getLiberalTitle(state.course.course_code);
    const label = liberalTitle
      ? `${state.course.course_code}: ${liberalTitle}`
      : `${state.course.course_code}: ${subject}`;
    document.title = `${label} | Prof Pulse`;
  }, [state]);

  if (state.status === "loading") {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-5xl items-center justify-center px-4 py-12">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-brand" />
          <p className="mt-3 text-muted-foreground">Loading course data</p>
        </div>
      </main>
    );
  }

  if (state.status === "not-found") {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-5xl items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <Search className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl text-foreground">Course not found</h1>
          <p className="mt-2 text-muted-foreground">
            We could not find {courseCode || "that course"}. It may not have any reviews yet.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-primary-foreground transition-opacity hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to search
          </Link>
        </div>
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-5xl items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <h1 className="font-display text-3xl text-foreground">Course data is unavailable</h1>
          <p className="mt-2 text-muted-foreground">
            The data source could not be reached. Check your connection and try again.
          </p>
          <button
            type="button"
            onClick={retry}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-primary-foreground transition-opacity hover:opacity-90"
          >
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <CourseHeader course={state.course} />

      <div className="mt-8">
        <CourseStats course={state.course} />
      </div>

      {state.professors.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 font-display text-2xl text-foreground">
            Professors teaching this course
          </h2>
          <CourseProfessors professors={state.professors} />
        </div>
      )}

      {state.trends.length > 1 && (
        <div className="mt-12">
          <h2 className="mb-4 font-display text-2xl text-foreground">
            Course trends over time
          </h2>
          <CourseTrends trends={state.trends} />
        </div>
      )}
    </main>
  );
}

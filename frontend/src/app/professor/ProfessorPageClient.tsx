"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowLeft, LoaderCircle, RefreshCw, UserRoundX } from "lucide-react";
import { getProfessorRecords, getReviewsForProfessor } from "@/lib/api";
import type { CourseProfessor, Review } from "@/lib/types";
import { ProfessorHeader } from "@/components/professor/ProfessorHeader";
import { ProfessorStats } from "@/components/professor/ProfessorStats";
import { ProfessorCourses } from "@/components/professor/ProfessorCourses";
import { ProfessorReviews } from "@/components/professor/ProfessorReviews";

type ProfessorPageState =
  | { status: "loading" }
  | { status: "not-found" }
  | { status: "error" }
  | {
      status: "ready";
      records: CourseProfessor[];
      reviews: Review[];
    };

function getProfessorId(pathname: string): string {
  const [, route, id] = pathname.split("/");
  if (route !== "professor" || !id) return "";

  try {
    return decodeURIComponent(id);
  } catch {
    return "";
  }
}

export function ProfessorPageClient() {
  const pathname = usePathname();
  const professorId = useMemo(() => getProfessorId(pathname), [pathname]);
  const [requestId, setRequestId] = useState(0);
  const [state, setState] = useState<ProfessorPageState>({ status: "loading" });

  const retry = useCallback(() => {
    setState({ status: "loading" });
    setRequestId((value) => value + 1);
  }, []);

  useEffect(() => {
    let active = true;

    if (!professorId) {
      return () => {
        active = false;
      };
    }

    Promise.all([
      getProfessorRecords(professorId),
      getReviewsForProfessor(professorId),
    ])
      .then(([records, reviews]) => {
        if (!active) return;

        if (records.length === 0) {
          setState({ status: "not-found" });
          return;
        }

        setState({ status: "ready", records, reviews });
      })
      .catch(() => {
        if (active) setState({ status: "error" });
      });

    return () => {
      active = false;
    };
  }, [professorId, requestId]);

  useEffect(() => {
    if (state.status === "ready") {
      document.title = `${state.records[0].professor_name} | Prof Pulse`;
    }
  }, [state]);

  if (state.status === "loading") {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-5xl items-center justify-center px-4 py-12">
        <div className="text-center">
          <LoaderCircle className="mx-auto h-8 w-8 animate-spin text-brand" />
          <p className="mt-3 text-muted-foreground">Loading professor data</p>
        </div>
      </main>
    );
  }

  if (state.status === "not-found") {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-5xl items-center justify-center px-4 py-12">
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-secondary">
            <UserRoundX className="h-7 w-7 text-muted-foreground" />
          </div>
          <h1 className="font-display text-3xl text-foreground">Professor not found</h1>
          <p className="mt-2 text-muted-foreground">
            We could not find that professor. Their reviews may not be available yet.
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
          <h1 className="font-display text-3xl text-foreground">Professor data is unavailable</h1>
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

  const professor = state.records[0];
  const totalReviews = state.records.reduce((sum, record) => sum + record.section_reviews, 0);
  const avgQuality =
    totalReviews > 0
      ? state.records.reduce(
          (sum, record) =>
            sum + (record.prof_avg_quality || 0) * record.section_reviews,
          0
        ) / totalReviews
      : 0;
  const avgDifficulty =
    totalReviews > 0
      ? state.records.reduce(
          (sum, record) =>
            sum + (record.prof_avg_difficulty || 0) * record.section_reviews,
          0
        ) / totalReviews
      : 0;
  const recordsWithRetakeData = state.records.filter(
    (record) => record.prof_would_take_again_pct !== null
  );
  const retakeReviewCount = recordsWithRetakeData.reduce(
    (sum, record) => sum + record.section_reviews,
    0
  );
  const avgWouldTakeAgain =
    retakeReviewCount > 0
      ? recordsWithRetakeData.reduce(
          (sum, record) =>
            sum + (record.prof_would_take_again_pct || 0) * record.section_reviews,
          0
        ) / retakeReviewCount
      : null;

  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <ProfessorHeader
        professor={professor}
        totalReviews={totalReviews}
        avgQuality={avgQuality}
        avgDifficulty={avgDifficulty}
        avgWouldTakeAgain={avgWouldTakeAgain}
        totalCourses={state.records.length}
      />

      <div className="mt-8">
        <ProfessorStats
          totalReviews={totalReviews}
          avgQuality={avgQuality}
          avgDifficulty={avgDifficulty}
          avgWouldTakeAgain={avgWouldTakeAgain}
          totalCourses={state.records.length}
          mostRecentYear={Math.max(...state.records.map((record) => record.most_recent_year || 0))}
        />
      </div>

      <div className="mt-12">
        <h2 className="mb-4 font-display text-2xl text-foreground">Courses taught</h2>
        <ProfessorCourses courses={state.records} />
      </div>

      {state.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-4 font-display text-2xl text-foreground">
            Student reviews ({state.reviews.length})
          </h2>
          <ProfessorReviews reviews={state.reviews} />
        </div>
      )}
    </main>
  );
}

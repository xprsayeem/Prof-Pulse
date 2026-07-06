import { getBirdCourses } from "@/lib/api";
import { BirdCoursesList } from "@/components/bird-courses/BirdCoursesList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Bird Courses | ProfPulse",
  description: "Find the easiest courses at TMU. Courses ranked by grade distribution, difficulty, and student satisfaction.",
};

export default async function BirdCoursesPage() {
  const birdCourses = await getBirdCourses();

  // Get unique departments for filter
  const departments = Array.from(
    new Set(birdCourses.map((c) => c.department).filter(Boolean))
  ).sort();

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      {/* Back button */}
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search</span>
      </Link>

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight text-foreground mb-3">
          Bird courses
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Find the easiest courses at TMU, ranked by grade distribution,
          difficulty ratings, and student feedback.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {birdCourses.length} courses analyzed
        </p>
      </div>

      <BirdCoursesList courses={birdCourses} departments={departments} />
    </main>
  );
}
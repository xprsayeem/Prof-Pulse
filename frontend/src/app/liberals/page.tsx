import { getBirdCourses, getCourses } from "@/lib/api";
import { LiberalsList } from "@/components/liberals/LiberalsList";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LIBERAL_COURSES } from "@/lib/liberals";

export const metadata = {
  title: "Liberal Studies | ProfPulse",
  description: "Browse all TMU liberal studies courses with student ratings and reviews.",
};

export default async function LiberalsPage() {
  const [birdCourses, courses] = await Promise.all([
    getBirdCourses(),
    getCourses(),
  ]);

  const lowerCount = LIBERAL_COURSES.filter((c) => c.level === "lower").length;
  const upperCount = LIBERAL_COURSES.filter((c) => c.level === "upper").length;

  return (
    <main className="mx-auto max-w-6xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search</span>
      </Link>

      <div className="text-center mb-12">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight text-foreground mb-3">
          Liberal studies
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          Browse all TMU liberal studies courses. See which ones have student
          reviews and ratings.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {lowerCount} lower level • {upperCount} upper level
        </p>
      </div>

      <LiberalsList birdCourses={birdCourses} courses={courses} />
    </main>
  );
}
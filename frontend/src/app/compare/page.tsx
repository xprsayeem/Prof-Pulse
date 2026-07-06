import { getCourses, getCourseProfessors, getBirdCourses } from "@/lib/api";
import { CompareView } from "@/components/compare/CompareView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Compare | ProfPulse",
  description: "Compare courses and professors at TMU side-by-side.",
};

interface ComparePageProps {
  searchParams: Promise<{
    mode?: string;
    items?: string;
    course?: string;
  }>;
}

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const mode = params.mode || "courses";
  const items = params.items?.split(",").filter(Boolean) || [];
  const courseFilter = params.course || null;

  const [courses, professors, birdCourses] = await Promise.all([
    getCourses(),
    getCourseProfessors(),
    getBirdCourses(),
  ]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search</span>
      </Link>

      <div className="text-center mb-8">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight text-foreground mb-3">
          Compare
        </h1>
        <p className="text-lg text-muted-foreground">
          Side-by-side comparison of courses and professors
        </p>
      </div>

      <CompareView
        initialMode={mode}
        initialItems={items}
        initialCourseFilter={courseFilter}
        courses={courses}
        professors={professors}
        birdCourses={birdCourses}
      />
    </main>
  );
}
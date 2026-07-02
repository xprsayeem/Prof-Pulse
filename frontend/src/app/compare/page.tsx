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
    <main className="min-h-screen">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
        {/* Back button */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to search</span>
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Compare
          </h1>
          <p className="text-xl text-white/60">
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
      </div>
    </main>
  );
}
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
    <main className="min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to search</span>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            📚 Liberal Studies
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Browse all TMU liberal studies courses. See which ones have student 
            reviews and ratings.
          </p>
          <p className="text-white/40 mt-2">
            {lowerCount} lower level • {upperCount} upper level
          </p>
        </div>

        <LiberalsList birdCourses={birdCourses} courses={courses} />
      </div>
    </main>
  );
}
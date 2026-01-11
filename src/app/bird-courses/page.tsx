import { getBirdCourses } from "@/lib/api";
import { BirdCoursesList } from "@/components/bird-courses/BirdCoursesList";

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
    <main className="min-h-screen">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            🐦 Bird Courses
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            Find the easiest courses at TMU. Ranked by grade distribution, 
            difficulty ratings, and student feedback.
          </p>
          <p className="text-white/40 mt-2">
            {birdCourses.length} courses analyzed
          </p>
        </div>

        <BirdCoursesList courses={birdCourses} departments={departments} />
      </div>
    </main>
  );
}
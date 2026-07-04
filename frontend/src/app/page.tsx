import { getStats, getCoursesIndex, getProfessorsIndex } from "@/lib/api";
import { SearchBar } from "@/components/home/SearchBar";
import { LiveStats } from "@/components/home/LiveStats";
import { QuickLinks } from "@/components/home/QuickLinks";

export default async function Home() {
  const [stats, courses, professors] = await Promise.all([
    getStats(),
    getCoursesIndex(),
    getProfessorsIndex(),
  ]);

  return (
    <main>
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-4 pt-20 pb-14 text-center">
        <h1 className="font-display text-5xl tracking-tight md:text-6xl">
          Find the courses worth taking.
        </h1>
        <p className="mx-auto mt-4 mb-8 max-w-xl text-lg text-muted-foreground">
          Search {stats.total_reviews.toLocaleString()} student reviews across
          every TMU course and professor.
        </p>
        <SearchBar courses={courses} professors={professors} />
      </section>

      {/* Stats */}
      <section className="mx-auto max-w-4xl px-4 pb-14">
        <LiveStats
          totalReviews={stats.total_reviews}
          totalProfessors={stats.total_professors}
          totalCourses={stats.total_courses}
          totalDepartments={stats.total_departments}
        />
      </section>

      {/* Explore */}
      <section className="mx-auto max-w-4xl px-4 pb-20">
        <h2 className="text-label mb-4 text-center text-muted-foreground">
          Explore
        </h2>
        <QuickLinks />
      </section>
    </main>
  );
}

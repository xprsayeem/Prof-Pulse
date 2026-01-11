import { getCourses, getCourseProfessors, getDepartments } from "@/lib/api";
import { SearchBar } from "@/components/home/SearchBar";
import { LiveStats } from "@/components/home/LiveStats";
import { QuickLinks } from "@/components/home/QuickLinks";

export default async function Home() {
  const [courses, professors, departments] = await Promise.all([
    getCourses(),
    getCourseProfessors(),
    getDepartments(),
  ]);

  // Calculate stats
  const totalReviews = courses.reduce((sum, c) => sum + c.total_reviews, 0);
  const uniqueProfessors = new Set(professors.map((p) => p.professor_id)).size;
  const totalCourses = courses.length;
  const totalDepartments = departments.length;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative px-4 pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo/Title */}
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            <span className="text-white">Prof</span>
            <span className="text-brand-blue">Pulse</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-white/70 mb-3">
            Make smarter course decisions at TMU
          </p>

          {/* Context */}
          <p className="text-white/50 mb-10 max-w-xl mx-auto">
            Search 110,000+ student reviews to find the best courses and professors. 
            Compare ratings, discover bird courses, and plan your perfect semester.
          </p>

          {/* Search */}
          <SearchBar courses={courses} professors={professors} />

          {/* Search hints */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <span className="text-white/30 text-sm">Try:</span>
            {["CPS510", "MTH108", "Smith", "bird courses"].map((hint) => (
              <button
                key={hint}
                className="text-sm text-white/50 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition-colors"
              >
                {hint}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 pb-16">
        <div className="max-w-4xl mx-auto">
          <LiveStats
            totalReviews={totalReviews}
            totalProfessors={uniqueProfessors}
            totalCourses={totalCourses}
            totalDepartments={totalDepartments}
          />
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="px-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-white/30 text-sm font-medium uppercase tracking-wider mb-4 text-center">
            Explore
          </h2>
          <QuickLinks />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-8">
        <div className="max-w-4xl mx-auto text-center text-white/30 text-sm">
          <p>
            Data sourced from RateMyProfessors. Not affiliated with TMU.
          </p>
          <p className="mt-2">
            Built by{" "}
            
              href="https://github.com/yourusername"
              className="text-brand-blue hover:underline"
            >
              Sayeem
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}
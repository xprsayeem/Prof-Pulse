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
        {/* Animated background gradient orbs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-brand-blue/30 rounded-full blur-3xl animate-float animate-breathe-glow"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-gold/15 rounded-full blur-3xl animate-float-delayed animate-breathe-glow"
            style={{ animationDelay: "-2s" }}
          />
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-3xl animate-gradient-shift"
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          {/* Logo/Title */}
          <h1 className="text-headline-1 mb-4">
            <span className="text-white">Prof</span>
            <span className="text-brand-blue glow-text-blue animate-pulse-soft">Pulse</span>
          </h1>

          {/* Tagline */}
          <p className="text-xl md:text-2xl text-white/70 mb-3 animate-slide-up-fade" style={{ animationDelay: "0.1s" }}>
            Make every course count.
          </p>

          {/* Context */}
          <p className="text-white/50 mb-10 max-w-xl mx-auto animate-slide-up-fade" style={{ animationDelay: "0.2s" }}>
            Search 110,000+ student reviews to find the best courses and professors.
            Compare ratings, discover bird courses, and plan your perfect semester.
          </p>

          {/* Search */}
          <div className="animate-slide-up-fade" style={{ animationDelay: "0.3s" }}>
            <SearchBar courses={courses} professors={professors} />
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
          <h2 className="text-label text-white/30 mb-4 text-center">
            Explore
          </h2>
          <QuickLinks />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-4 py-8">
        <div className="max-w-4xl mx-auto text-center text-white/30 text-sm">
          <p>Data sourced from RateMyProfessors. Not affiliated with TMU.</p>
          <p className="mt-2">
            Built by{" "}
            <a href="https://github.com/xprsayeem" className="text-brand-blue hover:text-brand-blue/80 link-underline transition-colors">
              Sayeem Mahfuz
            </a>
          </p>
        </div>
      </footer>
    </main>
  );
}

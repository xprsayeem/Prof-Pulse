import { getCourseProfessors, getReviews } from "@/lib/api";
import { notFound } from "next/navigation";
import { ProfessorHeader } from "@/components/professor/ProfessorHeader";
import { ProfessorStats } from "@/components/professor/ProfessorStats";
import { ProfessorCourses } from "@/components/professor/ProfessorCourses";
import { ProfessorReviews } from "@/components/professor/ProfessorReviews";

interface ProfessorPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProfessorPage({ params }: ProfessorPageProps) {
  const { id } = await params;
  const professorId = decodeURIComponent(id);

  const [allProfessors, allReviews] = await Promise.all([
    getCourseProfessors(),
    getReviews(),
  ]);

  // Get all records for this professor (one per course they teach)
  const professorRecords = allProfessors.filter(
    (p) => p.professor_id === professorId
  );

  if (professorRecords.length === 0) {
    notFound();
  }

  // Filter reviews for this professor
  const professorReviews = allReviews.filter(
    (r) => r.professor_id === professorId
  );

  // Use first record for basic info
  const professor = professorRecords[0];

  // Aggregate stats across all courses
  const totalReviews = professorRecords.reduce(
    (sum, p) => sum + p.section_reviews,
    0
  );
  const avgQuality =
    professorRecords.reduce(
      (sum, p) => sum + (p.prof_avg_quality || 0) * p.section_reviews,
      0
    ) / totalReviews;
  const avgDifficulty =
    professorRecords.reduce(
      (sum, p) => sum + (p.prof_avg_difficulty || 0) * p.section_reviews,
      0
    ) / totalReviews;

  // Calculate weighted would take again
  const recordsWithWTA = professorRecords.filter(
    (p) => p.prof_would_take_again_pct !== null
  );
  const avgWouldTakeAgain =
    recordsWithWTA.length > 0
      ? recordsWithWTA.reduce(
          (sum, p) => sum + (p.prof_would_take_again_pct || 0) * p.section_reviews,
          0
        ) / recordsWithWTA.reduce((sum, p) => sum + p.section_reviews, 0)
      : null;

  return (
    <main className="min-h-screen">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-brand-gold/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <ProfessorHeader
          professor={professor}
          totalReviews={totalReviews}
          avgQuality={avgQuality}
          avgDifficulty={avgDifficulty}
          avgWouldTakeAgain={avgWouldTakeAgain}
          totalCourses={professorRecords.length}
        />

        <div className="mt-8">
          <ProfessorStats
            totalReviews={totalReviews}
            avgQuality={avgQuality}
            avgDifficulty={avgDifficulty}
            avgWouldTakeAgain={avgWouldTakeAgain}
            totalCourses={professorRecords.length}
            mostRecentYear={Math.max(...professorRecords.map((p) => p.most_recent_year || 0))}
          />
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-semibold text-white mb-4">
            Courses Taught
          </h2>
          <ProfessorCourses courses={professorRecords} />
        </div>

        {professorReviews.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-4">
              Student Reviews ({professorReviews.length})
            </h2>
            <ProfessorReviews reviews={professorReviews} />
          </div>
        )}
      </div>
    </main>
  );
}
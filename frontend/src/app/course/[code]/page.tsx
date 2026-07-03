import type { Metadata } from "next";
import { getCourse, getProfessorsForCourse, getTrendsForCourse } from "@/lib/api";
import { notFound } from "next/navigation";
import { getSubjectName } from "@/lib/courses";
import { getLiberalTitle } from "@/lib/liberals";
import { CourseHeader } from "@/components/course/CourseHeader";
import { CourseStats } from "@/components/course/CourseStats";
import { CourseProfessors } from "@/components/course/CourseProfessors";
import { CourseTrends } from "@/components/course/CourseTrends";

// Rendered on demand and cached; revalidated daily against the export.
export const revalidate = 86400;

interface CoursePageProps {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({
  params,
}: CoursePageProps): Promise<Metadata> {
  const { code } = await params;
  const courseCode = decodeURIComponent(code).toUpperCase();
  const course = await getCourse(courseCode);

  if (!course) {
    return { title: "Course Not Found | ProfPulse" };
  }

  const subject = getSubjectName(courseCode);
  const title = getLiberalTitle(courseCode);
  const label = title ? `${courseCode} — ${title}` : `${courseCode} — ${subject}`;

  return {
    title: `${label} | ProfPulse`,
    description: `${courseCode} (${subject}) at TMU: ${course.total_reviews} reviews, ${course.avg_quality?.toFixed(1)}/5 quality, ${course.avg_difficulty?.toFixed(1)}/5 difficulty.`,
  };
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { code } = await params;
  const courseCode = decodeURIComponent(code).toUpperCase();

  const [course, professors, trends] = await Promise.all([
    getCourse(courseCode),
    getProfessorsForCourse(courseCode),
    getTrendsForCourse(courseCode),
  ]);

  if (!course) {
    notFound();
  }

  return (
    <main className="min-h-screen">
      {/* Background gradient */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-blue/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 py-12">
        <CourseHeader course={course} />
        
        <div className="mt-8">
          <CourseStats course={course} />
        </div>

        {professors.length > 0 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-4">
              Professors Teaching This Course
            </h2>
            <CourseProfessors professors={professors} />
          </div>
        )}

        {trends.length > 1 && (
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-white mb-4">
              Course Trends Over Time
            </h2>
            <CourseTrends trends={trends} />
          </div>
        )}
      </div>
    </main>
  );
}
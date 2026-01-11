import { getCourses, getCourseProfessors, getCourseTrends } from "@/lib/api";
import { notFound } from "next/navigation";
import { CourseHeader } from "@/components/course/CourseHeader";
import { CourseStats } from "@/components/course/CourseStats";
import { CourseProfessors } from "@/components/course/CourseProfessors";
import { CourseTrends } from "@/components/course/CourseTrends";

interface CoursePageProps {
  params: Promise<{ code: string }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { code } = await params;
  const courseCode = decodeURIComponent(code).toUpperCase();

  const [courses, allProfessors, allTrends] = await Promise.all([
    getCourses(),
    getCourseProfessors(),
    getCourseTrends(),
  ]);

  const course = courses.find((c) => c.course_code === courseCode);

  if (!course) {
    notFound();
  }

  const professors = allProfessors.filter((p) => p.course_code === courseCode);
  const trends = allTrends.filter((t) => t.course_code === courseCode);

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
import {
  BirdCourse,
  Course,
  CourseIndex,
  CourseProfessor,
  CourseTrend,
  Department,
  ProfessorIndex,
  Review,
  SiteStats,
} from "./types";

const S3_BASE = "https://prof-pulse.s3.amazonaws.com/exports";

async function fetchJSON<T>(path: string, retries = 3): Promise<T[]> {
  let lastErr: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${S3_BASE}/${path}.json`, {
        // Static data exports — cache and revalidate rather than re-pulling.
        next: { revalidate: 300 },
      });

      // A missing shard means "no data for this key" (e.g. a course with no
      // trends, or a professor with no comment reviews) — not an error.
      if (res.status === 404) return [];

      if (!res.ok) {
        throw new Error(`Failed to fetch ${path}: ${res.status}`);
      }

      const text = await res.text();

      // Spark exports as newline-delimited JSON
      return text
        .trim()
        .split("\n")
        .filter((line) => line.length > 0)
        .map((line) => JSON.parse(line));
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        // Backoff before retrying transient connection resets: 300ms, 600ms.
        await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** (attempt - 1)));
      }
    }
  }

  throw new Error(`fetchJSON(${path}) failed after ${retries} attempts`, {
    cause: lastErr,
  });
}

// ---------------------------------------------------------------------------
// Per-entity shards (Run 4a). A page fetches only the file(s) it renders.
// ---------------------------------------------------------------------------

/** One course's metrics, or null if the course has no data. */
export async function getCourse(courseCode: string): Promise<Course | null> {
  const [course] = await fetchJSON<Course>(`courses/${courseCode}`);
  return course ?? null;
}

/** The professors who teach a given course. */
export async function getProfessorsForCourse(courseCode: string): Promise<CourseProfessor[]> {
  return fetchJSON<CourseProfessor>(`professors_by_course/${courseCode}`);
}

/** A single course's year-over-year trends (empty if none). */
export async function getTrendsForCourse(courseCode: string): Promise<CourseTrend[]> {
  return fetchJSON<CourseTrend>(`trends/${courseCode}`);
}

/** A professor's per-course records (one row per course they teach). */
export async function getProfessorRecords(professorId: string): Promise<CourseProfessor[]> {
  return fetchJSON<CourseProfessor>(`professors/${professorId}`);
}

/** A professor's individual reviews (empty if they have no comment reviews). */
export async function getReviewsForProfessor(professorId: string): Promise<Review[]> {
  return fetchJSON<Review>(`reviews/${professorId}`);
}

// ---------------------------------------------------------------------------
// Index / summary files — light, whole-file fetches for list & search pages.
// ---------------------------------------------------------------------------

export async function getCoursesIndex(): Promise<CourseIndex[]> {
  return fetchJSON<CourseIndex>("courses_index");
}

export async function getProfessorsIndex(): Promise<ProfessorIndex[]> {
  return fetchJSON<ProfessorIndex>("professors_index");
}

export async function getStats(): Promise<SiteStats> {
  const [stats] = await fetchJSON<SiteStats>("stats");
  return (
    stats ?? {
      total_reviews: 0,
      total_professors: 0,
      total_courses: 0,
      total_departments: 0,
    }
  );
}

export async function getBirdCourses(): Promise<BirdCourse[]> {
  return fetchJSON<BirdCourse>("bird_courses_gold");
}

export async function getDepartments(): Promise<Department[]> {
  return fetchJSON<Department>("department_overview_gold");
}

// ---------------------------------------------------------------------------
// Monolithic whole-table fetches — still used by the compare & liberals pages,
// which need the full course / professor lists. (Hot pages use shards above.)
// ---------------------------------------------------------------------------

export async function getCourses(): Promise<Course[]> {
  return fetchJSON<Course>("course_metrics_gold");
}

export async function getCourseProfessors(): Promise<CourseProfessor[]> {
  return fetchJSON<CourseProfessor>("course_professor_comparison_gold");
}

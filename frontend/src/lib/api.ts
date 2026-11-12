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

interface FetchJSONOptions {
  cacheAtBuild?: boolean;
  retries?: number;
  missingStatuses?: readonly number[];
}

class NonRetryableFetchError extends Error {}

async function fetchJSON<T>(
  path: string,
  {
    cacheAtBuild = false,
    retries = 3,
    missingStatuses = [404],
  }: FetchJSONOptions = {}
): Promise<T[]> {
  let lastErr: unknown;
  let attempts = 0;

  for (let attempt = 1; attempt <= retries; attempt++) {
    attempts = attempt;

    try {
      const res = await fetch(`${S3_BASE}/${path}.json`, {
        // Indexes used by prerendered pages are bundled at build time. Entity
        // shards remain live: the static-assets cache cannot store runtime writes.
        cache: cacheAtBuild ? "force-cache" : "no-store",
      });

      if (missingStatuses.includes(res.status)) return [];

      if (!res.ok) {
        const message = `Failed to fetch ${path}: ${res.status}`;

        // Retrying permanent client errors only adds latency and Worker CPU.
        // Timeouts and rate limits may be transient, so they can still retry.
        if (res.status >= 400 && res.status < 500 && ![408, 429].includes(res.status)) {
          throw new NonRetryableFetchError(message);
        }

        throw new Error(message);
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

      if (err instanceof NonRetryableFetchError) break;

      if (attempt < retries) {
        // Backoff before retrying transient connection resets: 300ms, 600ms.
        await new Promise((resolve) => setTimeout(resolve, 300 * 2 ** (attempt - 1)));
      }
    }
  }

  throw new Error(`fetchJSON(${path}) failed after ${attempts} attempt${attempts === 1 ? "" : "s"}`, {
    cause: lastErr,
  });
}

// ---------------------------------------------------------------------------
// Per-entity shards (Run 4a). A page fetches only the files it renders.
// ---------------------------------------------------------------------------

/** One course's metrics, or null if the course has no data. */
export async function getCourse(courseCode: string): Promise<Course | null> {
  const [course] = await fetchJSON<Course>(`courses/${courseCode}`, {
    missingStatuses: [403, 404],
  });
  return course ?? null;
}

/** The professors who teach a given course. */
export async function getProfessorsForCourse(courseCode: string): Promise<CourseProfessor[]> {
  return fetchJSON<CourseProfessor>(`professors_by_course/${courseCode}`, {
    missingStatuses: [403, 404],
  });
}

/** A single course's year-over-year trends (empty if none). */
export async function getTrendsForCourse(courseCode: string): Promise<CourseTrend[]> {
  // The export only creates a trend shard when a course has trend rows. Public
  // S3 access masks a missing key as 403 because callers cannot list the bucket.
  return fetchJSON<CourseTrend>(`trends/${courseCode}`, {
    missingStatuses: [403, 404],
  });
}

/** A professor's per-course records (one row per course they teach). */
export async function getProfessorRecords(professorId: string): Promise<CourseProfessor[]> {
  return fetchJSON<CourseProfessor>(`professors/${professorId}`, {
    missingStatuses: [403, 404],
  });
}

/** A professor's individual reviews (empty if they have no comment reviews). */
export async function getReviewsForProfessor(professorId: string): Promise<Review[]> {
  return fetchJSON<Review>(`reviews/${professorId}`, {
    missingStatuses: [403, 404],
  });
}

// ---------------------------------------------------------------------------
// Index and summary files are light, whole-file fetches for list and search pages.
// ---------------------------------------------------------------------------

export async function getCoursesIndex(): Promise<CourseIndex[]> {
  return fetchJSON<CourseIndex>("courses_index", { cacheAtBuild: true });
}

export async function getProfessorsIndex(): Promise<ProfessorIndex[]> {
  return fetchJSON<ProfessorIndex>("professors_index", { cacheAtBuild: true });
}

export async function getStats(): Promise<SiteStats> {
  const [stats] = await fetchJSON<SiteStats>("stats", { cacheAtBuild: true });
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
  return fetchJSON<BirdCourse>("bird_courses_gold", { cacheAtBuild: true });
}

export async function getDepartments(): Promise<Department[]> {
  return fetchJSON<Department>("department_overview_gold");
}

import { BirdCourse, Course, CourseProfessor, CourseTrend, Department, Review } from "./types";

const S3_BASE = "https://prof-pulse.s3.amazonaws.com/exports";

async function fetchJSON<T>(filename: string, retries = 3): Promise<T[]> {
  let lastErr: unknown;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${S3_BASE}/${filename}.json`, {
        // Static data exports — cache and revalidate rather than re-pulling
        // multiple MB on every request.
        next: { revalidate: 300 },
      });

      if (!res.ok) {
        throw new Error(`Failed to fetch ${filename}: ${res.status}`);
      }

      const text = await res.text();

      // Spark exports as newline-delimited JSON
      return text
        .trim()
        .split('\n')
        .filter(line => line.length > 0)
        .map(line => JSON.parse(line));
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        // Backoff before retrying: 300ms, 600ms. Handles transient
        // connection resets on flaky networks instead of 500ing the page.
        await new Promise(resolve => setTimeout(resolve, 300 * 2 ** (attempt - 1)));
      }
    }
  }

  throw new Error(`fetchJSON(${filename}) failed after ${retries} attempts`, {
    cause: lastErr,
  });
}

export async function getCourses(): Promise<Course[]> {
  return fetchJSON<Course>('course_metrics_gold');
}

export async function getBirdCourses(): Promise<BirdCourse[]> {
  return fetchJSON<BirdCourse>('bird_courses_gold');
}

export async function getCourseProfessors(): Promise<CourseProfessor[]> {
  return fetchJSON<CourseProfessor>('course_professor_comparison_gold');
}

export async function getDepartments(): Promise<Department[]> {
  return fetchJSON<Department>('department_overview_gold');
}

export async function getCourseTrends(): Promise<CourseTrend[]> {
  return fetchJSON<CourseTrend>('course_trends_gold');
}

export async function getReviews(): Promise<Review[]> {
  return fetchJSON<Review>('reviews');
}
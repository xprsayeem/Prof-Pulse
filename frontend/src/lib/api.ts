import { BirdCourse, Course, CourseProfessor, CourseTrend, Department, Review } from "./types";

const S3_BASE = "https://prof-pulse.s3.amazonaws.com/exports";

async function fetchJSON<T>(filename: string): Promise<T[]> {
  const res = await fetch(`${S3_BASE}/${filename}.json`, {
    next: { revalidate: 3600 } // Cache for 1 hour
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
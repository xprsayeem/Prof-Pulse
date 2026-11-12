import type { Metadata } from "next";
import { CoursePageClient } from "./CoursePageClient";

export const metadata: Metadata = {
  title: "Course Reviews | Prof Pulse",
  description:
    "Explore course ratings, grade distributions, trends, and professor comparisons at TMU.",
};

export default function CoursePage() {
  return <CoursePageClient />;
}

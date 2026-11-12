import type { Metadata } from "next";
import { ProfessorPageClient } from "./ProfessorPageClient";

export const metadata: Metadata = {
  title: "Professor Reviews | Prof Pulse",
  description:
    "Explore professor ratings, courses taught, grade outcomes, and student reviews at TMU.",
};

export default function ProfessorPage() {
  return <ProfessorPageClient />;
}

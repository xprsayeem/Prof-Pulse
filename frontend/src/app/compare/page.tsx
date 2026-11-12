import { Suspense } from "react";
import { CompareView } from "@/components/compare/CompareView";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Compare | ProfPulse",
  description: "Compare courses and professors at TMU side-by-side.",
};

// Static shell. CompareView reads the selection from the URL and pulls only the
// shards it needs straight from S3 in the browser. No server function runs, and
// no data passes through Vercel's origin.
export default function ComparePage() {
  return (
    <main className="mx-auto max-w-7xl px-4 py-12">
      <Link
        href="/"
        className="mb-8 inline-flex items-center gap-2 text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to search</span>
      </Link>

      <div className="text-center mb-8">
        <h1 className="font-display text-4xl md:text-5xl tracking-tight text-foreground mb-3">
          Compare
        </h1>
        <p className="text-lg text-muted-foreground">
          Side-by-side comparison of courses and professors
        </p>
      </div>

      <Suspense fallback={null}>
        <CompareView />
      </Suspense>
    </main>
  );
}

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function CourseNotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <div className="inline-flex p-4 rounded-full bg-white/5 mb-6">
          <Search className="w-12 h-12 text-white/30" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Course Not Found</h1>
        <p className="text-white/50 mb-6">
          We couldn&apos;t find that course. It may not have any reviews yet.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl hover:bg-brand-blue/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Search
        </Link>
      </div>
    </main>
  );
}
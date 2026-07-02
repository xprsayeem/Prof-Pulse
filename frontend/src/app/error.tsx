"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RotateCw, AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surface the error in the console for debugging.
    console.error(error);
  }, [error]);

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex p-4 rounded-full bg-white/5 mb-6">
          <AlertTriangle className="w-12 h-12 text-white/30" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-white/50 mb-6">
          We couldn&apos;t load this page. The data may be temporarily
          unavailable — please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-brand-blue text-white px-6 py-3 rounded-xl hover:bg-brand-blue/80 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white px-4 py-3 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}

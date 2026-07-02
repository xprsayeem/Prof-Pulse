"use client";

import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className, style }: SkeletonProps) {
  return <div className={cn("skeleton", className)} style={style} />;
}

interface SkeletonCardProps {
  className?: string;
  showHeader?: boolean;
  showStats?: boolean;
  lines?: number;
}

export function SkeletonCard({
  className = "",
  showHeader = true,
  showStats = true,
  lines = 2,
}: SkeletonCardProps) {
  return (
    <div className={`glass p-5 space-y-4 ${className}`}>
      {showHeader && (
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-16 w-16 rounded-full" />
        </div>
      )}

      {showStats && (
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center space-y-1">
              <Skeleton className="h-5 w-12 mx-auto" />
              <Skeleton className="h-3 w-10 mx-auto" />
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        {[...Array(lines)].map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            style={{ width: `${100 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

interface SkeletonStatsProps {
  count?: number;
  className?: string;
}

export function SkeletonStats({ count = 4, className = "" }: SkeletonStatsProps) {
  return (
    <div className={`grid grid-cols-2 md:grid-cols-${count} gap-4 ${className}`}>
      {[...Array(count)].map((_, i) => (
        <div key={i} className="glass p-6 text-center space-y-3">
          <Skeleton className="h-12 w-12 rounded-xl mx-auto" />
          <Skeleton className="h-8 w-20 mx-auto" />
          <Skeleton className="h-4 w-24 mx-auto" />
        </div>
      ))}
    </div>
  );
}

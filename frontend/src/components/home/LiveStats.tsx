"use client";

import { MessageSquare, Users, BookOpen, Building2 } from "lucide-react";
import { AnimatedCounter } from "@/components/ui/animated-counter";

interface LiveStatsProps {
  totalReviews: number;
  totalProfessors: number;
  totalCourses: number;
  totalDepartments: number;
}

export function LiveStats({
  totalReviews,
  totalProfessors,
  totalCourses,
  totalDepartments,
}: LiveStatsProps) {
  const stats = [
    { label: "Reviews analyzed", value: totalReviews, icon: MessageSquare },
    { label: "Professors", value: totalProfessors, icon: Users },
    { label: "Courses", value: totalCourses, icon: BookOpen },
    { label: "Departments", value: totalDepartments, icon: Building2 },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-border bg-card p-5 text-center shadow-soft"
        >
          <stat.icon className="mx-auto mb-2 h-5 w-5 text-muted-foreground" />
          <p className="font-display text-3xl font-medium tabular-nums">
            <AnimatedCounter value={stat.value} />
          </p>
          <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

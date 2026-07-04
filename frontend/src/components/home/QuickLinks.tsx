import Link from "next/link";
import { Bird, BookOpen, GitCompare, ArrowRight } from "lucide-react";

const links = [
  {
    href: "/bird-courses",
    icon: Bird,
    title: "Bird courses",
    description: "Find the easiest A's at TMU, ranked by grades.",
  },
  {
    href: "/liberals",
    icon: BookOpen,
    title: "Liberal studies",
    description: "Browse upper and lower liberal electives with ratings.",
  },
  {
    href: "/compare",
    icon: GitCompare,
    title: "Compare",
    description: "Put courses or professors side by side.",
  },
];

export function QuickLinks() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent/40"
        >
          <link.icon className="mb-3 h-6 w-6 text-primary" />
          <h3 className="mb-1 flex items-center gap-1.5 font-medium">
            {link.title}
            <ArrowRight className="h-4 w-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
          </h3>
          <p className="text-sm text-muted-foreground">{link.description}</p>
        </Link>
      ))}
    </div>
  );
}

import Link from "next/link";
import { Bird, BookOpen, GitCompare, ArrowRight } from "lucide-react";

const links = [
  {
    href: "/bird-courses",
    icon: Bird,
    title: "Bird courses",
    description: "Find the easiest A's at TMU, ranked by grades.",
    chip: "bg-brand/12 text-brand",
  },
  {
    href: "/liberals",
    icon: BookOpen,
    title: "Liberal studies",
    description: "Browse upper and lower liberal electives with ratings.",
    chip: "bg-brand/12 text-brand",
  },
  {
    href: "/compare",
    icon: GitCompare,
    title: "Compare",
    description: "Put courses or professors side by side.",
    chip: "bg-brand/12 text-brand",
  },
];

export function QuickLinks() {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="group rounded-xl border border-border bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-soft-md"
        >
          <div className={`mb-3 inline-flex rounded-lg p-2 ${link.chip}`}>
            <link.icon className="h-5 w-5" />
          </div>
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

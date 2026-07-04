import Link from "next/link";
import { Activity } from "lucide-react";

const navLinks = [
  { href: "/bird-courses", label: "Bird courses" },
  { href: "/liberals", label: "Liberal studies" },
  { href: "/compare", label: "Compare" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-medium">
          <Activity className="h-5 w-5 text-primary" />
          <span>ProfPulse</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

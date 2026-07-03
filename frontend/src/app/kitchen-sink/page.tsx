import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

// Run 5 foundation demo. Rendered in the new LIGHT design system (scoped via the
// `light` class) while the rest of the app is still on the old dark theme.
// Not linked in nav — a scratch page to prove tokens + components before we
// redesign real pages in Runs 6+.

function RatingChip({ value }: { value: number }) {
  const cls =
    value >= 4
      ? "bg-success/15 text-success"
      : value >= 3
      ? "bg-warning/20 text-warning"
      : "bg-destructive/15 text-destructive";
  return (
    <span className={`rounded-md px-2 py-0.5 text-sm font-medium ${cls}`}>
      {value.toFixed(1)}
    </span>
  );
}

function Swatch({ name, className }: { name: string; className: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className={`h-14 rounded-lg border ${className}`} />
      <span className="text-xs text-muted-foreground">{name}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-2xl">{title}</h2>
      {children}
    </section>
  );
}

export default function KitchenSink() {
  return (
    <div className="light bg-background text-foreground min-h-screen">
      <div className="mx-auto max-w-4xl px-6 py-16 space-y-14">
        {/* Header */}
        <header className="space-y-3 border-b pb-8">
          <p className="text-label text-muted-foreground">Design system · Run 5</p>
          <h1 className="font-display text-5xl tracking-tight">ProfPulse</h1>
          <p className="text-lg text-muted-foreground max-w-xl">
            The light, editorial foundation — TMU blue accent, Fraunces headings,
            Inter body, and semantic rating colors. Everything below reads from
            design tokens.
          </p>
        </header>

        {/* Typography */}
        <Section title="Typography">
          <div className="space-y-3">
            <p className="font-display text-5xl">Find the courses worth taking.</p>
            <p className="font-display text-3xl text-muted-foreground">
              Editorial serif headings (Fraunces)
            </p>
            <p className="text-base leading-relaxed max-w-2xl">
              Body copy is set in Inter at a comfortable 1.6 line-height. Search
              108,000 student reviews across every TMU course and professor to
              compare ratings, discover bird courses, and plan a better semester.
            </p>
            <p className="text-sm text-muted-foreground">
              Muted secondary text for captions and metadata.
            </p>
          </div>
        </Section>

        {/* Color */}
        <Section title="Color">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            <Swatch name="Primary" className="bg-primary" />
            <Swatch name="Success" className="bg-success" />
            <Swatch name="Warning" className="bg-warning" />
            <Swatch name="Destructive" className="bg-destructive" />
            <Swatch name="Muted" className="bg-muted" />
            <Swatch name="Gold" className="bg-brand-gold" />
          </div>
        </Section>

        {/* Buttons */}
        <Section title="Buttons">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button>Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </Section>

        {/* Badges + rating chips */}
        <Section title="Badges & rating chips">
          <div className="flex flex-wrap items-center gap-3">
            <Badge>Default</Badge>
            <Badge variant="secondary">Secondary</Badge>
            <Badge variant="outline">Outline</Badge>
            <Badge variant="destructive">Destructive</Badge>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <RatingChip value={4.6} />
            <RatingChip value={3.4} />
            <RatingChip value={2.9} />
            <span className="text-sm text-muted-foreground">
              quality scores, color-coded by tier
            </span>
          </div>
        </Section>

        {/* Inputs */}
        <Section title="Inputs">
          <Input placeholder="Try ECN204, computer science, or a professor name" />
        </Section>

        {/* Cards */}
        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Sample course card in the new system */}
            <div className="rounded-xl border bg-card p-4 transition-colors hover:border-primary/40">
              <div className="mb-1 flex items-center justify-between">
                <span className="text-base font-medium">ECN204</span>
                <RatingChip value={4.6} />
              </div>
              <p className="mb-3 text-sm text-muted-foreground">Economics</p>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>3.0 difficulty</span>
                <span>911 reviews</span>
              </div>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="font-display text-xl">Bird courses</CardTitle>
                <CardDescription>
                  The easiest A&apos;s at TMU, ranked by grade distribution.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Standard shadcn card on the new tokens.
              </CardContent>
              <CardFooter>
                <Button size="sm">Explore</Button>
              </CardFooter>
            </Card>
          </div>
        </Section>
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-muted-foreground">
        <p>Data sourced from RateMyProfessors. Not affiliated with TMU.</p>
        <p className="mt-2">
          Built by{" "}
          <a
            href="https://github.com/xprsayeem"
            className="text-primary hover:underline"
          >
            Sayeem Mahfuz
          </a>
        </p>
      </div>
    </footer>
  );
}

export default function Loading() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-white/15 border-t-brand-blue animate-spin" />
        <p className="text-white/40 text-sm">Loading…</p>
      </div>
    </main>
  );
}

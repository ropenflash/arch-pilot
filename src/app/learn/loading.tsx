export default function LearnLoading() {
  return (
    <div className="mx-auto max-w-5xl animate-pulse px-4 py-12 sm:px-6">
      <div className="h-3 w-36 rounded bg-muted" />
      <div className="mt-4 h-10 max-w-xl rounded bg-muted" />
      <div className="mt-3 h-5 max-w-2xl rounded bg-muted" />
      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-32 rounded-xl border border-border bg-card" />
        ))}
      </div>
    </div>
  );
}

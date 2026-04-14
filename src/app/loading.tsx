export default function Loading() {
  return (
    <div className="page-shell pb-20 pt-8">
      {/* Hero skeleton */}
      <div className="mb-4 h-[340px] animate-pulse rounded-[1.5rem] bg-[rgba(16,32,25,0.08)] sm:h-[420px] sm:rounded-[2rem]" />

      {/* Badges skeleton */}
      <div className="mb-4 flex gap-3 overflow-hidden">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-16 w-[220px] shrink-0 animate-pulse rounded-[1.4rem] bg-[rgba(16,32,25,0.06)] sm:w-full" />
        ))}
      </div>

      {/* Products skeleton */}
      <div className="soft-card p-4 sm:p-8">
        <div className="mb-6 h-8 w-48 animate-pulse rounded-full bg-[rgba(16,32,25,0.08)]" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="overflow-hidden rounded-[1.7rem] border border-[var(--line)]">
              <div className="aspect-square animate-pulse bg-[rgba(16,32,25,0.06)]" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-2/3 animate-pulse rounded-full bg-[rgba(16,32,25,0.06)]" />
                <div className="h-4 w-full animate-pulse rounded-full bg-[rgba(16,32,25,0.08)]" />
                <div className="h-5 w-1/3 animate-pulse rounded-full bg-[rgba(16,32,25,0.1)]" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

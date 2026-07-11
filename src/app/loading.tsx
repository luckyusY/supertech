export default function Loading() {
  return (
    <div className="page-shell pb-20 pt-8">
      {/* Hero skeleton */}
      <div className="mb-4 h-[340px] skeleton-shimmer rounded-xl sm:h-[440px]" />

      {/* Badges skeleton */}
      <div className="mb-4 flex gap-3 overflow-hidden">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="h-16 w-[180px] shrink-0 skeleton-shimmer rounded-lg" />
        ))}
      </div>

      {/* Products skeleton */}
      <div className="soft-card p-4 sm:p-6 bg-white">
        <div className="mb-6 h-8 w-48 skeleton-shimmer rounded-md" />
        <div className="grid gap-2 grid-cols-2 md:grid-cols-4 xl:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="overflow-hidden rounded-sm border border-[var(--line)] bg-white p-2.5">
              <div className="aspect-square skeleton-shimmer rounded-lg" />
              <div className="space-y-2.5 mt-3 px-1">
                <div className="h-3 w-1/3 skeleton-shimmer rounded-full" />
                <div className="h-4 w-full skeleton-shimmer rounded-full" />
                <div className="h-5 w-1/2 skeleton-shimmer rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

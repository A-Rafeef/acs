export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 w-full space-y-8 animate-pulse">
      {/* Title skeleton */}
      <div className="border-b border-border/25 pb-6 space-y-3">
        <div className="h-8 w-48 bg-secondary/60 rounded-sm" />
        <div className="h-3 w-32 bg-secondary/40 rounded-sm" />
      </div>

      {/* Content layout */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filter sidebar skeleton */}
        <div className="hidden md:block w-64 space-y-6 flex-shrink-0">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="h-3 w-20 bg-secondary/50 rounded-sm" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="h-3 w-full bg-secondary/30 rounded-sm" />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Product grid skeleton */}
        <div className="flex-grow grid grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-[3/4] w-full bg-secondary/40 rounded-sm" />
              <div className="space-y-2">
                <div className="h-3 w-3/4 bg-secondary/30 rounded-sm" />
                <div className="h-2.5 w-1/2 bg-secondary/20 rounded-sm" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

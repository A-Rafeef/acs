export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 w-full space-y-12 animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 w-32 bg-secondary/40 rounded-sm" />

      {/* Product detail columns */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
        {/* Image gallery skeleton */}
        <div className="md:col-span-7 space-y-4">
          <div className="aspect-[3/4] w-full bg-secondary/40 rounded-sm" />
          <div className="grid grid-cols-5 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="aspect-[3/4] bg-secondary/30 rounded-sm" />
            ))}
          </div>
        </div>

        {/* Info skeleton */}
        <div className="md:col-span-5 space-y-8">
          <div className="space-y-4 border-b border-border/20 pb-6">
            <div className="h-3 w-20 bg-secondary/40 rounded-sm" />
            <div className="h-7 w-3/4 bg-secondary/50 rounded-sm" />
            <div className="h-6 w-28 bg-secondary/40 rounded-sm" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-2.5 w-12 bg-secondary/30 rounded-sm" />
                <div className="h-4 w-16 bg-secondary/40 rounded-sm" />
              </div>
            ))}
          </div>
          <div className="h-14 w-full bg-secondary/50 rounded-sm" />
        </div>
      </div>
    </div>
  )
}
